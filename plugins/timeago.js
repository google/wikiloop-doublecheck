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

import Vue from 'vue';
import VueTimeago from 'vue-timeago';

Vue.use(VueTimeago, {
  name: 'Timeago', // Component name, `Timeago` by default
  locale: 'en', // Default locale
  // We use `date-fns` under the hood
  // So you can use all locales from it
  locales: {
    ar: require('date-fns/locale/ar'),
    be: require('date-fns/locale/be'),
    bg: require('date-fns/locale/bg'),
    ca: require('date-fns/locale/ca'),
    cs: require('date-fns/locale/cs'),
    da: require('date-fns/locale/da'),
    de: require('date-fns/locale/de'),
    el: require('date-fns/locale/el'),
    en: require('date-fns/locale/en'),
    eo: require('date-fns/locale/eo'),
    es: require('date-fns/locale/es'),
    fi: require('date-fns/locale/fi'),
    fil: require('date-fns/locale/fil'),
    fr: require('date-fns/locale/fr'),
    hr: require('date-fns/locale/hr'),
    hu: require('date-fns/locale/hu'),
    id: require('date-fns/locale/id'),
    is: require('date-fns/locale/is'),
    it: require('date-fns/locale/it'),
    ja: require('date-fns/locale/ja'),
    ko: require('date-fns/locale/ko'),
    mk: require('date-fns/locale/mk'),
    nb: require('date-fns/locale/nb'),
    nl: require('date-fns/locale/nl'),
    pl: require('date-fns/locale/pl'),
    pt: require('date-fns/locale/pt'),
    ro: require('date-fns/locale/ro'),
    ru: require('date-fns/locale/ru'),
    sk: require('date-fns/locale/sk'),
    sl: require('date-fns/locale/sl'),
    sr: require('date-fns/locale/sr'),
    sv: require('date-fns/locale/sv'),
    th: require('date-fns/locale/th'),
    tr: require('date-fns/locale/tr'),
    zh: require('date-fns/locale/zh_cn'),
  }
})


