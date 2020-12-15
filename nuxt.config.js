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
const locales = require('./i18n/getlocales');
require('dotenv').config();

console.log('=================================');
console.log('nuxt.config.js is being executed!');
module.exports = {
  mode: 'spa', // TODO change back to spa once we fix the client-side-render and server-side-render inconsistency
  telemetry: false,
  components: true, // used in nuxt storybook
  /*
   ** Headers of the page
   */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, shrink-to-fit=no',
      },
      { hid: 'description', name: 'description', content: pkg.description },
      { uptimerobot_verify_uuid: '89d70f81-d069-43cf-ad7f-b932f7e3a24b' }, // a random uuid for verification purpose
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href:
          'https://www.mediawiki.org/w/load.php?modules=mediawiki.legacy.shared|mediawiki.diff.styles&only=styles',
      },
      {
        rel: 'stylesheet',
        href: 'https://use.fontawesome.com/releases/v5.13.0/css/all.css',
        crossorigin: 'anonymous',
      },
      { rel: 'preconnect', href: 'http://https://fonts.gstatic.com' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css2?family=Noto+Sans&family=Open+Sans&family=Roboto&display=swap',
      },
    ],
    script: [
      {
        src: 'https://code.jquery.com/jquery-3.3.1.min.js',
        type: 'text/javascript',
      },
    ],
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
    '@/plugins/timeago.js',
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
    [
      '@nuxtjs/google-analytics',
      {
        asyncID(ctx) {
          return ctx.app.$env?.GA_WLBF_ID_CLIENT;
        },
      },
    ],
    ['cookie-universal-nuxt', { alias: 'cookiez' }],
    [
      'nuxt-env',
      {
        keys: [
          'HOST',
          'PORT',
          'GA_WLBF_ID_CLIENT',
          'MIXER_RAMP_UP_PERCENT',
          'CROSS_EDIT_CHECK',
        ],
      },
    ],
    [
      'nuxt-i18n',
      {
        locales: Object.keys(locales),
        defaultLocale: 'en',
        vueI18n: {
          fallbackLocale: 'en',
          messages: {
            ...locales,
          },
        },
      },
    ],
  ],
  /*
   ** Axios module configuration
   */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    credentials: true,
  },

  bootstrapVue: {
    config: {
      bootstrapCSS: false, // Or `css: false`
      bootstrapVueCSS: false, // Or `bvCSS: false`
    },
  },
  /*
   ** Build configuration
   */
  build: {
    vendor: ['socket.io-client'],
    babel: {
      // envName: server, client, modern
      presets({ envName }) {
        return [
          [
            '@nuxt/babel-preset-app',
            {
              corejs: { version: 3 },
            },
          ],
        ];
      },
    },
  },
  buildModules: ['@nuxt/typescript-build'],
  storybook: {
    parameters: {
      layout: 'fullscreen',
      chromatic: {
        viewports: [
          320,
          // 375, 428,
          768, 
          // 1024, 1280,
          1800,
        ],
      },
      backgrounds: {
        default: 'gray',
        values: [
          { name: 'white', value: '#ffffff' },
          { name: 'gray', value: '#aaaaaa' },
        ],
      },
    },
  },
};

console.log('nuxt.config.js is done executed!');
console.log('=================================');
