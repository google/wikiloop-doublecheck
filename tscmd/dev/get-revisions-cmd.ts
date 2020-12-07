import { MwActionApiClient } from '@/shared/mwapi';

async function main() {
  const page = 'Barack_Obama';
  const revIds = await MwActionApiClient.getRevisionIdsByTitle(
    'enwiki', page);
  console.log(`RevIds for ${page} = ${revIds}`);
}

main().then(() => {
  console.log('CMD Done!');
  process.exit(0);
});
