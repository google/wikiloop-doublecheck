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

const {getUrlBaseByWiki} = require("../../shared/utility");

const rp = require('request-promise');
const { computeOresField, perfLogger } = require('../common');

const latestRevs = async (req, res) => {
  let startTime = new Date();
  console.log(`XXX latestRevs`, req.query);
  let wiki = dewiki;
  // Getting a list of latest revisions related to the filter (Lang of Wiki), and their related diff
  // TODO Consider use https://nodejs.org/api/url.html#url_url_searchparams to compose a standard one. this contains too many parameters
  let queryUrl = `${getUrlBaseByWiki(wiki)}/w/api.php?action=query&list=recentchanges&prop=info&format=json&rcnamespace=0&rclimit=5&rctype=edit&rctoponly=true&rcprop=user|userid|comment|flags|timestamp|ids|title&rcshow=!bot`;
  // https://en.wikipedia.org/w/api.php?action=query&list=recentchanges&prop=info&format=json&rcnamespace=0&rclimit=50&rctype=edit&rctoponly=true&rcprop=user|userid|comment|flags|timestamp|ids|title&rcshow=!bot
  let recentChangesJson = await rp.get(queryUrl, { json: true });
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
        wiki: `${wiki}`, // TODO verify
        timestamp: Math.floor(new Date(rawRecentChange.timestamp).getTime() / 1000), // TODO check the exact format of timestamp. maybe use an interface?
        namespace: 0, // we already query the server with "rcnamespace=0" filter
        nonbot: true, // we already query the server with "rcprop=!bot" filter
        comment: rawRecentChange.comment,
      };
    });
  res.send(recentChanges.reverse());

  let endTime = new Date();
  req.visitor
    .event({ ec: "api", ea: "/latestRevs" })
    .timing(`/api/latestRevs`, 'Response delay for /api/latestRevs', endTime.getTime() - startTime.getTime())
    .timing(`/api/latestRevs - recentChange`, 'Response delay for /api/latestRevs recentChange', recentChangeResponseTime.getTime() - startTime.getTime())
    .send();
  perfLogger.info(`Response delay for /api/latestRevs = ${endTime.getTime() - startTime.getTime()}`);
  perfLogger.info(`Response delay for /api/latestRevs recentChange = ${recentChangeResponseTime.getTime() - startTime.getTime()}`);
};
module.exports = {
  latestRevs
};
