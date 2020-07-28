import { createSchema, ExtractDoc, ExtractProps, Type, typedModel } from 'ts-mongoose';
const ClaimerInfoSchema = createSchema({
  wikiUserName: Type.string(),
  userGaId: Type.string({ required: true }),
  claimedAt: Type.date({ required: true }),
});

const FeedRevisionSchema = createSchema(
  {
    feed: Type.string({ required: true, index: true}),
    wikiRevId: Type.string({ required: true, index: true }),
    wiki: Type.string({ required: true, index: true }),
    feedRankScore: Type.number(),
    claimerInfo: Type.schema().of(ClaimerInfoSchema),
    claimExpiresAt: Type.date({ index: true })
  }
);
export const FeedRevision = typedModel('FeedRevision', FeedRevisionSchema, 'FeedRevision');
export type FeedRevisionDoc = ExtractDoc<typeof FeedRevisionSchema>;
export type FeedRevisionProps = ExtractProps<typeof FeedRevisionSchema>;
