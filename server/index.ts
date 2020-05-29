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
const envPath = process.env.DOTENV_PATH || 'template.env';
console.log(`DotEnv envPath = `, envPath, ' if you want to change it, restart and set DOTENV_PATH');

require('dotenv').config({
  path: envPath
});

import { OresStream } from "@/server/ingest/ores-stream";
import { getUrlBaseByWiki, wikiToDomain } from "@/shared/utility-shared";
import { installHook } from "~/server/routers/api/interaction";
import { BasicJudgement } from "~/shared/interfaces";
import { InteractionProps } from "~/shared/models/interaction-item.model";
import { AwardBarnStarCronJob, UsageReportCronJob } from "../cronjobs";
import { apiLogger, asyncHandler, computeOresField, ensureAuthenticated, fetchRevisions, isWhitelistedFor, logger, perfLogger, useOauth } from './common';
import { getMetrics } from "./routers/api/metrics";
import { apiRouter as newApiRouter } from "./routers/api";


const http = require('http');
const express = require('express');
var responseTime = require('response-time');
const consola = require('consola');
const {Nuxt, Builder} = require('nuxt');
const universalAnalytics = require('universal-analytics');
const rp = require('request-promise');
const mongoose = require('mongoose');

const logReqPerf = function (req, res, next) {
  // Credit for inspiration: http://www.sheshbabu.com/posts/measuring-response-times-of-express-route-handlers/
  perfLogger.debug(` log request starts for ${req.method} ${req.originalUrl}:`, {
    method: req.method,
    original_url: req.originalUrl,
    ga_id: req.cookies._ga,
  });
  const startNs = process.hrtime.bigint();
  res.on(`finish`, () => {
    const endNs = process.hrtime.bigint();
    perfLogger.debug(` log response ends for ${req.method} ${req.originalUrl}:`, {
      method: req.method,
      original_url: req.originalUrl,
      ga_id: req.cookies._ga,
      time_lapse_ns: endNs - startNs,
      start_ns: startNs,
      end_ns: endNs,
    });
    if (req.session) {
      perfLogger.debug(` log request session info for ${req.method} ${req.originalUrl}:`, {
        session_id: req.session.id
      });
    }
  });
  next();
};

let docCounter = 0;
let allDocCounter = 0;
// Import and Set Nuxt.js options
const config = require('../nuxt.config.js');
config.dev = !(process.env.NODE_ENV === 'production');

// -------------- FROM API ----------------
function setupApiRequestListener(db, io, app) {
  app.use(`/api`, newApiRouter);
}

function setupCronJobs() {
  if (process.env.CRON_BARNSTAR_TIMES) {
    logger.info(`Setting up CRON_BARN_STAR_TIME raw value = `, process.env.CRON_BARNSTAR_TIMES);
    let cronTimePairs =
      process.env.CRON_BARNSTAR_TIMES
        .split('|')
        .map(pairStr => {
          let pair = pairStr.split(';');
          return { cronTime: pair[0], frequency: pair[1]}
        }).forEach(pair => {
        const awardBarnStarCronJob = new AwardBarnStarCronJob(pair.cronTime, pair.frequency);
        awardBarnStarCronJob.startCronJob();
      });
  } else {
    logger.warn(`Skipping Barnstar cronjobs because of lack of CRON_BARNSTAR_TIMES which is: `, process.env.CRON_BARNSTAR_TIMES);
  }

  if (process.env.CRON_USAGE_REPORT_TIMES) {
    logger.info(`Setting up CRON_USAGE_REPORT_TIMES raw value = `, process.env.CRON_USAGE_REPORT_TIMES);
    let cronTimePairs =
      process.env.CRON_USAGE_REPORT_TIMES
        .split('|')
        .map(pairStr => {
          let pair = pairStr.split(';');
          return { cronTime: pair[0], frequency: pair[1]}
        }).forEach(pair => {
        const usageReportCronJob = new UsageReportCronJob(pair.cronTime, pair.frequency);
        usageReportCronJob.startCronJob();
      });
  } else {
    logger.warn(`Skipping UsageReportCronJob because of lack of CRON_BARNSTAR_TIMES which is: `, process.env.CRON_BARNSTAR_TIMES);
  }

}

