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

import {Interaction, InteractionDoc, InteractionProps} from "~/shared/models/interaction-item.model";

const apicache = require('apicache');
const mongoose = require('mongoose');
import { logger, getNewJudgementCounts } from '../common';
import {MongooseUpdateQuery} from "mongoose";

export const getInteraction = async (req, res) => {
    let wikiRevId = req.params.wikiRevId;
    let interactions = await getNewJudgementCounts(mongoose.connection.db,
        // {
        //   wikiRevId: {$in: [wikiRevId]}
        // },
        { "wikiRevId": { "$in": [wikiRevId] } }
    );
    if (interactions.length >= 1) {
        res.send(interactions[0]);
    } else {
        res.send({
            "_id": {
                "wikiRevId": wikiRevId
            },
            "wikiRevId": wikiRevId,
            "judgements": [
            ],
            "counts": {
                "Total": 0,
                "ShouldRevert": 0,
                "NotSure": 0,
                "LooksGood": 0
            }
        });
    }
    req.visitor
        .event({ ec: "api", ea: "/interaction/:wikiRevId" })
        .send();
};

export const listInteractions = async (req, res) => {
    let limit = parseInt(req.query.limit) || 10;
    let offset = parseInt(req.query.offset) || 0;
    let matcher:any = {};
    if (req.query.wikiRevIds) {
        matcher.wikiRevId = { $in: req.query.wikiRevIds }
    }
    if (req.query.userGaIds) {
        matcher.userGaId = { $in: req.query.userGaIds }
    }
    if (req.query.wikiUserName) {
      matcher.wikiUserName = { $in: [req.query.wikiUserName] }
    }

    let interactions = await getNewJudgementCounts(mongoose.connection.db, matcher, offset, limit);
    res.send(interactions);
    req.visitor
        .event({ ec: "api", ea: "/interactions" })
        .send();
};

export const updateInteraction = async (req, res) => {
    const io = req.app.get('socketio');
    let interactionProps:InteractionProps = req.body as InteractionProps;
    let matcher:any ={
      wikiRevId: interactionProps.wikiRevId
    };
    if (interactionProps.wikiUserName) matcher.wikiUserName = interactionProps.wikiUserName;
    else matcher.userGaId = interactionProps.userGaId;
    await Interaction.findOneAndUpdate(matcher, interactionProps, {upsert:true});

    try { // old way
      let storedInteractions = await getNewJudgementCounts(
        mongoose.connection.db, {wikiRevId: {$in: [interactionProps.wikiRevId]}}
      );
      let storedInteraction = storedInteractions[0];
      storedInteraction.newJudgement = {
        userGaId: interactionProps.userGaId,
        judgement: interactionProps.judgement,
        timestamp: interactionProps.timestamp
      };
      io.sockets.emit('interaction', storedInteraction);
    } catch(err) {
      logger.warn(err);
      // new way
      io.sockets.emit('interaction-item', interactionProps);
    }
    apicache.clear(req.originalUrl);
    res.send(`ok`);
    req.visitor
        .event({ ec: "api", ea: "/interaction" })
        .event("judgement", req.body.judgement)
        .send();
};
