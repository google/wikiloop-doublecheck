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

import { wikiToDomain } from '@/shared/utility-shared';
import * as _ from 'underscore';
import update from 'immutability-helper';
const axios = require('axios');
const MAX_MWAPI_LIMIT:number = 50;
const userAgent = process.env.USER_AGENT || 'WikiLoop DoubleCheck Dev';
const Bottleneck = require('bottleneck');
const moreHeaders = {
  // "Origin": "http://localhost:3000",
  'Content-Type': 'application/json; charset=UTF-8',
};

/**
  "pageid": 48410011,
  "ns": 0,
  "title": "2020 United States presidential election",
  "type": "page",
  "timestamp": "2020-03-28T19:51:23Z"
 */
export interface MwPageInfo {
  pageid?:string,
  ns?:string,
  title?:string,
  timestamp?:string,
}

/**
 * MediaWiki Action API Client Utility
 *
 * TODO(xinbenlv): change to instance instead of static functions
 *
 * @doc https://www.mediawiki.org/wiki/API:Main_page
 */
export class MwActionApiClient {
  private static bottleneck = new Bottleneck({
    minTime: 100,
  });

  public static async getMwPageInfosByTitles(wiki:string, titles:string[]):Promise<MwPageInfo[]> {
    console.assert(titles && titles.length > 0 && titles.length <= MAX_MWAPI_LIMIT, `Parameter titles needs to has a length between 1 to ${MAX_MWAPI_LIMIT}}, but was ${titles.length}.`);

    const params = {
      action: 'query',
      format: 'json',
      prop: 'pageprops',
      titles: titles.join('|'),
    };
    const endpoint = `https://${wikiToDomain[wiki]}/w/api.php`;

    const result = await MwActionApiClient.bottleneck.schedule(
      async () => await axios.get(endpoint, { params, headers: { ...moreHeaders } }));
    if (Object.keys(result.data.query?.pages).length) {
      return Object.keys(result.data.query.pages).map((pageId) => {
        return result.data.query.pages[pageId];
      });
    }
    return [];
  }

  public static async getPageViewsByTitles(wiki:string, titles:string[], days:number = 60):Promise<object> {
    console.assert(titles && titles.length > 0 && titles.length <= MAX_MWAPI_LIMIT, `Parameter titles needs to has a length between 1 to ${MAX_MWAPI_LIMIT}}, but was ${titles.length}.`);

    const params =
    {
      action: 'query',
      format: 'json',
      prop: 'pageviews',
      titles: titles.join('|'),
      pvipdays: days,
    };
    const endpoint = `https://${wikiToDomain[wiki]}/w/api.php`;
    const ret = {};
    const result = await MwActionApiClient.bottleneck.schedule(
      async () => await axios.get(endpoint, { params, headers: { 'User-Agent': userAgent } }));
    console.assert(Object.keys(result.data.query?.pages).length == titles.length);
    for (let i = 0; i < Object.keys(result.data.query.pages).length; i++) {
      const pageId = Object.keys(result.data.query.pages)[i];
      const pageviewsOfPage = result.data.query.pages[pageId].pageviews;
      const title = result.data.query.pages[pageId].title;
      let pageviewCount = 0;
      if (pageviewsOfPage) {
        pageviewCount = Object.values(pageviewsOfPage).reduce((a: number, b:number) => a + b, 0) as number;
      }
      ret[title] = pageviewCount;
    }

    return ret;
  }

  public static async getRevisionIdsByTitle(
    wiki:string, pageTitle: string,
    startRevId: number = null, limit:number = MAX_MWAPI_LIMIT):Promise<object> {
    // TODO(xinbenlv) validate

    // https://www.mediawiki.org/wiki/Special:ApiSandbox#action=query&format=json&prop=revisions&titles=API%3AGeosearch&rvprop=timestamp%7Cuser%7Ccomment%7Cids&rvslots=main&rvlimit=500&rvdir=older
    const query: any = {
      action: 'query',
      format: 'json',
      prop: 'revisions',
      titles: pageTitle,
      rvprop: 'ids',
      rvslots: 'main',
      rvlimit: limit,
      rvdir: 'older',
    };

    if (startRevId) {query.rvstart = startRevId;}
    const searchParams = new URLSearchParams(query);
    const url = new URL(`https://${wikiToDomain[wiki]}/w/api.php?${searchParams.toString()}`);
    console.log('Url = ', url);
    try {
      const revisionsJson = (await MwActionApiClient.bottleneck.schedule(async () => await axios.get(url.toString(), {
        headers: { ...moreHeaders },
      }))).data;
      const pageId = Object.keys(revisionsJson.query.pages)[0];
      if (revisionsJson.query.pages[pageId].revisions) {return revisionsJson.query.pages[pageId].revisions.map((item) => item.revid);} else {return [];}
    } catch (e) {
      console.warn(e);
      return [];
    }
  }

