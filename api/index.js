const express = require('express');
const app = express();
const rp = require(`request-promise`);
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

// export the server middleware
module.exports = {
  path: '/api',
  handler: app
};
