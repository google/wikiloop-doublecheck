const http = require('http');
const express = require('express');
const consola = require('consola');
const {Nuxt, Builder} = require('nuxt');
const MongoClient = require('mongodb').MongoClient;
const ua = require('universal-analytics');
const rp = require(`request-promise`);

var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'debug';

let docCounter = 0;
let allDocCounter = 0;

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js');
config.dev = !(process.env.NODE_ENV === 'production');

function computeOresField(oresJson, wiki, revsionId) {
  let damagingScore = oresJson[wiki].scores[revsionId].damaging.score.probability.true;
  let badfaithScore = oresJson[wiki].scores[revsionId].goodfaith.score.probability.false;
  let damaging = oresJson[wiki].scores[revsionId].damaging.score.prediction;
  let badfaith = !oresJson[wiki].scores[revsionId].goodfaith.score.prediction;
  return {
    damagingScore: damagingScore,
    damaging: damaging,
    badfaithScore: badfaithScore,
    badfaith: badfaith
  }
}

async function getJudgementCounts(db, newRecentChange) {
  let judgementCounts = {};
  let aggrRet = await db.collection(`Interaction`).aggregate([
        {
          "$match": {
            "recentChange.id": newRecentChange.id.toString(),
            "recentChange.wiki": newRecentChange.wiki
          }
        },
        {
          // Counts group by Judgement
          "$group": {
            "_id": "$judgement",
            "judgement": {
              "$sum": 1.0
            }
          }
        }
      ],
      {
        "allowDiskUse": false
      }).toArray();
  aggrRet.forEach(ret => {
    judgementCounts[ret._id] = ret.judgement;
  });
  return judgementCounts;
}

async function queryMarkedRecentChangee(db, myGaId) {
  let recentChanges;
  let interactions = await db.collection(`Interaction`).find({}, {
    sort: [["timestamp", -1]]
  })
  // .limit(1)  // TODO add limit when performance becomes a problem, a typical case that RDB is better than NonRDB
      .toArray();
  let dbIds = interactions.map(rc => `${rc.recentChange.wiki}-${rc.recentChange.id}`);
  recentChanges = await db.collection(`MediaWikiRecentChange`)
      .find(
          {"_id": {$in: dbIds}})
      // .limit(1)  // TODO add limit when performance becomes a problem, a typical case that RDB is better than NonRDB
      .toArray();

  recentChanges = await Promise.all(recentChanges.map(async (rc) => {
    // TODO improve performance.
    rc.judgementCounts = await getJudgementCounts(db, rc);
    return rc;
  }));

  // Add my judgement
  if (myGaId) {
    let myInteractionMap = {};
    let myInteractions = await db.collection(`Interaction`).find({userGaId: myGaId}).toArray();
    myInteractions.forEach(interaction => {
      myInteractionMap[interaction.recentChange._id] = interaction;
    });
    recentChanges.forEach(rc => {
      if (myInteractionMap[rc._id]) rc.judgement = myInteractionMap[rc._id].judgement;
    });
  }
  return recentChanges.reverse();
}

