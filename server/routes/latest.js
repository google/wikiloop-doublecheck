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

const rp = require('request-promise');
const { computeOresField, perfLogger } = require('../common');

const latest = async (req, res) => {

  let wiki = "enwiki";  // TODO: support multiple different wiki in the cases. Currently only support ENwiki.

  // Getting a list of latest revisions related to the filter (Lang of Wiki), and their related diff
  // TODO Consider use https://nodejs.org/api/url.html#url_url_searchparams to compose a standard one. this contains too many parameters
  let queryUrl = `${req.query.serverUrl}/w/api.php?action=query&list=recentchanges&prop=info&format=json&rcnamespace=0&rclimit=100&rctype=edit&rctoponly=true&rcprop=user|userid|comment|flags|timestamp|ids|title&rcshow=!bot`;
  // https://en.wikipedia.org/w/api.php?action=query&list=recentchanges&prop=info&format=json&rcnamespace=0&rclimit=50&rctype=edit&rctoponly=true&rcprop=user|userid|comment|flags|timestamp|ids|title&rcshow=!bot
  let recentChangesJson = await rp.get(queryUrl, { json: true });
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

  let oresResultJson = await rp.get(oresUrl, { json: true });

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
    .event({ ec: "api", ea: "/latest" })
    .send();

};
const latestRevs = async (req, res) => {
  let startTime = new Date();
  let wiki = "enwiki";  // TODO: support multiple different wiki in the cases. Currently only support ENwiki.

  // Getting a list of latest revisions related to the filter (Lang of Wiki), and their related diff
  // TODO Consider use https://nodejs.org/api/url.html#url_url_searchparams to compose a standard one. this contains too many parameters
  let queryUrl = `${req.query.serverUrl}/w/api.php?action=query&list=recentchanges&prop=info&format=json&rcnamespace=0&rclimit=100&rctype=edit&rctoponly=true&rcprop=user|userid|comment|flags|timestamp|ids|title&rcshow=!bot`;
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

  let oresResultJson = await rp.get(oresUrl, { json: true });
  let oresResponseTime = new Date();
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

  let endTime = new Date();
  req.visitor
    .event({ ec: "api", ea: "/latestRevs" })
    .timing(`/api/latestRevs`, 'Response delay for /api/latestRevs', endTime.getTime() - startTime.getTime())
    .timing(`/api/latestRevs - recentChange`, 'Response delay for /api/latestRevs recentChange', recentChangeResponseTime.getTime() - startTime.getTime())
    .timing(`/api/latestRevs - ores`, 'Response delay for /api/latestRevs ores', oresResponseTime.getTime() - recentChangeResponseTime.getTime())
    .timing(`/api/latestRevs - post-processing`, 'Response delay for /api/latestRevs post-processing', endTime.getTime() - oresResponseTime.getTime())
    .send();
  perfLogger.info(`Response delay for /api/latestRevs = ${endTime.getTime() - startTime.getTime()}`);
};
module.exports = {
  latest,
  latestRevs
};
