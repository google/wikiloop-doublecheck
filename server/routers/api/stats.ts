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

import {Interaction} from "~/shared/models/interaction-item.model";
import {asyncHandler, logger} from '@/server/common';
import moment from "moment";

/** @deprecated stats.ts is deprecated, use metrics.ts instead.
* New endpoints shall be added to metrics.ts
*/

const mongoose = require('mongoose');
const ANONYMOUS_PLACEHOLDER = `(anonymous)`;

export const statsRouter = require('express').Router();

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
        "wiki": wiki ? wiki: {$exists:true}, // For now we only count individual wiki. There will be time we change it to also count global wiki.
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

const champion = async (req, res) => {
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

statsRouter.get('/champion', asyncHandler(champion));

const labelsTimeSeries = async (req, res) => {
  let groupBy:any = {

  },
  matcher:any = {
    timestamp: {$exists: true}
  };

  if (req.query.byJudgement) {
    groupBy.judgement = "$judgement";
  }

  if (req.query.byDay) {
    groupBy.date = {
      "$dateToString": {
        "format": "%Y-%m-%d",
        "date": {
          "$add": [
            new Date(0),
            {"$multiply": [1000, "$timestamp"]}
          ]
        }
      },
    }
  } else if (req.query.byMonth) {
    groupBy.date = {
      "$dateToString": {
        "format": "%Y-%m-01",
        "date": {
          "$add": [
            new Date(0),
            {"$multiply": [1000, "$timestamp"]}
          ]
        }
      },
    }
  }

  if (req.query.wiki) {
    matcher.wiki = req.query.wiki;
  }
  if (req.query.wikiUserName) {
    matcher.wikiUserName = req.query.wikiUserName;
  }
  if (req.query.title) {
    matcher.title = req.query.title;
  }

  let labelsTimeSeries = await mongoose.connection.db.collection(`Interaction`)
    .aggregate([
      { $match: matcher },
      { $group: { _id: groupBy, count: { $sum: 1 } } },
      { $sort: {'_id.date': -1}},
    ]).toArray();
  res.send(labelsTimeSeries);
};

statsRouter.get('/timeseries/labels', asyncHandler(labelsTimeSeries));

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

statsRouter.get('/', asyncHandler(basic));

statsRouter.get('/breakdownQuery', asyncHandler(async (req, res) => {

}));

statsRouter.get('/breakdown', asyncHandler(async (req, res) => {
  let interactions = await mongoose.connection.db.collection(`Interaction`)
    .find({
      timestamp: {$exists: true},
      wikiRevId: {$exists: true},
      judgement: {$exists: true}
    })
    .project({timestamp: 1, wikiRevId: 1, judgement: 1, wikiUserName: 1, userGaId: 1})
    .toArray();
  let breakdownByDay = {};
  let breakdownByWeek = {};
  let breakdownByMonth = {};
  let breakdownByQuarter = {};
  interactions.map(i => {
    let rawDate = new Date(i.timestamp * 1000);
    let dateStr = moment(rawDate).format('YYYY-MM-DD');
    let weekStr = moment(rawDate).format('YYYY-[W]w');
    let monthStr = moment(rawDate).format('YYYY-MM');
    let monthNumber = parseInt(moment(rawDate).format('MM'));
    let quarterStr = moment(rawDate).format(`YYYY-[Q]Q`);
    breakdownByDay[dateStr] = (breakdownByDay[dateStr] ?? 0) + 1;
    breakdownByWeek[weekStr] = (breakdownByWeek[weekStr] ?? 0) + 1;
    breakdownByMonth[monthStr] = (breakdownByMonth[monthStr] ?? 0) + 1;
    breakdownByQuarter[quarterStr] = (breakdownByQuarter[quarterStr] ?? 0) + 1;
    return i;
  });
  let output = {
    'day': [],
    'week': [],
    'month': [],
    "quarter": [],
  };

  Object.keys(breakdownByDay).sort().forEach(k => {
    output.day.push({date: k}, {value: breakdownByDay[k]});
  });

  Object.keys(breakdownByWeek).sort().forEach(k => {
    output.week.push({date: k}, {value: breakdownByWeek[k]});
  });

  Object.keys(breakdownByMonth).sort().forEach(k => {
    output.month.push({date: k}, {value: breakdownByMonth[k]});
  });

  Object.keys(breakdownByQuarter).sort().forEach(k => {
    output.quarter.push({date: k}, {value: breakdownByQuarter[k]});
  });
  res.send(output);
}));
