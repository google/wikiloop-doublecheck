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

import { flags } from './flags';

import { root } from './root';
import { diff, diffWikiRevId } from './diff';
import { avatar } from './avatar';
import { getInteraction, listInteractions, updateInteraction } from './interaction';
import { listRecentChanges } from './recentchanges';
import { version } from './version';
import { listLabels } from './label';
import { ores, oresWikiRevId } from './ores';
import { mediawiki } from './mediawiki';
import { revision, revisionWikiRevId } from './revision';
import { markedRevsCsv, markedRevs } from './marked';
import { latestRevs } from './latest';
import { leaderboard } from './leaderboard';
import { basic, labelsTimeSeries, champion } from './stats';

export default {
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
    markedRevsCsv,
    markedRevs,
    leaderboard,
    avatar,
    latestRevs,
    flags,
    mediawiki,
    version,
};
