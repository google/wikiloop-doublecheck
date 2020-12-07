const fs = require('fs');
const yaml = require('js-yaml');

const localesDir = './i18n/locales/';
const files = fs.readdirSync(localesDir);

const localeObjs = {};

files.filter((file) => /\.yml$/.test(file)).forEach((file) => {
  const locale = file.split('.')[0];
  console.log(`Loading locale file ${file}, as ${locale}`);
  const fileContents = fs.readFileSync(`${localesDir}/${file}`, 'utf8');
  const localeObj = yaml.safeLoad(fileContents);
  localeObjs[locale] = localeObj;
});

module.exports = localeObjs;
