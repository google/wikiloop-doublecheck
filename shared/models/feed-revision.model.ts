import { createSchema, ExtractDoc, ExtractProps, Type, typedModel } from 'ts-mongoose';

const FeedRevisionSchema = createSchema(
  {
    feed: Type.string({ required: true, index: true}),
    wikiRevId: Type.string({ required: true, index: true }),
    wiki: Type.string({ required: true, index: true }),
    feedRankScore: Type.number(),
    claimerInfo: Type.object().of({
      userGaId: Type.string({ required: true }),
      wikiUserName: Type.string({ required:false}),
      claimedAt: Type.date({ required: true }),
      checkedOffAt: Type.date({ required: false }),
    }),
    claimExpiresAt: Type.date({ index: true })
  }
);
FeedRevisionSchema.index({ feed: 1, wikiRevId: 1 }, { unique: true })

export const FeedRevision = typedModel('FeedRevision', FeedRevisionSchema, 'FeedRevision');
export type FeedRevisionDoc = ExtractDoc<typeof FeedRevisionSchema>;
export type FeedRevisionProps = ExtractProps<typeof FeedRevisionSchema>;

