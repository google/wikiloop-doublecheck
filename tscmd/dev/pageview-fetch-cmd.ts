// npx ts-node -r tsconfig-paths/register --project tsconfig.json tscmd/dev/pageview-fetch-cmd.ts


import { MwActionApiClient } from '~/shared/mwapi';
import { initDotEnv } from '~/server/init-util';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const SqlString = require('sqlstring-sqlite');

const mainPageViewFetch = async function ()
{
  initDotEnv();
  let db = await open({
    filename: `tmp/database-category-2020-09-01T18:44:53.821Z.db`,
    driver: sqlite3.cached.Database
  });
  // sawait db.exec(`ALTER TABLE link_graph_table ADD COLUMN pageview INTEGER default null`);
  for (let iter = 0; iter < 20; iter ++) {
    const rows = await db.all('SELECT * FROM link_graph_table WHERE (pageviews IS NULL) OR (pageviews <= 100)');
    const PAGE_SIZE = 50;
    for (let i = 0; i < rows.length; i += PAGE_SIZE) {
      let end = Math.min(i + PAGE_SIZE, rows.length);
      let pageviewsByPage = await MwActionApiClient.getPageViewsByTitles('enwiki', rows.slice(i, end).map(row=>row.link_to));
      for (let title in pageviewsByPage) {
        let pageviewCount = pageviewsByPage[title];

        let sql = SqlString.format(
          `UPDATE link_graph_table SET pageviews = ? WHERE link_to = ? AND (pageviews IS NULL OR pageviews < ?)`,
          [pageviewCount, title, pageviewCount]);
        console.log(`iter=${iter} executing article=${title}, pageviews=${pageviewCount}`);
        await db.exec(sql);
      }
    }
  }
}

mainPageViewFetch().then(() => {
  console.log(`CMD Done!`);
  process.exit(0);
});

