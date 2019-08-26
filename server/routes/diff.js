const rp = require(`request-promise`);
const {logger, getUrlBaseByWiki} = require('../common');

const diffWikiRevId = async (req, res) => {
    logger.debug(`req.query`, req.query);
    let wikiRevId = req.params.wikiRevId;
    let wiki = wikiRevId.split(':')[0];
    let revId = wikiRevId.split(':')[1];
    let diffApiUrl = `${getUrlBaseByWiki(wiki)}/w/api.php?action=compare&fromrev=${revId}&torelative=prev&format=json`;
    let diffJson = await rp.get(diffApiUrl, { json: true });
    res.send(diffJson);
    req.visitor
        .event({ ec: "api", ea: "/diff/:wikiRevId" })
        .send();
};

const diff = async (req, res) => {
    logger.debug(`req.query`, req.query);
    let diffApiUrl = `${req.query.serverUrl}/w/api.php?action=compare&fromrev=${req.query.revId}&torelative=prev&format=json`;
    let diffJson = await rp.get(diffApiUrl, { json: true });
    res.send(diffJson);
    req.visitor
        .event({ ec: "api", ea: "/diff" })
        .send();
};

module.exports = { diffWikiRevId, diff };