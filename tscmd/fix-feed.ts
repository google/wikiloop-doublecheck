/**
 ```bash
 npx ts-node -r tsconfig-paths/register --project tsconfig.json tscmd/fix-feed.ts
 ```
 */

import {Interaction} from "@/shared/models/interaction-item.model";
import mongoose, {Document, Schema}  from 'mongoose';

async function main() {
  console.log(`Start...`);
  const envPath = process.env.DOTENV_PATH || 'template.env';
  console.log(`DotEnv envPath = `, envPath, ' if you want to change it, restart and set DOTENV_PATH');

  require('dotenv').config({
    path: envPath
  });

  await mongoose.connect(process.env.MONGODB_URI, {useUnifiedTopology: true, useNewUrlParser: true});
  let ret1 = await Interaction.updateMany({feed: {$exists:false}}, {feed: 'index'});
  console.log(`After fixed feed, ret= ${JSON.stringify(ret1, null, 2)}`);

  let ret2 = await Interaction.updateMany({wiki: {$exists:false}}, {feed: 'enwiki'});
  console.log(`After fixed feed, ret= ${JSON.stringify(ret2, null, 2)}`);
  console.log(`Done`);
}

main().then(async () => {
  console.log(`CMD Done!`);
  process.exit(0);
});
