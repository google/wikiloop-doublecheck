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
    // af: require('date-fns/locale/af'), Afrikaan is not supported by date-fns
    de: require('date-fns/locale/de'),
    en: require('date-fns/locale/en'),
    fr: require('date-fns/locale/fr'),
    id: require('date-fns/locale/id'),
    pl: require('date-fns/locale/pl'),
    ru: require('date-fns/locale/ru'),
    tr: require('date-fns/locale/tr'),
    zh: require('date-fns/locale/zh_cn'),
    // lv: require('date-fns/locale/lv'), NOT SUPPORTED by DEP yet
  }
})
