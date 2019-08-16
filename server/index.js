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
const http = require('http');
const express = require('express');
const consola = require('consola');
const {Nuxt, Builder} = require('nuxt');
const MongoClient = require('mongodb').MongoClient;
const universalAnalytics = require('universal-analytics');
const rp = require(`request-promise`);
const asyncHandler = fn => (req, res, next) =>
    Promise
        .resolve(fn(req, res, next))
        .catch(next);
const logger = new (require('heroku-logger').Logger)({
  level: process.env.LOG_LEVEL || 'debug',
  delimiter: " | ",
  prefix: 'index'
});

const apiLogger = new (require('heroku-logger').Logger)({
  level: process.env.LOG_LEVEL || 'debug',
  delimiter: " | ",
  prefix: 'api'
});

const perfLogger = new (require('heroku-logger').Logger)({
  level: process.env.LOG_LEVEL || 'debug',
  delimiter: " | ",
  prefix: 'perf'
});

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
function isEmpty(value) {
  return typeof value == 'string' && !value.trim() || typeof value == 'undefined' || value === null;
}

const useStiki = isEmpty(process.env.STIKI_MYSQL);
const useOauth = isEmpty(process.env.MEDIAWIKI_CONSUMER_SECRET) && isEmpty(process.env.MEDIAWIKI_CONSUMER_KEY);
// Import and Set Nuxt.js options
const config = require('../nuxt.config.js');
config.dev = !(process.env.NODE_ENV === 'production');

function computeOresField(oresJson, wiki, revId) {
  let damagingScore = oresJson.damagingScore || (oresJson[wiki].scores[revId].damaging.score && oresJson[wiki].scores[revId].damaging.score.probability.true);
  let badfaithScore = oresJson.badfaithScore || (oresJson[wiki].scores[revId].goodfaith.score && oresJson[wiki].scores[revId].goodfaith.score.probability.false);
  let damaging = oresJson.damaging || (oresJson[wiki].scores[revId].damaging.score && oresJson[wiki].scores[revId].damaging.score.prediction);
  let badfaith = oresJson.badfaith || (oresJson[wiki].scores[revId].goodfaith.score && !oresJson[wiki].scores[revId].goodfaith.score.prediction);
  return {
    wikiRevId: `${wiki}:${revId}`,
    damagingScore: damagingScore,
    damaging: damaging,
    badfaithScore: badfaithScore,
    badfaith: badfaith
  }
}

// TODO: merged with shared/utility
function getUrlBaseByWiki(wiki) {
  let wikiToLang = {
    'enwiki': 'en',
    'frwiki': 'fr',
    'ruwiki': 'ru'
  };
  return `https://${wikiToLang[wiki]}.wikipedia.org`; // Require HTTPS to conduct the write edits
}

async function fetchOres(wiki, revIds) {
  let oresUrl = `https://ores.wmflabs.org/v3/scores/${wiki}/?models=damaging|goodfaith&revids=${revIds.join('|')}`;
  let oresResultJson = await rp.get(oresUrl, {json: true});
  return revIds.map(revId => computeOresField(oresResultJson, wiki, revId));
}

