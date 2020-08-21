// Usage: npx ts-node -r tsconfig-paths/register tscmd/dev/create-notice-cmd.ts


import { initDotEnv, initMongoDb } from '~/server/init-util';
import { NoticeMessage } from '~/shared/models/notice-message-model';

const createNoticeMain = async function () {
  await initDotEnv();
  await initMongoDb();

  let noticeMessage = await NoticeMessage.create({
    messageId: "Notice-UserLevelsRfC1",
    defaultMessage: "Hi editors, we have a Request For Comments we like your feedback.",
    url: 'https://meta.wikimedia.org/wiki/WikiLoop/DoubleCheck/RfC:Levels_for_WikiLoop_DoubleCheck_Reviewers',
    createdAt: new Date("2020-08-20 01:01 UTC"),
    acks: [
      {
        wikiUserName: "RandomUser",
        userGaId: "GA1.2.1390141177.1578026694", // random GA ID,
        ackedAt: new Date(),
      }
    ],
    beginAt: new Date("2020-08-20 00:00:00 UTC"),
    endAt: new Date("2020-09-14 00:00:00 UTC"),
  });
  noticeMessage.acks.push({
    wikiUserName: "RandomUser",
    userGaId: "GA1.2.1390141177.1578026694", // random GA ID,
    ackedAt: new Date(),
  });
  console.log(`done`);
}


createNoticeMain()
  .then(() => {
    console.log(`CMD Done!`);
    process.exit(0);
  });