  /**
   * Get the last-est revisions. This is the only endpoint where MediaWiki
   * allows querying querying various pages.
   *
   * @params ctx see {@link getRawRecentChanges}
   * @return raw object of recentChanges.
   */
  public static getLatestRevisionIds = async function(ctx) {
    const ctx2 = update(ctx, {
      limit: { $set: MAX_MWAPI_LIMIT },
    });
    const raw = await MwActionApiClient.getRawRecentChanges(ctx2);
    const revIds = raw.query.recentchanges.map((rc) => rc.revid);
    return _.sample(revIds, ctx.limit);
  };

  /**
   * Get the last-est revisions. This is the only endpoint where MediaWiki
   * allows querying querying various pages.
   *
   * @params ctx see {@link getRawRecentChanges}
   * @return raw object of recentChanges.
   */
  public static getLatestOresRevisionIds = async function(ctx) {
    const cloneCtx = { ...ctx };
    cloneCtx.limit = MAX_MWAPI_LIMIT;
    const raw = await MwActionApiClient.getRawRecentChanges(cloneCtx);
    const result = raw.query.recentchanges
        .filter((rc) =>
          rc.oresscores.damaging && rc.oresscores.goodfaith &&
        rc.oresscores.damaging.true >= 0.5 && rc.oresscores.goodfaith.false >= 0.5)
        .map((rc) => rc.revid);
    // TODO(xinbenlv): when we add test, allow deterministic behavior with seed.
    return _.sample(result, ctx.limit);
  };

