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

const apicache = require('apicache');
const mongoose = require('mongoose');
const { logger, getNewJudgementCounts } = require('../common');

const getInteraction = async (req, res) => {
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

const listInteractions = async (req, res) => {
    let limit = parseInt(req.query.limit) || 10;
    let offset = parseInt(req.query.offset) || 0;
    let matcher = {};
    if (req.query.wikiRevIds) {
        matcher.wikiRevId = { $in: req.query.wikiRevIds }
    }
    if (req.query.userGaIds) {
        matcher.userGaId = { $in: req.query.userGaIds }
    }

    let interactions = await getNewJudgementCounts(mongoose.connection.db, matcher, offset, limit);
    res.send(interactions);
    req.visitor
        .event({ ec: "api", ea: "/interactions" })
        .send();
};

const updateInteraction = async (req, res) => {
    const io = req.app.get('socketio');
    let userGaId = req.body.gaId;
    let wikiRevId = req.params.wikiRevId;
    /**
    {
      gaId: gaId,
      judgement: this.myJudgement,
      timestamp: Math.floor(new Date().getTime() / 1000),
      wikiRevId: revision.wikiRevId,
      recentChange: {
        title: revision.title,
        namespace: revision.namespace,
        revision: {
          new: revision.revid,
          old: revision.parentid,
        },
        ores: this.ores,
        user: revision.user,
        wiki: revision.wiki,
        timestamp: revision.timestamp
      }
    }
    */

    let doc = req.body;
    await mongoose.connection.db.collection(`Interaction`).findOneAndReplace({
        userGaId: userGaId,
        wikiRevId: wikiRevId,
    }, doc, { upsert: true });
    apicache.clear(req.originalUrl);
    let storedInteractions = await getNewJudgementCounts(mongoose.connection.db, { wikiRevId: { $in: [wikiRevId] } });
    let storedInteraction = storedInteractions[0];

    storedInteraction.newJudgement = {
        userGaId: doc.userGaId,
        judgement: doc.judgement,
        timestamp: doc.timestamp
    };
    io.sockets.emit('interaction', storedInteraction);

    res.send(`ok`);
    req.visitor
        .event({ ec: "api", ea: "/interaction" })
        .event("judgement", req.body.judgement)
        .send();
};

const interaction = async (req, res) => {
    const io = req.app.get('socketio');
    logger.debug(`Interaction req`, req.cookies, req.body);

    let userGaId = req.body.gaId;
    let newRecentChange = req.body.newRecentChange;
    let doc = {
        userGaId: userGaId,
        wikiRevId: `${newRecentChange.wiki}:${newRecentChange.revision.new}`,
        judgement: req.body.judgement,
        timestamp: req.body.timestamp,
        recentChange: {
            _id: newRecentChange._id,
            id: newRecentChange.id,
            title: newRecentChange.title,
            namespace: newRecentChange.namespace,
            revision: newRecentChange.revision,
            ores: newRecentChange.ores,
            user: newRecentChange.user,
            wiki: newRecentChange.wiki,
            timestamp: newRecentChange.timestamp,
        }
    };

    await mongoose.connection.db.collection(`Interaction`).findOneAndReplace({
        userGaId: userGaId,
        "recentChange.id": newRecentChange.id,
        "recentChange.wiki": newRecentChange.wiki
    }, doc, { upsert: true });

    doc.judgementCounts = await getJudgementCounts(mongoose.connection.db, newRecentChange);
    io.sockets.emit('interaction', doc);

    res.send(`ok`);
    req.visitor
        .event({ ec: "api", ea: "/interaction" })
        .event("judgement", req.body.judgement)
        .send();
};

module.exports = {
    getInteraction,
    listInteractions,
    updateInteraction,
    interaction
};
