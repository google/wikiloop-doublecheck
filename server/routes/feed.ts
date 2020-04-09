import express, {Request, Response} from "express";
import {FeedEnum, WatchCollectionFeed} from "../../server/feed/watch-collection-feed";

export const feedRouter = express.Router();

feedRouter.get("/:feed", async (req: Request, res: Response) => {
  res.send(await WatchCollectionFeed.sampleRevisions(FeedEnum[req.params.feed], parseInt(req.query.size) || 100));
});

if (process.env.FEED_WIKITRUST_TOKEN) {
  // FEED_WIKITRUST_TOKEN=<FEED_WIKITRUST_TOKEN> curl -H "Content-Type: application/json" -H "WikiLoopToken:$FEED_WIKITRUST_TOKEN" -X POST -d @./test/testdata/wikitrust_feed.json http://dev.battlefield.wikiloop.org:3000/api/feed/wikitrust
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

  // FEED_WIKITRUST_TOKEN=<token> curl -H "Content-Type: application/json" -H "WikiLoopToken:$FEED_WIKITRUST_TOKEN" -X DELETE http://localhost:3000/api/feed/wikitrust
  feedRouter.delete("/:feed", async (req: Request, res: Response) => {
    // Validation
    // TODO(xinbenlv): consider use `express-validator`
    // TODO(xinbenlv): change to MongoDB
    if (req.params.feed == 'wikitrust' && req.header('WikiLoopToken') == process.env.FEED_WIKITRUST_TOKEN) {
      const mongoose = require('mongoose');
      await mongoose.connection.db.collection(`WatchCollection_WIKITRUST`)
        .drop();
      // TODO(xinbenlv) add logic to allow validating content format, or consider use gRPC
      res.send(`ok`);
    } else {
      res.status(403).send(
        `The provided feed ${req.body.feed} or feedToken ${req.body.feedToken} combination is invalid.`);
    }
  });
}
