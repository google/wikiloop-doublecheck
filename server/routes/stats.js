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
const { logger } = require('../common');


const labelsTimeSeries = async (req, res) => {
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


const basic = async (req, res) => {
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
};
