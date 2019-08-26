const { fetchRevisions } = require('../common');
const rp = require('request-promise');

const revision = async (req, res) => {
    let revIds = req.query.revIds;
    let wiki = req.query.wiki;
    let revisions = await fetchRevisions(wiki, revIds);
    res.send(revisions);

    req.visitor
        .event({ ec: "api", ea: "/revision/:wikiRevId" })
        .send();
};
const revisionWikiRevId = async (req, res) => {
    let wikiRevId = req.params.wikiRevId;
    let revisions = await fetchRevisions(wikiRevId.split(':')[0], [wikiRevId.split(':')[1]]);
    if (revisions.length === 1) {
        res.send(revisions[0]);
    } else if (revisions.length === 0) {
        res.status(404);
        res.send(`Can't find revisions`);
    } else {
        res.status(500);
        res.send(`Something is wrong`);
    }

    req.visitor
        .event({ ec: "api", ea: "/revision/:wikiRevId" })
        .send();
};

module.exports = {
    revision,
    revisionWikiRevId
};