// -------------- FROM API ----------------
function setupApiRequestListener(db, io, app) {
  let apiRouter = express();

  const cookieParser = require('cookie-parser');
  const bodyParser = require('body-parser');

  apiRouter.use(cookieParser());
  apiRouter.use(bodyParser());

  const asyncHandler = fn => (req, res, next) =>
      Promise
          .resolve(fn(req, res, next))
          .catch(next);

  apiRouter.get('/', (req, res, next) => {
    res.send('API root');
    req.visitor
        .event({ec: "api", ea: "/"})
        .send();
  });

  // TODO add cache
  apiRouter.get('/diff', asyncHandler(async (req, res) => {
    logger.debug(`req.query`, req.query);
    let diffApiUrl = `${req.query.serverUrl}/w/api.php?action=compare&fromrev=${req.query.revId}&torelative=prev&format=json`;
    let diffJson = await rp.get(diffApiUrl, {json: true});
    res.send(diffJson);
    req.visitor
        .event({ec: "api", ea: "/diff"})
        .send();

  }));

  apiRouter.post('/interaction', asyncHandler(async (req, res) => {
    logger.debug(`Interaction req`, req.cookies, req.body);

    let userGaId = req.body.gaId;
    let newRecentChange = req.body.newRecentChange;
    let doc = {
      userGaId: userGaId,
      judgement: req.body.judgement,
      timestamp: req.body.timestamp,
      recentChange: {
        _id: newRecentChange._id,
        id: newRecentChange.id,
        title: newRecentChange.title,
        namespace: newRecentChange.namespace,
        revision: newRecentChange.revision,
        ores: newRecentChange.ores,
        user: newRecentChange.user,
        wiki: newRecentChange.wiki,
        timestamp: newRecentChange.timestamp,
      }
    };

    await db.collection(`Interaction`).findOneAndReplace({
      userGaId: userGaId,
      "recentChange.id": newRecentChange.id,
      "recentChange.wiki": newRecentChange.wiki
    }, doc, {upsert: true});

    doc.judgementCounts = await getJudgementCounts(db, newRecentChange);
    io.sockets.emit('interaction', doc);

    res.send(`ok`);
    req.visitor
        .event({ec: "api", ea: "/interaction"})
        .event("judgement", req.body.judgement)
        .send();
  }));

  apiRouter.get("/marked.csv", asyncHandler(async (req, res) => {
    let myGaId = req.body.gaId || req.cookies._ga;
    let recentChanges = await queryMarkedRecentChangee(db, myGaId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + Date.now() + '.csv\"');
    // res.send(recentChanges);
    const stringify = require('csv-stringify');
    let ret = [[`RevId`, `Wiki`, `OresDamagingScore`, `OresBadfaithScore`, `ShouldRevert`, `NotSure`, `LooksGood`]]
        .concat(recentChanges.map(rc => [
          rc.id, rc.wiki, rc.ores.damagingScore, rc.ores.badfaithScore,
          rc.judgementCounts.ShouldRevert || 0, rc.judgementCounts.NotSure || 0, rc.judgementCounts.LooksGood || 0
        ]));
    stringify(ret, {header: false})
        .pipe(res);
  }));

  apiRouter.get("/marked", asyncHandler(async (req, res) => {
    let myGaId = req.body.gaId || req.cookies._ga;
    let recentChanges = await queryMarkedRecentChangee(db, myGaId);
    res.send(recentChanges);
  }));

  apiRouter.get('/stats', asyncHandler(async (req, res) => {
    let myGaId = req.body.gaId || req.cookies._ga;

    logger.debug(`req.query`, req.query);
    let allInteractions = await db.collection(`Interaction`)
        .find({}, {
          userGaId: 1,
          judgement: 1,
          "recentChange.id": 1,
          "recentChang.title": 1,
          "recentChange.wiki": 1
        }).toArray();
    let revSet = {};
    allInteractions.forEach(i => revSet[i.recentChange.id] = true);
    let ret = {
      totalJudgement: allInteractions.length,
      totalRevJudged: Object.keys(revSet).length,
      totalShouldRevert: allInteractions.filter(i => i.judgement === "ShouldRevert").length,
    };

    if (myGaId) {
      let myInteractions = allInteractions.filter(i => i.userGaId === myGaId);
      let myRevSet = {};
      myInteractions.forEach(i => myRevSet[i.recentChange.id] = true);
      ret.totalMyJudgement = myInteractions.length;
      ret.totalMyRevJudged = Object.keys(myRevSet).length;
      ret.totalMyShouldRevert = myInteractions.filter(i => i.judgement === "ShouldRevert").length;
    }

    res.send(ret);
    req.visitor
        .event({ec: "api", ea: "/stats"})
        .send();
  }));

  apiRouter.get('/latest', asyncHandler(async (req, res) => {
    logger.debug(`req.query`, req.query);

    let wiki = "enwiki";  // TODO: support multiple different wiki in the cases. Currently only support ENwiki.

    // Getting a list of latest revisions related to the filter (Lang of Wiki), and their related diff
    // TODO Consider use https://nodejs.org/api/url.html#url_url_searchparams to compose a standard one. this contains too many parameters
    let queryUrl = `${req.query.serverUrl}/w/api.php?action=query&list=recentchanges&prop=info&format=json&rcnamespace=0&rclimit=100&rctype=edit&rctoponly=true&rcprop=user|userid|comment|flags|timestamp|ids|title&rcshow=!bot`;
    // https://en.wikipedia.org/w/api.php?action=query&list=recentchanges&prop=info&format=json&rcnamespace=0&rclimit=50&rctype=edit&rctoponly=true&rcprop=user|userid|comment|flags|timestamp|ids|title&rcshow=!bot
    let recentChangesJson = await rp.get(queryUrl, {json: true});
    /** Sample response
     {
       "batchcomplete":"",
       "continue":{
          "rccontinue":"20190701214931|1167038199",
          "continue":"-||info"
       },
       "query":{
          "recentchanges":[
             {
                "type":"edit",
                "ns":0,
                "title":"Multiprocessor system architecture",
                "pageid":58955273,
                "revid":904396518,
                "old_revid":904395753,
                "rcid":1167038198,
                "user":"Dhtwiki",
                "userid":9475572,
                "timestamp":"2019-07-01T21:49:32Z",
                "comment":"Putting images at bottom, side by side, to prevent impinging on References section"
             }
             // ...
          ]
       }
     }

     Converting to
     {
        _id: recentChange._id,
        id: recentChange.id,
        revision: recentChange.revision,
        title: recentChange.title,
        user: recentChange.user,
        wiki: recentChange.wiki,
        timestamp: recentChange.timestamp,
        ores: recentChange.ores,
        namespace: recentChange.namespace,
        nonbot: !recentChange.bot
      }
     */

    let oresUrl = `https://ores.wmflabs.org/v3/scores/${wiki}/?models=damaging|goodfaith&revids=${
        recentChangesJson.query.recentchanges // from recentChangesJson result
            .map(rawRecentChange => rawRecentChange.revid).join('|')
        }`;

    /**
     {
        enwiki:{
          models:{
            damaging:{
              version:"0.5.0"
            },
            goodfaith:{
              version:"0.5.0"
            }
          },
          scores:{
            904398217:{
              damaging:{
                score:{
                  prediction:false,
                  probability:{
                    false:0.8201493218128969,
                    true:0.1798506781871031
                  }
                }
              },
              goodfaith:{
                score:{
                  prediction:true,
                  probability:{
                    false:0.09864511980935009,
                    true:0.9013548801906499
                  }
                }
              }
            },
            904398221:{
              damaging:{
                score:{
                  prediction:false,
                  probability:{
                    false:0.9593284228949122,
                    true:0.04067157710508781
                  }
                }
              },
              goodfaith:{
                score:{
                  prediction:true,
                  probability:{
                    false:0.01102952942780866,
                    true:0.9889704705721913
                  }
                }
              }
            }
          }
        }
      }
     * */

    let oresResultJson = await rp.get(oresUrl, {json: true});

    let recentChanges = recentChangesJson.query.recentchanges  // from recentChangesJson result
        .map(rawRecentChange => {
          return {
            _id: `${wiki}-${rawRecentChange.rcid}`,
            id: rawRecentChange.rcid,
            revision: {
              new: rawRecentChange.revid,
              old: rawRecentChange.old_revid
            },
            title: rawRecentChange.title,
            user: rawRecentChange.user,
            ores: computeOresField(oresResultJson, wiki, rawRecentChange.revid),
            wiki: `${wiki}`, // TODO verify
            timestamp: Math.floor(new Date(rawRecentChange.timestamp).getTime() / 1000), // TODO check the exact format of timestamp. maybe use an interface?
            namespace: 0, // we already query the server with "rcnamespace=0" filter
            nonbot: true // we already query the server with "rcprop=!bot" filter
          };
        });
    res.send(recentChanges.reverse());
    req.visitor
        .event({ec: "api", ea: "/latest"})
        .send();

  }));

  apiRouter.get('/version', (req, res, next) => {
    var packageson = require('./../package.json');
    res.send(packageson.version);
    req.visitor
        .event({ec: "api", ea: "/"})
        .send();
  });
  app.use(`/api`, apiRouter);
}

