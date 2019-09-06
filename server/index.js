// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
require(`dotenv`).config();
const http = require('http');
const express = require('express');
const consola = require('consola');
const {Nuxt, Builder} = require('nuxt');
const universalAnalytics = require('universal-analytics');
const rp = require('request-promise');
const mongoose = require('mongoose');
const {logger, apiLogger, perfLogger, getUrlBaseByWiki, computeOresField, fetchRevisions, useOauth} = require('./common');
const routes = require('./routes');
const asyncHandler = fn => (req, res, next) =>
    Promise
        .resolve(fn(req, res, next))
        .catch(next);

const logReqPerf = function (req, res, next) {
  // Credit for inspiration: http://www.sheshbabu.com/posts/measuring-response-times-of-express-route-handlers/
  perfLogger.info(` log request starts for ${req.method} ${req.originalUrl}:`, {
    method: req.method,
    original_url: req.originalUrl,
    ga_id: req.cookies._ga,
  });
  const startNs = process.hrtime.bigint();
  res.on(`finish`, () => {
    const endNs = process.hrtime.bigint();
    perfLogger.info(` log response ends for ${req.method} ${req.originalUrl}:`, {
      method: req.method,
      original_url: req.originalUrl,
      ga_id: req.cookies._ga,
      time_lapse_ns: endNs - startNs,
      start_ns: startNs,
      end_ns: endNs
    });
  });
  next();
};

let docCounter = 0;
let allDocCounter = 0;
// Import and Set Nuxt.js options
const config = require('../nuxt.config.js');
config.dev = !(process.env.NODE_ENV === 'production');

// -------------- FROM STIKI API -------------
function setupSTikiApiLisenter(app) {
  let stikiRouter = express();

  const apicache = require('apicache');
  let cache = apicache.middleware;
  const onlyGet = (req, res) => res.method === `GET`;
  stikiRouter.use(cache('1 week', onlyGet));

  const mysql = require('mysql2');

  // create the pool
  const pool = mysql.createPool(process.env.STIKI_MYSQL);
  // now get a Promise wrapped instance of that pool
  const promisePool = pool.promise();

  stikiRouter.get('/stiki', asyncHandler(async (req, res) => {
    logger.debug(`req.query`, req.query);
    let revIds = JSON.parse(req.query.revIds);
    const [rows, _fields] = await promisePool.query(`SELECT R_ID, SCORE FROM scores_stiki WHERE R_ID in (${revIds.join(',')})`);
    res.send(rows);
    req.visitor
        .event({ec: "api", ea: "/scores"})
        .send();
  }));

  stikiRouter.get('/stiki/:wikiRevId', asyncHandler(async (req, res) => {
    let revIds = req.query.revIds;
    logger.debug(`req.query`, req.query);
    let wikiRevId = req.params.wikiRevId;
    let _wiki = wikiRevId.split(':')[0];
    let revId = wikiRevId.split(':')[1];
    const [rows, _fields] = await promisePool.query(`SELECT R_ID, SCORE FROM scores_stiki WHERE R_ID = ${revId}`);
    res.send(rows);
    req.visitor
        .event({ec: "api", ea: "/scores/:wikiRevId"})
        .send();
  }));

  stikiRouter.get('/cbng/:wikiRevId', asyncHandler(async (req, res) => {
    logger.debug(`req.query`, req.query);
    let wikiRevId = req.params.wikiRevId;
    let _wiki = wikiRevId.split(':')[0];
    let revId = wikiRevId.split(':')[1];
    const [rows, _fields] = await promisePool.query(`SELECT R_ID, SCORE FROM scores_cbng WHERE R_ID = ${revId}`);
    res.send(rows);
    req.visitor
        .event({ec: "api", ea: "/cbng/:wikiRevId"})
        .send();
  }));

  stikiRouter.get('/cbng', asyncHandler(async (req, res) => {
    logger.debug(`req.query`, req.query);
    let revIds = JSON.parse(req.query.revIds);
    const [rows, _fields] = await promisePool.query(`SELECT R_ID, SCORE FROM scores_cbng WHERE R_ID in (${revIds.join(',')})`);
    res.send(rows);
    req.visitor
        .event({ec: "api", ea: "/scores"})
        .send();
  }));

  app.use(`/extra`, stikiRouter);
}

