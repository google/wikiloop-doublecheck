// npx ts-node -r tsconfig-paths/register tscmd/dev/populate-revisions-given-title-cmd.ts


import { MwActionApiClient } from '@/shared/mwapi';
import { logger } from '@/server/common';
import { RevisionInfo } from '@/shared/models/revision-info.model';
import { FeedRevision } from '~/shared/models/feed-revision.model';
import { articleLists } from './data/us-2020';

const Bottleneck = require("bottleneck");

const populateRevisionsGivenTitleMain = async function () {
  let neck = new Bottleneck({
    minTime: 500
  });
  const envPath = process.env.DOTENV_PATH || 'template.env';
  console.log(`DotEnv envPath = `, envPath, ' if you want to change it, restart and set DOTENV_PATH');

  require('dotenv').config({
    path: envPath
  });
  const mongoose = require('mongoose');
  console.log(`Connecting mongodb ...`);
  await mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true });
  console.log(`Connected mongodb!`);
  mongoose.set('debug', true);
  RevisionInfo.on('index', function(err) {
      if (err) {
          logger.error('RevisionInfo index error: %s', err);
      } else {
          logger.info('RevisionInfo indexing complete');
      }
  });


  for (let articleIndex = 0; articleIndex < articleLists.length; articleIndex += 50) {
    let titles = articleLists.slice(articleIndex, Math.min(articleIndex + 50, articleLists.length));
    logger.warn(`Reading the articles ${articleIndex}， ${titles.join('|')}`);

    let wiki = 'enwiki';
    let result = await neck.schedule(async () => await MwActionApiClient.getLastRevisionsByTitles(titles, wiki));
    let countC = 0;
    if (Object.keys(result.query.pages).length > 0) {
      let pageIds = Object.keys(result.query.pages);
      for (let pageId of pageIds) {
        if (result.query.pages[pageId].revisions?.length > 0) {
          let revisions = result.query.pages[pageId].revisions;
          if (revisions.length > 1) {
            logger.info(`revisions.length > 1
  title=${result.query.pages[pageId].title},
  revId=${revisions[0].revid}
  length=${revisions.length}`);
          }
          let revision = revisions[0];
          let wikiRevId = `${wiki}:${revision.revid}`;
          logger.info(`${countC} Fetching wikiRevId = ${wikiRevId}, title = ${result.query.pages[pageId].title}, diff = https://en.wikipedia.org/wiki/Special:Diff/${revision.revid}}.`);
          if ((await RevisionInfo.count({wikiRevId: wikiRevId})) == 0) {
            let revisionInfo = new RevisionInfo({
              wikiRevId: wikiRevId,
              revId: revision.revid,
              wiki: wiki,
              pageId: parseInt(pageId),
              title: result.query.pages[pageId].title,
              wikiCreated: new Date(revision.timestamp),
              tags: revision.tags,
              summary: revision.comment,
              // skip diff
              // skip ores_damaging
              // skip ores_damaging
              prevRevId: revision.parentid
            });

            if (Object.keys(revision).indexOf('anon') /* anonymous */ >= 0) {
              revisionInfo.anonymousIp = revision.user
            } else revisionInfo.wikiUserName = revision.user
            if (revision.oresscores.damaging) revisionInfo.ores_damaging = revision.oresscores.damaging.true;
            if (revision.oresscores.badfaith) revisionInfo.ores_badfaith = revision.oresscores.goodfaith.false;

            let diffRet =  await neck.schedule(async () => await MwActionApiClient.getDiffByWikiRevId(wiki, revision.revid));
            if (diffRet.compare) {
              revisionInfo.diffHtml = diffRet.compare["*"];
            } else {
              logger.warn(`The diff doesn't exist for  ${revisionInfo.wikiRevId} diffRet = ${JSON.stringify(diffRet, null, 2)}`);
            }
            await revisionInfo.save();
          }
          if ((await FeedRevision.count({wikiRevId: wikiRevId})) == 0) {
            let feedRevision = new FeedRevision({
              feed: 'US2020',
              wikiRevId: wikiRevId,
              wiki: wiki,
              feedRankScore: 0,
            });
            await feedRevision.save();
          }
        }
      }
    }
  }
  console.log(`done`);
}


populateRevisionsGivenTitleMain()
  .then(() => {
    console.log(`CMD Done!`);
    process.exit(0);
  });
