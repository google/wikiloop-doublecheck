// npx ts-node -r tsconfig-paths/register --project tsconfig.json tscmd/dev/traverse-category-tree-cmd.ts

import { initDotEnv} from '~/server/init-util';

import { MwActionApiClient } from '~/shared/mwapi';
import { initSqlite } from './utils';
const SqlString = require('sqlstring-sqlite');

const insertLinkEdge = async function (db, from, to, type, ttl, iteration) {
  let sql = SqlString.format(
    `INSERT OR REPLACE INTO link_graph_table (link_from, link_to, link_type, link_ttl, iteration) VALUES
    (?, ?, ?, ?, ?)`, [from, to, type, ttl, iteration]);
  return await db.exec(sql);
}

const mainTraverseCategoryTree = async function ()
{
  initDotEnv();
  let db = await initSqlite(`tmp/database-category-${new Date().toISOString()}.db`);
  let iterationTime = new Date();
  let wiki = 'enwiki';
  let seed = ['Category:2020 United States presidential election'];
  let exclusions = [
    "Category:Albums produced by Kanye West",
    "Category:Kanye West audio samples",
    "Category:Cultural depictions of Kanye West",
    "Category:Films directed by Kanye West",
    "Category:Kanye West albums",
    "Category:Kanye West songs",
    "Category:Songs written by Kanye West",
    "Category:Music videos directed by Kanye West",
    "Category:Kanye West concert tours",
    "Category:Song recordings produced by Kanye West",
    "Category:Kanye West tribute albums",
    "Category:Donald Trump real estate",
    "Category:Assets owned by the Trump Organization",
    "Category:Television series by Trump Productions",
    "Category:Miss Universe Organization",
    "Category:Donald Trump in popular culture"
  ];

  let crawled = new Set();
  let stored = new Set();
  const HOP_LIMIT = 50;
  let toCrawl = [];
  toCrawl.push(...seed.map(article => [article, HOP_LIMIT]));

  await Promise.all(seed.map(async a => insertLinkEdge(db, '', a, 'seed', HOP_LIMIT, iterationTime)));
  seed.forEach(article => stored.add(article));
  while (toCrawl.length > 0) {
    console.log(`crawled ${crawled.size} categories, ${toCrawl.length} left to crawl, stored ${stored.size}, stored/craweld = ${stored.size / crawled.size}, toVisit/visited = ${toCrawl.length/crawled.size}`);
    let curr = toCrawl.shift();
    let article = curr[0];
    let ttl = curr[1];
    if (crawled.has(article)) {
      console.log(`Skipping already crawled ${article}`);
      continue;
    }
    else {
      console.log(`Crawling article="${article}" at ttl=${ttl}...`);
      if (!/Category:/.test(article) || exclusions.indexOf(article) >=0) continue;
      let result = (await MwActionApiClient.getCategoryChildren(wiki, article)).map(info=>info.title);
      if (ttl >= 1) {
        for (let i =0;i<result.length;i++) {
          let child = result[i];
          if (stored.has(child)) continue; // already visited;
          else if (exclusions.indexOf(child) >= 0) continue; // need to exclude
          stored.add(child);
          if (/Category:/.test(article)) {
            toCrawl.push([child, ttl-1]);
            console.log(`Enqueueing ${article} to crawl.`);
          }
          await insertLinkEdge(db, article, child, 'category', ttl-1, iterationTime);
        }
      }
      crawled.add(article);
    }
  }
}

mainTraverseCategoryTree().then(() => {
  console.log(`CMD Done!`);
  process.exit(0);
});

