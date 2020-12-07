// npx ts-node -r tsconfig-paths/register tscmd/dev/populate-feed-revisions-cmd.ts

import { FeedRevisionEngine } from '~/server/feed/feed-revision-engine';
import { initDotEnv, initMongoDb } from '~/server/init-util';

const populateFeedRevisionsMain = async function() {
  await initDotEnv();
  await initMongoDb();
  // await FeedRevisionEngine.populateFeedRevisions('us2020', 'enwiki');
  await FeedRevisionEngine.populateFeedRevisions('covid19', 'enwiki');
  console.log('done');
};

populateFeedRevisionsMain()
    .then(() => {
      console.log('CMD Done!');
      process.exit(0);
    });
