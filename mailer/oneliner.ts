import { MwMailer } from './mw-mailer';

let main = async () => {
    let mwMailer = new MwMailer();
    await mwMailer.init();
    await mwMailer.mail('User:Xinbenlv/sandbox', 'Hello here is your new message!')
}

main().then(() => { console.log('complete!'); });