
import { FeedEnum, WatchCollectionFeed } from '@/server/feed/watch-collection-feed';
import { MwActionApiClient } from '@/shared/mwapi';
import { wikiToDomain } from '@/shared/utility-shared';
import { asyncHandler, isAuthenticatedWithWikiUserName, apiLogger } from '~/server/common';
import { FeedRevisionEngine } from '~/server/feed/feed-revision-engine';
import { FeedRevisionProps, FeedRevision } from '~/shared/models/feed-revision.model';
const express = require('express');

export const feedRouter = express.Router();

feedRouter.get('/mix', async (req, res) => {
  const weighted = require('weighted');

  const options = {
    recent: 1,
    // 'second': 0.1,
    ores: 1,
    covid19: 1,
    us2020: 1,
    wikitrust: parseInt(process.env.MIXER_RATIO_WIKITRUST) || 0,
    lastbad: parseInt(process.env.MIXER_RATIO_LASTBAD) || 0,
  };
  const feed = weighted.select(options);
  apiLogger.info(`Mixer options =${JSON.stringify(options, null, 2)}, picked = ${feed}`);
  let wikiRevIds;
  const ctx:any = {
    wiki: req.query.wiki || 'enwiki',
    limit: parseInt(req.query.limit) || 50,
  };

  switch (feed) {
  case 'us2020':
  case 'covid19': // fall through
  case 'wikitrust': // fall through
    feedRevisionHandler(true, feed)(req, res);
    return; // we don't go to res.send clause below.
  case 'ores': // fall through
    wikiRevIds = await WatchCollectionFeed.sampleRevisions(
      FeedEnum[feed], parseInt(req.query.size) || 50);
    break;
  case 'lastbad': // fall through
    ctx.bad = true;
  case 'recent': // fall through
  default:
    wikiRevIds = (await MwActionApiClient.getLatestRevisionIds(ctx))
        .map((revId) => `${ctx.wiki}:${revId}`);
    break;
  }
  res.send({
    useMixer: true,
    feed,
    wikiRevIds,
  });
});

feedRouter.get(/(recent|lastbad)/, async (req, res) => {
  if (req.query.wiki && !Object.keys(wikiToDomain).includes(req.query.wiki)) {
    res.status(400).send(`The wiki ${req.query.wiki} is not supported`);
  } else {
    const ctx:any = {
      wiki: req.query.wiki || 'enwiki',
      limit: (parseInt(req.query.limit)) || 50,
    };
    const feed = req.path.split('/')[1];
    if (feed === 'lastbad') {
      ctx.bad = true;
      ctx.isLast = true;
    }
    const wiki = req.query.wiki;
    const wikiRevIds = (await MwActionApiClient.getLatestRevisionIds(ctx)).map((revId) => `${wiki}:${revId}`);
    res.send({
      useMixer: false,
      feed,
      wikiRevIds,
    });
  }
});

const feedRevisionHandler = function(useMixer = false, chosenFeed = null) {
  return async function(req, res) {
    const wiki = req.query.wiki || 'enwiki';
    const feed = chosenFeed || req.query.feed || 'us2020';
    const limit = parseInt(req.query.limit) || 2;
    const userGaId = req.query.userGaId;
    const wikiUserName = req.query.wikiUserName || null;
    if (wikiUserName && !isAuthenticatedWithWikiUserName(req, wikiUserName)) {
      res.status(403);
      res.send('Login required to fetch and claim revisions');
      return;
    }

    const feedRevisions:FeedRevisionProps[] = await FeedRevisionEngine.fetchAndClaim(userGaId, wikiUserName, feed, wiki, limit);
    res.send({
      useMixer,
      feed,
      wikiRevIds: feedRevisions.map((fr) => fr.wikiRevId),
    });
  };
};

feedRouter.get('/us2020', asyncHandler(feedRevisionHandler()));
feedRouter.get('/covid19', asyncHandler(feedRevisionHandler()));
feedRouter.get('/wikitrust', asyncHandler(feedRevisionHandler()));

feedRouter.get('/:feed', async (req, res) => {
  const feed = req.params.feed;
  if (Object.keys(FeedEnum).includes(feed)) {
    res.send({
      useMixer: false,
      feed,
      wikiRevIds: await WatchCollectionFeed.sampleRevisions(FeedEnum[req.params.feed], parseInt(req.query.limit) || 50),
    });
  } else {res.status(404).send(`Feed ${feed} doesn't exist`);}
});

