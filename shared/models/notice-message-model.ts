import { createSchema, ExtractDoc, ExtractProps, Type, typedModel } from 'ts-mongoose';

/**
 * Schema for a NoticeMessage
 *
 * Example
 {
   messageId: "NoticeUSerLevelsRfC",
   defaultMessage: "Hi editors, we have a Request For Comments we like your feedback.",
   url: 'https://meta.wikimedia.org/wiki/WikiLoop/DoubleCheck/RfC:Levels_for_WikiLoop_DoubleCheck_Reviewers',
   createdAt: "2020-08-20 01:01 UTC",
   asks: [
     {
        wikiUserName: "Xinbenlv",
        userGaId: "...",
        ackedAt: "2020-08-20 02:02 UTC",
     }
   ],
   beginAt: "2020-08-20 00:00 UTC",
   endAt: "2020-09-14 00:00 UTC",
  }
 */
const NoticeMessageSchema = createSchema(
  {
    messageId: Type.string({ required: true, index: true, unique: true }),  // e.g.
    defaultMessage: Type.string({required: true}), // The default message content, in case translations are not currently available yet.
    url: Type.string({required: false}),
    createdAt: Type.date({required: true, index:true}),
    acks: Type.array().of(Type.mixed()),
    beginAt: Type.date({required: true, index:true}),
    endAt: Type.date({required: true, index:true}),
  },
);

export const NoticeMessage = typedModel('NoticeMessage', NoticeMessageSchema, 'NoticeMessage', true);
export type NoticeMessageDoc = ExtractDoc<typeof NoticeMessageSchema>;
export type NoticeMessageProps = ExtractProps<typeof NoticeMessageSchema>;
