//npx ts-node -r tsconfig-paths/register --project tsconfig.json tscmd/dev/fetch-testdata.ts
import { initDotEnv } from '~/server/init-util'
import { MwActionApiClient2 } from '~/shared/mwapi2'

import axios from 'axios'
import {
  MwApiPair,
  MwApiRequest,
  MwApiResponse
} from '~/test/testdata/mwapi2.testdata'

const createNoticeMain = async function() {
  await initDotEnv()
  let url = MwActionApiClient2.endPoint('enwiki')
  let parsedPairs = []

  for (let i = 0; i < 10; i++) {
    let revId = 920429244 + i;
    await Promise.all([
      MwActionApiClient2.infoParams,
      MwActionApiClient2.diffParams,
      MwActionApiClient2.parsedParams
    ].map(async paramFunc => {
      try {
        let params = paramFunc(revId);
        let result = await axios.get(url, {
          params: params
        })
        let pair: MwApiPair = {
          req: {
            url: url,
            params: params
          } as MwApiRequest,
          res: {
            status: result.status,
            data: result.data
          } as MwApiResponse
        }
        parsedPairs.push(pair)
      } catch(err) {
        console.warn(err);
      }
    }));
  }
  console.log(JSON.stringify(parsedPairs, null, 2))
}

createNoticeMain().then(() => {
  console.log(`CMD Done!`)
  process.exit(0)
})