function setupHooks() {
  // See https://github.com/google/wikiloop-battlefield/issues/234
  // TODO(xinbenlv): add authentication.
  installHook('postToJade', async function(i:InteractionProps) {
    let revId = i.wikiRevId.split(':')[1];
    let wiki = i.wikiRevId.split(':')[0];
    if (wiki =='enwiki'  // we only handle enwiki for now. See https://github.com/google/wikiloop-battlefield/issues/234
    && [
      BasicJudgement.ShouldRevert.toString(),
      BasicJudgement.LooksGood.toString(),
    ].indexOf(i.judgement) > 0) {
      let isDamaging = (i.judgement === BasicJudgement.ShouldRevert);
      let payload = {
        "action": "jadeproposeorendorse",
        "title": `Jade:Diff/${revId}`,
        "facet": "editquality",
        // TODO(xinbenlv): we don't actually make assessment on "goodfaith", but validation requires it.
        "labeldata": `{"damaging":${isDamaging}, "goodfaith":true}`,
        "endorsementorigin": `WikiLoop Battelfield`,
        "notes": "Notes not available",
        "formatversion": "2",
        // TODO(xinbenlv): endorsementcomment is effectively required rather than optional
        "endorsementcomment": "SeemsRequired",
        "format":"json",
        "token": `+\\`, // TODO(xinbenlv): update with real CSRF token when JADE launch to production
      };
      var optionsForForm = {
        method: 'POST',
        uri: 'https://en.wikipedia.beta.wmflabs.org/w/api.php',
        formData: payload,
        headers: {
          /* 'content-type': 'multipart/form-data' */ // Is set automatically
        }
      };

      let retWithForm = await rp(optionsForForm);
    }
  });

  if (process.env.DISCORD_WEBHOOK_ID && process.env.DISCORD_WEBHOOK_TOKEN) {
    logger.info(`Installing discord webhook for id=${process.env.DISCORD_WEBHOOK_ID}, token=${process.env.DISCORD_WEBHOOK_TOKEN.slice(0,3)}...`);
    installHook('postToDiscord', async function(i:InteractionProps) {
      let revId = i.wikiRevId.split(':')[1];
      let colorMap = {
        'ShouldRevert': 14431557, // #dc3545 / Bootstrap Danger
        'NotSure': 7107965, // 6c757d /
        'LooksGood':  2664261, // #28a745 / Bootstrap Success
      };
      rp.post(
        {
          url: `https://discordapp.com/api/webhooks/${process.env.DISCORD_WEBHOOK_ID}/${process.env.DISCORD_WEBHOOK_TOKEN}`,
          json: {
            username: process.env.PUBLIC_HOST,
            content: `A revision ${i.wikiRevId} for ${i.title} is reviewed by ${i.wikiUserName || i.userGaId} and result is ${i.judgement}`,
            "embeds": [{
              "title": `See it on ${i.wiki}: ${i.title}`,
              "url": `${getUrlBaseByWiki(i.wiki)}/wiki/Special:Diff/${revId}`,

            },
            {
              "title": `${i.judgement}`,
              "url": `http://${process.env.PUBLIC_HOST}/revision/${i.wiki}/${revId}`,
              "color": colorMap[i.judgement]
            }]
          }
        });
    });
  } else {
    logger.warn(`Not Installing discord webhook because lack of process.env.DISCORD_WEBHOOK_ID or process.env.DISCORD_WEBHOOK_TOKEN`);
  }

}

