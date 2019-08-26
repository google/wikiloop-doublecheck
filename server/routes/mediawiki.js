const { apiLogger, getUrlBaseByWiki } = require('../common');
const rp = require('request-promise');

module.exports = async (req, res) => {
  // TODO add sanitize if we see abuse.
  apiLogger.debug('req.params:', req.params);
  apiLogger.debug('req.query:', req.query);
  const fetchUrl = new URL(`${getUrlBaseByWiki(req.query.wiki)}/w/api.php`);
  let params = JSON.parse(req.query.apiQuery);

  Object.keys(params).forEach(key => {
    fetchUrl.searchParams.set(key, params[key]);
  });
  let retJson = await rp.get(fetchUrl, { json: true });
  res.send(retJson);
  req.visitor
    .event({ ec: "mediawiki", ea: "/" })
    .send();
}