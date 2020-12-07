import { WatchCollectionFeed, FeedEnum } from '@/server/feed/watch-collection-feed';

const mongoose = require('mongoose');

async function main() {
  require('dotenv').config();
  await mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true });
  const ret = await WatchCollectionFeed.sampleRevisions(FeedEnum.covid19, 10);
  console.log(`Result ${JSON.stringify(ret, null, 2)}`);
}

main().then(() => {
  console.log('CMD Done!');
  process.exit(0);
});
