// Usage: npx ts-node -r tsconfig-paths/register tscmd/dev/populate-watch-collection-cmd.ts

import {MwActionApiClient} from "~/shared/mwapi";
import {WatchCollectionItem} from "~/shared/schema";
import {FeedEnum} from "~/server/feed/watch-collection-feed";

function arraySum(arr: any[]): string {
  if (!arr || arr.length == 0) return `[]`;
  return `Array {
  start: ${arr[0]}, 
  end: ${arr[arr.length - 1]}, 
  total: ${arr.length}
}`;
}

async function main() {
  const yargs = require('yargs');
  const argv = yargs
      .option('feed', {
        alias: 'f',
        default: 'covid19',
        description: 'The feed to populate',
        type: 'string',
      })
      .help()
      .alias('help', 'h')
      .argv;

  const Bottleneck = require("bottleneck");
  let neck = new Bottleneck({
    minTime: 2000
  });
  require(`dotenv`).config();
  const mongoose = require('mongoose');
  const feedName = FeedEnum[argv.feed];
  console.log(`Populating feed = `, feedName);
  const WIKI = `enwiki`;
  const REV_PER_PAGE_LIMIT = 500;
  console.log(`Connecting ...`);
  await mongoose.connect(process.env.MONGODB_URI, {useUnifiedTopology: true, useNewUrlParser: true});
  console.log(`Connected ...`);
  let feed = await mongoose.connection.db.collection(feedName)
      .find({})
      .toArray() as WatchCollectionItem[];
  console.log(`Fetched ...`);
  let j = 1;
  let total = feed.length;
  console.log(`feed = `, feed);
  await Promise.all(feed.map(async (item: WatchCollectionItem) => {
    j++;
    let i = j;
    console.log(`Start fetching revIds for  ${i}/${total} Page ${item.title}`);
    let revIds = [];
    while (revIds.length < REV_PER_PAGE_LIMIT) {

      let newRevIds = await neck.schedule(async () => {
        return await MwActionApiClient
            .getRevisions(WIKI, item.title,
                revIds.length ? revIds[revIds.length - 1] - 1 : null/*we start from the one earlier*/);

      });
      console.log(`NewRevIds = ${arraySum(newRevIds)}`);
      if (newRevIds.length == 0) break;
      else revIds = revIds.concat(newRevIds);
      console.log(`RevIds = ${arraySum(revIds)}`);

    }
    console.log(`Done Fetching RevIds for ${item.title}, RevIds ${arraySum(revIds)}`);
    item.wiki = WIKI;
    item.revIds = revIds;
    await mongoose.connection.db.collection(feedName).update({title: item.title}, item, {upsert: true});
    console.log(`Uploaded ${i}/${total} Page ${item.title}`);
  }));
  process.exit(0);
}

main().then(() => {
  console.log(`CMD Done!`);
  process.exit(0);
});