function setupIoSocketListener(db, io) {
  async function emitMetricsUpdate() {
    let metrics = await getMetrics();
    io.sockets.emit('metrics-update', metrics);
    logger.debug(`Emit Metrics Update`, metrics);
  }

  io.on('connection', async function (socket) {
    logger.info(`A socket client connected. Socket id = ${socket.id}. Total connections =`, Object.keys(io.sockets.connected).length);
    socket.on('disconnect', async function () {
      await emitMetricsUpdate();
      logger.info(`A socket client disconnected. Socket id = ${socket.id}. Total connections =`, Object.keys(io.sockets.connected).length);
    });

    socket.on(`user-id-info`, async function (userIdInfo) {
      logger.info(`Received userIdInfo`, userIdInfo);
      await db.collection(`Sockets`).updateOne({_id: socket.id}, {
          $set: { userGaId: userIdInfo.userGaId, wikiUserName: userIdInfo.wikiUserName },
        }, { upsert: true }
      );
      await emitMetricsUpdate();
    });

    await db.collection(`Sockets`).updateOne({_id: socket.id}, {
      $setOnInsert: { created: new Date() }
    }, { upsert: true } );
  });

  setInterval(async () => {
    await emitMetricsUpdate();
  },5000);
}

function setupAuthApi(db, app) {
  const passport = require(`passport`);
  const oauthFetch = require('oauth-fetch-json');
  const session = require('express-session');

  var MongoDBStore = require('connect-mongodb-session')(session);
  var mongoDBStore = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'Sessions',
  });

  app.use(session({
    cookie: {
      // 7 days
      maxAge: 7*24*60*60*1000
     },
    secret: 'keyboard cat like a random stuff',
    resave: false,
    saveUninitialized: true,
    store: mongoDBStore,
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
        callbackURL: `http://${process.env.PUBLIC_HOST}/auth/mediawiki/callback` // TODO probably need to set HOST and PORT
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
      logger.debug(`Setting res.locals.user = `, res.locals.user);
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

  const rateLimit = require("express-rate-limit");
  const editLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutes
    max: 30 // 30 edits globally per 3 minutes
  });

  app.get(`/api/auth/revert/:wikiRevId`, ensureAuthenticated, editLimiter,  asyncHandler(async (req, res) => {
    logger.info(`Receive auth revert request`, req.params);
    let wiki = req.params.wikiRevId.split(':')[0];
    let revId = req.params.wikiRevId.split(':')[1];
    let apiUrl = `https://${wikiToDomain[wiki]}/w/api.php`;

    let revInfo = (await fetchRevisions([req.params.wikiRevId]))[wiki]; // assuming request succeeded

    // Documentation: https://www.mediawiki.org/wiki/API:Edit#API_documentation
    let userInfo = await oauthFetch(apiUrl, {
      "action": "query",
      "format": "json",
      "meta": "userinfo",
      "uiprop": "rights|groups|groupmemberships"
    }, {method: 'GET'}, req.user.oauth );  // assuming request succeeded;
    logger.debug(`userInfo ret = `, userInfo);
    let whitelisted = await isWhitelistedFor(`DirectRevert`, userInfo.query.userinfo.name);
    logger.warn(`userInfo.query.userinfo.rights.indexOf('rollback)`, userInfo.query.userinfo.rights.indexOf(`rollback`));
    logger.warn(`whitelisted`, whitelisted);
    if (whitelisted || userInfo.query.userinfo.rights.indexOf(`rollback`) >= 0) {
      let token = (await oauthFetch( apiUrl,     {
        "action": "query",
        "format": "json",
        "meta": "tokens"
      }, {}, req.user.oauth)).query.tokens.csrftoken;  // assuming request succeeded;

      try {
        let payload = {
          "action": "edit",
          "format": "json",
          "title": revInfo[0].title, // TODO(zzn): assuming only 1 revision is being reverted
          "summary": `Identified as test/vandalism and undid revision ${revId} by [[User:${revInfo[0].user}]] with [[m:WikiLoop Battlefield]](v${require(
            './../package.json').version}). See it or provide your opinion at http://${process.env.PUBLIC_HOST || "localhost:8000"}/revision/${wiki}/${revId}`,
          "undo": revId,
          "token": token
        };
        if (wiki == 'enwiki') { // currently only enwiki has the manually created tag of WikiLoop Battlefield
          payload['tags'] = "WikiLoop Battlefield";
        }
        let retData = await oauthFetch(apiUrl, payload, {method: 'POST'}, req.user.oauth );  // assuming request succeeded;
        res.setHeader('Content-Type', 'application/json');
        res.status(200);
        res.send(JSON.stringify(retData));
        logger.debug(`conducted revert for wikiRevId=${req.params.wikiRevId}`);
      } catch (err) {
        apiLogger.error(err);
        res.status( 500 );
        res.send(err);
      }
    } else {
      logger.warn(`Attempt to direct revert but no rights or whitelisted`)
      res.status(403);
      res.send(`Error, lack of permission!. No rollback rights or whitelisted`);
    }

  }));
  app.get(`/api/auth/user/preferences`, ensureAuthenticated, asyncHandler(async (req, res) => {
    let wikiUserName = req.user.displayName;
    let userPreferences = await mongoose.connection.db.collection(
      `UserPreferences`)
      .find({wikiUserName: wikiUserName})
      .toArray();
    res.send(userPreferences.length > 0 ? userPreferences[0] : {});
  }));

  app.post(`/api/auth/user/preferences`, ensureAuthenticated,
    asyncHandler(async (req, res) => {
      await mongoose.connection.db.collection(`UserPreferences`)
        .update({wikiUserName: req.user.displayName}, {
          $set: req.body,
          $setOnInsert: {created: new Date()}
        }, {upsert: true});
      let wikiUserName = req.user.id;
      let userPreferences = await mongoose.connection.db.collection(
        `UserPreferences`)
        .find({wikiUserName: wikiUserName})
        .toArray();
      res.send(userPreferences.length > 0 ? userPreferences[0] : {});
    }));
}

