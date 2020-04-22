import {asyncHandler, isAuthenticatedWithWikiUserName} from "~/server/common";
import mongoose from 'mongoose';
import {WikiActionItem} from "~/shared/schema";

const express = require('express');

export const actionRouter = express.Router();

actionRouter.post('/revert', asyncHandler(async (req, res) => {
  console.log(`XXX req.body, ${JSON.stringify(req.body, null, 2)}`);
  let wikiAction: WikiActionItem = req.body;
  if (wikiAction.fromWikiUserName && !isAuthenticatedWithWikiUserName(req, wikiAction.fromWikiUserName)) {
    res.status(403).send(
      `The fromWikiUserName ${wikiAction.fromWikiUserName} ` +
      `doesn't match with authenticated wikiUserName ${req.user.displayName}`);
    return;
  }
  else await mongoose.connection.db.collection(`WikiActions`).insertOne(wikiAction);
}));

export default actionRouter;
