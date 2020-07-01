const fs = require('fs');
const yaml = require('js-yaml');

const localesDir = `./i18n/locales/`;
let files = fs.readdirSync(localesDir);

const localeObjs = {};

files.filter(file => /\.yml$/.test(file)).forEach(file => {
  let locale = file.split('.')[0];
  console.log(`Loading locale file ${file}, as ${locale}`);
  let fileContents = fs.readFileSync(`${localesDir}/${file}`, 'utf8');
  let localeObj = yaml.safeLoad(fileContents);
  localeObjs[locale] = localeObj
});

module.exports = localeObjs;
