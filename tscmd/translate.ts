// Usage: npx ts-node -r tsconfig-paths/register tscmd/translate.ts

const fs = require('fs');
const yaml = require('js-yaml');

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

  let source = require(`~/i18n/getlocales`).en;

  async function translateText(texts:string[], target:string) {
    // Translates the text into the target language. "text" can be a string for
    // translating a single piece of text, or an array of strings for translating
    // multiple texts.
    let [translations, data] = await translate.translate(texts, target);
    return translations;
  }
  let targets = ['bg','ca','es','it','ko','nl','th'];

  await Promise.all(targets.map(async target => {
    console.log(`Working on ${target}`);
    let translations:string[] = await translateText(Object.values(source), target);
    let output = {};
    for (let i = 0; i < Object.keys(source).length; i++) {
      let key = Object.keys(source)[i];
      let value = translations[i];
      output[key] = value;
    }

    fs.writeFileSync(`./i18n/locales/${target}.yml`, yaml.safeDump(output), 'utf8');
    console.log(`Done with ${target}`);
  }));

}

translateCmd().then(() => {
  console.log(`CMD Done!`);
  process.exit(0);
});
