import {AwardBarnStarCronJob} from "~/cronjobs";
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {useUnifiedTopology: true, useNewUrlParser: true});
  await AwardBarnStarCronJob.awardBarnstar('monthly');
}

main().then(() => {
  process.exit(0);
});
