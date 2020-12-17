// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// This folder includes api convenience  that we use for accessing
// MediaWiki Action API and REST API

import { strict as assert } from 'assert';
import { wikiToDomain } from '@/shared/utility-shared';
import Bottleneck from 'bottleneck';

/**
 * An interface for the page info when fetching from MediaWiki Action API.

 Sample output

 ```json
    {
    "pageid": 48410011,
    "ns": 0,
    "title": "2020 United States presidential election",
    "type": "page",
    "timestamp": "2020-03-28T19:51:23Z"
    }
  ```
  */

export interface MwInfo {
  wiki: string;
}

export interface MwPageInfo extends MwInfo {
  wiki: string;
  pageId: number;
  namespace: number;
  title: string;
}

export interface MwRevisionInfo extends MwPageInfo {
  revId: number;
  parentRevId?: number;
  author: string;
  comment: string;
  timestampStr: string;
}

export function wikiUrl(wiki, { title, revId, user }) {
  if (title) {
    const encodedTitle = title.replace(' ', '_');
    return `https://${wikiToDomain[wiki]}/wiki/${encodedTitle}`;
  } else if (revId) {
    return `https://${wikiToDomain[wiki]}/wiki/Special:Diff/${revId}`;
  } else if (user) {
    const encodedUser = user.replace(' ', '_');
    return `https://${wikiToDomain[wiki]}/wiki/User:${user}`;
  }
}

/**
 * An class for utility functions for MediaWiki Action Client.
 */
export class MwActionApiClient2 {
  private axios;
  private bottleneck;

  constructor(axios) {
    this.axios = axios || require('axios');
    this.bottleneck = new Bottleneck({
      minTime: 500
    });
  }

  /**
   * Given a valid {@link wiki} this function returns a MediaWiki instance endpoint.
   *
   * @throws an error if wiki is not valid.
   * @return a MediaWiki instance endpoint URL
   *
   * @param wiki
   */
  public static endPoint(wiki: string) {
    if (wiki in wikiToDomain) {
      return `https://${wikiToDomain[wiki]}/w/api.php`;
    } else {
      throw new Error(
        `Error: wiki "${wiki}" was not available in wikiToDomain, which supports only ${Object.keys(
          wikiToDomain
        )}`
      );
    }
  }

  public static infoParams(revId) {
    const params = {
      action: 'query',
      format: 'json',
      prop: 'revisions',
      revids: revId,
      origin: '*'
    };
    return params;
  }

  public static extractRevisionInfo(wiki, result) {
    if (result.data?.query?.badrevids) {
      // TODO: conisider verifying the badrevids is the revision we sent them.
      // This is ignored since we are assuming the {@link revId} is a single number.
      // when revid does not exist;
      return null;
    } else if (Object.keys(result.data?.query?.pages)) {
      const pageIds = Object.keys(result.data.query.pages);
      
      // We expect only one or less pages in response, and thus we use a a for-loop to 
      // get the maybe-exist page.
      assert(pageIds.length <= 1);
      // eslint-disable-next-line no-unreachable-loop
      for (const pageId of pageIds) {
        const page = result.data.query.pages[pageId];
        const mwRevisionInfo = {
          wiki,
          pageId: parseInt(pageId),
          namespace: page.ns,
          title: page.title,
          revId: page.revisions[0].revid,
          parentRevId: page.revisions[0].parentid,
          author: page.revisions[0].user,
          comment: page.revisions[0].comment,
          timestampStr: page.revisions[0].timestamp
        } as MwRevisionInfo;
        return mwRevisionInfo;
      }
    }
  }

  /**
   * A fetch function given {@link wiki} and a SINGLE {@link revId} it returns information of a revision, given wiki and revid.
   *
   * There are a few types of errors:
   *   1. revision doesn't exist ever. - it will return null
   *   2. revision was deleted, e.g. due to violation of policy - it will return null
   *   3. connection was broken - retry - it will through and error, and the upper layer consider retrial.
   *
   * @param wiki
   * @param revId
   *
   * @return a composed {@link MwRevisionInfo} that contains page and revision info.
   */
  public async fetchRevisionInfo(
    wiki: string,
    revId: number
  ): Promise<MwRevisionInfo> {
    const result = await this.bottleneck.schedule(
      async () =>
        await this.axios.get(MwActionApiClient2.endPoint(wiki), {
          params: MwActionApiClient2.infoParams(revId)
        })
    );
    return MwActionApiClient2.extractRevisionInfo(wiki, result);
  }

  public static diffParams(revId: number, prevRevId: number = null) {
    const params: any = {
      action: 'compare',
      format: 'json',
      origin: '*'
    };

    if (prevRevId) {
      params.torev = revId;
      params.fromrev = prevRevId;
    } else {
      params.fromrev = revId; // When using torelative:prev, the compare API will swap fromrev with torev.
      params.torelative = 'prev';
    }
    return params;
  }

  public async fetchDiff(
    wiki: string,
    revId: number,
    prevRevId: number = null
  ) {
    const ret = await this.axios.get(MwActionApiClient2.endPoint(wiki), {
      params: MwActionApiClient2.diffParams(revId, prevRevId)
    });
    if (ret.data.error) {
      throw new Error(
        `Error fetching Diff, error: ${JSON.stringify(ret.data, null, 2)}`
      );
    }
    return ret.data.compare['*'];
  }

  public static parsedParams(revId) {
    return {
      action: 'parse',
      format: 'json',
      prop: 'links|images|iwlinks',
      oldid: revId,
      origin: '*'
    };
  }

  public async fetchParsedInfo(wiki: string, revId: number) {
    const ret = await this.axios.get(MwActionApiClient2.endPoint(wiki), {
      params: MwActionApiClient2.parsedParams(revId)
    });
    if (ret.data.error) {
      throw new Error(ret.data.error.info);
    } else {
      return ret.data.parse;
    }
  }
}
