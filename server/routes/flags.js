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

const { useOauth, isEmpty } = require('../common');

const useStiki = !isEmpty(process.env.STIKI_MYSQL);

module.exports = {
    flags: async (req, res) => {
        res.send({
            flagDEBUGXXX: "debug 111",
            useStiki: useStiki,
            useOauth: useOauth,
            useDirectRevert: process.env.DIRECT_REVERT === '1'
        });
        req.visitor
            .event({ec: "api", ea: "/"})
            .send();
    }
};
