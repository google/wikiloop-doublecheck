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

// TODO(xinbenlv): consider merge with mediawiki

import { wikiToDomain } from '../../../shared/utility-shared';
import { apiLogger, perfLogger, asyncHandler, logger } from '../../common';
import { MwActionApiClient } from '../../../shared/mwapi';

const rp = require('request-promise');

const express = require('express');
export const recentChangesRouter = express.Router();

/**
 * @param req, supporting query
 *   req.query.wiki: the language of wikis being queried for.
 *   req.query.timestamp: the timestamp as boundary of recent change
 *   req.query.limit: the limit of request
 *   req.query.direction: enum of {newer, older} as in `rcdir` in
 *     MediaWiki Action API
 * @param res
 * @return {Promise<void>}
 */
const listRecentChanges = async (req, res) => {
  const startTime = new Date();

  // TODO(zzn): create and use a common request/response error handler
  if (req.query.wiki && !Object.keys(wikiToDomain).includes(req.query.wiki)) {
    res.status(400);
    res.send(`Bad serverUrl, we only support ${Object.keys(wikiToDomain)}`);
    return;
  }

  const wiki = req.query.wiki || 'frwiki'; // Default to french wiki

  // Getting a list of latest revisions related to the filter (Lang of Wiki), and their related diff
  // https://en.wikipedia.org/w/api.php?action=query&list=recentchanges&prop=info&format=json&rcnamespace=0&rclimit=50&rctype=edit&rctoponly=true&rcprop=oresscores%7Cuser%7Cuserid%7Ccomment%7Cflags%7Ctimestamp%7Cids%7Ctitle&rcshow=!bot
  // API document: https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brecentchanges

  // It seems according to url.searchParams is not available in Microsoft Internet Explorer, we need to test it
  const direction = req.query.direction;
  const timestamp = req.query.timestamp;
  const limit = req.query.limit;

  const recentChangesJson = await MwActionApiClient.getRawRecentChanges({ wiki, direction, timestamp, limit });

  const recentChangeResponseTime = new Date();

  /*
   Converting to
   {
      _id: recentChange._id,
      id: recentChange.id,
      revision: recentChange.revision,
      title: recentChange.title,
      user: recentChange.user,
      wiki: recentChange.wiki,
      timestamp: recentChange.timestamp,
      ores: recentChange.ores,
      namespace: recentChange.namespace,
      nonbot: !recentChange.bot
    }
   */

  const recentChanges = recentChangesJson.query.recentchanges // from recentChangesJson result
      .map((rawRecentChange) => {
        return {
          _id: `${wiki}-${rawRecentChange.rcid}`,
          id: rawRecentChange.rcid,
          wikiRevId: `${wiki}:${rawRecentChange.revid}`,
          revision: {
            new: rawRecentChange.revid,
            old: rawRecentChange.old_revid,
          },
          title: rawRecentChange.title,
          user: rawRecentChange.user,
          wiki: `${wiki}`,
          ores: rawRecentChange.oresscores,
          timestamp: Math.floor(new Date(rawRecentChange.timestamp).getTime() / 1000),
          namespace: 0, // we already query the server with "rcnamespace=0" filter
          nonbot: true, // we already query the server with "rcprop=!bot" filter
          comment: rawRecentChange.comment,
          interactions: [],
        };
      });
  const mongoose = require('mongoose');
  const wikiRevIds = recentChanges.map((rc) => rc.wikiRevId);
  const interactions = await mongoose.connection.db.collection('Interaction').find({
    wikiRevId: { $in: wikiRevIds },
  }).toArray();

  interactions.forEach((i) => recentChanges.forEach((rc) => {
    if (i.wikiRevId === rc.wikiRevId) {
      rc.interactions.push(i);
    }
  }));

  res.send(recentChanges.reverse());

  const endTime = new Date();
  req.visitor
      .event({ ec: 'api', ea: '/recentchanges/list' })
      .timing('/api/recentchanges/list', 'Response delay for /api/recentchanges/list', endTime.getTime() - startTime.getTime())
      .timing('/api/recentchanges/list - recentChange', 'Response delay for /api/latestRevs recentChange', recentChangeResponseTime.getTime() - startTime.getTime())
      .send();
  perfLogger.debug(`Response delay for /api/recentchanges/list = ${endTime.getTime() - startTime.getTime()}`);
  perfLogger.debug(`Response delay for /api/recentchanges/list = ${recentChangeResponseTime.getTime() - startTime.getTime()}`);
};

recentChangesRouter.get('/list', asyncHandler(listRecentChanges));
