import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export const initSqlite = async function(filename) {
  let db = await open({
    filename: filename,
    driver: sqlite3.cached.Database
  });

  await db.exec(
    'CREATE TABLE IF NOT EXISTS link_graph_table (link_from TEXT, link_to TEXT, link_type TEXT, link_ttl INTEGER, iteration TEXT, pageviews INTEGER)');
  return db;
}
