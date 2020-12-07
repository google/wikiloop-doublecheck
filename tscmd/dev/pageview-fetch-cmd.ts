// npx ts-node -r tsconfig-paths/register --project tsconfig.json tscmd/dev/pageview-fetch-cmd.ts

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { MwActionApiClient } from '~/shared/mwapi';
import { initDotEnv } from '~/server/init-util';

const SqlString = require('sqlstring-sqlite');

const mainPageViewFetch = async function() {
  initDotEnv();
  const db = await open({
    filename: 'tmp/database-category-2020-09-01T23:53:34.832Z.db',
    driver: sqlite3.cached.Database,
  });
  // sawait db.exec(`ALTER TABLE link_graph_table ADD COLUMN pageview INTEGER default null`);
  for (let iter = 0; iter < 20; iter++) {
    const rows = await db.all('SELECT * FROM link_graph_table WHERE (pageviews IS NULL) OR (pageviews <= 10)');
    const PAGE_SIZE = 50;
    for (let i = 0; i < rows.length; i += PAGE_SIZE) {
      const end = Math.min(i + PAGE_SIZE, rows.length);
      const pageviewsByPage = await MwActionApiClient.getPageViewsByTitles('enwiki', rows.slice(i, end).map((row) => row.link_to));
      for (const title in pageviewsByPage) {
        const pageviewCount = pageviewsByPage[title];

        const sql = SqlString.format(
          'UPDATE link_graph_table SET pageviews = ? WHERE link_to = ? AND (pageviews IS NULL OR pageviews < ?)',
          [pageviewCount, title, pageviewCount]);
        console.log(`iter=${iter} executing article=${title}, pageviews=${pageviewCount}`);
        await db.exec(sql);
      }
    }
  }
};

mainPageViewFetch().then(() => {
  console.log('CMD Done!');
  process.exit(0);
});
