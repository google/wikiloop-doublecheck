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

import { wikiToDomain } from "@/shared/utility-shared";
const rp = require('request-promise');

const chalk = require('chalk');

const Logger = require('heroku-logger').Logger;
const pad = require('pad');

export const logger = require('heroku-logger');

export const latencyColor = function (latencyMs) {
  if (latencyMs >= 50000) return 'red';
  else if (latencyMs >= 5000) return 'orange';
  else if (latencyMs >= 500) return 'yellow';
  else return 'lightgreen';
}

export const statusColor = function(statusCode) {
  let codeNum = parseInt(statusCode);
  if (codeNum >= 600) return 'purple';
  else if (codeNum >= 500) return 'red';
  else if (codeNum >= 400) return 'orange';
  else if (codeNum >= 300) return 'yellow';
  else if (codeNum >= 200) return 'lightgreen';
  else if (codeNum >= 100) return 'lightblue';
  else return 'lightpink';
}

export const axiosLogger = new Logger({
  prefix: pad('AXIOS', 8),
  LOG_LEVEL: 'debug'
});

export const apiLogger = new Logger({
  prefix: pad('API', 8),    // Defaults to `''`.
});

export const perfLogger = new Logger({
  prefix: pad('PERF', 8),    // Defaults to `''`.
});
export const mailCronLogger = new Logger({
  prefix: pad('MAILCRON', 8),    // Defaults to `''`.
});


export const colorizeMaybe = function (logger, color, message) {
  if (logger.config.color) {
    return chalk.keyword(color)(message);
  } else {
    return message;
  }
}

export async function isWhitelistedFor(featureName, wikiUserName) {
  const mongoose = require('mongoose');
  let db = mongoose.connection.db;
  console.log(`featureName`, featureName, "wikiUserName", wikiUserName);
  let ret = await db.collection(`FeatureList`).find({
    featureName: featureName,
    whitelistedWikiUserNames: {$elemMatch: {$eq: wikiUserName}}
  }).toArray();
  return ret.length >= 1
}

/**
 * @deprecated
 * @param oresJson
 * @param wiki
 * @param revId
 * @return {{badfaithScore: *, damagingScore: *, badfaith: *, damaging: *, wikiRevId: string}}
 */
export function computeOresField(oresJson, wiki, revId) {
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
export function computeOresFieldNew(oresJson, wiki, revId) {
  let ret:any = {};
  let damagingScore = oresJson.damagingScore || (oresJson[wiki].scores[revId].damaging.score && oresJson[wiki].scores[revId].damaging.score.probability.true);
  let badfaithScore = oresJson.badfaithScore || (oresJson[wiki].scores[revId].goodfaith.score && oresJson[wiki].scores[revId].goodfaith.score.probability.false);
  ret.wikiRevId = `${wiki}:${revId}`;
  ret['damaging'] = {};
  ret['goodfaith'] = {};
  ret['damaging']['true'] = damagingScore;
  ret['damaging']['false'] = 1 - damagingScore;
  ret['goodfaith']['true'] = 1 - badfaithScore;
  ret['goodfaith']['false'] = badfaithScore;
  return ret;
}

export async function fetchRevisions(wikiRevIds) {
    let wikiToRevIdList = wikiRevIdsGroupByWiki(wikiRevIds);

    let wikiToRevisionList = {};
    for (let wiki in wikiToRevIdList) {
        let revIds= wikiToRevIdList[wiki];
        const fetchUrl = new URL(`http://${wikiToDomain[wiki]}/w/api.php`);
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
        let retJson = await rp.get(fetchUrl, { json: true });
        if (retJson.query.badrevids) {
            wikiToRevisionList[wiki] = []; // does not find
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
            wikiToRevisionList[wiki] =  revIds.map(revId => revIdToRevision[revId]);
        }
    }
    return wikiToRevisionList;
}

export async function getNewJudgementCounts(db, matcher = {}, offset = 0, limit = 10) {
    return await db.collection(`Interaction`).aggregate([
        {
            $match: matcher
        },
        {
            "$group": {
                "_id": {
                    "wikiRevId": "$wikiRevId"
                },
                "wikiRevId": {
                    "$first": "$wikiRevId"
                },
                "judgements": {
                    "$push": {
                        "judgement": "$judgement",
                        "userGaId": "$userGaId",
                        "wikiUserName": "$wikiUserName",
                        "timestamp": "$timestamp"
                    }
                },
                "totalCounts": {
                    "$sum": 1
                },
                "shouldRevertCounts": {
                    "$sum": {
                        "$cond": [
                            {
                                "$eq": [
                                    "$judgement",
                                    "ShouldRevert"
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                "notSureCounts": {
                    "$sum": {
                        "$cond": [
                            {
                                "$eq": [
                                    "$judgement",
                                    "NotSure"
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                "looksGoodCounts": {
                    "$sum": {
                        "$cond": [
                            {
                                "$eq": [
                                    "$judgement",
                                    "LooksGood"
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                "lastTimestamp": {
                    "$max": "$timestamp"
                },
                "wiki": {
                    "$first": "$wiki"
                }
            }
        },
        {
            "$project": {
                "wikiRevId": "$_id.wikiRevId",
                "judgements": "$judgements",
                "wiki": 1,
                "lastTimestamp": 1,
                "counts.Total": "$totalCounts",
                "counts.ShouldRevert": "$shouldRevertCounts",
                "counts.NotSure": "$notSureCounts",
                "counts.LooksGood": "$looksGoodCounts"
            }
        },
        {
            "$match": {
                "wiki": {
                    "$exists": true,
                    "$ne": null
                },
                "lastTimestamp": {
                    "$exists": true,
                    "$ne": null
                }
            }
        },
        {
            "$sort": {
                "lastTimestamp": -1
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

export function isEmpty(value) {
    return typeof value == 'string' && !value.trim() || typeof value == 'undefined' || value === null;
}

export const useOauth = !isEmpty(process.env.MEDIAWIKI_CONSUMER_SECRET) && !isEmpty(process.env.MEDIAWIKI_CONSUMER_KEY);

export function wikiRevIdsGroupByWiki(wikiRevIds) {
    let wikiToRevIdList = {};
    wikiRevIds.forEach((wikiRevId) => {
        let wiki = wikiRevId.split(':')[0];
        let revId = wikiRevId.split(':')[1];
        if (!(wiki in wikiToRevIdList)) {
            wikiToRevIdList[wiki] = [];
        }
        wikiToRevIdList[wiki].push(revId);
    });
    return wikiToRevIdList;
}

export const asyncHandler = fn => (req, res, next) =>
  Promise
    .resolve(fn(req, res, next))
    .catch(next);

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isAuthenticatedWithWikiUserName(req, wikiUserName:string):boolean {
  return req.isAuthenticated() && req.user.displayName === wikiUserName;
}

export function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status( 401 );
    res.send( 'Login required for this endpoint' );
  }
}

export const useStiki = /mysql:\/\//.test(process.env.STIKI_MYSQL);
