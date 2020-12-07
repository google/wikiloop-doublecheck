import { MwMailer } from './mw-mailer';

const main = async () => {
  const mwMailer = new MwMailer();
  await mwMailer.init();
  await mwMailer.mail('User:Xinbenlv/sandbox', 'Hello here is your new message!');
};

main().then(() => {console.log('complete!');});
