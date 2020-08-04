// npx ts-node -r tsconfig-paths/register --project tsconfig.json tscmd/dev/traverse-category-tree-cmd.ts

import { FeedRevisionEngine } from '@/server/feed/feed-revision-engine';
import { initDotEnv, initMongoDb } from '@/server/db-util';

const mainTraverseCategoryTree = async function ()
{
  initDotEnv();
  await initMongoDb();

  let feed = 'us2020';
  let wiki = 'enwiki';
  let entryTitle = "Category:2020_United_States_presidential_election";
  await FeedRevisionEngine.traverseCategoryTree(wiki, entryTitle, feed);
}

mainTraverseCategoryTree().then(() => {
  console.log(`CMD Done!`);
  process.exit(0);
});

