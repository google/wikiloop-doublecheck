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

import { logger, asyncHandler } from '../../common';

import {wikiToDomain} from "../../../shared/utility-shared";

const rp = require(`request-promise`);

const MW_LINK_PARSE_API_TIMEOUT_MS = 500; // TODO: Relax the timeout after this logic has been moved to client-side lazy loading.

export const diffRouter = require('express').Router();
const fetchDiffMeta = async (wiki, fromRevId, toRevId) => {
  // TODO: reduce duplicate code in two requests.
  try {
    logger.info(`Start requesting link parsing, with timeout = ${MW_LINK_PARSE_API_TIMEOUT_MS}`);
    let fromDiffApiUrl = `https://${wikiToDomain[wiki]}/w/api.php?action=parse&format=json&prop=links|images|iwlinks&oldid=${fromRevId}`;
    let toDiffApiUrl = `https://${wikiToDomain[wiki]}/w/api.php?action=parse&format=json&prop=links|images|iwlinks&oldid=${toRevId}`;
    let fromDiffJson = await rp.get(fromDiffApiUrl, { json: true, timeout: MW_LINK_PARSE_API_TIMEOUT_MS });
    let toDiffJson = await rp.get(toDiffApiUrl, { json: true, timeout: MW_LINK_PARSE_API_TIMEOUT_MS });

    let linkHashmap: any = {};

    fromDiffJson.parse.links.concat(toDiffJson.parse.links).forEach(function (currentValue) {
      this[currentValue['*']] = currentValue.exists === '' ? true : false;
    }.bind(linkHashmap));

    let iwlinksHashmap: any = {};

    fromDiffJson.parse.iwlinks.concat(toDiffJson.parse.iwlinks).forEach(function (currentValue) {
      this[currentValue['*']] = currentValue.url;
    }.bind(iwlinksHashmap));

    return {
      links: linkHashmap,
      images: [...new Set([...fromDiffJson.parse.images, ...toDiffJson.parse.images])],
      iwlinks: iwlinksHashmap
    };
  } catch (err) {
    logger.warn(err);
    return null;
  }
};

const diffWikiRevId = async (req, res) => {
    logger.debug(`req.query`, req.query);
    let wikiRevId = req.params.wikiRevId;
    let wiki = wikiRevId.split(':')[0];
    let revId = wikiRevId.split(':')[1];
    let diffApiUrl = `https://${wikiToDomain[wiki]}/w/api.php?action=compare&fromrev=${revId}&torelative=prev&format=json`;
    let diffJson = await rp.get(diffApiUrl, { json: true });
    let fromRevId = diffJson.compare.fromrevid;
    let toRevId = diffJson.compare.torevid;
    let diffMetadata = await fetchDiffMeta(wiki, fromRevId, toRevId);
    if(diffMetadata) diffJson.compare.diffMetadata = diffMetadata
    res.send(diffJson);
    req.visitor
        .event({ ec: "api", ea: "/diff/:wikiRevId" })
        .send();
};
diffRouter.get(`/:wikiRevId`, asyncHandler(diffWikiRevId));

/**
 * @deprecated
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const diff = async (req, res) => {
    logger.debug(`req.query`, req.query);
    let diffApiUrl = `https://${wikiToDomain[req.query.wiki]}/w/api.php?action=compare&fromrev=${req.query.revId}&torelative=prev&format=json`;
    let diffJson = await rp.get(diffApiUrl, { json: true });
    res.send(diffJson);
    req.visitor
        .event({ ec: "api", ea: "/diff" })
        .send();
};

diffRouter.get(`/`, asyncHandler(diff));