async function fetchRevisions(wiki, revIds = []) {
  if (revIds.length > 0) {
    const fetchUrl = new URL(`${getUrlBaseByWiki(wiki)}/w/api.php`);
    let params = {
      "action": "query",
      "format": "json",
      "prop": "revisions|info",
      "indexpageids": 1,
      "revids": revIds.join('|'),
      "rvprop": "ids|timestamp|flags|user|tags|size|comment",
      "rvslots": "main"
    };
    Object.keys(params).forEach(key => {
      fetchUrl.searchParams.set(key, params[key]);
    });
    let retJson = await rp.get(fetchUrl, {json: true});
    if (retJson.query.badrevids) {
      return []; // does not find
    }
    else {
      /** Example
      {
          "batchcomplete": "",
          "query": {
              "pageids": [
                  "16377",
                  "103072"
              ],
              "pages": {
                  "16377": {
                      "pageid": 16377,
                      "ns": 104,
                      "title": "API:Query",
                      "revisions": [
                          {
                              "revid": 3319487,
                              "parentid": 3319442,
                              "minor": "",
                              "user": "Shirayuki",
                              "timestamp": "2019-07-16T22:08:58Z",
                              "size": 15845,
                              "comment": "",
                              "tags": []
                          }
                      ],
                      "contentmodel": "wikitext",
                      "pagelanguage": "en",
                      "pagelanguagehtmlcode": "en",
                      "pagelanguagedir": "ltr",
                      "touched": "2019-07-17T03:10:17Z",
                      "lastrevid": 3319487,
                      "length": 15845
                  },
                  "103072": {
                      "pageid": 103072,
                      "ns": 104,
                      "title": "API:Lists/All",
                      "revisions": [
                          {
                              "revid": 2287599,
                              "parentid": 2287488,
                              "user": "Wargo",
                              "timestamp": "2016-11-17T16:49:59Z",
                              "size": 924,
                              "comment": "Undo revision 2287488 by [[Special:Contributions/Jkmartindale|Jkmartindale]] ([[User talk:Jkmartindale|talk]])",
                              "tags": []
                          }
                      ],
                      "contentmodel": "wikitext",
                      "pagelanguage": "en",
                      "pagelanguagehtmlcode": "en",
                      "pagelanguagedir": "ltr",
                      "touched": "2019-07-18T04:14:03Z",
                      "lastrevid": 2287599,
                      "length": 924
                  }
              }
          }
      }
       */
      let revIdToRevision = {};
      for (let pageId of retJson.query.pageids) {
        for (let revision of retJson.query.pages[pageId].revisions) {
          revIdToRevision[revision.revid] = revision;
          revIdToRevision[revision.revid].title = retJson.query.pages[pageId].title;
          revIdToRevision[revision.revid].wiki = wiki;
          revIdToRevision[revision.revid].wikiRevId = `${wiki}:${revision.revid}`;
          revIdToRevision[revision.revid].pageLatestRevId = retJson.query.pages[pageId].lastrevid;
          revIdToRevision[revision.revid].namespace = revision.ns;
        }
      }
      return revIds.map(revId => revIdToRevision[revId]);
    }
  }
}

