import { addMinutes } from 'date-fns';

import {
  RevisionInfo,
  RevisionInfoProps,
} from '@/shared/models/revision-info.model';
import { FeedPage, FeedPageProps } from '@/shared/models/feed-page.model';
import { MwActionApiClient, MwPageInfo } from '@/shared/mwapi';
import { feedRevisionEngineLogger } from '../common';
import {
  FeedRevision,
  FeedRevisionProps,
  FeedRevisionDoc,
} from '~/shared/models/feed-revision.model';

export class FeedRevisionEngine {
  public static async populateFeedRevisions(feed: string, _wiki: string) {
    const articleLists = (await FeedPage.find({ wiki: _wiki, feed })).map(
      (fp) => fp.title,
    );

    for (
      let articleIndex = 0;
      articleIndex < articleLists.length;
      articleIndex += 50
    ) {
      const titles = articleLists.slice(
        articleIndex,
        Math.min(articleIndex + 50, articleLists.length),
      );
      feedRevisionEngineLogger.debug(`Reading the articles ${articleIndex}`, titles);

      const wiki = _wiki || 'enwiki';
      const result = await MwActionApiClient.getLastRevisionsByTitles(
        titles,
        wiki,
      );

      if (Object.keys(result.query.pages).length > 0) {
        const pageIds = Object.keys(result.query.pages);
        const revisionInfos = [];
        const feedRevisions = [];
        for (const pageId of pageIds) {
          if (result.query.pages[pageId].revisions?.length > 0) {
            const [
              revisionInfo,
              feedRevision,
            ] = FeedRevisionEngine.getFeedRevisionPair(feed, wiki, result, pageId);
            revisionInfos.push(revisionInfo);
            feedRevisions.push(feedRevision);
          }
        }
        try {
          const ret = await Promise.all([
            RevisionInfo.bulkWrite(
              revisionInfos.map((ri: RevisionInfoProps) => {
                return {
                  updateOne: {
                    filter: { wikiRevId: ri.wikiRevId },
                    update: { $set: ri },
                    upsert: true,
                  },
                };
              }),
            ),
            FeedRevision.bulkWrite(
              feedRevisions.map((fr: FeedRevisionProps) => {
                return {
                  updateOne: {
                    filter: {
                      title: fr.title,
                      $or: [
                        {
                          claimerInfo: {
                            $exists: false,
                          },
                        },
                        {
                          'claimerInfo.checkedOfAt': {
                            $exists: false,
                          },
                          'claimExpiresAt': {
                            $lte: new Date(),
                          },
                        },
                      ],
                    },
                    update: { $set: fr },
                    upsert: true,
                  },
                };
              }),
            ),
          ]);
          feedRevisionEngineLogger.debug(
            `Current articleIndex=${articleIndex} Ret = `,
            JSON.stringify(ret, null, 2),
          );
        } catch (e) {
          if (e.code == 11000 && /^E11000 duplicate key error collection.*/.test(e.errmsg)) {
            feedRevisionEngineLogger.debug('BulkWrite E11000 issue potentially caused by\n\nhttps://jira.mongodb.org/browse/SERVER-14322.\n\nWe are skipping the suggested retry documented by https://jira.mongodb.org/browse/DOCS-12234 ');
          } else { // otherwise rethrow
            throw e;
          }
        }
      }
    }
  }

  private static getFeedRevisionPair = function(feed, wiki, result, pageId) {
    const revisions = result.query.pages[pageId].revisions;
    if (revisions.length > 1) {
      feedRevisionEngineLogger.info(`revisions.length > 1
  title=${result.query.pages[pageId].title},
  revId=${revisions[0].revid}
  length=${revisions.length}`);
    }
    const revision = revisions[0];
    const wikiRevId = `${wiki}:${revision.revid}`;
    const revisionInfo = <RevisionInfoProps>{
      wikiRevId,
      revId: revision.revid,
      wiki,
      pageId: parseInt(pageId),
      title: result.query.pages[pageId].title,
      wikiCreated: new Date(revision.timestamp),
      tags: revision.tags,
      summary: revision.comment,
      // skip diff
      // skip ores_damaging
      // skip ores_damaging
      prevRevId: revision.parentid,
    };
    if (Object.keys(revision).includes('anon')) {
      revisionInfo.anonymousIp = revision.user;
    } else {revisionInfo.wikiUserName = revision.user;}
    if (revision.oresscores?.damaging) {revisionInfo.ores_damaging = revision.oresscores.damaging.true;}
    if (revision.oresscores?.badfaith) {revisionInfo.ores_badfaith = revision.oresscores.goodfaith.false;}

    const feedRevision = <FeedRevisionProps>{
      feed,
      wikiRevId,
      title: result.query.pages[pageId].title,
      createdAt: new Date(),
      wiki,
      feedRankScore: 0,
    };
    return [revisionInfo, feedRevision];
  }

