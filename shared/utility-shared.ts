import { RevisionPanelItem } from '@/shared/interfaces';

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

export enum UserTier {
  Blocked = -1, // -10
  Anonymous = 0, // 1 = 1e0
  User = 1, // 10 = 1e1
  Confirmed = 2, // 100 = 1e2
  ExtendedConfirmed = 3, // 1000 = 1e3
  Rollbacker = 4, // 10000 = 1e4
  Admin = 5 // 100000 = 1e5
}

export const wikiLangs = [
  'af',
  'ar',
  'bg',
  'ca',
  'cs',
  'de',
  'en',
  'es',
  'fa',
  'fr',
  'he',
  'id',
  'it',
  'ja',
  'ko',
  'lv',
  'nl',
  'pl',
  'pt',
  'ru',
  'sv',
  'th',
  'tr',
  'uk',
  'zh',
];

const _wikiToDomain = {
  "wikidatawiki": "wikidata.org",
  "testwiki": "test.wikipedia.org",
};

const _wikiToLangMap = {
  "wikidatawiki": "en", // TODO(xinbenlv): consider how we deal with wikidata UI languages.
  "testwiki": "en",
};

wikiLangs.forEach(lang => {
  _wikiToDomain[`${lang}wiki`] = `${lang}.wikipedia.org`;
  _wikiToLangMap[`${lang}wiki`] = lang;
});

export const wikiToDomain = (function() {
  wikiLangs.forEach(lang => {
    _wikiToDomain[`${lang}wiki`] = `${lang}.wikipedia.org`;
  });
  return _wikiToDomain;
})();

export const wikiToLangMap = (function() {
  wikiLangs.forEach(lang => {
    _wikiToLangMap[`${lang}wiki`] = lang;
  });
  return _wikiToLangMap;
})();

export let getUrlBaseByWiki = function(wiki) {
    return `http://${wikiToDomain[wiki]}`;
};

  /**
   * @param wikiRevId a string of wiki:revId
   * @returns {Promise<String>}
   */
export let fetchDiffWithWikiRevId = async function(wikiRevId, $axios) {
    let wiki = wikiRevId.split(`:`)[0];
    let revId = wikiRevId.split(`:`)[1];
    let diffApiUrl = `/api/diff/${wiki}:${revId}`;
    let diffJson = await $axios.$get(diffApiUrl);
    return diffJson;
};
export const supportedWikis = Object.keys(wikiToDomain);

export const parseWikiRevId = (wikiRevId: string): [string,number] => {
  return [wikiRevId.split(':')[0], parseInt(wikiRevId.split(':')[1])];
}

export const percent = (num:number) => {
  return `${Math.round(num * 100)}%`;
}

export const fetchRevisionPanelItem = async function(wikiRevId, $axios):Promise<RevisionPanelItem> {
  let [revision, diff] = await Promise.all([
    await $axios.$get(`/api/revision/${wikiRevId}`),
    await $axios.$get(`/api/diff/${wikiRevId}`)
  ]);
  let diffHtml = diff?.compare['*'] || '';
  let diffMetadata = diff?.compare.diffMetadata || null;
  return <RevisionPanelItem> {
    wiki: revision.wiki,
    revId: revision.revid,
    title: revision.title,
    pageId: revision.pageId,
    summary: revision.comment,
    author: revision.user,
    timestamp: new Date(revision.timestamp).getTime()/1000,
    diffHtml: diffHtml,
    diffMetadata: diffMetadata
  };
}

export const getHash = (str, len = 5) => {
  var hash = require('hash.js');
  return hash.sha256().update(str).digest('hex').slice(0,len);
}
