import { asyncHandler } from "~/server/common";

export const labelRouter = require('express').Router();

const listLabels = async function (req, res) {
        const mongoose = require('mongoose');
        const limit = parseInt(req.query.limit) || 1000;
        const offset = parseInt(req.query.offset) || 0;

        let mongoMatcher:any = {
            timestamp: {$exists: true}
        };

        if (req.query.wikiUserName) mongoMatcher.wikiUserName = req.query.wikiUserName;
        if (req.query.userGaId) mongoMatcher.userGaId = req.query.userGaId;
        if (req.query.title) mongoMatcher.title = req.query.title;

        // CONSIDER add query validation logic, if needed.
        // We might adopt API standard such as gRPC or OpenAPI
        if (req.query.start) {
            // @ts-ignore
            mongoMatcher.timestamp.$gte = parseInt(req.query.start);
        }

        if (req.query.end) {
            // @ts-ignore
            mongoMatcher.timestamp.$lte = parseInt(req.query.end);
        }

        let labels = await mongoose.connection.db.collection(`Interaction`)
        .find(mongoMatcher)
        .project(
            {
                userGaId: true,
                wikiUserName: true,
                judgement: true,
                title: true,
                wikiRevId: true,
                timestamp: true,
                feed: true
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
                `title`,
                `feed`,
            ]]
                .concat(labels.map((label) => {
                  return [
                    label.wikiRevId,
                    label.timestamp,
                    label.userGaId,
                    label.wikiUserName,
                    label.judgement,
                    label.title,
                    label.feed,
                  ]
                }));
            stringify(ret, { header: false })
                .pipe(res);
        } else {
            res.send(labels);
        }
};

labelRouter.get('/', asyncHandler(listLabels));
