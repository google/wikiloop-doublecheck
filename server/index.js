const http = require('http');
const express = require('express');
const consola = require('consola');
const { Nuxt, Builder } = require('nuxt');
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
    let diffJson = await rp.get(diffApiUrl, { json: true });
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
    await db.collection(`Interaction`).insertOne(doc);

    let aggrRet = await db.collection(`Interaction`).aggregate(    [
          {
            "$match" : {
              "recentChange.id" : newRecentChange.id,
              "recentChange.wiki" : newRecentChange.wiki
            }
          },
          {
            // Counts group by Judgement
            "$group" : {
              "_id" : "$judgement",
              "judgement" : {
                "$sum" : 1.0
              }
            }
          }
        ],
        {
          "allowDiskUse" : false
        }).toArray();

    let judgementCounts = {};
    aggrRet.forEach(ret => {
      judgementCounts[ret._id] = ret.judgement;
    });
    doc.judgementCounts = judgementCounts;
    io.sockets.emit('interaction', doc);

    res.send(`ok`);
    req.visitor
        .event({ec: "api", ea: "/interaction"})
        .event("judgement", req.body.judgement)
        .send();
  }));

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
    eventSource.onopen = function(event) {
      logger.debug('--- Opened connection.');
    };

    eventSource.onerror = function(event) {
      console.error('--- Encountered error', event);
    };

    eventSource.onmessage = async function(event) {
      allDocCounter++;
      let recentChange = JSON.parse(event.data);
      // logger.debug(`server received`, data.wiki, data.id, data.meta.uri);
      recentChange._id = (`${recentChange.wiki}-${recentChange.id}`);
      if (recentChange.type === "edit") {
        // Currently only support these wikis.
        if (["enwiki", "frwiki", "ruwiki"].indexOf(recentChange.wiki) >= 0) {
          try {
            let oresUrl = `https://ores.wmflabs.org/v3/scores/${recentChange.wiki}/?models=damaging|goodfaith&revids=${recentChange.revision.new}`;
            let oresJson = await rp.get(oresUrl, { json: true });
            let damagingScore = oresJson[recentChange.wiki].scores[recentChange.revision.new].damaging.score.probability.true;
            let badfaithScore = oresJson[recentChange.wiki].scores[recentChange.revision.new].goodfaith.score.probability.false;
            let damaging = oresJson[recentChange.wiki].scores[recentChange.revision.new].damaging.score.prediction;
            let badfaith = !oresJson[recentChange.wiki].scores[recentChange.revision.new].goodfaith.score.prediction;
            recentChange.ores = {
              damagingScore: damagingScore,
              damaging: damaging,
              badfaithScore: badfaithScore,
              badfaith: badfaith
            };
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
  io.on('connection', function(socket) {
    logger.debug(`New client connected `, Object.keys(io.sockets.connected).length);
    io.sockets.emit('client-activity', { liveUserCount: Object.keys(io.sockets.connected).length });
    socket.on('disconnect', function() {
      io.sockets.emit('client-activity', { liveUserCount: Object.keys(io.sockets.connected).length });
      console.warn(`One client disconnected `, Object.keys(io.sockets.connected).length);
    });
  });
}

async function start() {

  const app = express();
  const server = http.Server(app);
  const io = require('socket.io')(server);

  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }
  // Use connect method to connect to the Server
  let db = (await MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true }))
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