// curl -H "Content-Type: application/json" -H "WikiLoopToken:$FEED_WIKITRUST_TOKEN" -X POST -d @./test/testdata/wikitrust_feed.json http://dev.doublecheck.wikiloop.org:3000/api/feed/wikitrust
feedRouter.post('/:feed', async (req, res) => {
  // Validation
  // TODO(xinbenlv): consider use `express-validator`
  // TODO(xinbenlv): change to MongoDB
  if (req.params.feed == 'wikitrust' &&
    (process.env.FEED_WIKITRUST_TOKEN && req.header('WikiLoopToken') == process.env.FEED_WIKITRUST_TOKEN)) {
    const mongoose = require('mongoose');
    await mongoose.connection.db.collection('WatchCollection_WIKITRUST')
        .insertMany(req.body.content);

    // TODO(xinbenlv) add logic to allow validating content format, or consider use gRPC
    res.send('ok');
  } else {
    res.status(403).send(
      `The provided feed ${req.body.feed} or feedToken ${req.body.feedToken} combination is invalid.`);
  }
});

const ingestRevisionHandler = asyncHandler(async (req, res) => {
  interface FeedRevisionItem {
    feed:string,
    wiki:string,
    revIds:number[],
    title?:string,
    pageId?:number,
    feedRankScore?:number,
  } // TODO deprecated, should migrate to FeedRevision instead
  const feedRevisionItem = <FeedRevisionItem>{};
  feedRevisionItem.feed = req.query.feed;
  feedRevisionItem.wiki = req.query.wiki;
  feedRevisionItem.revIds = [parseInt(req.query.revId)];
  feedRevisionItem.title = req.query.title;
  feedRevisionItem.feedRankScore = req.query.priority_score;
  feedRevisionItem.pageId = parseInt(req.query.pageId);

  const now = new Date();
  if (req.query.feed == 'wikitrust' &&
    (process.env.FEED_WIKITRUST_TOKEN && req.header('WikiLoopToken') == process.env.FEED_WIKITRUST_TOKEN)) {
    /* TODO: deprecate the WatchCollection W */
    const mongoose = require('mongoose');
    await mongoose.connection.db.collection('WatchCollection_WIKITRUST')
        .insertOne(feedRevisionItem);

    const feedRevision:any = <FeedRevisionProps> {
      feed: feedRevisionItem.feed,
      wiki: feedRevisionItem.wiki,
      wikiRevId: `${feedRevisionItem.wiki}:${req.query.revId}`,
      feedRankScore: feedRevisionItem.feedRankScore,
      title: feedRevisionItem.title,
      createdAt: now,
    };
    feedRevision.additionalInfo = {};
    if (req.query.ts_crawled) {feedRevision.additionalInfo.ts_crawled = parseInt(req.query.ts_crawled);}
    if (req.query.ts_sendout) {feedRevision.additionalInfo.ts_sendout = parseInt(req.query.ts_sendout);}
    if (req.query.ts_expire) {feedRevision.additionalInfo.ts_expire = parseInt(req.query.ts_expire);}

    await FeedRevision.findOneAndUpdate({ feed: feedRevision.feed, wiki: feedRevision.wiki, wikiRevId: feedRevision.wikiRevId }, feedRevision, { upsert: true });

    res.send('ok');
  } else {
    res.status(403).send(
      `The provided feed ${req.body.feed} or feedToken ${req.body.feedToken} combination is invalid.`);
  }
});
// curl -H "Content-Type: application/json" -H "WikiLoopToken:$FEED_WIKITRUST_TOKEN" -X GET "http://localhost:3000/api/feed/wikitrust/revision?feed=wikitrust&wiki=enwiki&title=Gald%C3%B3n&pageId=56289988&revId=972852246&ts_crawled=0&ts_sendout=1597376155&ts_expire=1597376146"
feedRouter.get('/:feed/revision', ingestRevisionHandler);
feedRouter.post('/:feed/revision', ingestRevisionHandler);

// curl -H "Content-Type: application/json" -H "WikiLoopToken:$FEED_WIKITRUST_TOKEN" -X DELETE http://localhost:3000/api/feed/wikitrust
feedRouter.delete('/:feed', async (req, res) => {
  // Validation
  // TODO(xinbenlv): consider use `express-validator`
  // TODO(xinbenlv): change to MongoDB
  if (req.params.feed == 'wikitrust' && req.header('WikiLoopToken') == process.env.FEED_WIKITRUST_TOKEN) {
    const mongoose = require('mongoose');
    try {
      await mongoose.connection.db.collection('WatchCollection_WIKITRUST').drop();
      res.send('ok');
    } catch (e) {
      if (e.code === 26 /* collection doesn't exist */) {res.send('ok');} else {res.status(500).send(e);}
    }
  } else {
    res.status(403).send(
      `The provided feed ${req.body.feed} or feedToken ${req.header('WikiLoopToken')} combination is invalid.`);
  }
});
