import express, { Request, Response } from "express";
import {FeedEnum, WatchCollectionFeed} from "../../server/feed/watch-collection-feed";

export const feedRouter = express.Router();

feedRouter.get("/:feed", async (req: Request, res: Response) => {
  res.send(await WatchCollectionFeed.sampleRevisions(FeedEnum[req.params.feed], parseInt(req.query.size) || 100));
});
