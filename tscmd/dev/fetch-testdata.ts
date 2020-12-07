// npx ts-node -r tsconfig-paths/register --project tsconfig.json tscmd/dev/fetch-testdata.ts
import axios from 'axios';
import { initDotEnv } from '~/server/init-util';
import { MwActionApiClient2 } from '~/shared/mwapi2';

import {
  MwApiPair,
  MwApiRequest,
  MwApiResponse,
} from '~/test/testdata/mwapi2.testdata';

const createNoticeMain = async function() {
  await initDotEnv();
  const url = MwActionApiClient2.endPoint('enwiki');
  const parsedPairs = [];

  for (let i = 0; i < 10; i++) {
    const revId = 920429244 + i;
    await Promise.all([
      MwActionApiClient2.infoParams,
      MwActionApiClient2.diffParams,
      MwActionApiClient2.parsedParams,
    ].map(async (paramFunc) => {
      try {
        const params = paramFunc(revId);
        const result = await axios.get(url, {
          params,
        });
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
        parsedPairs.push(pair);
      } catch (err) {
        console.warn(err);
      }
    }));
  }
  console.log(JSON.stringify(parsedPairs, null, 2));
};

createNoticeMain().then(() => {
  console.log('CMD Done!');
  process.exit(0);
});
