// Usage: npx ts-node -r tsconfig-paths/register tscmd/dev/create-notice-cmd.ts

import { initDotEnv, initMongoDb } from '~/server/init-util';
import { NoticeMessage } from '~/shared/models/notice-message-model';

const createNoticeMain = async function() {
  await initDotEnv();
  await initMongoDb();

  await NoticeMessage.create({
    messageId: 'Notice-Discord',
    defaultMessage: 'Hi editors, if you like to chat online while reviewing, please join our Discord server.',
    url: 'https://discord.gg/daZXxPB',
    createdAt: new Date(),
    acks: [
    ],
    beginAt: new Date('2020-09-08 00:00:00 UTC'),
    endAt: new Date('2020-10-08 00:00:00 UTC'),
  });
  console.log('done');
};

createNoticeMain()
    .then(() => {
      console.log('CMD Done!');
      process.exit(0);
    });
