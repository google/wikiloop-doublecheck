module.exports = {
    /**
     * ExpressJS GET route for listing **Labels**
     * 
     * Note: **Label** refers to the judgement given by a WikiLoop Battlefield reviwer 
     * @param {*} req the request, with
     * @param {*} req.query.start the start of time-window to query for labels
     * @param {*} req.query.end the end of time-window to query for labels
     * @param {*} req.query.limit an integer for paginataion size, default to 1K
     * @param {*} req.query.offset an integer for offset of pagaination, default to 0
     * @param {*} res the response
     * 
     * @public This endpoint has API clients, take extra caution when migrating
     */
    listLabels: async function (req, res) {
        const mongoose = require('mongoose');
        const limit = req.query.limit || 1000;
        const offset = req.query.offset || 0;

        let mongoMatcher = {
            timestamp: {$exists: true}
        };

        // CONSIDER add query validation logic, if needed.
        // We might adopt API standard such as gRPC or OpenAPI
        if (req.query.start) {
            mongoMatcher.timestamp.$gte = parseInt(req.query.start);
        }

        if (req.query.end) {
            mongoMatcher.timestamp.$lte = parseInt(req.query.end);
        }

        let labels = await mongoose.connection.db.collection(`Interaction`)
        .find(mongoMatcher)
        .project(
            {
                userGaId: true,
                wikiUserName: true,
                judgement: true,
                wikiRevId: true,
                timestamp: true,
            })
        .sort({timestamp: -1})
        .skip(offset)
        .limit(limit)
        .toArray();

        if (req.query.csv === '1') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'labels-' + Date.now() + '.csv\"');
            const stringify = require('csv-stringify');
            let ret = [[
                `wikiRevId`,
                `timestamp`,
                `userGaId`,
                `wikiUserName`,
                `judgement`,
            ]]
                .concat(labels.map((label) => {
                  return [
                    label.wikiRevId,
                    label.timestamp,
                    label.userGaId,
                    label.wikiUserName,
                    label.judgement,
                  ]
                }));
            stringify(ret, { header: false })
                .pipe(res);
        } else {
            res.send(labels);
        }

    }
}