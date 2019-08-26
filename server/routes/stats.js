const mongoose = require('mongoose');
const { logger } = require('../common');

module.exports = async (req, res) => {
    let myGaId = req.body.gaId || req.cookies._ga;
    logger.debug(`req.query`, req.query);
    let allInteractions = await mongoose.connection.db.collection(`Interaction`)
        .find({}, {
            userGaId: 1,
            judgement: 1,
            wikiRevId: 1,
        }).toArray();
    let revSet = {};
    allInteractions.forEach(item => revSet[item.wikiRevId] = true);
    let ret = {
        totalJudgement: allInteractions.length,
        totalRevJudged: Object.keys(revSet).length,
        totalShouldRevert: allInteractions.filter(i => i.judgement === "ShouldRevert").length,
    };

    if (myGaId) {
        let myInteractions = allInteractions.filter(i => i.userGaId === myGaId);
        let myRevSet = {};
        myInteractions.forEach(item => myRevSet[item.wikiRevId] = true);
        ret.totalMyJudgement = myInteractions.length;
        ret.totalMyRevJudged = Object.keys(myRevSet).length;
        ret.totalMyShouldRevert = myInteractions.filter(item => item.judgement === "ShouldRevert").length;
    }

    res.send(ret);
    req.visitor
        .event({ ec: "api", ea: "/stats" })
        .send();
}