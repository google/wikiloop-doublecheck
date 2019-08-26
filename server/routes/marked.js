const { db, getNewJudgementCounts } = require('../common');

/**
 * @deprecated use getNewJudgementCounts
 * @param db
 * @param newRecentChange
 * @returns {Promise<void>}
 */
async function getJudgementCounts(db, newRecentChange) {
    let judgementCounts = {};
    let aggrRet = await db.collection(`Interaction`).aggregate([
        {
            "$match": {
                "recentChange.id": newRecentChange.id.toString(),
                "recentChange.wiki": newRecentChange.wiki
            }
        },
        {
            // Counts group by Judgement
            "$group": {
                "_id": "$judgement",
                "judgement": {
                    "$sum": 1.0
                }
            }
        }
    ],
        {
            "allowDiskUse": false
        }).toArray();
    aggrRet.forEach(ret => {
        judgementCounts[ret._id] = ret.judgement;
    });
    return judgementCounts;
}

/**
 * @deprecated use queryMarkedRevisions
 * @param db
 * @param myGaId
 * @returns {Promise<any[]>}
 */
async function queryMarkedRecentChange(db, myGaId) {
    let recentChanges;
    let interactions = await db.collection(`Interaction`).find({}, {
        sort: [["timestamp", -1]]
    })
        // .limit(1)  // TODO add limit when performance becomes a problem, a typical case that RDB is better than NonRDB
        .toArray();

    let dbIds = interactions.map(rc => `${rc.recentChange.wiki}-${rc.recentChange.id}`);
    recentChanges = await db.collection(`MediaWikiRecentChange`)
        .find(
            { "_id": { $in: dbIds } })
        // .limit(1)  // TODO add limit when performance becomes a problem, a typical case that RDB is better than NonRDB
        .toArray();

    recentChanges = await Promise.all(recentChanges.map(async (rc) => {
        // TODO improve performance.
        rc.judgementCounts = await getJudgementCounts(db, rc);
        return rc;
    }));

    // Add my judgement
    if (myGaId) {
        let myInteractionMap = {};
        let myInteractions = await db.collection(`Interaction`).find({ userGaId: myGaId }).toArray();
        myInteractions.forEach(interaction => {
            myInteractionMap[interaction.recentChange._id] = interaction;
        });
        recentChanges.forEach(rc => {
            if (myInteractionMap[rc._id]) rc.judgement = myInteractionMap[rc._id].judgement;
        });
    }
    return recentChanges.reverse();
}

const markedRevsCsv = async (req, res) => {
    let newJudgementCounts = await getNewJudgementCounts(
        db, {}, 0, 10000000/* as many as possible to download all */);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + Date.now() + '.csv\"');
    const stringify = require('csv-stringify');
    let ret = [[
        `WikiRevId`,
        `LastTimestamp`,
        `OresDamagingScore`,
        `OresBadfaithScore`,
        `ShouldRevert`,
        `NotSure`,
        `LooksGood`
    ]]
        .concat(newJudgementCounts.map((newJudgementCount) => [
            newJudgementCount.wikiRevId,
            newJudgementCount.lastTimestamp,
            newJudgementCount.recentChange.ores ? newJudgementCount.recentChange.ores.damagingScore : "null",
            newJudgementCount.recentChange.ores ? newJudgementCount.recentChange.ores.badfaithScore : "null",
            newJudgementCount.counts.ShouldRevert,
            newJudgementCount.counts.NotSure,
            newJudgementCount.counts.LooksGood,
            // newJudgementCount.judgements
        ]));
    stringify(ret, { header: false })
        .pipe(res);
}

const markedCsv = async (req, res) => {
    let myGaId = req.body.gaId || req.cookies._ga;
    let recentChanges = await queryMarkedRecentChange(db, myGaId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + Date.now() + '.csv\"');
    // res.send(recentChanges);
    const stringify = require('csv-stringify');
    let ret = [[`WikiRevId`, `OresDamagingScore`, `OresBadfaithScore`, `ShouldRevert`, `NotSure`, `LooksGood`]]
        .concat(recentChanges.map(rc => [
            rc.wikiRevId, rc.ores.damagingScore, rc.ores.badfaithScore,
            rc.judgementCounts.ShouldRevert || 0, rc.judgementCounts.NotSure || 0, rc.judgementCounts.LooksGood || 0
        ]));
    stringify(ret, { header: false })
        .pipe(res);
};

const markedRevs = async (req, res) => {
    res.send(await getNewJudgementCounts(db));
};

const marked = async (req, res) => {
    let myGaId = req.body.gaId || req.cookies._ga;
    let recentChanges = await queryMarkedRecentChange(db, myGaId);
    res.send(recentChanges);
};


module.exports = {
    markedRevsCsv,
    markedCsv,
    markedRevs,
    marked
}