async function getNewJudgementCounts(db, matcher = {}, offset = 0, limit = 10) {
  return await db.collection(`Interaction`).aggregate([
        {
          $match: matcher
        },
        {
          "$group" : {
            "_id" : {
              "wikiRevId" : "$wikiRevId"
            },
            "wikiRevId" : {
              "$first" : "$wikiRevId"
            },
            "judgements" : {
              "$push" : {
                "judgement" : "$judgement",
                "userGaId" : "$userGaId",
                "timestamp" : "$timestamp"
              }
            },
            "totalCounts" : {
              "$sum" : 1
            },
            "shouldRevertCounts" : {
              "$sum" : {
                "$cond" : [
                  {
                    "$eq" : [
                      "$judgement",
                      "ShouldRevert"
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            "notSureCounts" : {
              "$sum" : {
                "$cond" : [
                  {
                    "$eq" : [
                      "$judgement",
                      "NotSure"
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            "looksGoodCounts" : {
              "$sum" : {
                "$cond" : [
                  {
                    "$eq" : [
                      "$judgement",
                      "LooksGood"
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            "lastTimestamp" : {
              "$max" : "$timestamp"
            },
            "recentChange": {
              "$first": "$recentChange"
            }
          }
        },
        {
          "$project" : {
            "wikiRevId" : "$_id.wikiRevId",
            "judgements" : "$judgements",
            "recentChange" : 1,
            "lastTimestamp" : 1,
            "counts.Total" : "$totalCounts",
            "counts.ShouldRevert" : "$shouldRevertCounts",
            "counts.NotSure" : "$notSureCounts",
            "counts.LooksGood" : "$looksGoodCounts"
          }
        },
        {
          "$match" : {
            "recentChange.ores" : {
              "$exists" : true,
              "$ne" : null
            },
            "recentChange.wiki" : {
              "$exists" : true,
              "$ne" : null
            },
            "lastTimestamp" : {
              "$exists" : true,
              "$ne" : null
            }
          }
        },
        {
          "$sort" : {
            "lastTimestamp" : -1
          }
        },
      ],
      {
        "allowDiskUse": true
      })
      .skip(offset)
      .limit(limit)
      .toArray();

  /**
   * Example of output schema:
   {
      "_id":{
        "wikiRevId":"enwiki:905704873"
      },

      "lastTimestamp":"1562791937",
      "recentChange":{
        "_id":"enwiki-1169325920",
        "id":"1169325920",
        "title":"Financial endowment",
        "namespace":"0",
        "revision":{
          "new":"905704873",
          "old":"900747399"
        },
        "ores":{
          "damagingScore":"0.8937388482947232",
          "damaging":"true",
          "badfaithScore":"0.8787846798198944",
          "badfaith":"true"
        },
        "user":"<userId or IP>>",
        "wiki":"enwiki",
        "timestamp":"1562791912"
      },
      "wikiRevId":"enwiki:905704873",
      "judgements":[
        {
          "judgement":"ShouldRevert",
          "userGaId":"<userGaId>",
          "timestamp":"1562791937"
        }
      ],
      "counts":{
        "Total":1,
        "ShouldRevert":1,
        "NotSure":0,
        "LooksGood":0
      }
   }
   */
}

/**
 * @deprecated use getNewJudgementCounts
 * @param db
 * @param newRecentChange
 * @returns {Promise<void>}
 */
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

/**
 * @deprecated use queryMarkedRevisions
 * @param db
 * @param myGaId
 * @returns {Promise<any[]>}
 */
async function queryMarkedRecentChange(db, myGaId) {
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

  apiRouter.get('/', (req, res, next) => {
    res.send('API root');
    req.visitor
        .event({ec: "api", ea: "/"})
        .send();
  });

  apiRouter.get('/diff/:wikiRevId', asyncHandler(async (req, res) => {
    logger.debug(`req.query`, req.query);
    let wikiRevId = req.params.wikiRevId;
    let wiki = wikiRevId.split(':')[0];
    let revId = wikiRevId.split(':')[1];
    let diffApiUrl = `${getUrlBaseByWiki(wiki)}/w/api.php?action=compare&fromrev=${revId}&torelative=prev&format=json`;
    let diffJson = await rp.get(diffApiUrl, {json: true});
    res.send(diffJson);
    req.visitor
        .event({ec: "api", ea: "/diff/:wikiRevId"})
        .send();
  }));

  apiRouter.get('/diff', asyncHandler(async (req, res) => {
    logger.debug(`req.query`, req.query);
    let diffApiUrl = `${req.query.serverUrl}/w/api.php?action=compare&fromrev=${req.query.revId}&torelative=prev&format=json`;
    let diffJson = await rp.get(diffApiUrl, {json: true});
    res.send(diffJson);
    req.visitor
        .event({ec: "api", ea: "/diff"})
        .send();
  }));

  apiRouter.get('/recentChanges', asyncHandler(async (req, res) => {
    logger.debug(`req.query`, req.query);

    // let diffApiUrl = `${req.query.serverUrl}/w/api.php?action=compare&fromrev=${req.query.revId}&torelative=prev&format=json`;
    // let diffJson = await rp.get(diffApiUrl, {json: true});
    res.send(req.query);

  }));

  apiRouter.get('/ores', asyncHandler(async (req, res) => {
    let revIds = req.query.revIds;
    let wiki = req.query.wiki;
    let ret = await fetchOres(wiki, revIds);
    res.send(ret);
    req.visitor
        .event({ec: "api", ea: "/ores"})
        .send();
  }));

  apiRouter.get('/ores/:wikiRevId', asyncHandler(async (req, res) => {
    let wikiRevId = req.params.wikiRevId;
    let wiki = wikiRevId.split(':')[0];
    let revId = wikiRevId.split(':')[1];
    let ret = await fetchOres(wiki, [revId]);
    if (ret.length === 1) {
      res.send(ret[0] );
    } else if (ret.length === 0) {
      res.status(404);
      res.send(`Can't find ores`);
    } else {
      res.status(500);
      res.send(`Something is wrong`);
    }
    req.visitor
        .event({ec: "api", ea: "/ores/:wikiRevId"})
        .send();
  }));

  apiRouter.get('/revision/:wikiRevId', asyncHandler(async (req, res) => {
    let wikiRevId = req.params.wikiRevId;
    let revisions = await fetchRevisions(wikiRevId.split(':')[0], [wikiRevId.split(':')[1]]);
    if (revisions.length === 1) {
      res.send(revisions[0] );
    } else if (revisions.length === 0) {
      res.status(404);
      res.send(`Can't find revisions`);
    } else {
      res.status(500);
      res.send(`Something is wrong`);
    }

    req.visitor
        .event({ec: "api", ea: "/revision/:wikiRevId"})
        .send();
  }));

  apiRouter.get('/revisions', asyncHandler(async (req, res) => {
    let revIds = req.query.revIds;
    let wiki = req.query.wiki;
    let revisions = await fetchRevisions(wiki, revIds);
    res.send(revisions);

    req.visitor
        .event({ec: "api", ea: "/revision/:wikiRevId"})
        .send();
  }));

  apiRouter.get('/interaction/:wikiRevId', asyncHandler(async (req, res) => {
    let wikiRevId = req.params.wikiRevId;
    let interactions = await getNewJudgementCounts(db,
    // {
    //   wikiRevId: {$in: [wikiRevId]}
    // },
        { "wikiRevId": {"$in":[wikiRevId]} }
        );
    if (interactions.length >= 1) {
      res.send(interactions[0] );
    } else {
      res.send({
        "_id": {
          "wikiRevId": wikiRevId
        },
        "wikiRevId": wikiRevId,
        "judgements": [
        ],
        "counts": {
          "Total": 0,
          "ShouldRevert": 0,
          "NotSure": 0,
          "LooksGood": 0
        }
      });
    }
    req.visitor
        .event({ec: "api", ea: "/interaction/:wikiRevId"})
        .send();
  }));

  apiRouter.get('/interactions', asyncHandler(async (req, res) => {
    let limit = parseInt(req.query.limit) || 10;
    let offset = parseInt(req.query.offset) || 0;
    let matcher = {};
    if (req.query.wikiRevIds) {
      matcher.wikiRevId = { $in: req.query.wikiRevIds }
    }
    if (req.query.userGaIds) {
      matcher.userGaId = { $in: req.query.userGaIds }
    }

    let interactions = await getNewJudgementCounts(db, matcher, offset, limit);
    res.send(interactions);
    req.visitor
        .event({ec: "api", ea: "/interactions"})
        .send();
  }));

  apiRouter.post('/interaction/:wikiRevId', asyncHandler(async (req, res) => {
    let userGaId = req.body.gaId;
    let wikiRevId = req.params.wikiRevId;
    /**
    {
      gaId: gaId,
      judgement: this.myJudgement,
      timestamp: Math.floor(new Date().getTime() / 1000),
      wikiRevId: revision.wikiRevId,
      recentChange: {
        title: revision.title,
        namespace: revision.namespace,
        revision: {
          new: revision.revid,
          old: revision.parentid,
        },
        ores: this.ores,
        user: revision.user,
        wiki: revision.wiki,
        timestamp: revision.timestamp
      }
    }
    */

    let doc = req.body;
    await db.collection(`Interaction`).findOneAndReplace({
      userGaId: userGaId,
      wikiRevId: wikiRevId,
    }, doc, {upsert: true});
    apicache.clear(req.originalUrl);
    let storedInteractions = await getNewJudgementCounts(db, {wikiRevId: {$in : [wikiRevId]}});
    let storedInteraction = storedInteractions[0];

    storedInteraction.newJudgement = {
      userGaId:  doc.userGaId,
      judgement: doc.judgement,
      timestamp: doc.timestamp
    };
    io.sockets.emit('interaction', storedInteraction);

    res.send(`ok`);
    req.visitor
        .event({ec: "api", ea: "/interaction"})
        .event("judgement", req.body.judgement)
        .send();
  }));

  /**
   * TODO fix it.
   * @deprecated
   */
  apiRouter.post('/interaction', asyncHandler(async (req, res) => {
    logger.debug(`Interaction req`, req.cookies, req.body);

    let userGaId = req.body.gaId;
    let newRecentChange = req.body.newRecentChange;
    let doc = {
      userGaId: userGaId,
      wikiRevId: `${newRecentChange.wiki}:${newRecentChange.revision.new}`,
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

  apiRouter.get("/markedRevs.csv", asyncHandler(async (req, res) => {
    let newJudgementCounts = await getNewJudgementCounts(
        db, {}, 0, 10000000/* as many as possible to download all */);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + Date.now() + '.csv\"');
    const stringify = require('csv-stringify');
    let ret = [[
          `WikiRevId`,
          `LastTimestamp`,
          `OresDamagingScore`,
          `OresBadfaithScore`,
          `ShouldRevert`,
          `NotSure`,
          `LooksGood`
        ]]
        .concat(newJudgementCounts.map((newJudgementCount) => [
          newJudgementCount.wikiRevId,
          newJudgementCount.lastTimestamp,
          newJudgementCount.recentChange.ores ? newJudgementCount.recentChange.ores.damagingScore: "null",
          newJudgementCount.recentChange.ores ? newJudgementCount.recentChange.ores.badfaithScore: "null",
          newJudgementCount.counts.ShouldRevert,
          newJudgementCount.counts.NotSure,
          newJudgementCount.counts.LooksGood,
          // newJudgementCount.judgements
        ]));
    stringify(ret, {header: false})
        .pipe(res);
  }));

  /**
   * @deprecated
   */
  apiRouter.get("/marked.csv", asyncHandler(async (req, res) => {
    let myGaId = req.body.gaId || req.cookies._ga;
    let recentChanges = await queryMarkedRecentChange(db, myGaId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + Date.now() + '.csv\"');
    // res.send(recentChanges);
    const stringify = require('csv-stringify');
    let ret = [[`WikiRevId`, `OresDamagingScore`, `OresBadfaithScore`, `ShouldRevert`, `NotSure`, `LooksGood`]]
        .concat(recentChanges.map(rc => [
          rc.wikiRevId, rc.ores.damagingScore, rc.ores.badfaithScore,
          rc.judgementCounts.ShouldRevert || 0, rc.judgementCounts.NotSure || 0, rc.judgementCounts.LooksGood || 0
        ]));
    stringify(ret, {header: false})
        .pipe(res);
  }));


  apiRouter.get("/markedRevs", asyncHandler(async (req, res) => {
    res.send(await getNewJudgementCounts(db));
  }));

  /**
   * @deprecated
   */
  apiRouter.get("/marked", asyncHandler(async (req, res) => {
    let myGaId = req.body.gaId || req.cookies._ga;
    let recentChanges = await queryMarkedRecentChange(db, myGaId);
    res.send(recentChanges);
  }));

  /**
   * Return a list of all leader
   * Pseudo SQL
   *
   *
   * ```SQL
   *   SELECT user, count(*) FROM Interaction GROUP BY user ORDER by user;
   * ````
   */
  apiRouter.get('/leaderboard', asyncHandler(async (req, res) => {
    let myGaId = req.body.gaId || req.cookies._ga;

    // TO-FUTURE-DO consider adding pagination if performance is a problem. We don't expect this list to be more than
    // 10K records anytime soon
    let ret = await db.collection("Interaction").aggregate(
        [
          {
            "$match": {
              "userGaId": {$ne: null}
            }
          },
          {
            "$group" : {
              "_id" : {
                "userGaId" : "$userGaId"
              },
              "count" : {
                "$sum" : 1
              },
              "lastTimestamp" : {
                "$max" : "$timestamp"
              }
            }
          },
          {
            "$sort" : {
              "count" : -1
            }
          },
          {
            "$project" : {
              "userGaId" : "$_id.userGaId",
              "count" : 1,
              "lastTimestamp" : 1
            }
          }
        ],
        {
          "allowDiskUse" : false
        }
    ).toArray();
    res.send(ret);
    req.visitor
        .event({ec: "api", ea: "/leaderboard"})
        .send();
  }));


  apiRouter.get('/stats', asyncHandler(async (req, res) => {
    let myGaId = req.body.gaId || req.cookies._ga;
    logger.debug(`req.query`, req.query);
    let allInteractions = await db.collection(`Interaction`)
        .find({}, {
          userGaId: 1,
          judgement: 1,
          wikiRevId: 1,
        }).toArray();
    let revSet = {};
    allInteractions.forEach(item => revSet[item.wikiRevId] = true);
    let ret = {
      totalJudgement: allInteractions.length,
      totalRevJudged: Object.keys(revSet).length,
      totalShouldRevert: allInteractions.filter(i => i.judgement === "ShouldRevert").length,
    };

    if (myGaId) {
      let myInteractions = allInteractions.filter(i => i.userGaId === myGaId);
      let myRevSet = {};
      myInteractions.forEach(item => myRevSet[item.wikiRevId] = true);
      ret.totalMyJudgement = myInteractions.length;
      ret.totalMyRevJudged = Object.keys(myRevSet).length;
      ret.totalMyShouldRevert = myInteractions.filter(item => item.judgement === "ShouldRevert").length;
    }

    res.send(ret);
    req.visitor
        .event({ec: "api", ea: "/stats"})
        .send();
  }));

  {
    const Avatars = require('@dicebear/avatars').default;
    const sprites = require('@dicebear/avatars-male-sprites').default;
    let avatars = new Avatars(sprites({}));

    // TODO build batch api for avatar until performance is an issue. We have cache anyway should be fine.
    apiRouter.get("/avatar/:seed", asyncHandler(async (req, res) => {
      logger.debug(`avatar requested with seed`, req.params.seed);
      let svg = avatars.create(req.params.seed);
      res.send(svg);
      req.visitor
          .event({ec: "api", ea: "/avatar/:seed"})
          .send();
    }));
  }

  /** Get the latest recentChangee
   * @deprecated
   */
  apiRouter.get('/latest', asyncHandler(async (req, res) => {

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
            nonbot: true, // we already query the server with "rcprop=!bot" filter
            comment: rawRecentChange.comment,
          };
        });
    res.send(recentChanges.reverse());
    req.visitor
        .event({ec: "api", ea: "/latest"})
        .send();

  }));

  apiRouter.get('/latestRevs', asyncHandler(async (req, res) => {
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
            wikiRevId: `${wiki}:${rawRecentChange.revid}`,
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
            nonbot: true, // we already query the server with "rcprop=!bot" filter
            comment: rawRecentChange.comment,
          };
        });
    res.send(recentChanges.reverse());
    req.visitor
        .event({ec: "api", ea: "/latestRevs"})
        .send();

  }));

  apiRouter.get('/flags', (req, res, next) => {
    res.send({
      useStiki: useStiki,
      useOauth: useOauth
    });
    req.visitor
        .event({ec: "api", ea: "/"})
        .send();
  });

  apiRouter.get('/mediawiki', asyncHandler(async (req, res) => {
    // TODO add sanitize if we see abuse.
    apiLogger.debug('req.params:', req.params);
    apiLogger.debug('req.query:', req.query);
    const fetchUrl = new URL(`${getUrlBaseByWiki(req.query.wiki)}/w/api.php`);
    let params = JSON.parse(req.query.apiQuery);

    Object.keys(params).forEach(key => {
      fetchUrl.searchParams.set(key, params[key]);
    });
    let retJson = await rp.get(fetchUrl, {json: true});
    res.send(retJson);
    req.visitor
        .event({ec: "mediawiki", ea: "/"})
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
        callbackURL: `${process.env.AXIOS_BASE_URL}/auth/mediawiki/callback`
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

  app.use(function (req, res, next) {
    apiLogger.debug('req.originalUrl:', req.originalUrl);
    apiLogger.debug('req.params:', req.params);
    apiLogger.debug('req.query:', req.query);
    next();
  });
  if (useOauth) setupAuthApi(app);
  setupIoSocketListener(io);
  setupMediaWikiListener(db, io);
  setupApiRequestListener(db, io, app);

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
