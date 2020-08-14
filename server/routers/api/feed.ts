import { asyncHandler, isAuthenticatedWithWikiUserName } from '~/server/common';

const express = require('express');
import {FeedEnum, WatchCollectionFeed} from "@/server/feed/watch-collection-feed";
import {MwActionApiClient} from "@/shared/mwapi";
import { wikiToDomain } from '@/shared/utility-shared';
import { FeedRevisionEngine } from "~/server/feed/feed-revision-engine";
import { apiLogger } from '@/server/common';
import { FeedRevisionProps, FeedRevision } from '~/shared/models/feed-revision.model';

export const feedRouter = express.Router();

feedRouter.get('/mix', async (req, res) => {
  var weighted = require('weighted');

  var options = {
    'recent': 1,
    // 'second': 0.1,
    'ores': 1,
    'covid19': 1,
    'us2020': 1,
    'wikitrust': parseInt(process.env.MIXER_RATIO_WIKITRUST) || 0,
    'lastbad': parseInt(process.env.MIXER_RATIO_LASTBAD )|| 0
  };
  const feed = weighted.select(options);
  let wikiRevIds;
  let ctx:any = {
    wiki: req.query.wiki || 'enwiki',
    limit: req.query.limit || 50,
  };

  switch (feed) {
    case 'us2020':
    case 'covid19':  // fall through
      feedRevisionHandler(true)(res, req);
      return; // we don't go to res.send clause below.
    case 'ores':  // fall through
    case 'wikitrust':  // fall through
      wikiRevIds = await WatchCollectionFeed.sampleRevisions(
        FeedEnum[feed], parseInt(req.query.size) || 50);
        break;
    case 'lastbad':  // fall through
      ctx.bad = true;
    case 'recent':  // fall through
    default:
      wikiRevIds = (await MwActionApiClient.getLatestRevisionIds(ctx))
        .map(revId => `${ctx.wiki}:${revId}`);
      break;
  }
  res.send({
    useMixer: true,
    feed: feed,
    wikiRevIds: wikiRevIds
  });
});

feedRouter.get(/(recent|lastbad)/, async (req, res) => {
  if (req.query.wiki && Object.keys(wikiToDomain).indexOf(req.query.wiki) < 0) {
    res.status(400).send(`The wiki ${req.query.wiki} is not supported`);
    return;
  } else {
    let ctx:any = {
      wiki: req.query.wiki || 'enwiki',
      limit: 50
    };
    let feed = req.path.split('/')[1];
    if (feed === 'lastbad') {
      ctx.bad = true;
      ctx.isLast = true;
    }
    let wiki = req.query.wiki;
    let wikiRevIds = (await MwActionApiClient.getLatestRevisionIds(ctx)).map(revId => `${wiki}:${revId}`);
    res.send({
      useMixer: false,
      feed: feed,
      wikiRevIds: wikiRevIds
    });
  }
});

let feedRevisionHandler = function (useMixer) {
  return async function(req, res) {
    let wiki = req.query.wiki || 'enwiki';
    let feed = req.query.feed || 'us2020';
    let userGaId = req.query.userGaId;
    let wikiUserName = req.query.wikiUserName || null;
    if (wikiUserName && !isAuthenticatedWithWikiUserName(req, wikiUserName)) {
      res.status( 403 );
      res.send( 'Login required to fetch and claim revisions' );
      return;
    }

    let feedRevisions:FeedRevisionProps[] = await FeedRevisionEngine.fetchAndClaim(userGaId, wikiUserName, feed, wiki, 2);
    res.send({
      useMixer: useMixer,
      feed: feed,
      wikiRevIds: feedRevisions.map(fr=>fr.wikiRevId)
    });
  };
}

feedRouter.get('/us2020', asyncHandler(feedRevisionHandler(false)));
feedRouter.get('/covid19', asyncHandler(feedRevisionHandler(false)));

feedRouter.get("/:feed", async (req, res) => {
  let feed = req.params.feed;
  if (Object.keys(FeedEnum).includes(feed))
    res.send({
      useMixer: false,
      feed: feed,
      wikiRevIds: await WatchCollectionFeed.sampleRevisions(FeedEnum[req.params.feed], parseInt(req.query.limit) || 50)
    });
  else res.status(404).send(`Feed ${feed} doesn't exist`);
});