  /**
   * Get the last-est revisions. This is the only endpoint where MediaWiki
   * allows querying querying various pages.
   * @param
   * @returns raw object of recentChanges.
   */
  public static getRawRecentChanges = async function({ wiki = 'enwiki', direction, timestamp, limit = 500, bad = false, isLast = false }) {
    const searchParams = new URLSearchParams(
      {
        action: 'query',
        format: 'json',
        list: 'recentchanges',
        formatversion: '2',
        rcnamespace: '0',
        rcprop: 'title|timestamp|ids|oresscores|flags|tags|sizes|comment|user',
        rcshow: '!bot',
        rclimit: '1',
        rctype: 'edit',
        rctoponly: '1',
        origin: "*" // TODO(xinbenlv, #371): for some reason it doesn't work for wikidatawiki. We need to further debug it.
      });
    if (bad) {searchParams.set('rcshow', '!bot|oresreview');}
    if (isLast) {searchParams.set('rctoponly', '1');}
    if (direction) {searchParams.set('rcdir', direction || 'older');}
    if (timestamp) {searchParams.set('rcstart', timestamp || (new Date().getTime() / 1000));}
    searchParams.set('rclimit', limit.toString());

    const url = new URL(`https://${wikiToDomain[wiki]}/w/api.php?${searchParams.toString()}`);
    console.log(`Requesting ${wiki} for Media Action API: ${url.toString()}`);
    console.log(`Try sandbox request here: ${new URL(`https://${wikiToDomain[wiki]}/wiki/Special:ApiSandbox#${searchParams.toString()}`)}`);

    const response = await MwActionApiClient.bottleneck.schedule(async () => await axios.get(url.toString(), {
      headers: { ...moreHeaders },
    }));
    const recentChangesJson = response.data;
    /** Sample response
     {
     "batchcomplete":"",
     "continue":{
        "rccontinue":"20190701214931|1167038199",
        "continue":"-||info"
     },
     "query":{
        "recentchanges":[
           {
              "type":"edit",
              "ns":0,
              "title":"Multiprocessor system architecture",
              "pageid":58955273,
              "revid":904396518,
              "old_revid":904395753,
              "rcid":1167038198,
              "user":"Dhtwiki",
              "userid":9475572,
              "timestamp":"2019-07-01T21:49:32Z",
              "comment":"Putting images at bottom, side by side, to prevent impinging on References section"
           }
           // ...
        ]
     }
    } */
    return recentChangesJson;
  }

  public static getLastRevisionsByTitles = async function(titles:string[], wiki = 'enwiki', rvcontinue = null) {
    const query: any = {
      action: 'query',
      format: 'json',
      prop: 'revisions',
      titles: titles.join('|'),
      rvprop: 'ids|timestamp|flags|comment|user|oresscores|tags|userid|roles|flagged',
    };
    if (rvcontinue) {
      query.rvcontinue = rvcontinue;
    }
    const searchParams = new URLSearchParams(query);
    const url = new URL(`https://${wikiToDomain[wiki]}/w/api.php?${searchParams.toString()}`);
    return (await MwActionApiClient.bottleneck.schedule(async () => await axios.get(url.toString(), {
      headers: { ...moreHeaders },
    }))).data;
  }

  public static getDiffByWikiRevId = async function(wiki:string, revId:number) {
    const query: any = {
      action: 'compare',
      format: 'json',
      fromrev: `${revId}`,
      torelative: 'prev',
      origin: '*', // https://www.mediawiki.org/wiki/API:Cross-site_requests
    };
    const searchParams = new URLSearchParams(query);
    const url = new URL(`https://${wikiToDomain[wiki]}/w/api.php?${searchParams.toString()}`);
    const result = (await MwActionApiClient.bottleneck.schedule(async () => await axios.get(url.toString(), {
      headers: { ...moreHeaders },
    }))).data;
    return result.compare['*'];
  }

  /**
   * Given a wiki, using a title to get all it's category children
   * please note this function handles the "continue" call to MediaWiki Action API
   * it is in charge of making all follow up queries.
   *
   * @param wiki
   * @param entryArticle
   */
  public static getCategoryChildren = async function(wiki, entryArticle):Promise<MwPageInfo[]> {
    const endpoint = `https://${wikiToDomain[wiki]}/w/api.php`;
    const result = [];
    const params = {
      action: 'query',
      format: 'json',
      list: 'categorymembers',
      formatversion: '2',
      cmtitle: entryArticle,
      cmprop: 'ids|timestamp|title',
      cmnamespace: '0|14',
      cmlimit: '500',
    };
    let ret = null;

    do {
      ret = await axios.get(endpoint, { params, headers: { ...moreHeaders } });

      /** json
        {
          "batchcomplete": true,
          "continue": {
          "cmcontinue": "page|0f53aa04354b3131430443294f394543293f042d45435331434f394543011f01c4dcc1dcbedc0d|61561742",
          "continue": "-||"
          },
          "query": {
            "categorymembers": [
              {
                "pageid": 48410011,
                "ns": 0,
                "title": "2020 United States presidential election",
                "timestamp": "2020-03-28T19:51:23Z"
              }
            ],
          }
        }
        */
      if (ret.data?.query?.categorymembers?.length > 0) {
        ret.data.query.categorymembers.forEach((item) => console.log(`${JSON.stringify(item.title, null, 2)}`));
        result.push(...ret.data.query.categorymembers);
        if (ret.data?.continue?.cmcontinue) {(params as any).cmcontinue = ret.data.continue.cmcontinue;}
      } else {
        return result;
      }
    } while (ret.data?.continue?.cmcontinue);
    return result;
  }

  /**
   * Given a wiki, using a title to get all it's category children
   * please note this function handles the "continue" call to MediaWiki Action API
   * it is in charge of making all follow up queries.
   *
   * @param wiki
   * @param entryArticle
   */
  public static getLinkChildren = async function(wiki, entryArticle):Promise<string[]> {
    try {
      const endpoint = `https://${wikiToDomain[wiki]}/w/api.php`;
      const result:string[] = [];
      const params = {
        action: 'query',
        format: 'json',
        prop: 'links',
        formatversion: '2',
        plnamespace: '0',
        titles: entryArticle,
        pllimit: '500',
      };
      let ret = null;

      do {
        ret = await axios.get(endpoint, { params, headers: { ...moreHeaders } });

        /** json
        {
            "continue": {
                "plcontinue": "9228|0|2010_TK7",
                "continue": "||"
            },
            "query": {
                "pages": {
                    "9228": {
                        "pageid": 9228,
                        "ns": 0,
                        "title": "Earth",
                        "links": [
                            {
                                "ns": 0,
                                "title": "2002 AA29"
                            },
                            {
                                "ns": 0,
                                "title": "2006 RH120"
                            }
                        ]
                    }
                }
            }
        }
        */
        if (ret.data?.query?.pages && Object.keys(ret.data?.query?.pages).length == 1) {
          const pageId = Object.keys(ret.data?.query?.pages)[0];
          const links = ret.data.query.pages[pageId].links;
          if (links) {result.push(...links.map((link) => link.title));}

          if (ret.data?.continue?.plcontinue) {(params as any).plcontinue = ret.data.continue.plcontinue;} else {break;}
        } else {
          break;
        }
      } while (ret.data?.continue?.plcontinue);
      return result;
    } catch (e) {
      console.warn(e);
      return [];
    }
  }
}
