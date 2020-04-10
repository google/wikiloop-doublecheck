import express, {Request, Response} from "express";
import {FeedEnum, WatchCollectionFeed} from "@/server/feed/watch-collection-feed";
import {MwActionApiClient} from "@/shared/mwapi";

export const feedRouter = express.Router();

feedRouter.get('/mix', async (req: Request, res: Response) => {
  var weighted = require('weighted');

  var options = {
    'recent': 0.1,
    // 'second': 0.1,
    'ores': 0.5,
    // 'wikitrust': 0.2,
    'covid19': 0.2,
    'us2020': 0.2,
  };
  const feed = weighted.select(options);
  let revIds;
  switch (feed) {
    case 'ores':  // fall through
    case 'wikitrust':  // fall through
    case 'covid19':  // fall through
    case 'us2020':  // fall through
      revIds = await WatchCollectionFeed.sampleRevisions(
      FeedEnum[feed], parseInt(req.query.size) || 50);
      break;
    case 'recent':  // fall through
    default:
      revIds = await MwActionApiClient.getLatestRevisionIds({limit: 50});
      break;
  }
  res.send({
    useMixer: true,
    feed: feed,
    revIds: revIds
  });
});

feedRouter.get("/recent", async (req: Request, res: Response) => {
  res.send(await MwActionApiClient.getLatestRevisionIds({limit: 50}));
});

feedRouter.get("/:feed", async (req: Request, res: Response) => {
  let feed = req.params.feed;
  if (Object.keys(FeedEnum).includes(feed))
    res.send({
      useMixer: false,
      feed: feed,
      revIds: await WatchCollectionFeed.sampleRevisions(FeedEnum[req.params.feed], parseInt(req.query.limit) || 50)
    });
  else res.status(404).send(`Feed ${feed} doesn't exist`);
});

if (process.env.FEED_WIKITRUST_TOKEN) {
  // curl -H "Content-Type: application/json" -H "WikiLoopToken:$FEED_WIKITRUST_TOKEN" -X POST -d @./test/testdata/wikitrust_feed.json http://dev.battlefield.wikiloop.org:3000/api/feed/wikitrust
  feedRouter.post("/:feed", async (req: Request, res: Response) => {
    // Validation
    // TODO(xinbenlv): consider use `express-validator`
    // TODO(xinbenlv): change to MongoDB
    if (req.params.feed == 'wikitrust' && req.header('WikiLoopToken') == process.env.FEED_WIKITRUST_TOKEN) {
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

  // curl -H "Content-Type: application/json" -H "WikiLoopToken:$FEED_WIKITRUST_TOKEN" -X DELETE http://localhost:3000/api/feed/wikitrust
  feedRouter.delete("/:feed", async (req: Request, res: Response) => {
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
        `The provided feed ${req.body.feed} or feedToken ${req.body.feedToken} combination is invalid.`);
    }
  });
}
