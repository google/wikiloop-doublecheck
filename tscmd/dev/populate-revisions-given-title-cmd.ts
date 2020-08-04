// npx ts-node -r tsconfig-paths/register tscmd/dev/populate-revisions-given-title-cmd.ts

import { FeedRevisionEngine } from '~/server/feed/feed-revision-engine';
import { initDotEnv, initMongoDb } from '@/server/db-util';

const populateRevisionsGivenTitleMain = async function () {
  await initDotEnv();
  await initMongoDb();
  let wiki = 'enwiki';
  let feed = 'us2020';
  await FeedRevisionEngine.populateRevisionsGivenTitle(wiki, feed);
  console.log(`done`);
}

populateRevisionsGivenTitleMain()
  .then(() => {
    console.log(`CMD Done!`);
    process.exit(0);
  });
