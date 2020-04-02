// Copyright 2020 Google LLC
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

// This folder includes api convenience  that we use for accessing
// MediaWiki Action API and REST API

import {wikiToDomain} from "~/shared/utility-shared";
import {logger} from "~/server/common";

const rp = require('request-promise');

/**
 * MediaWiki Action API Client Utility
 *
 * @doc https://www.mediawiki.org/wiki/API:Main_page
 */
export class MwActionApiClient {
  public static async getRevisions(
    wiki:string, pageTitle: string,
    startRevId: number = null):Promise<number[]> {

    // https://www.mediawiki.org/wiki/Special:ApiSandbox#action=query&format=json&prop=revisions&titles=API%3AGeosearch&rvprop=timestamp%7Cuser%7Ccomment%7Cids&rvslots=main&rvlimit=500&rvdir=older
    let query: any = {
      "action": "query",
      "format": "json",
      "prop": "revisions",
      "titles": pageTitle,
      "rvprop": "ids",
      "rvslots": "main",
      "rvlimit": "500",
      "rvdir": "older",
    };

    if (startRevId) query.rvstart = startRevId;
    let searchParams = new URLSearchParams(query);
    let url = new URL(`http://${wikiToDomain[wiki]}/w/api.php?${searchParams.toString()}`);
    console.log(`Url = `, url);
    try {
      let revisionsJson = await rp.get(url.toString(), {json: true});
      let pageId = Object.keys(revisionsJson.query.pages)[0];
      if (revisionsJson.query.pages[pageId].revisions)
      return revisionsJson.query.pages[pageId].revisions.map(item => item.revid);
      else return [];
    } catch (e) {
        logger.warn(e);
        return [];
    }
  }
}