// curl -H "Content-Type: application/json" -H "WikiLoopToken:$FEED_WIKITRUST_TOKEN" -X POST -d @./test/testdata/wikitrust_feed.json http://dev.doublecheck.wikiloop.org:3000/api/feed/wikitrust
feedRouter.post("/:feed", async (req, res) => {
  // Validation
  // TODO(xinbenlv): consider use `express-validator`
  // TODO(xinbenlv): change to MongoDB
  if (req.params.feed == 'wikitrust' &&
    (process.env.FEED_WIKITRUST_TOKEN && req.header('WikiLoopToken') == process.env.FEED_WIKITRUST_TOKEN)) {
    const mongoose = require('mongoose');
    await mongoose.connection.db.collection(`WatchCollection_WIKITRUST`)
      .insertMany(req.body.content);

      // TODO(xinbenlv) add logic to allow validating content format, or consider use gRPC
    res.send(`ok`);
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
  let feedRevisionItem = <FeedRevisionItem>{};
  feedRevisionItem.feed = req.query.feed;
  feedRevisionItem.wiki = req.query.wiki;
  feedRevisionItem.revIds = [parseInt(req.query.revId)];
  feedRevisionItem.title = req.query.title;
  feedRevisionItem.feedRankScore = req.query.priority_score;
  feedRevisionItem.pageId = parseInt(req.query.pageId);

  let now = new Date();
  if (req.query.feed == 'wikitrust' &&
    (process.env.FEED_WIKITRUST_TOKEN && req.header('WikiLoopToken') == process.env.FEED_WIKITRUST_TOKEN)) {
    /* TODO: deprecate the WatchCollection W*/
    const mongoose = require('mongoose');
    await mongoose.connection.db.collection(`WatchCollection_WIKITRUST`)
      .insertOne(feedRevisionItem);

    let feedRevision:any = <FeedRevisionProps> {
      feed: feedRevisionItem.feed,
      wiki: feedRevisionItem.wiki,
      wikiRevId: `${feedRevisionItem.wiki}:${req.query.revId}`,
      feedRankScore: feedRevisionItem.feedRankScore,
      title: feedRevisionItem.title,
      createdAt: now,
    };
    feedRevision.additionalInfo = {};
    if (req.query.ts_crawled) feedRevision.additionalInfo.ts_cralwed = parseInt(req.query.ts_crawled);
    if (req.query.ts_sendout) feedRevision.additionalInfo.ts_sendout = parseInt(req.query.ts_sendout);
    if (req.query.ts_expire) feedRevision.additionalInfo.ts_expire = parseInt(req.query.ts_expire);

    await FeedRevision.findOneAndUpdate({feed: feedRevision.feed, wiki: feedRevision.wiki, wikiRevId: feedRevision.wikiRevId}, feedRevision, {upsert:true});

    res.send(`ok`);
  } else {
    res.status(403).send(
      `The provided feed ${req.body.feed} or feedToken ${req.body.feedToken} combination is invalid.`);
  }
});
// curl -H "Content-Type: application/json" -H "WikiLoopToken:$FEED_WIKITRUST_TOKEN" -X GET "http://localhost:3000/api/feed/wikitrust/revision?feed=wikitrust&wiki=enwiki&title=Gald%C3%B3n&pageId=56289988&revId=972852246&ts_crawled=0&ts_sendout=1597376155&ts_expire=1597376146"
feedRouter.get("/:feed/revision", ingestRevisionHandler);
feedRouter.post("/:feed/revision", ingestRevisionHandler);

// curl -H "Content-Type: application/json" -H "WikiLoopToken:$FEED_WIKITRUST_TOKEN" -X DELETE http://localhost:3000/api/feed/wikitrust
feedRouter.delete("/:feed", async (req, res) => {
  // Validation
  // TODO(xinbenlv): consider use `express-validator`
  // TODO(xinbenlv): change to MongoDB
  if (req.params.feed == 'wikitrust' && req.header('WikiLoopToken') == process.env.FEED_WIKITRUST_TOKEN) {
    const mongoose = require('mongoose');
    try{
      await mongoose.connection.db.collection(`WatchCollection_WIKITRUST`).drop();
      res.send(`ok`);
    } catch(e) {
      if (e.code === 26 /* collection doesn't exist */) res.send(`ok`);
      else res.status(500).send(e);
    }
  } else {
    res.status(403).send(
      `The provided feed ${req.body.feed} or feedToken ${req.header('WikiLoopToken')} combination is invalid.`);
  }
});
