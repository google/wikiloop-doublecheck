// npx ts-node -r tsconfig-paths/register --project tsconfig.json tscmd/dev/traverse-category-tree-cmd.ts

import { FeedRevisionEngine } from '@/server/feed/feed-revision-engine';
import { initDotEnv, initMongoDb } from '~/server/init-util';

const mainTraverseCategoryTree = async function ()
{
  initDotEnv();
  await initMongoDb();
  // await FeedRevisionEngine.traverseCategoryTree('us2020', 'enwiki', 'Category:2020_United_States_presidential_election');
  await FeedRevisionEngine.traverseCategoryTree('covid19', 'enwiki', 'Category:COVID-19');
}

mainTraverseCategoryTree().then(() => {
  console.log(`CMD Done!`);
  process.exit(0);
});

