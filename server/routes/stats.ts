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

const mongoose = require('mongoose');
import { logger } from '../common';
const ANONYMOUS_PLACEHOLDER = `(anonymous)`;
const championQuery = function(timeRange, endDate, wiki) {
  let utcEndTime;
  if (/20\d\d-\d\d-\d\d/.test(endDate)) {
    utcEndTime = new Date(endDate).getTime()/1000;
  } else if (/\d+/.test(endDate) &&
      parseInt(endDate) <= new Date('2099-01-01').getTime()/1000 && // WE WILL EXLODE in 2099!
      parseInt(endDate) >= new Date('2015-01-01').getTime()/1000
  ) {
    utcEndTime = parseInt(endDate);
  }

  let days;
  if (/\d+/.test(timeRange)) {
    days = parseInt(timeRange);
  } else if (timeRange === 'week') {
    days = 7;
  } else if (timeRange === 'month') {
    days = 30; // for simplicity
  } else if (timeRange === 'year') {
    days = 365; // for simplicity
  }
  return [
    {
      $match: {
        // wikiUserName: {$exists: true},
        timestamp: {
          $exists: true,
          $lt: utcEndTime,
          $gte: utcEndTime - (3600 * 24 * days)
        },
        "recentChange.wiki": wiki ? wiki: {$exists:true}, // For now we only count individual wiki. There will be time we change it to also count global wiki.
      }
    },
    { "$group": {
        "_id": {
            "wikiUserName": { $ifNull: ["$wikiUserName", ANONYMOUS_PLACEHOLDER]},
        },
        "count": { "$sum": 1 }
      } },
    { $sort: {'count': -1}},
  ];
}

/**
 * Generate the champion list given a end date,  time range and wiki.
 * @param {Ge} timeRange
 * @param {*} endDate
 * @param {*} wiki
 */
export const getChampion = async function(timeRange, endDate, wiki) {
  let query = championQuery(timeRange, endDate, wiki);
  let ret = await mongoose.connection.db.collection(`Interaction`).aggregate(query).toArray();
  return ret;
}
export const champion = async (req, res) => {
  let ret = await getChampion(req.query.timeRange || 'week', req.query.endDate || '2020-02-01', req.wiki || null);
  if (req.query.cmd) {
    if (ret.length) {
      res.send(
        `npx ts-node barnstar.ts --users='${
          ret.slice(0,10/*top 10*/)
            .filter(n => n !== ANONYMOUS_PLACEHOLDER)
            .map(item => item._id.wikiUserName).join(',')}' --timeRange=${req.query.timeRange} --endDate=${req.query.endDate
          }`
      );
    } else {
      res.send(`empty!`);
    }
  } else {
    res.send(ret);
  }
}

export const labelsTimeSeries = async (req, res) => {
  let labelsTimeSeries = await mongoose.connection.db.collection(`Interaction`)
    .aggregate([
      { $match: {timestamp: {$exists: true}}},
      { "$group": {
          "_id": {
              date: {
                "$dateToString": {
                  "format": "%Y-%m-%d",
                  "date": {
                    "$add": [
                      new Date(0),
                      {"$multiply": [1000, "$timestamp"]}
                    ]
                  }
                },
              },
              "wiki": "$recentChange.wiki",
          },
          "count": { "$sum": 1 }
        } },
      { $sort: {'_id.date': -1}},
    ]).toArray();
  res.send(labelsTimeSeries);
};


export const basic = async (req, res) => {
    let myGaId = req.body.gaId || req.cookies._ga;
    logger.debug(`req.query`, req.query);
    let allInteractions = await mongoose.connection.db.collection(`Interaction`)
        .find({}, {
            userGaId: 1,
            judgement: 1,
            wikiRevId: 1,
        }).toArray();
    let revSet = {};
    allInteractions.forEach(item => revSet[item.wikiRevId] = true);
    let ret:any = {
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
    ret.totalJudgementByLogin = allInteractions.reduce((counters, item) => {
        if (item.wikiUserName) counters.Login++;
        else counters.Anonymous++;
        return counters;
    }, {'Login': 0, "Anonymous": 0});;
    ret.totalJudgementByLang = allInteractions
    .filter(item => item.wikiRevId)
    .map(item => item.wikiRevId.split(':')[0])
    .reduce((counters, wiki) => {
        if (!counters[wiki]) counters[wiki] = 0;
        counters[wiki]++;
        return counters;
    }, {});

    res.send(ret);
    req.visitor
        .event({ ec: "api", ea: "/stats" })
        .send();
};

module.exports = {
  basic,
  labelsTimeSeries,
  champion,
  getChampion
};
