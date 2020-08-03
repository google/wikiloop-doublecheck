import {
  FeedRevision,
  FeedRevisionProps,
  FeedRevisionDoc
} from '~/shared/models/feed-revision.model';
import { logger } from '@/server/common';
import { addMinutes } from 'date-fns';

export class FeedRevisionEngine {

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
            { claimExpiresAt: { $lte: new Date() } },
          ]
        }, // claim expired
      ]
    })
      .sort([[ 'feedRankScore', 1 ]])
      .limit(limit);

    let results = await Promise.all(
      feedRevisions.map(async fr => {
        let now = new Date();

        fr.claimerInfo = {
          userGaId: userGaId,
          wikiUserName: wikiUserName,
          claimedAt:now
        };

        if (wikiUserName) fr.claimerInfo.wikiUserName = wikiUserName

        fr.claimExpiresAt = addMinutes(now, 15);
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
    return await FeedRevision.bulkWrite(wikiRevIds.map(wikiRevId => {
      let filter = {
        wiki: wikiRevId.split(':')[0],
        wikiRevId: wikiRevId,
        feed:feed,
        'claimerInfo.userGaId': userGaId
      };
      if (wikiUserName) filter['claimerInfo.wikiUserName'] = wikiUserName;
      return {
        updateOne: {
          filter: filter,
          update: { $set: {
            'claimerInfo.checkedOfAt': new Date()
          }, $unset: {claimExpiresAt: ''} },
        }
      }}
    ))
  }
}
