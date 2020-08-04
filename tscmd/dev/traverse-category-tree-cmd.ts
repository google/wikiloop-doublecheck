// npx ts-node -r tsconfig-paths/register --project tsconfig.json tscmd/dev/traverse-category-tree-cmd.ts

import axios from 'axios';
import { FeedPage, FeedPageProps } from '@/shared/models/feed-page.model';
import { wikiToDomain } from '@/shared/utility-shared';
import { MwActionApiClient, MwPageInfo } from '@/shared/mwapi';

const Bottleneck = require("bottleneck");
let neck = new Bottleneck({
  minTime: 200
});
let numReq = 0;
const userAgent = process.env.USER_AGENT;

/**
 * Given a feed, and wiki, using a title to get all it's category children
 * please note this function handles the "continue" call to MediaWiki Action API
 * it is in charge of making all follow up queries.
 *
 * @param feed
 * @param wiki
 * @param entryArticle
 */
const getChildren = async function (wiki, entryArticle):Promise<MwPageInfo[]> {
  let endpoint =`http://${wikiToDomain[wiki]}/w/api.php`;
  let result = [];
  let params = {
    "action": "query",
    "format": "json",
    "list": "categorymembers",
    "formatversion": "2",
    "cmtitle": entryArticle,
    "cmprop": "ids|timestamp|title",
    "cmlimit": "500",
  };
  let ret = null;
  do {
    ret = await neck.schedule(async () =>
      await axios.get(endpoint, {params: params, headers: { 'User-Agent': userAgent }}));

      /**json
      {
        "batchcomplete": true,
        "continue": {
        "cmcontinue": "page|0f53aa04354b3131430443294f394543293f042d45435331434f394543011f01c4dcc1dcbedc0d|61561742",
        "continue": "-||"
        },
        "query": {
          "categorymembers": [
            {
              "pageid": 48410011,
              "ns": 0,
              "title": "2020 United States presidential election",
              "timestamp": "2020-03-28T19:51:23Z"
            }
          ],
        }
      }
      */

    numReq++;
    if (ret.data?.query?.categorymembers?.length > 0) {
      ret.data.query.categorymembers.forEach(item => console.log(`${JSON.stringify(item.title, null, 2)}`));
      result.push(...ret.data.query.categorymembers);
      if (ret.data?.continue?.cmcontinue) params['cmcontinue'] = ret.data.continue.cmcontinue;
    } else {
      return result;
    }

  } while (ret.data?.continue?.cmcontinue);
  return result;
}
const traverse = async function (feed, wiki, entryFeedPage) {
  let visitedFeedPages = {};
  let toVisitFeedPages:FeedPageProps[] = [];
  toVisitFeedPages.push(entryFeedPage); // enqueue from its tail

  let now = new Date();
  while (toVisitFeedPages.length > 0) {
    let currentFeedPage:FeedPageProps = toVisitFeedPages.shift(); // dequeue from it's head, Breadth First Search (BFS)
    if (visitedFeedPages[currentFeedPage.pageId]) {
      continue;
    } else {
      visitedFeedPages[currentFeedPage.pageId] = currentFeedPage;
    }
    console.log(`Current = ${currentFeedPage}`);
    if (currentFeedPage.namespace == 14) {
      let mwPageInfos = await getChildren(wiki, currentFeedPage.title);
      let children:FeedPageProps[] = mwPageInfos.map(mwPageInfo => {
        return <FeedPageProps>{
          feed: feed,
          wiki: wiki,
          title: mwPageInfo.title,
          pageId: parseInt(mwPageInfo.pageid),
          namespace: parseInt(mwPageInfo.ns),
          traversedAt: now,
        };
      });
      currentFeedPage.categoryChildren = Array.from(new Set(children.map(feedPage => feedPage.pageId)));
      children
        .forEach((feedPage:FeedPageProps) => {
          if (!feedPage.categoryParents) feedPage.categoryParents = [];
          feedPage.categoryParents = Array.from(new Set(feedPage.categoryParents.concat(currentFeedPage.pageId)));
        });
      console.log(`Children = ${children}`);
      toVisitFeedPages.push(...(children.filter(feedPage => !visitedFeedPages[feedPage.pageId])));
    }
    console.log(`\n\n\n=== Total toVisit ${toVisitFeedPages.length}, visited = ${Object.keys(visitedFeedPages).length}, numReq=${numReq}`);
  }

  let bulkUpdateResult = await FeedPage.bulkWrite(Object.values(visitedFeedPages).map((feedPage:FeedPageProps) => {
    return {
      updateOne: {
        filter: {
          feed: feedPage.feed,
          wiki: feedPage.wiki,
          title: feedPage.title,
        },
        upsert: true,
        update: {
          $set: feedPage,
        }
      }
    };
  }));
  console.log(`\n\n\nDone bulkUpdateResult = `, bulkUpdateResult);
}

const mainTraverseCategoryTree = async function ()
{

  const envPath = process.env.DOTENV_PATH || 'template.env';
  console.log(`DotEnv envPath = `, envPath, ' if you want to change it, restart and set DOTENV_PATH');

  require('dotenv').config({
    path: envPath
  });
  const mongoose = require('mongoose');
  console.log(`Connecting mongodb ...`);
  await mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true });
  console.log(`Connected mongodb!`);

  let feed = 'us2020';
  let wiki = 'enwiki';
  let entryTitle = "Category:2020_United_States_presidential_election";
  let mwPageInfos = await MwActionApiClient.getMwPageInfosByTitles(wiki, [entryTitle]);
  let mwPageInfo:MwPageInfo = mwPageInfos[0];

  let entryFeedPage:FeedPageProps = <FeedPageProps>{
    feed: feed,
    wiki: wiki,
    title: mwPageInfo.title,
    pageId: parseInt(mwPageInfo.pageid),
    namespace: parseInt(mwPageInfo.ns),
    traversedAt: new Date()
  };
  await traverse(feed, wiki, entryFeedPage);
}

mainTraverseCategoryTree().then(() => {
  console.log(`CMD Done!`);
  process.exit(0);
});
