import { MwMailer } from './mw-mailer';

const awardBarnstarMsg = async (mwMailer, user, timeRange, endDate) => {
  await mwMailer.mail(`User_talk:${user}`,
    `
== The WikiLoop Battlefield ${timeRange}ly barnstar ==
{{subst:Xinbenlv/WikiLoop Battlefield Champion|user=${user}|enddate=${endDate}|timerange=${timeRange}}}
`,
    `Awarding The WikiLoop Battlefield ${timeRange}ly barnstar`);
};

const main = async () => {
  const yargs = require('yargs');
  const argv = yargs
      .option('users', {
        alias: 'us',
        description: 'The users receipiant of barnstar.',
        type: 'string',
      })
      .option('user', {
        alias: 'u',
        description: 'The user receipiant of barnstar.',
        type: 'string',
      })
      .option('endDate', {
        alias: 'e',
        description: 'The end date of time range.',
        type: 'string',
      })
      .option('timeRange', {
        alias: 't',
        description: 'The timerange.',
        type: 'string',
      })

      .help()
      .alias('help', 'h')
      .argv;

  const mwMailer = new MwMailer();
  await mwMailer.init();
  if (argv.users) {
    const users = argv.users.split(',');
    await users.forEach(async (user) => {
      await awardBarnstarMsg(mwMailer, user, argv.timeRange, argv.endDate);
    });
  } else {
    await awardBarnstarMsg(mwMailer, argv.user, argv.timeRange, argv.endDate);
  }
};

main().then(() => {console.log('complete!');});
