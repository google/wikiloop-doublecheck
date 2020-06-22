/**
 ```zsh
 export MONGODB_URI_FROM=
 export MONGODB_URI_TO=
 export DB_NAME_FROM=heroku_00w6ld63
 export DB_NAME_TO=heroku_00w6ld63
 export OUT_DIR=tmp/$(date +'%Y-%m-%d-%H-%M')
 echo "Start back up to $OUT_DIR/$DB_NAME_FROM/Interaction.bson from ${MONGODB_URI_FROM}"
 mongodump --uri="$MONGODB_URI_FROM" -o=$OUT_DIR -c=Interaction
 echo "Saved to $OUT_DIR"
 echo "Now restoring to ${MONGODB_URI_TO}"
 mongorestore --uri="$MONGODB_URI_TO" --drop -c=Interaction --db=${DB_NAME_TO} "$OUT_DIR/$DB_NAME_FROM/Interaction.bson"
 echo "Done, start fixing schema"
 npx ts-node -r tsconfig-paths/register --project tsconfig.json tscmd/validate-interaction.ts
 echo "Done, everything"
 ```


```bash
 npx ts-node -r tsconfig-paths/register --project tsconfig.json tscmd/validate-interaction.ts
```


 */

import {Interaction, InteractionDoc} from "@/shared/models/interaction-item.model";
import mongoose, {Document}  from 'mongoose';
import {fetchRevisions} from "@/server/common";

async function getInvalidCount() {
  return await Interaction.find({
    $or: [
      {feed: {$exists: false}},
      {wikiRevId: {$exists: false}},
      {userGaId: {$exists: false}},
      {judgement: {$exists: false}},
      {timestamp: {$exists: false}},
      {title: {$exists: false}},
      {wiki: {$exists: false}},
    ]}).count();
}

async function fixFeed() {
  let ret = await Interaction.updateMany({feed: {$exists:false}}, {feed: 'index'});
  console.log(`After fixed feed, ret= ${JSON.stringify(ret, null, 2)}`);
}

async function fixTimestamp() {
  let update:any = {
    timestamp: {
      $convert: {
        input: '$recentChange.timestamp', to: "int"
      }
    }
  };
  // @ts-ignore

  await Promise.all((await Interaction.find({
    timestamp: {$exists: false},
  })).map(
    // @ts-ignore
    async (interaction: Document) => {
      if (interaction['_doc'].recentChange.timestamp) {
        interaction['timestamp'] = parseInt(interaction['_doc'].recentChange.timestamp);
      } else {
        interaction['timestamp'] = Math.floor(new Date().getTime()/ 1000);
      }
      await interaction.save({ validateBeforeSave: false });
    }));
}

async function fixWiki() {
  // if no gaId in both stage, delete them
  await Interaction.deleteMany({
    wikiRevId: {$exists: false},
    wiki: {$exists: false},
    'recentChange.wiki': {$exists:false} }
    );

  await Interaction.updateMany({
    wiki: {$exists: false},
    'recentChange.wiki': {$exists:true}
    },
    {
      $set: {wiki: '$recentChange.wiki'}
    });

  await Interaction.updateMany({
    wiki: {$exists: false},
    'recentChange.wiki': {$exists:false},
    wikiRevId: {$regex: 'enwiki'}
  }, {$set: {
    wiki: 'enwiki'
  }});
  // console.log(`After fix wiki, ret= ${JSON.stringify(ret, null, 2)}`);
}

async function fixUserGaId() {
  // if no gaId in both stage, delete them
  await Interaction.deleteMany({
    userGaId: {$exists: false},
    gaId: {$exists: false}});

  let ret = await Interaction.updateMany({
    userGaId: {$exists: false},
    gaId: {$exists: true}
  }, {$addFields: {userGaId: '$gaId'}});
  console.log(`After fixUserGaId, ret= ${JSON.stringify(ret, null, 2)}`);
}

async function fixJudgement() {
  let ret = await Interaction.deleteMany({
    judgement: {$exists: false}});
  console.log(`Deleted interaction without judgement, ret= ${JSON.stringify(ret, null, 2)}`);
}

async function fixTitle() {
  // if no title in both stage, delete them
  await Interaction.deleteMany({
    title: {$exists: false},
    'recentChange.title': {$exists: false}});

  let ret = await Interaction.updateMany({
    title: {$exists: false},
    'recentChange.title': {$exists: true}
  }, {$addFields: {title: '$recentChange.title'}});
  console.log(`After fixed Title, ret= ${JSON.stringify(ret, null, 2)}`);
}

async function requiredFieldIsAbsence (fieldName) {
  return await Interaction.find({[fieldName]: {$exists:false}}).count();
}

