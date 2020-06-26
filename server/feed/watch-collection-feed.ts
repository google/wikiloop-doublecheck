export enum FeedEnum {
  us2020 = 'WatchCollection_US2020',
  covid19 = 'WatchCollection_COVID19',
  wikitrust = 'WatchCollection_WIKITRUST',
  ores = 'WatchCollection_ORES',
  lastbad = 'WatchCollection_LASTBAD'
}

export class WatchCollectionFeed {
  /**
   * Randomly sample a list of revision ids.
   *
   * Note: we require the collection to be in the schema of WatchCollectionItem
   * @param collectionName
   * @param sampleSize
   */
  public static async sampleRevisions(collectionName: string, sampleSize: number):Promise<number[]> {
    const mongoose = require('mongoose');
    let ret = await mongoose.connection.db.collection(collectionName)
      .aggregate([
      // TODO: add wiki filtering
        {
          "$group": {
            "_id": {
              "revIds": "$revIds",
              "wiki": "$wiki"
            }
          }
        },
        {
          "$sample": {
            "size": sampleSize
          }
        },
        {
          "$project": {
            "_id": 0.0,
            "revId": "$_id.revIds",
            "wiki": "$_id.wiki"
          }
        },
        {
          "$unwind": {
            "path": "$revId"
          }
        },
        {
          "$project": {
            "wikiRevId": {
              "$concat": [
                "$wiki",
                ":",
                {
                  "$substr": [
                    "$revId",
                    0.0,
                    -1.0
                  ]
                }
              ]
            }
          }
        }
      ])
      .toArray();
    return ret.map(i => i.wikiRevId);
  }
}