  /**
   * Fetch and claim the feedRevisions that is claimable and has no claimerInfo.
   *
   * Caveat: we are using a "find-and-then" update approach
   *         there could potentially be racing condition if two users are fetching
   *         the result
   * @param userGaId
   * @param wikiUserName
   * @param feed
   * @param wiki
   * @param limit
   */
  public static async fetchAndClaim(
    userGaId,
    wikiUserName = '',
    feed = 'us2020',
    wiki = 'enwiki',
    limit = 2,
  ): Promise<FeedRevisionProps[]> {
    const feedRevisions: FeedRevisionDoc[] = await FeedRevision.find({
      wiki,
      feed,
      $or: [
        { claimerInfo: { $exists: false } }, // no claimer
        {
          $and: [
            { claimExpiresAt: { $exists: true } },
            { claimExpiresAt: { $lte: new Date() } },
          ],
        }, // claim expired
      ],
    })
        .sort([['feedRankScore', 1]])
        .limit(limit);

    const results = await Promise.all(
      feedRevisions.map(async (fr) => {
        const now = new Date();

        fr.claimerInfo = {
          userGaId,
          wikiUserName,
          claimedAt: now,
        };

        if (wikiUserName) {fr.claimerInfo.wikiUserName = wikiUserName;}

        fr.claimExpiresAt = addMinutes(now, 15);
        return fr.save();
      }),
    );

    return results.map((doc) => doc as FeedRevisionProps);
  }

  public static async checkOff(
    wikiRevIds: string[],
    userGaId,
    wikiUserName = null,
    feed = 'us2020',
  ) {
    return await FeedRevision.bulkWrite(
      wikiRevIds.map((wikiRevId) => {
        const filter = {
          'wiki': wikiRevId.split(':')[0],
          wikiRevId,
          feed,
          'claimerInfo.userGaId': userGaId,
        };
        if (wikiUserName) {filter['claimerInfo.wikiUserName'] = wikiUserName;}
        return {
          updateOne: {
            filter,
            update: {
              $set: {
                'claimerInfo.checkedOfAt': new Date(),
              },
              $unset: { claimExpiresAt: '' },
            },
          },
        };
      }),
    );
  }

  private static traverse = async function(feed, wiki, entryFeedPage) {
    let numReq = 0;
    const visitedFeedPages = {};
    const toVisitFeedPages:FeedPageProps[] = [];
    toVisitFeedPages.push(entryFeedPage); // enqueue from its tail

    const now = new Date();
    while (toVisitFeedPages.length > 0) {
      const currentFeedPage:FeedPageProps = toVisitFeedPages.shift(); // dequeue from it's head, Breadth First Search (BFS)
      if (visitedFeedPages[currentFeedPage.pageId]) {
        continue;
      } else {
        visitedFeedPages[currentFeedPage.pageId] = currentFeedPage;
      }
      feedRevisionEngineLogger.debug(`Current numReq=${numReq}`, currentFeedPage);
      if (currentFeedPage.namespace == 14) {
        const mwPageInfos = await MwActionApiClient.getCategoryChildren(wiki, currentFeedPage.title);
        numReq++;
        const children:FeedPageProps[] = mwPageInfos.map((mwPageInfo) => {
          return <FeedPageProps>{
            feed,
            wiki,
            title: mwPageInfo.title,
            pageId: parseInt(mwPageInfo.pageid),
            namespace: parseInt(mwPageInfo.ns),
            traversedAt: now,
          };
        });
        currentFeedPage.categoryChildren = Array.from(new Set(children.map((feedPage) => feedPage.pageId)));
        children
            .forEach((feedPage:FeedPageProps) => {
              if (!feedPage.categoryParents) {feedPage.categoryParents = [];}
              feedPage.categoryParents = Array.from(new Set(feedPage.categoryParents.concat(currentFeedPage.pageId)));
            });
        feedRevisionEngineLogger.debug('Children = ', children);
        toVisitFeedPages.push(...(children.filter((feedPage) => !visitedFeedPages[feedPage.pageId])));
      }
      feedRevisionEngineLogger.debug(`=== Total toVisit ${toVisitFeedPages.length}, visited = ${Object.keys(visitedFeedPages).length}, numReq=${numReq}`);
    }
    try {
      const bulkUpdateResult = await FeedPage.bulkWrite(Object.values(visitedFeedPages).map((feedPage:FeedPageProps) => {
        return {
          updateOne: {
            filter: {
              feed: feedPage.feed,
              wiki: feedPage.wiki,
              title: feedPage.title,
            },
            upsert: true,
            update: {
              $set: feedPage,
            },
          },
        };
      }));
      feedRevisionEngineLogger.debug('Done bulkUpdateResult = ', bulkUpdateResult);
    } catch (e) {
      if (e.code == 11000 && /^E11000 duplicate key error collection.*/.test(e.errmsg)) {
        feedRevisionEngineLogger.debug('BulkWrite E11000 issue potentially caused by\n\nhttps://jira.mongodb.org/browse/SERVER-14322.\n\nWe are skipping the suggested retry documented by https://jira.mongodb.org/browse/DOCS-12234 ');
      } else { // otherwise rethrow
        throw e;
      }
    }
  }

  public static traverseCategoryTree = async function(feed: string, wiki: string, entryTitle: string) {
    const mwPageInfos = await MwActionApiClient.getMwPageInfosByTitles(wiki, [entryTitle]);
    const mwPageInfo: MwPageInfo = mwPageInfos[0];

    const entryFeedPage: FeedPageProps = <FeedPageProps>{
      feed,
      wiki,
      title: mwPageInfo.title,
      pageId: parseInt(mwPageInfo.pageid),
      namespace: parseInt(mwPageInfo.ns),
      traversedAt: new Date(),
    };
    await FeedRevisionEngine.traverse(feed, wiki, entryFeedPage);
  }
}
