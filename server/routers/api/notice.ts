import { NoticeMessage, NoticeMessageDoc, NoticeMessageProps } from '~/shared/models/notice-message-model';
import { isAuthenticatedWithWikiUserName } from '~/server/common';

const express = require('express');
export const noticeRouter = express.Router();

noticeRouter.get('/list', async (req, res) => {
  const wikiUserName = req.query.wikiUserName;
  const userGaId = req.query.userGaId;
  const now = new Date();
  const matcher = {
    beginAt: { $lte: now },
    endAt: { $gt: now },
  };

  if (req.query.wikiUserName) {matcher['acks.wikiUserName'] = { $ne: req.query.wikiUserName };} // TO-TEST
  else if (req.query.userGaId) {matcher['acks.userGaId'] = { $ne: req.query.userGaId };} // TO-TEST

  const noticeMessages = await NoticeMessage.find(matcher)
      .sort({
        beginAt: 1, // show the earliest not acked notice
      });
  res.send(noticeMessages);
});

noticeRouter.post('/:messageId/ack', async (req, res) => {
  const wikiUserName = req.body.wikiUserName;
  const userGaId = req.body.userGaId;
  if (!wikiUserName && !userGaId) {
    res.status(400).send('Please at least specify wikiUserName or userGaId in the url, currently both empty.');
  }
  const messageId = req.params.messageId;

  const newAck = req.body;
  if (wikiUserName && !isAuthenticatedWithWikiUserName(req, newAck.wikiUserName)) {
    res.status(403);
    res.send('Login required to ack with wikiUserName.');
    return;
  }

  const noticeMessage:NoticeMessageDoc = await NoticeMessage.findOne({
    messageId: req.params.messageId,
  });
  if (!noticeMessage) {
    res.status(404).send(`There is no notice message with messageId=${messageId}`);
  }

  // We don't validate wether there is an existing ack, each acks noticeMessage can be acked multiple times.
  // Unless we want to consider filtering them out to avoid re-ack / or use index unique. but It think unnecessarily complicated things.
  const toCommitAck = {
    wikiUserName,
    userGaId,
    ackedAt: new Date(),
  };
  noticeMessage.acks.push(toCommitAck);

  await noticeMessage.save();
  res.send('ok');
});
