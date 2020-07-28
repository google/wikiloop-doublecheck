// npx ts-node -r tsconfig-paths/register tscmd/mail-usage-report-cmd.ts

import axios from 'axios';
const Bottleneck = require("bottleneck");
let neck = new Bottleneck({
  minTime: 500
});
let numReq = 0;
const userAgent = process.env.USER_AGENT;
const getChildren = async function (entryArticle) {
  if (!/^Category\:.+/.test(entryArticle)) return [];
  let endpoint = `https://en.wikipedia.org/w/api.php`;
  let result = [];
  let params = {
    "action": "query",
    "format": "json",
    "list": "categorymembers",
    "formatversion": "2",
    "cmtitle": entryArticle,
    "cmprop": "ids|type|timestamp|title",
    "cmlimit": "500",
  };
  let ret = null;

  do {
    ret = await neck.schedule(async () =>
    await axios.get(endpoint, {params: params, headers: { 'User-Agent': userAgent }}));
    numReq++;
    if (ret.data?.query?.categorymembers) {
      ret.data.query.categorymembers.forEach(item => console.log(`  ${JSON.stringify(item.title, null, 2)}`));
      result.push(...ret.data.query.categorymembers.map(item => item.title));
      if (ret.data?.continue?.cmcontinue) params['cmcontinue'] = ret.data.continue.cmcontinue;
    } else {
      return result;
    }

  } while (ret.data?.continue?.cmcontinue);
  return result;
}
const traverse = async function (entry) {
  var fs = require('fs')
  let now = new Date();
  let filename = `tmp/visited-${now.getTime()}.txt`;
  var writer = fs.createWriteStream(filename, {
    flags: 'a' // 'a' means appending (old data will be preserved)
  })
  let visited = {};
  let toVisit = [];
  toVisit.push(entry); // enqueue from its tail
  while (toVisit.length > 0) {
    let current = toVisit.shift(); // dequeue from it's head
    if (visited[current]) {
      continue;
    } else {
      visited[current] = 1;
      writer.write(current);
      writer.write('\n');
    }
    console.log(`Current = ${current}`);
    let children = await getChildren(current);
    console.log(`  Children = ${children}`);
    toVisit.push(...(children.filter(item => !visited[item])));
    console.log(`\n\n\n=== Total toVisit ${toVisit.length}, visited = ${Object.keys(visited).length}, numReq=${numReq}`)

  }
  writer.close();
  console.log(`\n\n\nTotal:${Object.keys(visited).length}`);
  console.log(`\n\n\nFor full list, see `, filename);
}

const mainTraverseCategoryTree = async function ()
{
  await traverse("Category:2020_United_States_presidential_election");
}


mainTraverseCategoryTree().then(() => {
  console.log(`CMD Done!`);
  process.exit(0);
});