// -------------- FROM API ----------------
function setupApiRequestListener(db, io, app) {
  let apiRouter = express();


  const apicache = require('apicache');
  let cache = apicache.middleware;
  const onlyGet = (req, res) => res.method === `GET`;

  apiRouter.use(cache('1 week', onlyGet));

  apiRouter.get('/', routes.root);

  apiRouter.get('/diff/:wikiRevId', asyncHandler(routes.diffWikiRevId));

  apiRouter.get('/diff', asyncHandler(routes.diff));

  apiRouter.get('/recentChanges', asyncHandler(routes.recentChanges));

  apiRouter.get('/ores', asyncHandler(routes.ores));

  apiRouter.get('/ores/:wikiRevId', asyncHandler(routes.oresWikiRevId));

  apiRouter.get('/revision/:wikiRevId', asyncHandler(routes.revisionWikiRevId));

  apiRouter.get('/revisions', asyncHandler(routes.revision));

  apiRouter.get('/interaction/:wikiRevId', asyncHandler(routes.getInteraction));

  apiRouter.get('/interactions', asyncHandler(routes.listInteractions));

  apiRouter.post('/interaction/:wikiRevId', asyncHandler(routes.updateInteraction));

  apiRouter.get("/markedRevs.csv", asyncHandler(routes.markedRevsCsv));

  apiRouter.get("/markedRevs", asyncHandler(routes.markedRevs));

  /**
   * Return a list of all leader
   * Pseudo SQL
   *
   *
   * ```SQL
   *   SELECT user, count(*) FROM Interaction GROUP BY user ORDER by user;
   * ````
   */
  apiRouter.get('/leaderboard', asyncHandler(routes.leaderboard));


  apiRouter.get('/stats', asyncHandler(routes.stats));

  // TODO build batch api for avatar until performance is an issue. We have cache anyway should be fine.
  apiRouter.get("/avatar/:seed", asyncHandler(routes.avatar));

  apiRouter.get('/latestRevs', asyncHandler(routes.latestRevs));

  apiRouter.get('/flags', routes.flags);

  apiRouter.get('/mediawiki', asyncHandler(routes.mediawiki));

  apiRouter.get('/version', routes.version);

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
      logger.error('--- Encountered error', event);
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
            let oresUrl = `https://ores.wikimedia.org/v3/scores/${recentChange.wiki}/?models=damaging|goodfaith&revids=${recentChange.revision.new}`;
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
              nonbot: !recentChange.bot,
            };
            docCounter++;
            logger.debug(` Counters: ${docCounter} / ${allDocCounter}`);
            doc.comment = recentChange.comment;
            io.sockets.emit('recent-change', doc);
            delete doc.comment;
            // TODO add
            // await db.collection(`MediaWikiRecentChange`).insertOne(doc);

          } catch (e) {
            if (e.name === "MongoError" && e.code === 11000) {
              logger.warn(`Duplicated Key Found`, e.errmsg);
            } else {
              logger.error(e);
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
      logger.warn(`One client disconnected `, Object.keys(io.sockets.connected).length);
    });
  });
}

