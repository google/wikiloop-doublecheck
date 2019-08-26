const rp = require('request-promise');
const { computeOresField } = require('../common');

async function fetchOres(wiki, revIds) {
    let oresUrl = `https://ores.wmflabs.org/v3/scores/${wiki}/?models=damaging|goodfaith&revids=${revIds.join('|')}`;
    let oresResultJson = await rp.get(oresUrl, { json: true });
    return revIds.map(revId => computeOresField(oresResultJson, wiki, revId));
}

const ores = async (req, res) => {
    let revIds = req.query.revIds;
    let wiki = req.query.wiki;
    let ret = await fetchOres(wiki, revIds);
    res.send(ret);
    req.visitor
        .event({ ec: "api", ea: "/ores" })
        .send();
};

const oresWikiRevId = async (req, res) => {
    let wikiRevId = req.params.wikiRevId;
    let wiki = wikiRevId.split(':')[0];
    let revId = wikiRevId.split(':')[1];
    let ret = await fetchOres(wiki, [revId]);
    if (ret.length === 1) {
        res.send(ret[0]);
    } else if (ret.length === 0) {
        res.status(404);
        res.send(`Can't find ores`);
    } else {
        res.status(500);
        res.send(`Something is wrong`);
    }
    req.visitor
        .event({ ec: "api", ea: "/ores/:wikiRevId" })
        .send();
};

module.exports = {
    ores,
    oresWikiRevId
};