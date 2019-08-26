const { logger } = require('../common');

const recentChanges = async (req, res) => {
    logger.debug(`req.query`, req.query);

    // let diffApiUrl = `${req.query.serverUrl}/w/api.php?action=compare&fromrev=${req.query.revId}&torelative=prev&format=json`;
    // let diffJson = await rp.get(diffApiUrl, {json: true});
    res.send(req.query);

};

module.exports = recentChanges;