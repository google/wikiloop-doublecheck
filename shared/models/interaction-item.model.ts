import {createSchema, ExtractDoc, ExtractProps, Type, typedModel} from 'ts-mongoose';
import {BasicJudgement} from "~/shared/interfaces";

const basicJudgementEnums = Object.keys(BasicJudgement);

const InteractionSchema = createSchema(
  {
    feed: Type.string(),
    wikiRevId: Type.string({ required: true }),
    userGaId: Type.string({ required: true }),
    wikiUserName: Type.string(),
    judgement: Type.string({ required: true, enum: basicJudgementEnums }),
    timestamp: Type.number({
      required: true,
      min: new Date('2017-01-01').getTime()/1000,
      max: new Date('2200-01-01').getTime()/1000 // hope someday this become a problem. :)
    }),
    title: Type.string({ required: true }),
    wiki: Type.string({ required: true }),
  }
);
export const Interaction = typedModel('Interaction', InteractionSchema, 'Interaction');
export type InteractionDoc = ExtractDoc<typeof InteractionSchema>;
export type InteractionProps = ExtractProps<typeof InteractionSchema>;
