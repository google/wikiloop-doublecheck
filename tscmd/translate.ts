// Usage: npx ts-node -r tsconfig-paths/register tscmd/translate.ts

const fs = require('fs');
const yaml = require('js-yaml');
const ISO6391 = require('iso-639-1');

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

  let projectId = `project-wikiloop`;

  // Creates a client
  const translate = new Translate({
    projectId,
    keyFilename:'.creds/private-key.json'
  });
  let sourceLang = 'en'
  let sourceKeyMsgMap = existingLocales[sourceLang];

  async function translateText(texts:string[], target:string) {
    // Translates the text into the target language. "text" can be a string for
    // translating a single piece of text, or an array of strings for translating
    // multiple texts.
    let [translations, data] = await translate.translate(texts, target);
    return translations;
  }

  let targetLangs = Object.keys(existingLocales).filter(key => key !== sourceLang);
    // .concat(['ar','fa','uk','cs','sv']); // for new languages to add
  console.log(`Working on langauges of ${targetLangs.map(lang => `${ISO6391.getNativeName(lang)}(${lang})`)}`)
  let forceUpdatedKeys = [

  ];

  let ignoredMetaPostfix = [
    `@translator`,
    `@translatedAt`,
    `@isMachineTranslated`,
  ];

  await Promise.all(targetLangs.map(async targetLang => {
    console.log(`Working on ${targetLang}`);
    let targetKeyMsgMap = require(`~/i18n/getlocales`)[targetLang] || {};
    let keyArray = [];
    for (let key in sourceKeyMsgMap) {
      if (forceUpdatedKeys.indexOf(key) >=0) keyArray.push(key);
      else if (sourceKeyMsgMap[key] && !targetKeyMsgMap[key]) {
        let segments = key.split('.');
        let postfix = segments[segments.length-1];
        if (ignoredMetaPostfix.indexOf(postfix) >= 0) { } // ignore
        else keyArray.push(key);
      }
    }
    let now = new Date();
    if (keyArray.length != 0) {
      let translations:string[] = await translateText(keyArray.map(key => sourceKeyMsgMap[key]), targetLang);
      for(let i in keyArray) {
        let key = keyArray[i];
        targetKeyMsgMap[key] = translations[i];
        if (! (/@meta.@description$/.test(key))) { // if not a @description
          targetKeyMsgMap[`${key}.@meta.@translator`] = `GoogleCloudTranslationAPI ${projectId}`;
          targetKeyMsgMap[`${key}.@meta.@translatedAt`] = now;
          targetKeyMsgMap[`${key}.@meta.@isMachineTranslated`] = true;
        }

      }

      fs.writeFileSync(`./i18n/locales/${targetLang}.yml`, yaml.safeDump(targetKeyMsgMap, { sortKeys: true }), 'utf8');
      console.log(`Done with ${targetLang}`);
    } else {
      console.log(`Skipping lang=${targetLang} because there is no update on sources`);
    }

  }));

}

translateCmd().then(() => {
  console.log(`CMD Done!`);
  process.exit(0);
});
