import {asyncHandler} from "~/server/common";

const express = require('express');
import {FeedEnum, WatchCollectionFeed} from "@/server/feed/watch-collection-feed";
import {MwActionApiClient} from "@/shared/mwapi";

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
    limit: 50
  };

  switch (feed) {
    case 'ores':  // fall through
    case 'wikitrust':  // fall through
    case 'covid19':  // fall through
    case 'us2020':  // fall through
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
  if (req.query.wiki && ['enwiki', 'testwiki'].indexOf(req.query.wiki) < 0) {
    res.status(400).send(`The wiki ${req.query.wiki} is not supported`);
    return;
  } else {
    let ctx:any = {
      wiki: req.query.wiki, limit: 50
    };
    let feed = req.path.split('/')[1];
    if (feed === 'lastbad') ctx.bad = true;
    let wiki = req.query.wiki;
    let wikiRevIds = (await MwActionApiClient.getLatestRevisionIds(ctx)).map(revId => `${wiki}:${revId}`);
    res.send({
      useMixer: false,
      feed: feed,
      wikiRevIds: wikiRevIds
    });
  }
});

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
  }
  let feedRevisionItem = <FeedRevisionItem>{};
  feedRevisionItem.feed = req.query.feed;
  feedRevisionItem.wiki = req.query.wiki;
  feedRevisionItem.revIds = [parseInt(req.query.revId)];
  feedRevisionItem.title = req.query.title;
  feedRevisionItem.pageId = parseInt(req.query.pageId);
  if (req.query.feed == 'wikitrust' &&
    (process.env.FEED_WIKITRUST_TOKEN && req.header('WikiLoopToken') == process.env.FEED_WIKITRUST_TOKEN)) {
    const mongoose = require('mongoose');
    await mongoose.connection.db.collection(`WatchCollection_WIKITRUST`)
      .insertOne(feedRevisionItem);
    // TODO(xinbenlv) add logic to allow validating content format, or consider use gRPC

    res.send(`ok`);
  } else {
    res.status(403).send(
      `The provided feed ${req.body.feed} or feedToken ${req.body.feedToken} combination is invalid.`);
  }
});
// http://localhost:3000/api/feed/wikitrust/revision?feed=wikitrust&wiki=enwiki&title=Washington_Heights,_Manhattan&pageId=182694&revId=950027405
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
