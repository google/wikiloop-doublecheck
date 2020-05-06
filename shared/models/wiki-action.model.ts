import {WikiActionType} from "~/shared/interfaces";
import {createSchema, ExtractDoc, ExtractProps, Type, typedModel} from 'ts-mongoose';

const wikiActionTypeEnums = Object.keys(WikiActionType);

const WikiActionSchema = createSchema({
  type: Type.string({required: true, enum: wikiActionTypeEnums}),
  fromWikiUserName: Type.string({required: true}),
  fromUserGaId: Type.string({required: true}),
  wiki: Type.string({required: true}),
  revId: Type.number({required: true}),
  pageId: Type.number({required: true}),
  title: Type.string({required: true}),
  created: Type.date({required: true}),
  resultRevId: Type.date({require: false}),
  _meta: Type.object({required: false})
    .of({
      hasError: Type.boolean({required: false}),
      rawResult:Type.object({require: false})
    }),
});

export const WikiAction = typedModel('WikiAction', WikiActionSchema, 'WikiActions');
export type WikiActionDoc = ExtractDoc<typeof WikiActionSchema>;
export type WikiActionProps = ExtractProps<typeof WikiActionSchema>;
