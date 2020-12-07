import { AwardBarnStarCronJob } from '~/cronjobs/award-barnstar.cron';
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true });
  await AwardBarnStarCronJob.awardBarnstar('weekly');
}

main().then(() => {
  console.log('CMD Done!');
  process.exit(0);
});
