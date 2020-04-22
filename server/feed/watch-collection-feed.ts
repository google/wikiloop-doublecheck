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
        { $project: { _id: 0, revIds: '$revIds' } },
        { $unwind: '$revIds' },
        { "$sample": { size: sampleSize } }
      ])
      .toArray();
    return ret.map(i => i.revIds);
  }
}
