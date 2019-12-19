/**
 * Server side URL Maps, shall be merged with client side `shared/
 * @type {{wikiToDomain: {frwiki: string, enwiki: string, dewiki: string}}}
 */
module.exports = {
  wikiToDomain: {
    "enwiki": "en.wikipedia.org",
    "frwiki": "fr.wikipedia.org",
    "dewiki": "de.wikipedia.org",
    "wikidatawiki": "wikidata.org",
    "zhwiki": "zh.wikipedia.org",
    "trwiki": "tr.wikipedia.org",
  }
};
