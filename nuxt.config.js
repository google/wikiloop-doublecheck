const pkg = require('./package');
require(`dotenv`).config();

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
      { hid: 'description', name: 'description', content: pkg.description }
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
      id: process.env.GA_ID
    }],
    {
      src: 'nuxt-universal-cookies',
      options: {}
    }
  ],
  /*
   ** Axios module configuration
   */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  bootstrapVue: {
    config: {
      // Custom config options here
      "enable-gradients": true,
      "enable-transitions": true
    }
  },

  /*
   ** Build configuration
   */
  build: {
    vendor: ['socket.io-client']
  }
};