function setupAuthApi(app) {
  const passport = require(`passport`);
  const oauthFetch = require('oauth-fetch-json');
  const session = require('express-session');
  app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  const MediaWikiStrategy = require('passport-mediawiki-oauth').OAuthStrategy;

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  passport.use(new MediaWikiStrategy({
        consumerKey: process.env.MEDIAWIKI_CONSUMER_KEY,
        consumerSecret: process.env.MEDIAWIKI_CONSUMER_SECRET,
        callbackURL: `/auth/mediawiki/callback` // TODO probably need to set HOST and PORT
      },
      function(token, tokenSecret, profile, done) {
        profile.oauth = {
          consumer_key: process.env.MEDIAWIKI_CONSUMER_KEY,
          consumer_secret: process.env.MEDIAWIKI_CONSUMER_SECRET,

          token: token,
          token_secret: tokenSecret
        };
        done(null, profile);
      }
  ));

  app.use((req, res, next) => {
    if (req.isAuthenticated() && req.user) {
      res.locals.isAuthenticated = req.isAuthenticated();
      res.locals.user = {
        id: req.user.id,
        username: req.user._json.username,
        grants: req.user._json.grants
      };
      logger.debug(`res.locals.user = ${JSON.stringify(res.locals.user, null ,2)}`);
    }
    next();
  });

  app.get('/auth/mediawiki/login', passport.authenticate('mediawiki'));

  app.get('/auth/mediawiki/logout', asyncHandler(async (req, res) => {
    req.logout();
    res.redirect('/');
  }));

  app.get('/auth/mediawiki/callback',
      passport.authenticate('mediawiki', { failureRedirect: '/auth/mediawiki/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        logger.debug(` Successful authentication, redirect home. req.isAuthenticated()=`, req.isAuthenticated());
        res.redirect('/');
      });

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.status( 401 );
      res.send( 'Login required for this endpoint' );
    }
  }

  app.get(`/api/auth/revert/:wikiRevId`, ensureAuthenticated,  asyncHandler(async (req, res) => {
    let wiki = req.params.wikiRevId.split(':')[0];
    let revId = req.params.wikiRevId.split(':')[1];
    let apiUrl = `${getUrlBaseByWiki(wiki)}/w/api.php`;
    let revInfo = await fetchRevisions(wiki, [revId]); // assuming request succeeded;
    let token = (await oauthFetch( apiUrl,     {
      "action": "query",
      "format": "json",
      "meta": "tokens"
    }, {}, req.user.oauth)).query.tokens.csrftoken;  // assuming request succeeded;
    oauthFetch( apiUrl, {
        "action": "edit",
        "format": "json",
        "title": revInfo[0].title,
        "tags": "WikiLoop Battlefield",
        "undo": revId,
        "token": token
      }, { method: 'POST' }, req.user.oauth ).then( function ( data ) {
      res.setHeader('Content-Type', 'application/json');
      res.status( 200 );
      res.send( JSON.stringify( data ) );
    } );  // assuming request succeeded;
    logger.debug(`conducted revert for wikiRevId=${req.params.wikiRevId}`);
  }));
}

async function start() {

  const app = express();
  const cookieParser = require('cookie-parser');
  const bodyParser = require('body-parser');
  app.use(cookieParser());
  // Setup Google Analytics
  app.use(universalAnalytics.middleware(process.env.GA_ID, {cookieName: '_ga'}));
  app.use(bodyParser());
  app.use(logReqPerf);

  const server = http.Server(app);
  const io = require('socket.io')(server);
  app.set('socketio', io);

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

  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, dbName: process.env.MONGODB_DB} );

  app.use(function (req, res, next) {
    apiLogger.debug('req.originalUrl:', req.originalUrl);
    apiLogger.debug('req.params:', req.params);
    apiLogger.debug('req.query:', req.query);
    next();
  });
  if (useOauth) setupAuthApi(app);
  setupIoSocketListener(io);
  setupMediaWikiListener(mongoose.connection.db, io);
  setupApiRequestListener(mongoose.connection.db, io, app);

  if (process.env.STIKI_MYSQL) {
    await setupSTikiApiLisenter(app);
  }

  // Give nuxt middleware to express
  app.use(nuxt.render);

  // Listen the server
  // app.listen(port, host)
  server.listen(port, host);
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })


}

start()
