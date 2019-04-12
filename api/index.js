const express = require('express');
const app = express();

const asyncHandler = fn => (req, res, next) =>
  Promise
    .resolve(fn(req, res, next))
    .catch(next);


app.get('/', (req, res, next) => {
  res.send('API root')
});

app.get('/diff', asyncHandler(async (req, res) => {
  // let diffApiUrl = `${data.server_url}/w/api.php?action=compare&fromrev=${data.revision.new}&torelative=prev&format=json`;
  //   // let diffJson = await $.get(diffApiUrl, { type: "jsonp" });
  //   // console.log(`XXX diffApiUrl=${diffApiUrl} diff=${data.revision.new}, diff=${diffJson}`, diffJson);
  //   // data.diff = diffJson;

  res.send({
    "compare": {
      "fromid": 15580374,
      "fromrevid": 139992,
      "fromns": 0,
      "fromtitle": "Main Page",
      "toid": 15580374,
      "torevid": 139993,
      "tons": 0,
      "totitle": "Main Page",
      "*": "<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 26:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 26:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>:'''Wikipedias in other languages'''</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>:'''Wikipedias in other languages'''</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">\u2212</td>\n  <td class=\"diff-deletedline\"><div>:[[Non-English Wikipedias|About the non-English Wikipedias]] - [http://af.wikipedia.com/ Afrikaans] - [http://ar.wikipedia.com/ Arabic (Araby)] - [http://eu.wikipedia.com/ Basque (Euskara)] - [http://ca.wikipedia.com/ Catalan (<del class=\"diffchange diffchange-inline\">Catal\u00e0</del>)] - [http://zh.wikipedia.com/ Chinese (Hanyu)] - [http://dk.wikipedia.com/ Danish (Dansk)] - [http://nl.wikipedia.com/ Dutch (Nederlands)] - [http://eo.wikipedia.com/ Esperanto] - [http://fr.wikipedia.com/ French (<del class=\"diffchange diffchange-inline\">Fran\u00e7ais</del>)] - [http://de.wikipedia.com/ German (Deutsch)] - [http://he.wikipedia.com/ Hebrew (Ivrit)] - [http://hu.wikipedia.com/ Hungarian (Magyar)] - [http://it.wikipedia.com/ Italian (Italiano)]  - [http://ja.wikipedia.com/ Japanese (Nihongo)] - [http://no.wikipedia.com/ Norwegian (Norsk)] - [http://pl.wikipedia.com/ Polish (Polska)] - [http://pt.wikipedia.com/ Portuguese (<del class=\"diffchange diffchange-inline\">Portugu\u00eas</del>)] - [http://ru.wikipedia.com/ Russian (Russkiy)] - [http://sh.wikipedia.com/ Serbocroatian (Croatoserbian)] - [http://es.wikipedia.com/ Spanish (Castellano)] - [http://sv.wikipedia.com/ Swedish (Svensk)] </div></td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>:[[Non-English Wikipedias|About the non-English Wikipedias]] - [http://af.wikipedia.com/ Afrikaans] - [http://ar.wikipedia.com/ Arabic (Araby)] - [http://eu.wikipedia.com/ Basque (Euskara)] - [http://ca.wikipedia.com/ Catalan (<ins class=\"diffchange diffchange-inline\">Catal&amp;agrave;</ins>)] - [http://zh.wikipedia.com/ Chinese (Hanyu)] - [http://dk.wikipedia.com/ Danish (Dansk)] - [http://nl.wikipedia.com/ Dutch (Nederlands)] - [http://eo.wikipedia.com/ Esperanto] - [http://fr.wikipedia.com/ French (<ins class=\"diffchange diffchange-inline\">Fran&amp;ccedil;ais</ins>)] - [http://de.wikipedia.com/ German (Deutsch)] - [http://he.wikipedia.com/ Hebrew (Ivrit)] - [http://hu.wikipedia.com/ Hungarian (Magyar)] - [http://it.wikipedia.com/ Italian (Italiano)]  - [http://ja.wikipedia.com/ Japanese (Nihongo)] - [http://no.wikipedia.com/ Norwegian (Norsk)] - [http://pl.wikipedia.com/ Polish (Polska)] - [http://pt.wikipedia.com/ Portuguese (<ins class=\"diffchange diffchange-inline\">Portug&amp;ecirc;s</ins>)] - [http://ru.wikipedia.com/ Russian (Russkiy)] - [http://sh.wikipedia.com/ Serbocroatian (Croatoserbian)] - [http://es.wikipedia.com/ Spanish (Castellano)] - [http://sv.wikipedia.com/ Swedish (Svensk)] </div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>----</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>----</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>:'''Wikipedia'''</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>:'''Wikipedia'''</div></td>\n</tr>\n\n<!-- diff cache key enwiki:diff:wikidiff2:1.12:old-139992:rev-139993:1.7.3:25 -->\n"
    }
  });
}));

// export the server middleware
module.exports = {
  path: '/api',
  handler: app
};
