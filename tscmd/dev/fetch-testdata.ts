// npx ts-node -r tsconfig-paths/register --project tsconfig.json tscmd/dev/fetch-testdata.ts
import axios from 'axios';
import * as fse from 'fs-extra';
import Bottleneck from 'bottleneck';
import { initDotEnv } from '~/server/init-util';
import { MwActionApiClient2 } from '~/shared/mwapi2';

import {
  MwApiPair,
  MwApiRequest,
  MwApiResponse,
} from '~/test/testdata/mwapi2.testdata';
import { parseWikiRevId } from '~/shared/utility-shared';

const bottleneck = new Bottleneck({
  minTime: 200
});

/**
 * Default number of revisions to fetch in each type of test data.
 */
const NUM_REVS_TO_FETHC = 1000;

const start = new Date();

/**
 * Given wiki and revId, the function fetch a number of {@link NUM_REVS_TO_FETHC} of Request and Response from MediaWiki API.
 * @param wiki 
 * @param seedRevId 
 */
async function getReqResPairs(wiki:string, seedRevId:number) {
  
  const url = MwActionApiClient2.endPoint(wiki);
  const reqResPairs = [];

  for (let i = 0; i < NUM_REVS_TO_FETHC; i++) {
    const revId = seedRevId - i;
    await Promise.all([
      MwActionApiClient2.infoParams,
      MwActionApiClient2.diffParams,
      MwActionApiClient2.parsedParams,
    ].map(async (paramFunc) => {
      try {
        const params:any = paramFunc(revId);
        const result:any = await bottleneck.schedule(async () => await axios.get(url, {
          params,
        }));
        const pair: MwApiPair = {
          req: {
            url,
            params,
          } as MwApiRequest,
          res: {
            status: result.status,
            data: result.data,
          } as MwApiResponse,
        };
        reqResPairs.push(pair);
        console.log(`At ${new Date().getTime() - start.getTime()}ms fetched `, params, result.status, 'length', JSON.stringify(result.data, null, 2).length);
      } catch (err) {
        console.warn(err);
      }
    }));
  }
  return reqResPairs;
}

async function writeFile(filename, jsonObj) {
  await fse.outputJSON(`./test/testdata/mwapi/large/${filename}`, jsonObj, {spaces: 2});
}

const createNoticeMain = async function() {
  await initDotEnv();

  const wikiRevIds = [
    "enwiki:920429244", 
    "zhwiki:63095995",
    "wikidatawiki:1319338548",
  ];

  await Promise.all(wikiRevIds.map(async wikiRevId=> {
    const [wiki, revId] = parseWikiRevId(wikiRevId);
    const data = await getReqResPairs(wiki, revId);
    await writeFile(`${wiki}:${revId}.json`, data);
    console.log(`Done for ${wikiRevId}`);
  }));
  console.log('Done all');
};

createNoticeMain().then(() => {
  console.log('CMD Done!');
  process.exit(0);
});
