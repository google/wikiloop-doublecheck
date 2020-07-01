// const en = require('./en');
// const zh = require('./zh');
const fs = require('fs');
const yaml = require('js-yaml');

let loadYml = function(locale) {
  let fileContents = fs.readFileSync(`./i18n/locales/${locale}.yml`, 'utf8');
  return yaml.safeLoad(fileContents);
};
const en = loadYml('en');
const zh = loadYml('zh');


module.exports = {
  // af,
  // de,
  en,
  // fr,
  // id,
  // lv,
  // pl,
  // pt,
  // ru,
  // tr,
  zh
};
