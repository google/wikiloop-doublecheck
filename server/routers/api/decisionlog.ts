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

import { logger, getNewJudgementCounts, asyncHandler } from '../../common';
import { DecisionLog, DecisionLogDoc, DecisionLogProps } from '~/shared/models/decision-log.model';

const apicache = require('apicache');
const mongoose = require('mongoose');

export const decisionLogRouter = require('express').Router();

type DecisionLogHookFunc = (i: DecisionLogProps) => any;

const hooks = {};
export const installHook = function(hookName, hookFunc:DecisionLogHookFunc) {
  hooks[hookName] = hookFunc;
  logger.info(`Hook ${hookName} is installed`);
};

async function getPreviousWarningsAuthor(
  userId: string,
  endTimestamp: number,
  warningTimeframe: number,
  warningThreshold: number,
) {
  const endDate = new Date(endTimestamp);
  const startTimestamp = new Date();
  startTimestamp.setDate(endDate.getDate() - warningTimeframe);
  const eventsBeforeEnd: DecisionLogProps[] = await DecisionLog.find({
    userId,
    type: { $in: ['warning', 'block'] },
    timestamp: { $gte: startTimestamp, $lte: endDate },
  }).sort([['timestamp', 1]]).limit(warningThreshold * 10); // Avoid too many events
  console.log('Get ' + eventsBeforeEnd.length + ' past events for ' + userId);
  return eventsBeforeEnd;
}

async function getPreviousWarningsArticle(
  title: string,
  endTimestamp: number,
  warningTimeframe: number,
  warningThreshold: number,
) {
  const endDate = new Date(endTimestamp);
  const startTimestamp = new Date();
  startTimestamp.setDate(endDate.getDate() - warningTimeframe);
  const eventsBeforeEnd: DecisionLogProps[] = await DecisionLog.find({
    title,
    type: { $in: ['protect', 'articleLogEvent'] },
    timestamp: { $gte: startTimestamp, $lte: endDate },
  }).sort([['timestamp', 1]]).limit(warningThreshold * 10); // Avoid too many events
  console.log('Get ' + eventsBeforeEnd.length + ' past events for ' + title);
  return eventsBeforeEnd;
}

const getAuthorLog = async (req, res) => {
  const userId = req.params.userId;
  const endTimestamp = req.params.endTimestamp;
  const warningTimeframe = req.params.warningTimeframe;
  const warningThreshold = req.params.warningThreshold;
  const events = await getPreviousWarningsAuthor(userId, endTimestamp, warningTimeframe, warningThreshold);
  res.send(events);
  req.visitor
      .event({ ec: 'api', ea: '/decisionLog/author/:userId' })
      .send();
};
decisionLogRouter.get('/author/:userId/:endTimestamp/:warningTimeframe/:warningThreshold', asyncHandler(getAuthorLog));

const getArticleLog = async (req, res) => {
  const title = req.params.title;
  const endTimestamp = req.params.endTimestamp;
  const warningTimeframe = req.params.warningTimeframe;
  const warningThreshold = req.params.warningThreshold;
  const events = await getPreviousWarningsArticle(title, endTimestamp, warningTimeframe, warningThreshold);
  res.send(events);
  req.visitor
      .event({ ec: 'api', ea: '/decisionLog/article/:title' })
      .send();
};
decisionLogRouter.get('/article/:title/:endTimestamp/:warningTimeframe/:warningThreshold', asyncHandler(getArticleLog));

async function writeNewDecisionAuthor(
  decisionObject: any,
) {
  await DecisionLog.create(decisionObject);
  console.log('Suspicious event of type ' + decisionObject.type + ' logged for author ' + decisionObject.userId + ' at ' + decisionObject.timestamp);
}

async function writeNewDecisionArticle(
  decisionObject: any,
) {
  await DecisionLog.create(decisionObject);
  console.log('Suspicious event of type ' + decisionObject.type + ' logged for article ' + decisionObject.title + ' at ' + decisionObject.timestamp);
}

const updateAuthorLog = async (req, res) => {
  const decisionLogProps:DecisionLogProps = req.body as DecisionLogProps;
  await writeNewDecisionAuthor(decisionLogProps);
  res.send('ok');
  req.visitor
      .event({ ec: 'api', ea: '/decisionLog' })
      .send();
};

decisionLogRouter.post('/author', asyncHandler(updateAuthorLog));

const updateArticleLog = async (req, res) => {
  const decisionLogProps:DecisionLogProps = req.body as DecisionLogProps;
  await writeNewDecisionArticle(decisionLogProps);
  res.send('ok');
  req.visitor
      .event({ ec: 'api', ea: '/decisionLog' })
      .send();
};

decisionLogRouter.post('/article', asyncHandler(updateArticleLog));
