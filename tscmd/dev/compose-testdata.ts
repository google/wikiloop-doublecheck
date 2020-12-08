// npx ts-node -r tsconfig-paths/register --project tsconfig.json tscmd/dev/compose-testdata.ts

import axios from 'axios';
import * as fse from 'fs-extra';

import { initDotEnv } from '~/server/init-util';
import { parseWikiRevId } from '~/shared/utility-shared';
import { MwApiPair } from '~/test/testdata/mwapi2.testdata';
import { MwActionApiClient2 } from '~/shared/mwapi2';

const createNoticeMain = async function() {
  await initDotEnv();

  const wikiRevIds = [
    "enwiki:920429244", 
    "zhwiki:63095995",
    "wikidatawiki:1319338548",
  ];

  const wikiRevIdToData = {};

  await Promise.all(wikiRevIds.map(async wikiRevId => {
    const [wiki, seedRevId] = parseWikiRevId(wikiRevId);
    const filename = `${wiki}:${seedRevId}.json`;
    const pairs:MwApiPair[] = await fse.readJSON(`./test/testdata/mwapi/small/${filename}`);
    pairs.forEach((pair:MwApiPair) => {
      if (!(pair.res.status != 200 || pair.res.data?.error || pair.res.data?.query?.badrevids)) {
        if (pair.res.data?.query?.pages) {
          const revInfo = MwActionApiClient2.extractRevisionInfo(wiki, pair.res);
          const existed = wikiRevIdToData[`${wiki}:${revInfo.revId}`];
          if (existed) wikiRevIdToData[`${wiki}:${revInfo.revId}`] = {...existed, ...revInfo};
          else wikiRevIdToData[`${wiki}:${revInfo.revId}`] = revInfo;
        } else if (pair.res.data?.compare?.['*']) {
          const diffHtml = pair.res.data.compare['*'];
          const revId = pair.req.params.fromrev;
          const existed = wikiRevIdToData[`${wiki}:${revId}`];
          if (existed) wikiRevIdToData[`${wiki}:${revId}`] = {...existed, ...{ diffHtml } };
          else wikiRevIdToData[`${wiki}:${revId}`] = {diffHtml};
        } else if (pair.res.data.parse) {
          const parse = pair.res.data.parse;
          const revId = pair.req.params.oldid;
          const existed = wikiRevIdToData[`${wiki}:${revId}`];
          if (existed) wikiRevIdToData[`${wiki}:${revId}`] = {...existed, ...{ parse }};
          else wikiRevIdToData[`${wiki}:${revId}`] = parse;
        }
      }
    });
  }));
  await fse.outputJSON(`./test/testdata/mwapi/small/datamap.json`, wikiRevIdToData, {spaces: 2});
  console.log('Done all');
};

createNoticeMain().then(() => {
  console.log('CMD Done!');
  process.exit(0);
});
