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

import { getNewJudgementCounts } from '../common';

const mongoose = require('mongoose');

/**
 *
 * @param {*} req
 * @param {*} res
 *
 *
* @public This endpoint has API clients, take extra caution when migrating
 */
export const markedRevsCsv = async (req, res) => {
    let newJudgementCounts = await getNewJudgementCounts(
        mongoose.connection.db, {}, 0, 10000000/* as many as possible to download all */);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + Date.now() + '.csv\"');
    const stringify = require('csv-stringify');
    let ret = [[
        `WikiRevId`,
        `LastTimestamp`,
        `ShouldRevert`,
        `NotSure`,
        `LooksGood`
    ]]
        .concat(newJudgementCounts.map((newJudgementCount) => {
          return [
            newJudgementCount.wikiRevId,
            newJudgementCount.lastTimestamp,
            newJudgementCount.counts.ShouldRevert,
            newJudgementCount.counts.NotSure,
            newJudgementCount.counts.LooksGood,
          ]
        }));
    stringify(ret, { header: false })
        .pipe(res);
};

export const markedRevs = async (req, res) => {
    res.send(await getNewJudgementCounts(mongoose.connection.db));
};
