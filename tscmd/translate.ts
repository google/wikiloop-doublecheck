// Usage: npx ts-node -r tsconfig-paths/register tscmd/translate.ts

const fs = require('fs');
const yaml = require('js-yaml');

const existingLocales = require(`~/i18n/getlocales`);
async function translateCmd() {
  console.log(`Start...`);
  const envPath = process.env.DOTENV_PATH || 'template.env';
  console.log(`DotEnv envPath = `, envPath, ' if you want to change it, restart and set DOTENV_PATH');

  require('dotenv').config({
    path: envPath
  });

  // Imports the Google Cloud client library
  const {Translate} = require('@google-cloud/translate').v2;

  // Creates a client
  const translate = new Translate({
    projectId: `project-wikiloop`,
    keyFilename:'.creds/private-key.json'
  });

  let sourceKeyMsgMap = existingLocales.en;

  async function translateText(texts:string[], target:string) {
    // Translates the text into the target language. "text" can be a string for
    // translating a single piece of text, or an array of strings for translating
    // multiple texts.
    let [translations, data] = await translate.translate(texts, target);
    return translations;
  }

  let targetLangs = Object.keys(existingLocales)
    .concat(['bg','ca','es','it','ko','nl','th']);

  await Promise.all(targetLangs.map(async targetLang => {
    console.log(`Working on ${targetLang}`);
    let targetKeyMsgMap = require(`~/i18n/getlocales`)[targetLang] || {};
    let keyArray = [];
    for (let key in sourceKeyMsgMap) {
      if (sourceKeyMsgMap[key] && !targetKeyMsgMap[key]) {
        keyArray.push(key);
      }
    }
    let translations:string[] = await translateText(keyArray.map(key => sourceKeyMsgMap[key]), targetLang);
    for(let i in keyArray) {
      let key = keyArray[i];
      targetKeyMsgMap[key] = translations[i];
    }

    fs.writeFileSync(`./i18n/locales/${targetLang}.yml`, yaml.safeDump(targetKeyMsgMap), 'utf8');
    console.log(`Done with ${targetLang}`);
  }));

}

translateCmd().then(() => {
  console.log(`CMD Done!`);
  process.exit(0);
});
