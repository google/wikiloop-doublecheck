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
import { Interaction, InteractionDoc, InteractionProps } from '~/shared/models/interaction-item.model';
import { FeedRevisionEngine } from '~/server/feed/feed-revision-engine';
import { isAuthenticatedWithWikiUserName } from '~/server/common';

const apicache = require('apicache');
const mongoose = require('mongoose');

export const interactionRouter = require('express').Router();

type InteractionHookFunc = (i: InteractionProps) => any;

const hooks = {};
export const installHook = function(hookName, hookFunc:InteractionHookFunc) {
  hooks[hookName] = hookFunc;
  logger.info(`Hook ${hookName} is installed`);
};

const getInteraction = async (req, res) => {
  const wikiRevId = req.params.wikiRevId;
  const interactions = await getNewJudgementCounts(mongoose.connection.db,
    // {
    //   wikiRevId: {$in: [wikiRevId]}
    // },
    { wikiRevId: { $in: [wikiRevId] } },
  );
  if (interactions.length >= 1) {
    res.send(interactions[0]);
  } else {
    res.send({
      _id: {
        wikiRevId,
      },
      wikiRevId,
      judgements: [
      ],
      counts: {
        Total: 0,
        ShouldRevert: 0,
        NotSure: 0,
        LooksGood: 0,
      },
    });
  }
  req.visitor
      .event({ ec: 'api', ea: '/interaction/:wikiRevId' })
      .send();
};
interactionRouter.get('/:wikiRevId', asyncHandler(getInteraction));

const getInteractionsByWikiRevId = async (req, res) => {
  const wikiRevId = req.params.wikiRevId;
  const interactionDocs = await Interaction.find({ wikiRevId: { $in: wikiRevId } });
  res.send(interactionDocs);
  req.visitor
      .event({ ec: 'api', ea: '/interaction/:wikiRevId' })
      .send();
};

// TODO(xinbenlv): temporarily use
interactionRouter.get('/beta/:wikiRevId', asyncHandler(getInteractionsByWikiRevId));

const listInteractions = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const matcher:any = {};
  if (req.query.wikiRevIds) {
    matcher.wikiRevId = { $in: req.query.wikiRevIds };
  }
  if (req.query.userGaIds) {
    matcher.userGaId = { $in: req.query.userGaIds };
  }
  if (req.query.wikiUserName) {
    matcher.wikiUserName = { $in: [req.query.wikiUserName] };
  }

  const interactions = await getNewJudgementCounts(mongoose.connection.db, matcher, offset, limit);
  res.send(interactions);
  req.visitor
      .event({ ec: 'api', ea: '/interactions' })
      .send();
};

interactionRouter.get('/', asyncHandler(listInteractions));

const updateInteraction = async (req, res) => {

  const interactionProps:InteractionProps = req.body as InteractionProps;

  if (interactionProps.wikiUserName &&
      !isAuthenticatedWithWikiUserName(req, interactionProps.wikiUserName)) {
    res.status(403);
    res.send('Login required to fetch and claim revisions');
    return;
  }

  const matcher:any = {
    wikiRevId: interactionProps.wikiRevId,
  };
  
  // Check if the interaction comes from a given WikiUserName
  if (interactionProps.wikiUserName) {
    matcher.wikiUserName = interactionProps.wikiUserName;
  } else {
    // otherwise use userGaId for anonymous WLDC reviewers.
    matcher.userGaId = interactionProps.userGaId;
  }

  // Insert the {interactionProps} into Database.
  await Interaction.findOneAndUpdate(matcher, interactionProps, { upsert: true });

  // If there is a revision in the feed, we also check-off them so they are not distributed to other WLDC reviewers for review.
  await FeedRevisionEngine.checkOff(
    [interactionProps.wikiRevId],
    interactionProps.userGaId,
    interactionProps.wikiUserName || null,
    interactionProps.feed || 'us2020',
  );
  
  // the new way
  const io = req.app.get('socketio');
  io.sockets.emit('interaction-item', interactionProps);
  io.sockets.emit('interaction-props', interactionProps);
  apicache.clear(req.originalUrl);

  // install execute hooks.
  Object.keys(hooks).forEach((hookName) => {
    logger.info(`Hook ${hookName} is being installed`);
    hooks[hookName](interactionProps).then(() => {
      logger.info(`Hook ${hookName} succeeded`);
    }).catch((e) => {
      if (e.statusCode && e.name && e.message) {logger.warn(`HTTP ${e.statusCode}, ${e.name}, ${e.message.slice(0, 100)}`);} else {logger.warn(`Error in hook ${hookName}:`, e);}
    });
  });

  res.send('ok');
  req.visitor
      .event({ ec: 'api', ea: '/interaction' })
      .event('judgement', req.body.judgement)
      .send();
};

interactionRouter.post('/:wikiRevId', asyncHandler(updateInteraction));
