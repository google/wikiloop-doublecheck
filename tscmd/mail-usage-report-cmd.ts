// Usage: npx ts-node -r tsconfig-paths/register tscmd/mail-usage-report-cmd.ts

import {UsageReportCronJob} from "@/cronjobs";
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {useUnifiedTopology: true, useNewUrlParser: true});
  const yargs = require('yargs');
  const argv = yargs
      .option('frequency', {
        alias: 'f',
        default: 'daily',
        description: 'The frequency or timerange of the usage report',
        type: 'string',
      })
      .option('email', {
        alias: 'e',
        default: true,
        description: 'The frequency or timerange of the usage report',
        type: 'boolean',
      })
      .help()
      .alias('help', 'h')
      .argv;
  await UsageReportCronJob.usageReport(argv.frequency);
}

main().then(() => {
  console.log(`CMD Done!`);
  process.exit(0);
});
