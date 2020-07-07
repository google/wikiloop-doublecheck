// Copyright 2019-2020 Google LLC
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


import { actionRouter } from "./action";
import { feedRouter } from "./feed";
import { scoreRouter } from "./score";
import { metricsRouter } from "./metrics";
import { utilsRouter } from "./utils";
import { diffRouter } from "./diff";
import { recentChangesRouter } from "./recentchanges";
import { oresRouter } from "./ores";
import { revisionRouter } from "./revision";
import { labelRouter } from "./label";
import { interactionRouter } from "./interaction";
import { latestRouter } from "./latest";
import { mediawikiRouter } from "./mediawiki";
import { statsRouter } from "./stats";
import { leaderboardRouter } from "./leaderboard";
import { markedRevsCsv, markedRevs } from "./marked";
import { asyncHandler } from "~/server/common";
import { useStiki } from '~/server/common';

const express = require('express');
export const apiRouter = express.Router();

// const apicache = require('apicache');
// let cache = apicache.middleware;
// const onlyGet = (req, res) => res.method === `GET`;
// apiRouter.use(cache('1 week', onlyGet));

apiRouter.use(`/action`, actionRouter);
apiRouter.use(`/feed`, feedRouter);
apiRouter.use(`/metrics`, metricsRouter);
apiRouter.get('/test', (req, res) => { res.send('test ok') });

if (useStiki) {
  apiRouter.use(`/score`, scoreRouter);
  apiRouter.use(`/extra`, scoreRouter);
}

// Needs to stay at the end of ApiRouter
apiRouter.use(`/`, utilsRouter);

apiRouter.use('/diff', diffRouter);

apiRouter.use('/recentchanges', recentChangesRouter);

apiRouter.use('/ores', oresRouter);

apiRouter.use('/revision', revisionRouter);
apiRouter.use('/revisions', revisionRouter);

apiRouter.use('/interaction', interactionRouter);
apiRouter.use('/interactions', interactionRouter);

apiRouter.use('/label', labelRouter);
apiRouter.use('/labels', labelRouter);

// TODO(xinbenlv): merge to labels / interactions
apiRouter.use("/markedRevs.csv", asyncHandler(markedRevsCsv));
apiRouter.use("/markedRevs", asyncHandler(markedRevs));

/**
 * Return a list of all leader
 * Pseudo SQL
 *
 *
 * ```SQL
 *   SELECT user, count(*) FROM Interaction GROUP BY user ORDER by user;
 * ````
 */
apiRouter.use('/leaderboard', leaderboardRouter);

apiRouter.use('/stats', statsRouter);

apiRouter.use('/latestRevs', latestRouter);

apiRouter.use('/mediawiki', mediawikiRouter);