async function printStatus() {
  let total = await Interaction.countDocuments();
  let ret = await getInvalidCount();
  console.log(`Invalid count = ${ret}, of total ${total}`);
  await Promise.all(['feed', 'wikiRevId', 'userGaId', 'judgement', 'timestamp', 'title', 'wiki']
    .map(async field => {
        console.log(`requiredFieldIsAbsence ${field}: ${await requiredFieldIsAbsence (field)}`);
      }
    ));
}
async function validateAll() {
  console.log(`Start validate`);
  let invalid = (await Interaction.find()).map(i=> {
    let e = i.validateSync();
    return e;
  }).filter(e=>e);
  let count = {
    total: 0
  };

  invalid.forEach(e => {
    count.total++;
    Object.keys(e.errors).forEach(f=> {
      if (!count[f]) count[f] = 0;
      count[f]++;
    });
  });
  console.log(`Error count`, invalid.length, count);
}

async function main() {
  console.log(`Start! MONGODB_URI = `, process.env.MONGODB_URI);
  require(`dotenv`).config();

  await mongoose.connect(process.env.MONGODB_URI, {useUnifiedTopology: true, useNewUrlParser: true});
  let ret = await mongoose.connection.db.command({ buildInfo: 1 });
  await validateAll();

  console.log(`connected mongoose ${JSON.stringify(ret, null, 2)}`);
  await printStatus();
  let deleteRet = await Interaction.deleteMany(
  {
    $or: [
      {
        $and: [
          {wikiRevId: null},
          {'recentChange.ores.wikiRevId': null},
        ]
      }, // unrecoverable
      {judgement: {$exists: false}},
    ]
  });

  //console.log(`Delete unrecoverable ${deleteRet}`);
  let docs = (await Interaction.find({
    $or: [
      {feed: {$exists: false}}, // recoverable
      {userGaId: {$exists: false}},
      {$or: [{timestamp: {$exists: false}}, {timestamp: {$gte: 1487764007468}}]}, // unrecoverable
      {title: {$exists: false}},
      {wiki: {$exists: false}},
      {wikiRevId: {$exists: false}},
    ]}));
    let errorInteractions = (await Promise.all(docs.map(async (i:InteractionDoc)=> {
      try {
        console.log(`Start doc ${i}`);
        let hardRecoverFields = i.get('_meta.HardRecoveredFields') || [];
        if (!i.feed) {
          i.feed = 'index';
        }
        if (!i.userGaId) {
          i.userGaId = i.get('gaId');
          if (!i.userGaId) {
            i.userGaId = 'GA1.2.1951184974.1586738317';
            i.set('_backfill.userGaId', true);
          }
        }
        if (!i.wiki) {
          if (i.get('recentChange.wiki')) {
            i.wiki = i.get('recentChange.wiki');
          } else if (i.get('wikiRevId')) {
            i.wiki = i.get('wikiRevId').split(':')[0];
          } else {
            i.wiki = 'enwiki';
            i.set('_backfill.wiki', true);
          }
        }
        if (!i.wikiRevId) {
          i.wikiRevId = i.get('recentChange.ores.wikiRevId');
        }
        if (!i.title) {
          i.title = i.get('recentChange.title');
          if (!i.title) {
            let wikiToRevisionList = await fetchRevisions([i.wikiRevId]);
            i.title = wikiToRevisionList['enwiki'][0].title;
          }
        }
        if (!i.timestamp) {
          let rcTsRaw = parseFloat(i.get('recentChange.timestamp'));
          let backfillTimestamp;
          if (rcTsRaw) {
            if (rcTsRaw > 1500000000 && rcTsRaw < 1700000000) {
              backfillTimestamp = rcTsRaw;
            }
            if ((rcTsRaw * 1000) > 1500000000 && (rcTsRaw * 1000) < 1700000000) {
              backfillTimestamp = Math.floor(rcTsRaw * 1000);
            }
          } else {
            backfillTimestamp = new Date().getTime();
          }
          i.timestamp = backfillTimestamp;
          i.set('_backfill.timestamp', true);
        }
        if (i.timestamp > 1487764007468) {
          i.timestamp = Math.floor(i.timestamp/1000);
        }
        console.log(`Before saving i = ${JSON.stringify(i, null, 2)}`);
        await i.save();
        return null;
      } catch (e) {
        return i;
      }


    }))).filter(ret => ret !== null).map(i => i['_doc']);
    console.log(`If we see errorInteractions`, errorInteractions);
  await printStatus();



}

main().then(() => {
  console.log(`CMD Done!`);
  process.exit(0);
});
