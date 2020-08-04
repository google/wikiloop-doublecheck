import {
  FeedRevision,
  FeedRevisionProps,
  FeedRevisionDoc
} from '~/shared/models/feed-revision.model';
import { addMinutes } from 'date-fns'

import {
  RevisionInfo,
  RevisionInfoProps
} from '@/shared/models/revision-info.model'
import { FeedPage, FeedPageProps } from '@/shared/models/feed-page.model'
import { MwActionApiClient, MwPageInfo } from '@/shared/mwapi'
import { feedRevisionEngineLogger } from '../common';

export class FeedRevisionEngine {
  public static async populateRevisionsGivenTitle(wiki: string, feed: string) {
    let articleLists = (await FeedPage.find({ wiki: wiki, feed: feed })).map(
      fp => fp.title
    )

    for (
      let articleIndex = 0;
      articleIndex < articleLists.length;
      articleIndex += 50
    ) {
      let titles = articleLists.slice(
        articleIndex,
        Math.min(articleIndex + 50, articleLists.length)
      )
      feedRevisionEngineLogger.debug(`Reading the articles ${articleIndex}`, titles);

      let wiki = 'enwiki'
      let result = await MwActionApiClient.getLastRevisionsByTitles(
        titles,
        wiki
      )

      if (Object.keys(result.query.pages).length > 0) {
        let pageIds = Object.keys(result.query.pages)
        let revisionInfos = []
        let feedRevisions = []
        for (let pageId of pageIds) {
          if (result.query.pages[pageId].revisions?.length > 0) {
            let [
              revisionInfo,
              feedRevision
            ] = FeedRevisionEngine.getFeedRevisionPair(wiki, result, pageId)
            revisionInfos.push(revisionInfo)
            feedRevisions.push(feedRevision)
          }
        }
        let ret = await Promise.all([
          RevisionInfo.bulkWrite(
            revisionInfos.map((ri: RevisionInfoProps) => {
              return {
                updateOne: {
                  filter: { wikiRevId: ri.wikiRevId },
                  update: { $set: ri },
                  upsert: true
                }
              }
            })
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
                          $exists: false
                        }
                      },
                      {
                        'claimerInfo.checkedOfAt': {
                          $exists: false
                        },
                        claimExpiresAt: {
                          $lte: new Date()
                        }
                      }
                    ]
                  },
                  update: { $set: fr },
                  upsert: true
                }
              }
            })
          )
        ])
        feedRevisionEngineLogger.debug(
          `Current articleIndex=${articleIndex} Ret = `,
          JSON.stringify(ret, null, 2)
        )
      }
    }
  }

  private static getFeedRevisionPair = function(wiki, result, pageId) {
    let revisions = result.query.pages[pageId].revisions
    if (revisions.length > 1) {
      feedRevisionEngineLogger.info(`revisions.length > 1
  title=${result.query.pages[pageId].title},
  revId=${revisions[0].revid}
  length=${revisions.length}`)
    }
    let revision = revisions[0]
    let wikiRevId = `${wiki}:${revision.revid}`
    let revisionInfo = <RevisionInfoProps>{
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
    }
    if (Object.keys(revision).indexOf('anon') /* anonymous */ >= 0) {
      revisionInfo.anonymousIp = revision.user
    } else revisionInfo.wikiUserName = revision.user
    if (revision.oresscores.damaging)
      revisionInfo.ores_damaging = revision.oresscores.damaging.true
    if (revision.oresscores.badfaith)
      revisionInfo.ores_badfaith = revision.oresscores.goodfaith.false

    let feedRevision = <FeedRevisionProps>{
      feed: 'us2020',
      wikiRevId: wikiRevId,
      title: result.query.pages[pageId].title,
      createdAt: new Date(),
      wiki: wiki,
      feedRankScore: 0
    }
    return [revisionInfo, feedRevision]
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
    limit = 2
  ): Promise<FeedRevisionProps[]> {
    let feedRevisions: FeedRevisionDoc[] = await FeedRevision.find({
      wiki: wiki,
      feed: feed,
      $or: [
        { claimerInfo: { $exists: false } }, // no claimer
        {
          $and: [
            { claimExpiresAt: { $exists: true } },
            { claimExpiresAt: { $lte: new Date() } }
          ]
        } // claim expired
      ]
    })
      .sort([['feedRankScore', 1]])
      .limit(limit)

    let results = await Promise.all(
      feedRevisions.map(async fr => {
        let now = new Date()

        fr.claimerInfo = {
          userGaId: userGaId,
          wikiUserName: wikiUserName,
          claimedAt: now
        }

        if (wikiUserName) fr.claimerInfo.wikiUserName = wikiUserName

        fr.claimExpiresAt = addMinutes(now, 15)
        return fr.save()
      })
    )

    return results.map(doc => doc as FeedRevisionProps)
  }

  public static async checkOff(
    wikiRevIds: string[],
    userGaId,
    wikiUserName = null,
    feed = 'us2020'
  ) {
    return await FeedRevision.bulkWrite(
      wikiRevIds.map(wikiRevId => {
        let filter = {
          wiki: wikiRevId.split(':')[0],
          wikiRevId: wikiRevId,
          feed: feed,
          'claimerInfo.userGaId': userGaId
        }
        if (wikiUserName) filter['claimerInfo.wikiUserName'] = wikiUserName
        return {
          updateOne: {
            filter: filter,
            update: {
              $set: {
                'claimerInfo.checkedOfAt': new Date()
              },
              $unset: { claimExpiresAt: '' }
            }
          }
        }
      })
    )
  }
  private static traverse = async function (feed, wiki, entryFeedPage) {
    let numReq = 0;
    let visitedFeedPages = {};
    let toVisitFeedPages:FeedPageProps[] = [];
    toVisitFeedPages.push(entryFeedPage); // enqueue from its tail

    let now = new Date();
    while (toVisitFeedPages.length > 0) {
      let currentFeedPage:FeedPageProps = toVisitFeedPages.shift(); // dequeue from it's head, Breadth First Search (BFS)
      if (visitedFeedPages[currentFeedPage.pageId]) {
        continue;
      } else {
        visitedFeedPages[currentFeedPage.pageId] = currentFeedPage;
      }
      feedRevisionEngineLogger.debug(`Current numReq=${numReq}`, currentFeedPage);
      if (currentFeedPage.namespace == 14) {
        let mwPageInfos = await MwActionApiClient.getCategoryChildren(wiki, currentFeedPage.title);
        numReq++;
        let children:FeedPageProps[] = mwPageInfos.map(mwPageInfo => {
          return <FeedPageProps>{
            feed: feed,
            wiki: wiki,
            title: mwPageInfo.title,
            pageId: parseInt(mwPageInfo.pageid),
            namespace: parseInt(mwPageInfo.ns),
            traversedAt: now,
          };
        });
        currentFeedPage.categoryChildren = Array.from(new Set(children.map(feedPage => feedPage.pageId)));
        children
          .forEach((feedPage:FeedPageProps) => {
            if (!feedPage.categoryParents) feedPage.categoryParents = [];
            feedPage.categoryParents = Array.from(new Set(feedPage.categoryParents.concat(currentFeedPage.pageId)));
          });
          feedRevisionEngineLogger.debug(`Children = `, children);
        toVisitFeedPages.push(...(children.filter(feedPage => !visitedFeedPages[feedPage.pageId])));
      }
      feedRevisionEngineLogger.debug(`=== Total toVisit ${toVisitFeedPages.length}, visited = ${Object.keys(visitedFeedPages).length}, numReq=${numReq}`);
    }

    let bulkUpdateResult = await FeedPage.bulkWrite(Object.values(visitedFeedPages).map((feedPage:FeedPageProps) => {
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
          }
        }
      };
    }));
    feedRevisionEngineLogger.debug(`Done bulkUpdateResult = `, bulkUpdateResult);
  }

  public static traverseCategoryTree = async function(wiki: string, entryTitle: string, feed: string) {
    let mwPageInfos = await MwActionApiClient.getMwPageInfosByTitles(wiki, [entryTitle]);
    let mwPageInfo: MwPageInfo = mwPageInfos[0];

    let entryFeedPage: FeedPageProps = <FeedPageProps>{
      feed: feed,
      wiki: wiki,
      title: mwPageInfo.title,
      pageId: parseInt(mwPageInfo.pageid),
      namespace: parseInt(mwPageInfo.ns),
      traversedAt: new Date()
    };
    await FeedRevisionEngine.traverse(feed, wiki, entryFeedPage);
  }
}
