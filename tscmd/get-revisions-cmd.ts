import {MwActionApiClient} from "../shared/mwapi";

async function main() {
  let page = "Barack_Obama";
  let revIds = await MwActionApiClient.getRevisions(
  'enwiki', page );
  console.log(`RevIds for ${page} = ${revIds}`);
}

main().then();
