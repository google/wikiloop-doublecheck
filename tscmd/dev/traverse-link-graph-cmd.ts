// npx ts-node -r tsconfig-paths/register --project tsconfig.json tscmd/dev/traverse-link-graph-cmd.ts

import { initDotEnv} from '~/server/init-util';

import { MwActionApiClient } from '~/shared/mwapi';
import { initSqlite } from './utils';
const SqlString = require('sqlstring-sqlite');

const insertLinkEdges = async function (db, rows) {
  let sql =
  `INSERT OR REPLACE INTO link_graph_table (link_from, link_to, link_type, link_ttl, iteration) VALUES` +
    rows.map(row => SqlString.format(
      `(?, ?, ?, ?, ?)`, row)).join(', ');
  return await db.exec(sql);
}

const insertLinkEdge = async function (db, from, to, type, ttl, iteration) {
  let sql = SqlString.format(
    `INSERT OR REPLACE INTO link_graph_table (link_from, link_to, link_type, link_ttl, iteration) VALUES
    (?, ?, ?, ?, ?)`, [from, to, type, ttl, iteration]);
  return await db.exec(sql);
}

const mainTraverseLinkGraph = async function ()
{
  initDotEnv();
  let db = await initSqlite(`tmp/database-link-${new Date().toISOString()}.db`);
  let iterationTime = new Date();
  let wiki = 'enwiki';
  let seed = [
    "2020 Democratic Party presidential debates",
    "2020 North Dakota elections",
    "2020 California elections",
    "Political positions of the 2020 Democratic Party presidential primary candidates",
    "2020 Democratic Party vice presidential candidate selection",
    "Jo Jorgensen 2020 presidential campaign",
    "Minnesota 2020",
    "Results of the 2020 Democratic Party presidential primaries",
    "2020 Constitution Party presidential primaries",
    "2020 Arizona elections",
    "2020 United States House of Representatives election ratings",
    "2020 Oregon state elections",
    "Opinion polling for the 2020 Republican Party presidential primaries",
    "2020 Democratic Party presidential forums",
    "News media endorsements in the 2020 United States presidential primaries",
    "Nationwide opinion polling for the 2020 United States presidential election",
    "Trump v. NAACP (DACA)",
    "2020 Green Party presidential primaries",
    "2020 Virginia Republican presidential primary",
    "2020 Wisconsin elections",
    "Arizona Republican primary, 2020",
    "2020 Republican Party presidential primaries",
    "2020 South Carolina Republican primary",
    "2020 Libertarian Party presidential primaries",
    "Trump v. Deutsche Bank AG",
    "Chiafalo v. Washington",
    "George Floyd protests in New Jersey",
    "2020 United Nations Security Council election",
    "Donald Trump presidential campaign, 2020",
    "John Delaney 2020 presidential campaign",
    "Andrew Yang 2020 presidential campaign",
    "Bill Weld 2020 presidential campaign",
    "Tulsi Gabbard 2020 presidential campaign",
    "Kamala Harris 2020 presidential campaign",
    "Cory Booker 2020 presidential campaign",
    "Marianne Williamson 2020 presidential campaign",
    "Elizabeth Warren 2020 presidential campaign",
    "Bernie Sanders Presidential Campaign, 2020",
    "Jay Inslee 2020 presidential campaign",
    "Beto O'Rourke 2020 presidential campaign",
    "Mike Gravel 2020 presidential campaign",
    "Joe Biden 2020 presidential campaign",
    "Trump v. Mazars USA, LLP",
    "Joe Walsh 2020 presidential campaign",
    "Impeachment of Donald Trump",
    "Impeachment trial of Donald Trump",
    "2020 Democratic Party presidential primaries",
    "2020 Iowa Republican caucuses",
    "2020 Iowa Democratic presidential caucuses",
    "2020 Minnesota House of Representatives District 60A special election",
    "2020 New Hampshire Democratic presidential primary",
    "2020 New Hampshire Republican presidential primary",
    "2020 Nevada Democratic presidential caucuses",
    "2020 South Carolina Democratic presidential primary",
    "2020 California Democratic presidential primary",
    "2020 Utah Republican primary",
    "2020 North Carolina Republican primary",
    "2020 Alabama Republican primary",
    "2020 Alabama Democratic presidential primary",
    "2020 Vermont Democratic presidential primary",
    "2020 Tennessee Democratic presidential primary",
    "2020 Arkansas Republican primary",
    "2020 Colorado Democratic presidential primary",
    "2020 Oklahoma Republican presidential primary",
    "2020 Texas Democratic presidential primary",
    "2020 Oklahoma Democratic presidential primary",
    "2020 Maine Republican presidential primary",
    "2020 Texas Republican primary",
    "2020 North Carolina Democratic presidential primary",
    "2020 Massachusetts Republican presidential primary",
    "2020 Democrats Abroad presidential primary",
    "2020 Massachusetts Republican primary",
    "2020 Arkansas Democratic presidential primary",
    "2020 Tennessee Republican primary",
    "2020 Massachusetts Democratic presidential primary",
    "2020 Minnesota Democratic primary",
    "2020 Maine Democratic presidential primary",
    "2020 Utah Democratic presidential primary",
    "2020 Virginia Democratic presidential primary",
    "2020 California Republican primary",
    "2020 Colorado Republican primary",
    "2020 Idaho Republican primary",
    "2020 Washington Republican presidential primary",
    "2020 North Dakota Democratic presidential caucuses",
    "2020 Washington Democratic presidential primary",
    "2020 Idaho Democratic presidential primary",
    "2020 Michigan Republican primary",
    "2020 Hawaii Republican caucuses",
    "2020 Michigan Democratic presidential primary",
    "2020 Missouri Republican primary",
    "2020 Mississippi Republican primary",
    "2020 Mississippi Democratic presidential primary",
    "2020 Missouri Democratic presidential primary",
    "2020 Illinois Republican primary",
    "2020 Illinois Democratic presidential primary",
    "2020 Florida Republican primary",
    "2020 Arizona Democratic presidential primary",
    "2020 Florida Democratic presidential primary",
    "2020 Wisconsin Democratic presidential primary",
    "2020 Wisconsin Republican presidential primary",
    "2020 Alaska Democratic presidential primary",
    "2020 Wyoming Democratic presidential caucuses",
    "2020 Ohio Republican presidential primary",
    "New York Republican primary, 2020",
    "2020 Ohio Democratic presidential primary",
    "2020 Maryland's 7th congressional district special election",
    "2020 Kansas Democratic presidential primary",
    "2020 Nebraska Democratic presidential primary",
    "2020 Wisconsin's 7th congressional district special election",
    "2020 Oregon Democratic presidential primary",
    "2020 Oregon Republican primary",
    "2020 Libertarian National Convention",
    "2020 Hawaii Democratic presidential primary",
    "Donald Trump photo op at St. John's Church",
    "2020 Indiana Republican primary",
    "2020 Montana Democratic presidential primary",
    "2020 Montana Republican primary",
    "2020 South Dakota Democratic presidential primary",
    "2020 Maryland Democratic presidential primary",
    "Rhode Island Republican primary, 2020",
    "2020 District of Columbia Democratic presidential primary",
    "2020 Indiana Democratic presidential primary",
    "2020 Rhode Island Democratic presidential primary",
    "2020 South Dakota Republican primary",
    "2020 New Mexico Republican primary",
    "2020 New Mexico Democratic presidential primary",
    "2020 District of Columbia Republican primary",
    "Buffalo police shoving incident",
    "2020 West Virginia Democratic presidential primary",
    "2020 Georgia Republican presidential primary",
    "2020 Georgia Democratic presidential primary",
    "2020 Trump Tulsa rally",
    "2020 New York Democratic presidential primary",
    "2020 Kentucky Republican primary",
    "2020 New York's 27th congressional district special election",
    "2020 Kentucky Democratic presidential primary",
    "2020 Salute to America",
    "New Jersey Republican primary, 2020",
    "2020 New Jersey Democratic presidential primary",
    "2020 Delaware Democratic presidential primary",
    "2020 Delaware Republican primary",
    "2020 Green National Convention",
    "2020 Louisiana Democratic presidential primary",
    "2020 Louisiana Republican primary",
    "2020 Connecticut Republican primary",
    "2020 Connecticut Democratic presidential primary",
    "2020 Democratic National Convention",
    "2020 Republican National Convention",
    "2020 United States Senate election in New Mexico",
    "2020 United States Senate election in West Virginia",
    "2020 United States House of Representatives elections in Arkansas",
    "2020 United States House of Representatives election in Alaska",
    "2020 United States House of Representatives elections in Connecticut",
    "2020 United States House of Representatives elections in California",
    "2020 United States Senate election in Arkansas",
    "2020 United States presidential election in Oregon",
    "2020 United States House of Representatives elections in South Carolina",
    "2020 United States Senate election in Illinois",
    "United States Presidential election, 2020",
    "2020 United States presidential election in Missouri",
    "2020 United States House of Representatives elections in Pennsylvania",
    "2020 United States Senate election in Virginia",
    "2020 United States Senate election in Mississippi",
    "2020 United States House of Representatives elections in Georgia",
    "2020 United States Senate election in New Jersey",
    "2020 United States Senate election in South Dakota",
    "2020 United States House of Representatives elections in Florida",
    "2020 United States House of Representatives elections in New Hampshire",
    "2020 United States Senate election in Colorado",
    "2020 United States House of Representatives election in Montana",
    "2020 United States House of Representatives elections in New York",
    "2020 Texas State Senate election",
    "2020 United States House of Representatives elections in Colorado",
    "2020 United States House of Representatives elections in Mississippi",
    "2020 United States House of Representatives elections in Oklahoma",
    "2020 United States Senate election in Idaho",
    "2020 United States presidential election in Iowa",
    "2020 United States Senate election in Wyoming",
    "2020 Florida House of Representatives election",
    "2020 United States presidential election in Montana",
    "2020 United States House of Representatives election in Vermont",
    "2020 United States presidential election in Wisconsin",
    "2020 United States House of Representatives election in Delaware",
    "2020 United States Senate election in Montana",
    "2020 United States presidential election in Arizona",
    "2020 United States House of Representatives elections in New Jersey",
    "2020 United States Senate election in Nebraska",
    "2020 United States House of Representatives elections in Kentucky",
    "2020 United States presidential election in Pennsylvania",
    "2020 United States Senate special election in Georgia",
    "2020 United States House of Representatives elections in Illinois",
    "2020 United States presidential election in Michigan",
    "2020 United States presidential election in Georgia",
    "2020 United States presidential election in Delaware",
    "2020 United States presidential election in Ohio",
    "2020 North Carolina Attorney General election",
    "United States House of Representatives elections, 2020",
    "2020 United States Senate election in Alaska",
    "2020 United States House of Representatives elections in Utah",
    "2020 United States Senate election in Kentucky",
    "2020 Pennsylvania House of Representatives election",
    "2020 United States House of Representatives elections in Ohio",
    "2020 Oregon State Treasurer election",
    "2020 United States presidential election in Virginia",
    "2020 United States presidential election in North Carolina",
    "2020 United States House of Representatives elections in Iowa",
    "2020 United States House of Representatives elections in Missouri",
    "2020 United States House of Representatives elections in Tennessee",
    "2020 United States Senate special election in Arizona",
    "2020 United States House of Representatives elections in Alabama",
    "2020 United States Senate election in Maine",
    "2020 United States House of Representatives elections in West Virginia",
    "2020 United States House of Representatives elections in Kansas",
    "2020 United States House of Representatives elections in Michigan",
    "2020 United States presidential election in West Virginia",
    "2020 United States Senate election in Georgia",
    "2020 United States House of Representatives elections in Louisiana",
    "2020 United States House of Representatives elections in Maine",
    "2020 California State Assembly election",
    "2020 United States presidential election in Indiana",
    "2020 United States Senate election in Minnesota",
    "2020 United States House of Representatives elections in Maryland",
    "2020 United States presidential election in Colorado",
    "2020 United States Senate election in Michigan",
    "2020 United States Senate election in New Hampshire",
    "2020 United States Senate election in Louisiana",
    "2020 United States Senate election in Oregon",
    "2020 United States House of Representatives elections in Massachusetts",
    "2020 United States Senate election in Tennessee",
    "2020 United States Senate election in Iowa",
    "United States Senate elections, 2020",
    "2020 Florida Senate election",
    "2020 Ohio Senate election",
    "2020 United States presidential election in Utah",
    "2020 United States presidential election in Maryland",
    "2020 United States Senate election in Delaware",
    "2020 United States House of Representatives elections in Texas",
    "2020 United States presidential election in Washington",
    "2020 United States presidential election in New Hampshire",
    "2020 United States presidential election in Kansas",
    "2020 United States House of Representatives elections in Oregon",
    "2020 United States Senate election in Oklahoma",
    "2020 United States House of Representatives elections in Nebraska",
    "2020 United States House of Representatives elections in Virginia",
    "2020 United States Senate election in South Carolina",
    "2020 United States House of Representatives elections in Washington",
    "South Dakota Initiated Measure 26",
    "2020 United States Senate election in Alabama",
    "2020 United States House of Representatives elections in Hawaii",
    "2020 United States presidential election in Nevada",
    "2020 United States presidential election in Minnesota",
    "2020 United States House of Representatives elections in Wisconsin",
    "2020 United States presidential election in Florida",
    "2020 United States presidential election in Texas",
    "2020 United States presidential election in Kentucky",
    "2020 United States presidential election in Nebraska",
    "2020 United States House of Representatives elections in New Mexico",
    "2020 United States House of Representatives elections in Nevada",
    "United States Presidential election, 2020",
    "2020 United States House of Representatives elections in North Carolina",
    "2020 United States Senate election in North Carolina",
    "2020 United States presidential election in Maine",
    "2020 United States House of Representatives elections in Arizona",
    "2020 United States general election",
    "Presidential election in Alabama, 2020",
    "2020 United States Senate election in Kansas",
    "2020 United States House of Representatives elections in Minnesota",
    "2020 United States Senate election in Rhode Island",
    "2020 United States presidential election in Alaska",
    "2020 United States presidential election in New Mexico",
    "2020 United States Senate election in Texas",
    "2020 California State Senate election",
    "2020 United States presidential election in Mississippi",
    "2020 United States Senate election in Massachusetts",
    "2020 United States presidential election in California",
    "2020 Missouri Attorney General election",
    "2020 United States presidential election in South Carolina",
    "2020 United States presidential election in Hawaii"
  ];

  let exclusions = [
  ];
  let started = new Date();
  let crawled = new Set();
  let stored = new Set();
  const HOP_LIMIT = 2;
  let toCrawl = [];
  toCrawl.push(...seed.map(article => [article, HOP_LIMIT]));

  await Promise.all(seed.map(async a => insertLinkEdge(db, '', a, 'seed', HOP_LIMIT, iterationTime)));
  seed.forEach(article => stored.add(article));
  while (toCrawl.length > 0) {
    console.log(`${(new Date().getTime() - started.getTime())/1000}s crawled ${crawled.size} pages, ${toCrawl.length} left to crawl, stored ${stored.size}, stored/craweld = ${Math.floor(stored.size / crawled.size)}, toCrawl/crawled = ${Math.floor(toCrawl.length/crawled.size)}, time per crawl = ${(new Date().getTime() - started.getTime())/1000/crawled.size}s, ETA ${Math.floor(toCrawl.length * ((new Date().getTime() - started.getTime())/1000/crawled.size)/60)}min`);
    let curr = toCrawl.shift();
    let article = curr[0];
    let ttl = curr[1];
    if (crawled.has(article)) {
      console.log(`Skipping already crawled ${article}`);
      continue;
    }
    else {

      if (exclusions.indexOf(article) >=0) continue;
      console.log(`Crawling article="${article}" at ttl=${ttl}...`);
      let fetchAt = new Date();
      let result = (await MwActionApiClient.getLinkChildren(wiki, article));
      console.log(`MwAPI delay = ${(new Date().getTime() - fetchAt.getTime())/1000}s`);
      let storedAt = new Date();
      if (ttl >= 1) {
        let rowsToStore = [];
        for (let i =0;i<result.length;i++) {
          let child = result[i];
          if (stored.has(child)) continue; // already visited;
          else if (exclusions.indexOf(child) >= 0) continue; // need to exclude
          stored.add(child);
          if (ttl-1 >= 1) toCrawl.push([child, ttl-1]);
            // console.log(`Enqueueing ${child} to crawl.`);
          rowsToStore.push([article, child, 'link', ttl-1, iterationTime]);
        }
        if (rowsToStore.length) await insertLinkEdges(db, rowsToStore);
        else console.log(`Skipping children of ${article}, because no rows to commit`);
      }
      crawled.add(article);
      console.log(`Storage delay = ${(new Date().getTime() - storedAt.getTime())/1000}s`);
    }
  }
}

mainTraverseLinkGraph().then(() => {
  console.log(`CMD Done!`);
  process.exit(0);
});

