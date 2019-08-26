const { db } = require('../common');
module.exports = async (req, res) => {
    let myGaId = req.body.gaId || req.cookies._ga;

    // TO-FUTURE-DO consider adding pagination if performance is a problem. We don't expect this list to be more than
    // 10K records anytime soon
    let ret = await db.collection("Interaction").aggregate(
        [
            {
                "$match": {
                    "userGaId": { $ne: null }
                }
            },
            {
                "$group": {
                    "_id": {
                        "userGaId": "$userGaId"
                    },
                    "count": {
                        "$sum": 1
                    },
                    "lastTimestamp": {
                        "$max": "$timestamp"
                    }
                }
            },
            {
                "$sort": {
                    "count": -1
                }
            },
            {
                "$project": {
                    "userGaId": "$_id.userGaId",
                    "count": 1,
                    "lastTimestamp": 1
                }
            }
        ],
        {
            "allowDiskUse": false
        }
    ).toArray();
    res.send(ret);
    req.visitor
        .event({ ec: "api", ea: "/leaderboard" })
        .send();
};