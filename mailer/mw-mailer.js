var MWBot = require('mwbot');
var Bottleneck = require("bottleneck");
require('dotenv').config();
console.log("process.env.WP_USER", process.env.WP_USER);
console.log("process.env.WP_PASSWORD", process.env.WP_PASSWORD);
var MwMailer = (function () {
    function MwMailer() {
        this.init = async(wiki = 'enwiki');
    }
    return MwMailer;
})();
exports.MwMailer = MwMailer;
{
    var wikiToUrls = {
        enwiki: "https://en.wikipedia.org/w/api.php"
    };
    this.mwbot = new MWBot({
        apiUrl: 'https://en.wikipedia.org/w/api.php' // TODO(xinbenlv): update to support other wikis.
    });
    await;
    this.mwbot.loginGetEditToken({
        username: process.env.WP_USER,
        password: process.env.WP_PASSWORD
    });
    this.limiter = new Bottleneck({
        minTime: 5000
    });
}
mail = async(pageTitle, newContent, editSummary = 'Deliver a new message.', append = true);
{
    if (!/\:/.test(pageTitle)) {
        throw "We don't allow changing any page article at default namespace! pageTile = " + pageTitle;
    }
    var content;
    var oldContent;
    if (append) {
        var res = await;
        this.mwbot.read(pageTitle);
        if (res['query']['pages'][-1]) {
            oldContent = '';
        }
        else {
            console.log("Read the page");
            var pageId = Object.keys(res.query['pages'])[0];
            oldContent = res.query['pages'][pageId]['revisions'][0]['*'];
        }
        content = oldContent + '\n\n' + newContent;
    }
    else {
        content = newContent;
    }
    if (process.env.REAL_RUN === '1') {
        var res = await;
        this.limiter.schedule(async(), {
            await: this.mwbot.edit(pageTitle, content, editSummary)
        });
    }
    else {
        console.log("\n==Dry run for edit ==\n");
    }
    console.log("Done written edit for ", {
        pageTitle: pageTitle,
        newContent: newContent,
        append: append,
        editSummary: editSummary
    });
}