function setupFlag() {
  const yargs = require('yargs');
  const argv = yargs
      .option('server-only', {
        alias: 's',
        default: false,
        description: 'If true, the app will be run as server-only',
        type: 'boolean',
      })
      .help().alias('help', 'h')
      .argv;
  return argv;
}

async function start() {
  const flag = setupFlag();
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const {host, port} = nuxt.options.server

  const app = express();
  app.use(responseTime());

  const cookieParser = require('cookie-parser');
  app.use(cookieParser());
  // Setup Google Analytics
  app.use(universalAnalytics.middleware(process.env.GA_WLBF_ID_API, {cookieName: '_ga'}));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(express.json({ limit: '50mb', extended: true }));
  app.use(logReqPerf);

  const server = http.Server(app);
  const io = require('socket.io')(server, { cookie: false });
  app.set('socketio', io);
  await mongoose.connect(process.env.MONGODB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
    );

  app.use(function (req, res, next) {
    apiLogger.debug('req.originalUrl:', req.originalUrl);
    apiLogger.debug('req.params:', req.params);
    apiLogger.debug('req.query:', req.query);
    next();
  });
  if (useOauth) setupAuthApi(mongoose.connection.db, app);
  setupIoSocketListener(mongoose.connection.db, io);
  setupApiRequestListener(mongoose.connection.db, io, app);

  if (!flag['server-only']) {
    await nuxt.ready();

    // Build only in dev mode
    if (config.dev) {
      logger.info(`Running Nuxt Builder ... `);
      const builder = new Builder(nuxt);
      await builder.build();
      logger.info(`DONE ... `);
    } else {
      logger.info(`NOT Running Nuxt Builder`);
    }
    // Give nuxt middleware to express
    app.use(nuxt.render);
  }

  // Listen the server
  // app.listen(port, host)
  server.listen(port, host);
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  });

  if (process.env.INGESTION_ENABLED === '1') {
    const oresStream = new OresStream(`enwiki`);
    oresStream.subscribe();
    logger.info(`Ingestion enabled`);
  } else {
    logger.info(`Ingestion disabled`);
  }
  setupCronJobs();
  setupHooks();
}

start();
