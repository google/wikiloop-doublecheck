// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const pkg = require('./package');
require(`dotenv`).config();

console.log(`=================================`);
console.log(`nuxt.config.js is being executed!`);
module.exports = {
  mode: 'universal',

  /*
   ** Headers of the page
   */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description },
      { uptimerobot_verify_uuid: '89d70f81-d069-43cf-ad7f-b932f7e3a24b'}, // a random uuid for verification purpose
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://www.mediawiki.org/w/load.php?modules=mediawiki.legacy.shared|mediawiki.diff.styles&only=styles' },
      { rel: 'stylesheet', href: 'https://use.fontawesome.com/releases/v5.8.1/css/all.css', integrity: 'sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf', crossorigin: 'anonymouse' }
    ],
    script: [
      {
        src: "https://code.jquery.com/jquery-3.3.1.min.js",
        type: "text/javascript"
      }
    ]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },

  /*
   ** Global CSS
   */
  css: [],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '@/plugins/axios.js',
    '@/plugins/socket.io.js',
    '@/plugins/timeago.js'
  ],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    // Doc: https://bootstrap-vue.js.org/docs/
    'bootstrap-vue/nuxt',
    '@nuxtjs/pwa',
    ['@nuxtjs/google-analytics', {
      asyncID: function (ctx) {
        return ctx.app.$env.GA_ID;
      }
    }],
    ['cookie-universal-nuxt', { alias: 'cookiez' }],
    ['nuxt-env', {
      keys: [
        'HOST',
        'PORT',
        'GA_ID'
      ]
    }],
    [
      'nuxt-i18n',
      {
        locales: ['en', 'zh', 'fr', 'de'],
        defaultLocale: 'en',
        vueI18n: {
          fallbackLocale: 'en',
          messages: {
            en: {
              LoginMenuItem: "Login",
              LogoutMenuItem: "Logout",
              ContributionsMenuItem: "Contributions",
              Anonymous: "Anonymous",
              Me: "Me",
              Someone: "Someone",
              EditSummaryLabel: "Edit summary",
              LooksGoodBtnLabel: "Looks good",
              NotSureBtnLabel: "Not sure",
              ShouldRevertBtnLabel: "Should revert",
              NextBtnLabel: "Next",
              Loading: "Loading",
              EditedTimeLabel: "edited"
            },
            zh: {
              LoginMenuItem: "登录",
              LogoutMenuItem: "登出",
              ContributionsMenuItem: "贡献",
              Anonymous: "游客",
              Me: "我",
              Someone: "别人",
              EditSummaryLabel: "编辑摘要",
              LooksGoodBtnLabel: "看着不错",
              NotSureBtnLabel: "不确定",
              ShouldRevertBtnLabel: "应该撤回",
              Loading: "读取中",
              EditedTimeLabel: "编辑于"
            },
            fr: {
              LoginMenuItem: "Connexion",
              LogoutMenuItem: "Déconnexion",
              ContributionsMenuItem: "Contributions",
              Anonymous: "Anonyme",
              Me: "Moi",
              Someone: "Quelqu'un",
              EditSummaryLabel: "Modifier le résumé",
              LooksGoodBtnLabel: "Cela semble bon",
              NotSureBtnLabel: "Pas sûr",
              ShouldRevertBtnLabel: "Devrait revenir",
              NextBtnLabel: "Suivant",
              Loading: "Chargement",
              EditedTimeLabel: "édité"
            },
            de: {
              LoginMenuItem: "Anmelden",
              LogoutMenuItem: "Abmelden",
              ContributionsMenuItem: "Beiträge",
              Anonymous: "Anonym",
              Me: "Ich",
              Someone: "Jemand",
              EditSummaryLabel: "Zusammenfassung bearbeiten",
              LooksGoodBtnLabel: "Sieht gut aus",
              NotSureBtnLabel: "Nicht sicher",
              ShouldRevertBtnLabel: "Sollte zurücksetzen",
              NextBtnLabel: "Nächste",
              Loading: "Beladung",
              EditedTimeLabel: "Bearbeitet"
            }
          }
        }
      }
    ]

  ],
  /*
   ** Axios module configuration
   */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    credentials: true
  },

  bootstrapVue: {
    config: {
      // Custom config options here
    }
  },
  /*
   ** Build configuration
   */
  build: {
    vendor: ['socket.io-client']
  }
};

console.log(`nuxt.config.js is done executed!`);
console.log(`=================================`);
