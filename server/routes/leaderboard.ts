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
async function getWikisLeaderList(
    startTime:number, endTime:number) {
  return await mongoose.connection.db.collection("Interaction").aggregate(
    [
      {
        "$match": {
          "wiki": { $exists: true },
          "timestamp": {$gte: startTime, $lte: endTime}
        }
      },
      {
        "$group": {
          "_id": {
            "wiki": "$wiki",
          },
          "count": {
            "$sum": 1
          },
          "lastTimestamp": {
            "$max": "$timestamp"
          }
        }
      },
      {
        "$sort": {
          "count": -1
        }
      },
      {
        "$project": {
          "wiki": "$_id.wiki",
          "count": 1,
          "lastTimestamp": 1
        }
      }
    ],
    {
      "allowDiskUse": false
    }
  ).toArray();
}
async function getTotalLoggedInUsers(
    startTime:number, endTime:number) {
  return (await mongoose.connection.db.collection("Interaction").aggregate(
      [
        {
          "$match": {
            "wikiUserName": { $exists: true },
            "timestamp": {$gte: startTime, $lte: endTime}
          }
        },
        {
          "$group": {
            "_id": {
              "wikiUserName": "$wikiUserName",
            },
          }
        },
        {
          "$count": "count"
        }
      ],
      {
        "allowDiskUse": false
      }
  ).toArray())[0]?.count || 0; // it's possible the result is zero
}

async function getLoggedInLeaderList(
    startTime:number, endTime:number, limit:number) {
  return await mongoose.connection.db.collection("Interaction").aggregate(
    [
      {
        "$match": {
          "wikiUserName": { $exists: true },
          "timestamp": {$gte: startTime, $lte: endTime}
        }
      },
      {
        "$group": {
          "_id": {
            "wikiUserName": "$wikiUserName",
          },
          "count": {
            "$sum": 1
          },
          "wikis": {
            "$addToSet": "$wiki"
          },
          "lastTimestamp": {
            "$max": "$timestamp"
          }
        }
      },
      {
        "$sort": {
          "count": -1
        }
      },
      { $limit : limit },
      {
        "$project": {
          "wikiUserName": "$_id.wikiUserName",
          "count": 1,
          "wikis": 1,
          "lastTimestamp": 1
        }
      }
    ],
    {
      "allowDiskUse": false
    }
  ).toArray();
}

async function getAnonymousLeaderList(
    startTime:number, endTime:number, limit:number) {
  return await mongoose.connection.db.collection("Interaction").aggregate(
    [
      {
        "$match": {
          "userGaId": {$ne: null},
          "wikiUserName": {$exists: false},
          "timestamp": {$gte: startTime, $lte: endTime}
        }
      },
      {
        "$group": {
          "_id": {
            "userGaId": "$userGaId",
          },
          "count": {
            "$sum": 1
          },
          "wikis": {
            "$addToSet": "$wiki"
          },
          "lastTimestamp": {
            "$max": "$timestamp"
          }
        }
      },
      {
        "$sort": {
          "count": -1
        }
      },
      { $limit : limit },
      {
        "$project": {
          "userGaId": "$_id.userGaId",
          "count": 1,
          "wikis": 1,
          "lastTimestamp": 1
        }
      }
    ],
    {
      "allowDiskUse": false
    }
  ).toArray();
}

export const leaderboard = async (req, res) => {
    let startTime = parseInt(req.query.startTime) || 0;
    let endTime = parseInt(req.query.endTime) || new Date().getTime()/1000;
    const limit = parseInt(req.query.limit) || 20;
    if (req.query.days) {
      const days = parseInt(req.query.days);
      endTime = new Date().getTime()/1000;
      startTime = new Date().getTime()/1000 - (3600 * 24 * days);
    }
    // TO-FUTURE-DO consider adding pagination if performance is a problem. We don't expect this list to be more than
    // 100K records anytime soon (updated 2020-01-02).
    let loggedIn = await getLoggedInLeaderList(startTime, endTime, limit);
    let anonymous = await getAnonymousLeaderList(startTime, endTime, limit);
    let wikis = await getWikisLeaderList(startTime, endTime);
    let totalLoggedIn = await getTotalLoggedInUsers(startTime, endTime);
    res.send({ loggedIn, anonymous, wikis, totalLoggedIn });
    req.visitor
        .event({ ec: "api", ea: "/leaderboard" })
        .send();
};
