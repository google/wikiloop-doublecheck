import { createSchema, ExtractDoc, ExtractProps, Type, typedModel } from 'ts-mongoose';

const FeedPageSchema = createSchema(
  {
    feed: Type.string({ required: true, index: true }),
    wiki: Type.string({ required: true, index: true }),
    title: Type.string({ required: true, index: true }),
    pageId: Type.number({ required: true, index: true }),
    namespace: Type.number({ required: true, index: true }),
    categoryChildren: Type.array({ required: false }).of(
      Type.number({ required: true }),
    ),
    categoryParents: Type.array({ required: false }).of(
      Type.number({ required: true }),
    ),
    traversedAt: Type.date({ required: true }),
    revisionLastFetchedAt: Type.date({ required: false }),
    skip: Type.boolean({ required: false, index: true }),
  },
);

// composite indices
FeedPageSchema.index({ feed: 1, wiki: 1, pageId: 1 }, { unique: true });
FeedPageSchema.index({ feed: 1, wiki: 1, title: 1 }, { unique: true });

export const FeedPage = typedModel('FeedPage', FeedPageSchema, 'FeedPage');
export type FeedPageDoc = ExtractDoc<typeof FeedPageSchema>;
export type FeedPageProps = ExtractProps<typeof FeedPageSchema>;
