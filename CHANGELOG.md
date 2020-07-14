# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.1.0](https://github.com/google/wikiloop-doublecheck/compare/v4.0.1...v4.1.0) (2020-07-07)


### Features

* **chart:** add chart and stats api for timeseries, not connected yet ([10b6967](https://github.com/google/wikiloop-doublecheck/commit/10b6967b6e95519923d33fd634f47d4dc096bc3c))
* **chart:** allow query granularity by week ([0cfaec6](https://github.com/google/wikiloop-doublecheck/commit/0cfaec6ad67de3c1926beec10ea6c5089c849678))
* **chart:** allow using url query to change breakdown ([45fad91](https://github.com/google/wikiloop-doublecheck/commit/45fad91d90fe78f3428f09dfa80d30ba6f704c45))
* **chart:** connect the stats with UI ([8b754db](https://github.com/google/wikiloop-doublecheck/commit/8b754dbeed6ac7191c0a4cd65267d64c912f0739))
* **chart:** improve breakdown feature. ([2c0f16d](https://github.com/google/wikiloop-doublecheck/commit/2c0f16d073b0d2d13f8f270d4ac9ab78b7456495))
* **chart:** move component to chart page. ([203eb82](https://github.com/google/wikiloop-doublecheck/commit/203eb824ebb6a66970286f7b57aca20e6e6539f4))
* **chart:** start a timeseries barchart and loading indictor ([05cc800](https://github.com/google/wikiloop-doublecheck/commit/05cc80030e667520a70a2c0d0551ed3a5a15deb9))
* **chart:** support the feature to filter by WikiUserName and wiki. ([60e7b91](https://github.com/google/wikiloop-doublecheck/commit/60e7b918eb431ea965f9105c87fd43d62a801515))
* **cmd:** create a notification cmd. ([71cd558](https://github.com/google/wikiloop-doublecheck/commit/71cd5580acefa853ed4da3fa40e1e56112d41665))
* **feed:** change lastbad feed to query mediawiki directly ([3fd7211](https://github.com/google/wikiloop-doublecheck/commit/3fd721101e47afa2d68e786aa343eec82eb60f85))
* **i18n:** add a few descriptions to longer messages. ([6b10066](https://github.com/google/wikiloop-doublecheck/commit/6b1006629b53bd2e0bd5302c2f9c4ef4591cc754))
* **i18n:** add a few i18n strings. A few left. ([4aa47b9](https://github.com/google/wikiloop-doublecheck/commit/4aa47b9b113a1372e793a0e6c0ed7939771f971c))
* **i18n:** add a few more UI strings. ([51925c0](https://github.com/google/wikiloop-doublecheck/commit/51925c0022465c412abff4ad63a107e79dee45ac))
* **i18n:** add back all languages, and use machine translation to fill in some missing strings. ([25f6d6f](https://github.com/google/wikiloop-doublecheck/commit/25f6d6fedc3e1808da9165d4eb0db90070cc0b07))
* **i18n:** add bg, ca, es, it, ko, nl, th languages. ([8227599](https://github.com/google/wikiloop-doublecheck/commit/8227599fb905a4baa5e3c5a484c5f61ad51d1406))
* **i18n:** add explanation to all labels and short messages. ([07a72cb](https://github.com/google/wikiloop-doublecheck/commit/07a72cb0942b73761aed500a3c9623d80bc75d88))
* **i18n:** add iso-639-1 to generate native text for a langauge ([5023dee](https://github.com/google/wikiloop-doublecheck/commit/5023dee05191a4ab06ab2bc7218058634bde69f8))
* **i18n:** add ja and he support. ([48c2664](https://github.com/google/wikiloop-doublecheck/commit/48c26641b3caffcfc1c3a44a3a4e428704b42b0e))
* **i18n:** add language support for ar,cs,fa,sv,uk with machine translation. ([6f938af](https://github.com/google/wikiloop-doublecheck/commit/6f938af6cbfbf4af59e4af2a6709a2c28808b9de))
* **i18n:** add metadata descriptions in their translated version. ([b9cd28f](https://github.com/google/wikiloop-doublecheck/commit/b9cd28fe4f70273d6868648d0587d259ffa5e8d9))
* **i18n:** added a few ui strings ([48a8c2b](https://github.com/google/wikiloop-doublecheck/commit/48a8c2b00c763a9da21a9a610e3b97dbac22cf2c))
* **i18n:** defined the metadata format for i18n and added readme. ([c48e75e](https://github.com/google/wikiloop-doublecheck/commit/c48e75e11b7ef49d0ad7cc4d4d64e56242f2b9e3))
* **i18n:** expand localized date in all lanugages that current date-fns support. re: [#268](https://github.com/google/wikiloop-doublecheck/issues/268) ([15480b2](https://github.com/google/wikiloop-doublecheck/commit/15480b2609a16155bdc95f04940f0381b2f64994))
* **i18n:** improve help translate links. ([ba948d3](https://github.com/google/wikiloop-doublecheck/commit/ba948d3646b53c3fa2dc5b9a3eb0a0242c22d5d4))
* **i18n:** mega extract ui strings into i18n strings. ([f74c29b](https://github.com/google/wikiloop-doublecheck/commit/f74c29b1ae1b0fe270eece046ed04989b82b31e5))
* **i18n:** migrate to Yml to support i18n-ally. ([92538e1](https://github.com/google/wikiloop-doublecheck/commit/92538e1782c667d9cb69e2e4a638c2889a47c9db))
* **i18n:** normalize locale message id format and add 3 few more UI strings. ([4260bd8](https://github.com/google/wikiloop-doublecheck/commit/4260bd859f374852cb07d087fb04fec0b3703dda))
* **i18n:** print out working locale languages for iso-639-1 native names. ([89ffe99](https://github.com/google/wikiloop-doublecheck/commit/89ffe993141776d5b9605112435c5557314e8edc))
* **i18n:** support adding new UI strings in batch mode. ([b9aa3fc](https://github.com/google/wikiloop-doublecheck/commit/b9aa3fc83b147bb3a01c977acd6affce28a640ea))
* **i18n:** support forced Update, support [@translated](https://github.com/translated)At, [@translator](https://github.com/translator) and [@is](https://github.com/is)MachineTranslated. ([d8934ba](https://github.com/google/wikiloop-doublecheck/commit/d8934bab41f92e3f32d251045921a0238b597ea3))
* **i18n:** translated zh strings ([ea36f91](https://github.com/google/wikiloop-doublecheck/commit/ea36f91b790839a650094ae67744cfc8b965911f))
* **i18n:** update with Andrei Goriachev's contribution for Russian (ru), Ted Hardie's contribution for Portugese (pt). ([5700dbe](https://github.com/google/wikiloop-doublecheck/commit/5700dbe128f17f896712e230105abc568423f0eb))
* **notice:** add a simple banner with content promoting name change vote. ([03b5f16](https://github.com/google/wikiloop-doublecheck/commit/03b5f16c6c904dddcc7b19b6027ceefa40a59a2f))
* **stiki:** avoid connecting to STIKI if no mysql url ([14cc29b](https://github.com/google/wikiloop-doublecheck/commit/14cc29b5f8e473939108d211fe656389ff62e369)), closes [#272](https://github.com/google/wikiloop-doublecheck/issues/272)


### Bug Fixes

* **i18n:** fix the ui strings to conform naming convention. ([d85453d](https://github.com/google/wikiloop-doublecheck/commit/d85453d841ab9041826eae322349664f2cc5fce5))
* added v-bind where raw variable names where getting leaked ([#283](https://github.com/google/wikiloop-doublecheck/issues/283)) ([3c8af18](https://github.com/google/wikiloop-doublecheck/commit/3c8af18dfeacfe33d03a1048c293e6886644cf24))
* **i18n:** fix bug ([9407434](https://github.com/google/wikiloop-doublecheck/commit/940743446664d19da3f92c09c8674900bdf75e9d))
* breakage ([86faab6](https://github.com/google/wikiloop-doublecheck/commit/86faab625b11148d35ef3b55d3dea295f61adfea))
* fix a bug causing the anonymous user to not loading index. ([f31adc9](https://github.com/google/wikiloop-doublecheck/commit/f31adc96e8281bcabc30e9e608ccb557ad62628e))
* fix user missing bug caused by query. ([f2f829a](https://github.com/google/wikiloop-doublecheck/commit/f2f829ab18b011bf06b2f411964a87dc10f2a600))
* removed extraneous `}` in empty edit summary field ([#270](https://github.com/google/wikiloop-doublecheck/issues/270)) ([5605435](https://github.com/google/wikiloop-doublecheck/commit/56054352027a018286086be782353adc4c9834e6)), closes [#269](https://github.com/google/wikiloop-doublecheck/issues/269)
* **avatar:** size of avatar ([868a691](https://github.com/google/wikiloop-doublecheck/commit/868a691249fb99c46b3814c1e5f03d3696746cf7))
* **data:** fix feed data ([0595c5d](https://github.com/google/wikiloop-doublecheck/commit/0595c5de7f08b09f6741c3f2daeecfdd83131a20))
* **feed:** fixes the wikidatawiki in wikitrust feed breakage ([f15685e](https://github.com/google/wikiloop-doublecheck/commit/f15685e056d70cb4c03ced1ab9eeced39bf50c5e)), closes [#265](https://github.com/google/wikiloop-doublecheck/issues/265)

### [4.0.1](https://github.com/google/wikiloop-doublecheck/compare/v2.2.0-beta...v4.0.1) (2020-06-18)
