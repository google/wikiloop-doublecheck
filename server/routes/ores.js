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
const { computeOresField, wikiRevIdsGroupByWiki } = require('../common');

async function fetchOres(wikiRevIds) {
    let wikiToRevIdList = wikiRevIdsGroupByWiki(wikiRevIds);
    let oresResults = {};
    for (let wiki in wikiToRevIdList) {
        let revIds = wikiToRevIdList[wiki];
        let oresUrl = `https://ores.wikimedia.org/v3/scores/${wiki}/?models=damaging|goodfaith&revids=${revIds.join('|')}`;
        let oresResultJson = await rp.get(oresUrl, { json: true });
        oresResults[wiki] = revIds.map(revId => computeOresField(oresResultJson, wiki, revId));
    }
    return oresResults;
}

const ores = async (req, res) => {
    let wikiRevIds = req.query.wikiRevIds;
    let ret = await fetchOres(wikiRevIds);
    res.send(ret);
    req.visitor
        .event({ ec: "api", ea: "/ores" })
        .send();
};

const oresWikiRevId = async (req, res) => {
    let wikiRevId = req.params.wikiRevId;
    let wiki = req.params.wikiRevId.split(':')[0];
    let ret = await fetchOres([wikiRevId]);
    if (ret[wiki].length === 1) {
        res.send(ret[wiki][0]);
    } else if (ret[wiki].length === 0) {
        res.status(404);
        res.send(`Can't find ores`);
    } else {
        res.status(500);
        res.send(`Something is wrong inside of oresWikiRevId, ret = `, ret);
    }
    req.visitor
        .event({ ec: "api", ea: "/ores/:wikiRevId" })
        .send();
};

module.exports = {
    ores,
    oresWikiRevId
};
