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

import { apiLogger } from '../common';
import {wikiToDomain} from "../../shared/utility-shared";
const rp = require('request-promise');

export const mediawiki = async (req, res) => {
  // TODO add sanitize if we see abuse.
  apiLogger.debug('req.params:', req.params);
  apiLogger.debug('req.query:', req.query);
  const fetchUrl = new URL(`http://${wikiToDomain[req.query.wiki]}/w/api.php`);
  let params = JSON.parse(req.query.apiQuery);

  Object.keys(params).forEach(key => {
    fetchUrl.searchParams.set(key, params[key]);
  });
  let retJson = await rp.get(fetchUrl, { json: true });
  res.send(retJson);
  req.visitor
    .event({ ec: "mediawiki", ea: "/" })
    .send();
};
