const express = require('express');
const app = express();
const rp = require(`request-promise`);
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
app.use(cookieParser());
app.use(bodyParser());

const asyncHandler = fn => (req, res, next) =>
  Promise
    .resolve(fn(req, res, next))
    .catch(next);

app.get('/', (req, res, next) => {
  res.send('API root')
});

app.get('/diff', asyncHandler(async (req, res) => {
  console.log(`req.query`, req.query);
  let diffApiUrl = `${req.query.serverUrl}/w/api.php?action=compare&fromrev=${req.query.revId}&torelative=prev&format=json`;
  let diffJson = await rp.get(diffApiUrl, { json: true });
  res.send(diffJson);
}));

app.post('/interaction', asyncHandler(async (req, res) => {
  console.log(`Interaction req`, req.cookies, req.body);
  const MongoClient = require('mongodb').MongoClient;
  // Use connect method to connect to the Server
  let db = (await MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true }))
    .db(process.env.MONGODB_DB);
  let userGaId = req.body.gaId;
  let recentChange = req.body.recentChange;
  await db.collection(`Interaction`).insertOne({
    userGaId: userGaId,
    judgement: req.body.judgement,
    recentChange: {
      id: recentChange.id,
      namespace: recentChange.namespace,
      ores: recentChange.ores,
      revision: recentChange.revision,
      timestamp: recentChange.timestamp,
      title: recentChange.title,
      type: recentChange.type,
      uri: recentChange.meta.uri,
      user: recentChange.user,
      wiki: recentChange.wiki
    }
  });
  res.send(`ok`);
}));

// export the server middleware
module.exports = {
  path: '/api',
  handler: app
};
