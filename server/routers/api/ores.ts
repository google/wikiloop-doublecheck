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

// DEPRECATED use score.ts if possible
// TODO(xinbenlv): consider merge with `/score`

const rp = require('request-promise');
import { computeOresFieldNew, wikiRevIdsGroupByWiki, apiLogger, asyncHandler } from '../../common';

export const oresRouter = require('express').Router();

/** Function to fetch ORES, if unavailable, cover the error and replace score with null
 * There are two main reasons ORES scores are unavailable:
 *  1. [Fixed] Rate throttled - when we send too many requests within a limited time window.
 *    **solution**: we need to add paging and throttling to maximize the number of ORES score.
 *    Bug: https://github.com/google/wikiloop-doublecheck/issues/97
 *  2. Revision ORES unavailable, normally because a revision is unavailable, or other error.
 *    Bug: https://github.com/google/wikiloop-doublecheck/issues/110
 *  3. ORES service (temporarily)unavailable.
 *    Bug: https://github.com/google/wikiloop-doublecheck/issues/37
 *  TODO(xinbenlv, P2): consider add test for handling these 3 cases
 *
 * @param wikiRevIds
 * @returns {Promise<Object> a map of {wiki: [oresScore]}} where oresScore
 */
async function fetchOres(wikiRevIds) {
    let wikiToRevIdList = wikiRevIdsGroupByWiki(wikiRevIds);
    let oresResults = {};
    let oresResultJson;
    for (let wiki in wikiToRevIdList) {
        let revIds = wikiToRevIdList[wiki];
        let oresUrl = `https://ores.wikimedia.org/v3/scores/${wiki}/?models=damaging|goodfaith&revids=${revIds.join('|')}`;
        try {
            oresResultJson = await rp.get(oresUrl, { json: true });
            oresResults[wiki] = revIds.map(revId => computeOresFieldNew(oresResultJson, wiki, revId));
        } catch (err) {
            if (err.statusCode === 429) {
                apiLogger.warn(`\n\n\nEncountered a 429 rate limit err for wikiRevIds=${wikiRevIds}, returning null for all\n\n\n`);
            } else apiLogger.error(`fetchOres has an unknown error of `, err);
            revIds.forEach(revId => {
                oresResults[wiki] = Array(revIds.length).fill(null);
            });
        }
    }
    return oresResults;
};

const ores = async (req, res) => {
    let wikiRevIds = req.query.wikiRevIds;
    let ret = await fetchOres(wikiRevIds);
    res.send(ret);
    req.visitor
        .event({ ec: "api", ea: "/ores" })
        .send();
};

oresRouter.get(`/`, asyncHandler(ores));

const oresWikiRevId = async (req, res) => {
    let wikiRevId = req.params.wikiRevId;
    let wiki = req.params.wikiRevId.split(':')[0];
    let ret = await fetchOres([wikiRevId]);
    if (ret && ret[wiki] && ret[wiki].length === 1) {
        res.send(ret[wiki][0]);
    } else {
        res.status(500);
        let errMsg = `Something unknown happen to the function of oresWikiRevId, wikiRevId = ${wikiRevId}, ret = ${ret}`;
        res.send(errMsg);
        apiLogger.warn(errMsg);
    }
    // TODO(zzn): Google Analytics to log different cases with different value
    req.visitor
        .event({ ec: "api", ea: "/ores/:wikiRevId" })
        .send();
};

oresRouter.get(`/:wikiRevId`, asyncHandler(oresWikiRevId));
