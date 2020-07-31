import { asyncHandler } from '../../common';
import { FeedRevisionEngine } from '../../feed/feed-revision-engine';

const express = require('express');
export const debugRouter = express.Router();

const Logger = require('heroku-logger').Logger;
const pad = require('pad');

export const debugLogger = new Logger({
  prefix: pad('DBG', 8),
  LOG_LEVEL: 'debug'
});

debugRouter.get('/fetchAndClaim', asyncHandler(async (req, res) => {
  let frs = (await FeedRevisionEngine.fetchAndClaim(
        req.query.userGaId, req.query.wikiUserName, req.query.feed, req.query.wiki, 2));
  debugLogger.info(`FeedRevisions claimed:`, JSON.stringify(frs, null, 2));
  res.send(frs);
}));
