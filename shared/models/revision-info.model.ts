import { createSchema, ExtractDoc, ExtractProps, Type, typedModel } from 'ts-mongoose';

const RevisionInfoSchema = createSchema(
  {
    wikiRevId: Type.string({ required: true, index: true, unique: true }),
    revId: Type.number({ required: true, index: true }),
    wiki: Type.string({ required: true, index: true }),
    pageId: Type.number({ required: true, index: true }),
    title: Type.string({ required: true, index: true }),
    wikiUserName: Type.string({ index: true }), // if the author is a logged in, a wikiUserName will be made public by Wikipedia
    // if the author is not logged in, their IP address will be made public by Wikipedia, such information is public information per https://en.wikipedia.org/wiki/WP:IP
    anonymousIp: Type.string({ index: true }),
    wikiCreated: Type.date({ required: true, index: true }),
    tags: Type.array().of(Type.string({ index: true })),
    summary: Type.string(),
    diffHtml: Type.string(),
    prevRevId: Type.number({ index: true }),
    ores_damaging: Type.number(),
    ores_badfaith: Type.number(),
  }
);
export const RevisionInfo = typedModel('RevisionInfo', RevisionInfoSchema, 'RevisionInfo', true);
export type RevisionInfoDoc = ExtractDoc<typeof RevisionInfoSchema>;
export type RevisionInfoProps = ExtractProps<typeof RevisionInfoSchema>;
