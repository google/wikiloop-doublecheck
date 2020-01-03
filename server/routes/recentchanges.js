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

const wikiToDomain = require("../urlMap").wikiToDomain;

const rp = require('request-promise');
const { perfLogger, apiLogger } = require('../common');

/**
 * @param req, supporting query
 *   req.query.wiki: the language of wikis being queried for.
 *   req.query.timestamp: the timestamp as boundary of recent change
 *   req.query.limit: the limit of request
 *   req.query.direction: enum of {newer, older} as in `rcdir` in
 *     MediaWiki Action API
 * @param res
 * @returns {Promise<void>}
 */

const listRecentChanges = async (req, res) => {
  let startTime = new Date();

  // TODO(zzn): create and use a common request/response error handler
  if (req.query.wiki && Object.keys(wikiToDomain).indexOf(req.query.wiki) < 0) {
    res.status(400);
    res.send(`Bad serverUrl, we only support ${Object.keys(wikiToDomain)}`);
    return;
  }

  let wiki = req.query.wiki || `frwiki`; // Default to french wiki

  // Getting a list of latest revisions related to the filter (Lang of Wiki), and their related diff
  // https://en.wikipedia.org/w/api.php?action=query&list=recentchanges&prop=info&format=json&rcnamespace=0&rclimit=50&rctype=edit&rctoponly=true&rcprop=user|userid|comment|flags|timestamp|ids|title&rcshow=!bot
  // API document: https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brecentchanges

  // It seems according to url.searchParams is not available in Microsoft Internet Explorer, we need to test it
  let searchParams = new URLSearchParams(
  {
    "action": "query",
    "format": "json",
    "prop": "info",
    "list": "recentchanges",
    "rcnamespace": "0",
    "rcprop": "user|userid|comment|flags|timestamp|ids|title|oresscores",
    "rcshow": "!bot",
    "rctype": "edit",
    "rctoponly": 1
  });

  if (req.query.direction ) searchParams.set(`rcdir`, req.query.direction);
  if (req.query.timestamp ) searchParams.set(`rcstart`, req.query.timestamp);
  if (req.query.limit) searchParams.set(`rclimit`, parseInt(req.query.limit));

  let url = new URL(`http://${wikiToDomain[wiki]}/w/api.php?${searchParams.toString()}`);
  apiLogger.info(`Requesting for Action API: ${url.toString()}`);
  apiLogger.info(`Try sandbox request here: ${new URL(`http://${wikiToDomain[wiki]}/wiki/Special:ApiSandbox#${searchParams.toString()}`)}`);

  let recentChangesJson = await rp.get(url.toString(), { json: true });
  let recentChangeResponseTime = new Date();
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
        wiki: `${wiki}`,
        ores: rawRecentChange.oresscores,
        timestamp: Math.floor(new Date(rawRecentChange.timestamp).getTime() / 1000),
        namespace: 0, // we already query the server with "rcnamespace=0" filter
        nonbot: true, // we already query the server with "rcprop=!bot" filter
        comment: rawRecentChange.comment,
        interactions: []
      };
    });
  const mongoose = require('mongoose');
  const wikiRevIds = recentChanges.map(rc => rc.wikiRevId);
  let interactions = await mongoose.connection.db.collection(`Interaction`).find({
    wikiRevId: {$in: wikiRevIds}
  }).toArray();

  interactions.forEach(i => recentChanges.forEach(rc => {
    if (i.wikiRevId === rc.wikiRevId) {
      rc.interactions.push(i);
    }
  }));

  res.send(recentChanges.reverse());

  let endTime = new Date();
  req.visitor
    .event({ ec: "api", ea: "/recentchanges/list" })
    .timing(`/api/recentchanges/list`, 'Response delay for /api/recentchanges/list', endTime.getTime() - startTime.getTime())
    .timing(`/api/recentchanges/list - recentChange`, 'Response delay for /api/latestRevs recentChange', recentChangeResponseTime.getTime() - startTime.getTime())
    .send();
  perfLogger.debug(`Response delay for /api/recentchanges/list = ${endTime.getTime() - startTime.getTime()}`);
  perfLogger.debug(`Response delay for /api/recentchanges/list = ${recentChangeResponseTime.getTime() - startTime.getTime()}`);
};
module.exports = {
  listRecentChanges
};
