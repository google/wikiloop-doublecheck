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

const express = require("express");
import {asyncHandler, logger} from '~/server/common';
import {Score, ScoreType} from "~/shared/interfaces";

const rp = require('request-promise');

const mysql = require('mysql2');

// create the pool
const pool = mysql.createPool(process.env.STIKI_MYSQL);
// now get a Promise wrapped instance of that pool
const promisePool = pool.promise();

export const scoreRouter = express.Router();

/** Function to fetch ORES, if unavailable, cover the error and replace score with null
 * There are two main reasons ORES scores are unavailable:
 *  1. [Fixed] Rate throttled - when we send too many requests within a limited time window.
 *    **solution**: we need to add paging and throttling to maximize the number of ORES score.
 *    Bug: https://github.com/google/wikiloop-battlefield/issues/97
 *  2. Revision ORES unavailable, normally because a revision is unavailable, or other error.
 *    Bug: https://github.com/google/wikiloop-battlefield/issues/110
 *  3. ORES service (temporarily)unavailable.
 *    Bug: https://github.com/google/wikiloop-battlefield/issues/37
 *  TODO(xinbenlv, P2): consider add test for handling these 3 cases
 *
 * @param wikiRevIds: a list of wikiRevId
 * @returns {Promise<Object> a map of {wiki: [oresScore]}} where oresScore
 */
async function fetchOresScore(wikiRevId, type:ScoreType):Promise<Score> {
  let oresResultJson;
    let wiki = wikiRevId.split(':')[0];
    let revId = wikiRevId.split(':')[1];
    let oresUrl = `https://ores.wikimedia.org/v3/scores/${wiki}/?models=damaging|goodfaith&revids=${revId}`;
    try {
      oresResultJson = await rp.get(oresUrl, { json: true });
      switch (type) {
        case ScoreType.ORES_DAMAGING:
          return <Score> {
            type: ScoreType.ORES_DAMAGING,
            score: oresResultJson[wiki].scores[revId]?.damaging?.score?.probability.true,
            isBad: oresResultJson[wiki].scores[revId]?.damaging?.score?.prediction === true
          };
        case ScoreType.ORES_BADFAITH:
          return <Score> {
            type: ScoreType.ORES_BADFAITH,
            score: oresResultJson[wiki].scores[revId]?.goodfaith?.score?.probability.false,
            isBad: oresResultJson[wiki].scores[revId]?.goodfaith?.score?.prediction === false
          };
      }
    } catch (err) {
      logger.warn(err);
      return null;
    }
}

async function fetchStikiAndCbng(wikiRevId, type:ScoreType):Promise<Score> {
  let wiki = wikiRevId.split(':')[0];
  let revId = wikiRevId.split(':')[1];
  let dbName = null;
  if (wiki !== 'enwiki') return null;
  switch (type) {
    case ScoreType.CLUEBOTNG:
      dbName = `scores_cbng`;
      break;
    case ScoreType.STIKI:
      dbName = `scores_stiki`;
      break;
    default:
      return null;
  }
  const [rows, _fields] = await promisePool.query(`SELECT R_ID, SCORE FROM ${dbName} WHERE R_ID = ${revId}`);

  if (rows.length > 0) {
    let score:Score = <Score> {
      type: type,
      score: rows[0]['SCORE'],
      isBad: rows[0]['SCORE'] > 0.5
    };
    return score;
  } else {
    return null;
  }
}

scoreRouter.get('/ores/damaging/:wikiRevId', asyncHandler(async (req, res) => {
  let wikiRevId = req.params.wikiRevId;
  let score:Score = await fetchOresScore(wikiRevId, ScoreType.ORES_DAMAGING);
  res.send(score);
}));

scoreRouter.get('/ores/badfaith/:wikiRevId', asyncHandler(async (req, res) => {
  let wikiRevId = req.params.wikiRevId;
  let score:Score = await fetchOresScore(wikiRevId, ScoreType.ORES_BADFAITH);
  res.send(score);
}));

scoreRouter.get('/stiki/:wikiRevId', asyncHandler(async (req, res) => {
  let wikiRevId = req.params.wikiRevId;
  res.send(fetchOresScore(wikiRevId, ScoreType.STIKI));
}));

scoreRouter.get('/cbng/:wikiRevId', asyncHandler(async (req, res) => {
  let wikiRevId = req.params.wikiRevId;
  res.send(fetchOresScore(wikiRevId, ScoreType.CLUEBOTNG));
}));

scoreRouter.get(`/:wikiRevId`, asyncHandler(async (req, res) => {
  let wikiRevId = req.params.wikiRevId;
  let [
      oresDamaging,
      oresBadfaith,
      stiki,
      cbng
  ] = await Promise.all([
    await fetchOresScore(wikiRevId, ScoreType.ORES_DAMAGING),
    await fetchOresScore(wikiRevId, ScoreType.ORES_BADFAITH),
    await fetchStikiAndCbng(wikiRevId, ScoreType.STIKI),
    await fetchStikiAndCbng(wikiRevId, ScoreType.CLUEBOTNG)
  ]);
  res.send([oresDamaging, oresBadfaith, stiki, cbng].filter(s => s != null));
}));

export default scoreRouter;


