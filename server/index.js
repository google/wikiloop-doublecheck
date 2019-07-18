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
const ua = require('universal-analytics');
const rp = require(`request-promise`);

var log4js = require('log4js');
var logger = log4js.getLogger();

var apiLogger = log4js.getLogger(`api`);
logger.level = 'debug';

let docCounter = 0;
let allDocCounter = 0;

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js');
config.dev = !(process.env.NODE_ENV === 'production');

function computeOresField(oresJson, wiki, revId) {
  let damagingScore = oresJson[wiki].scores[revId].damaging.score.probability.true;
  let badfaithScore = oresJson[wiki].scores[revId].goodfaith.score.probability.false;
  let damaging = oresJson[wiki].scores[revId].damaging.score.prediction;
  let badfaith = !oresJson[wiki].scores[revId].goodfaith.score.prediction;
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
  return `http://${wikiToLang[wiki]}.wikipedia.org`;
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

async function getNewJudgementCounts(db, wikiRevIds = []) {
  let matchFilter = {};
  if (wikiRevIds && wikiRevIds.length > 0) {
    matchFilter.wikiRevId = {$in: wikiRevIds};
  }

  return await db.collection(`Interaction`).aggregate([
        {
          $match: matchFilter
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
            }
          }
        },
        {
          "$project" : {
            "wikiRevId" : "$_id.wikiRevId",
            "judgements" : "$judgements",
            "lastTimestamp" : 1.0,
            "counts.Total" : "$totalCounts",
            "counts.ShouldRevert" : "$shouldRevertCounts",
            "counts.NotSure" : "$notSureCounts",
            "counts.LooksGood" : "$looksGoodCounts"
          }
        },
        {
          "$sort" : {
            "counts.lastTimeStamp" : -1.0
          }
        },
        {
          "$match" : {
            "lastTimestamp" : {
              "$exists" : true,
              "$ne" : null
            }
          }
        }
      ],
      {
        "allowDiskUse": true
      }).toArray();

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

// -------------- FROM API ----------------
function setupApiRequestListener(db, io, app) {
  let apiRouter = express();


  const cookieParser = require('cookie-parser');
  const bodyParser = require('body-parser');
  const apicache = require('apicache');
  let cache = apicache.middleware;

  apiRouter.use(cookieParser());
  apiRouter.use(bodyParser());
  const onlyGet = (req, res) => res.method === `GET`;

  apiRouter.use(cache('1 week', onlyGet));
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

  /**
   * Get a list of `revisions`
   */
  apiRouter.get('/revisions', asyncHandler(async (req, res) => {
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

  apiRouter.get('/interaction/:wikiRevId', asyncHandler(async (req, res) => {
    let wikiRevId = req.params.wikiRevId;
    let interactions = await getNewJudgementCounts(db, [wikiRevId]);
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

  apiRouter.post('/interaction/:wikiRevId', asyncHandler(async (req, res) => {
    let userGaId = req.body.gaId;
    let wikiRevId = req.params.wikiRevId;
    /**
    {
      gaId: gaId,
      judgement: this.myJudgement,
      timestamp: Math.floor(new Date().getTime() / 1000),
      wikiRevId: revision.wikiRevId,
      newRecentChange: {
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
    logger.info(`Interaction cache clearing for ${wikiRevId}`);
    apicache.clear(req.originalUrl);
    logger.info(`Done cache cleared for ${wikiRevId}`);
    let storedInteractions = await getNewJudgementCounts(db, [wikiRevId]);
    let storedInteraction = storedInteractions[0];
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
    let newJudgementCounts = await getNewJudgementCounts(db);
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

  apiRouter.get('/stats', asyncHandler(async (req, res) => {
    // let myGaId = req.body.gaId || req.cookies._ga;
    //
    // logger.debug(`req.query`, req.query);
    // let allInteractions = await db.collection(`Interaction`)
    //     .find({}, {
    //       userGaId: 1,
    //       judgement: 1,
    //       "recentChange.id": 1,
    //       "recentChang.title": 1,
    //       "recentChange.wiki": 1
    //     }).toArray();
    // let revSet = {};
    // allInteractions.forEach(i => revSet[i.recentChange.id] = true);
    // let ret = {
    //   totalJudgement: allInteractions.length,
    //   totalRevJudged: Object.keys(revSet).length,
    //   totalShouldRevert: allInteractions.filter(i => i.judgement === "ShouldRevert").length,
    // };
    //
    // if (myGaId) {
    //   let myInteractions = allInteractions.filter(i => i.userGaId === myGaId);
    //   let myRevSet = {};
    //   myInteractions.forEach(i => myRevSet[i.recentChange.id] = true);
    //   ret.totalMyJudgement = myInteractions.length;
    //   ret.totalMyRevJudged = Object.keys(myRevSet).length;
    //   ret.totalMyShouldRevert = myInteractions.filter(i => i.judgement === "ShouldRevert").length;
    // }

    res.send(
      //TODO fix this
      {
        totalJudgement: 0,
        totalRevJudged: 0,
        totalShouldRevert: 0,
      }
    );
    req.visitor
        .event({ec: "api", ea: "/stats"})
        .send();
  }));

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
              nonbot: !recentChange.bot,
            };
            docCounter++;
            logger.debug(`#${docCounter} / ${allDocCounter}`);
            doc.comment = recentChange.comment;
            io.sockets.emit('recent-change', doc);
            delete doc.comment;
            // TODO add
            // await db.collection(`MediaWikiRecentChange`).insertOne(doc);

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
  app.use(function (req, res, next) {
    apiLogger.debug('req.originalUrl:', req.originalUrl);
    apiLogger.debug('req.params:', req.params);
    apiLogger.debug('req.query:', req.query);
    next();
  });

  setupIoSocketListener(io);
  setupMediaWikiListener(db, io);
  setupApiRequestListener(db, io, app);

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