// ----------------------------------------

function setupMediaWikiListener(db, io) {
  logger.debug(`Starting mediaWikiListener.`);

  return new Promise(async (resolve, reject) => {
    logger.debug(`MediaWikiListener started`);
    const EventSource = require('eventsource');
    const url = 'https://stream.wikimedia.org/v2/stream/recentchange';

    logger.debug(`Connecting to EventStreams at ${url}`);

    const eventSource = new EventSource(url);
    eventSource.onopen = function (event) {
      logger.debug('--- Opened connection.');
    };

    eventSource.onerror = function (event) {
      console.error('--- Encountered error', event);
    };

    eventSource.onmessage = async function (event) {
      allDocCounter++;
      let recentChange = JSON.parse(event.data);
      // logger.debug(`server received`, data.wiki, data.id, data.meta.uri);
      recentChange._id = (`${recentChange.wiki}-${recentChange.id}`);
      if (recentChange.type === "edit") {
        // Currently only support these wikis.
        if (["enwiki", "frwiki", "ruwiki"].indexOf(recentChange.wiki) >= 0) {
          try {
            let oresUrl = `https://ores.wmflabs.org/v3/scores/${recentChange.wiki}/?models=damaging|goodfaith&revids=${recentChange.revision.new}`;
            let oresJson = await rp.get(oresUrl, {json: true});
            recentChange.ores = computeOresField(oresJson, recentChange.wiki, recentChange.revision.new);
            let doc = {
              _id: recentChange._id,
              id: recentChange.id,
              revision: recentChange.revision,
              title: recentChange.title,
              user: recentChange.user,
              wiki: recentChange.wiki,
              timestamp: recentChange.timestamp,
              ores: recentChange.ores,
              namespace: recentChange.namespace,
              nonbot: !recentChange.bot
            };
            docCounter++;
            logger.debug(`#${docCounter} / ${allDocCounter}`);
            io.sockets.emit('recent-change', doc);
            await db.collection(`MediaWikiRecentChange`).insertOne(doc);
          } catch (e) {
            if (e.name === "MongoError" && e.code === 11000) {
              console.warn(`Duplicated Key Found`, e.errmsg);
            } else {
              console.error(e);
            }
          }
        }

      }
    };

  });
}

