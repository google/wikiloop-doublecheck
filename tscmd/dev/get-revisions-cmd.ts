import {MwActionApiClient} from "@/shared/mwapi";

async function main() {
  let page = "Barack_Obama";
  let revIds = await MwActionApiClient.getRevisionIdsByTitle(
  'enwiki', page );
  console.log(`RevIds for ${page} = ${revIds}`);
}

main().then(() => {
  console.log(`CMD Done!`);
  process.exit(0);
});
