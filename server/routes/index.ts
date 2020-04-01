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

const root = require('./root');
const { diff, diffWikiRevId } = require('./diff');
const { listRecentChanges } = require('./recentchanges');
const { ores, oresWikiRevId } = require('./ores');
const { revision, revisionWikiRevId } = require('./revision');
const { getInteraction, listInteractions, updateInteraction, interaction } = require('./interaction');
const { listLabels } = require('./label');
const { markedRevsCsv, markedCsv, markedRevs, marked } = require('./marked');
const leaderboard = require('./leaderboard');
const { basic, labelsTimeSeries, champion } = require('./stats');
const avatar = require('./avatar');
const { latest, latestRevs } = require('./latest');
const flags = require('./flags');
const mediawiki = require('./mediawiki');
const version = require('./version');

module.exports = {
    basic, labelsTimeSeries, champion,
    root,
    diff,
    diffWikiRevId,
    listRecentChanges,
    ores,
    oresWikiRevId,
    revision,
    revisionWikiRevId,
    getInteraction,
    listInteractions,
    updateInteraction,

    listLabels,
    interaction,
    markedRevsCsv,
    markedCsv,
    markedRevs,
    marked,
    leaderboard,
    avatar,
    latest,
    latestRevs,
    flags,
    mediawiki,
    version,
}