function setupIoSocketListener(io) {
  io.on('connection', function (socket) {
    logger.debug(`New client connected `, Object.keys(io.sockets.connected).length);
    io.sockets.emit('client-activity', {liveUserCount: Object.keys(io.sockets.connected).length});
    socket.on('disconnect', function () {
      io.sockets.emit('client-activity', {liveUserCount: Object.keys(io.sockets.connected).length});
      console.warn(`One client disconnected `, Object.keys(io.sockets.connected).length);
    });
  });
}

async function start() {

  const app = express();
  if (!process.env.PROD) {
    const logRequestStart = (req, res, next) => {
      logger.debug(`${req.method} ${req.originalUrl}`);
      next();
    };
    app.use(logRequestStart);
  }


  const server = http.Server(app);
  const io = require('socket.io')(server);

  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const {host, port} = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }
  // Use connect method to connect to the Server
  let db = (await MongoClient.connect(process.env.MONGODB_URI, {useNewUrlParser: true}))
      .db(process.env.MONGODB_DB);

  // Setup Google Analytics
  app.use(ua.middleware(process.env.GA_ID, {cookieName: '_ga'}));
  setupIoSocketListener(io);
  setupMediaWikiListener(db, io);
  setupApiRequestListener(db, io, app);

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  // app.listen(port, host)
  server.listen(port, host);
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })


}

start()
