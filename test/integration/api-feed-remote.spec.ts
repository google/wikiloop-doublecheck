/**
 * @jest-environment jsdom
 */

import express from 'express';
import request from 'supertest';
import { apiRouter as newApiRouter } from '~/server/routers/api';
import { FeedResponse } from '~/server/routers/api/feed';
import { parseWikiRevId } from '~/shared/utility-shared';
const app = express();
app.use('/api', newApiRouter);

async function verifyBasicFeedResponse(feed:string, limit:number, wiki:string) {
  const res = await request(app)
      .get(`/api/feed/${feed}`)
      .query({wiki, limit });
  const feedRes = res.body as FeedResponse;
  expect(feedRes.feed).toBe(feed);
  expect(feedRes.useMixer).toBe(false);
  expect(feedRes.wikiRevIds.length).toBe(limit);
  feedRes.wikiRevIds.forEach(
    wikiRevId => {
      const [wiki, revId] = parseWikiRevId(wikiRevId);
      expect(revId > 0).toBe(true);
      expect(wiki).toEqual(wiki);
    });
}
/**
 * The test with real axio sending real HTTP requests to fetch revision info
 *
 * **!Note** This test requires a test environment with network connectivity and can be flaky.
 */
describe('API /api/feed/lastbad', () => {
  beforeEach(() => {
    jest.setTimeout(10000);
  });
  for (const feed of ['lastbad', 'recent']) {
    for (const wiki of [
      'enwiki', 
      'zhwiki', 
      // 'wikidatawiki' // TODO(xinbenlv, #371): for some reason it doesn't work for wikidatawiki. We need to further debug it.
    ]) {
      test(`should handle feed="${feed}" for ${wiki} request and return correct list of WikiRevIds under requested timeout`, async () => {
        await verifyBasicFeedResponse(feed, 10, wiki);
      });
    }

  }

});
