const MWBot = require('mwbot');
const Bottleneck = require("bottleneck");
require('dotenv').config();
console.log(`process.env.WP_USER`, process.env.WP_USER);
console.log(`process.env.WP_PASSWORD`, process.env.WP_PASSWORD);

export class MwMailer {
    private mwbot:any;
    private limiter:any;

    public init = async (wiki = 'enwiki') => {
        let wikiToUrls = {
            enwiki: `https://en.wikipedia.org/w/api.php`,
        }
        this.mwbot = new MWBot({
            apiUrl: 'https://en.wikipedia.org/w/api.php' // TODO(xinbenlv): update to support other wikis.
        });
        await this.mwbot.loginGetEditToken({
            username: process.env.WP_USER,
            password: process.env.WP_PASSWORD
        });

        this.limiter = new Bottleneck({
            minTime: 5000
        });
    }

    public mail = async (pageTitle, newContent, editSummary = 'Deliver a new message.', append = true) => {
        if (!/\:/.test(pageTitle)) { // if colon is not in the pageTitle, it's in a default page.
            throw `We don't allow changing any page article at default namespace! pageTile = ${pageTitle}`;
        }
        let content;
        let oldContent;
        if (append) {
            let res = await this.mwbot.read(pageTitle);
            if (res['query']['pages'][-1]) {
                oldContent = '';
            } else {
                console.log(`Read the page`);
                let pageId = Object.keys(res.query['pages'])[0];
                oldContent = res.query['pages'][pageId]['revisions'][0]['*'];
            }
            content = oldContent + '\n\n' + newContent; 
        } else {
            content = newContent;
        }

        let res = await this.limiter.schedule(async () => {
            await this.mwbot.edit(
                pageTitle,
                content,
                editSummary
            );
        });

        console.log(`Done written edit for `, {
            pageTitle: pageTitle,
            newContent: newContent,
            append: append,
            editSummary: editSummary
        });
    }

}