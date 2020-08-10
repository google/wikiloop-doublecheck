// Copyright 2019-2020 Google LLC
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


import { logger, asyncHandler } from '@/server/common';
import {useOauth} from '@/server/common';
import { useStiki } from '~/server/common';
const Avatars = require('@dicebear/avatars').default;
const sprites = require('@dicebear/avatars-identicon-sprites').default;
const avatars = new Avatars(sprites, {});

const express = require('express');

export const utilsRouter = express.Router();

const avatar = async (req, res) => {
    logger.debug(`avatar requested with seed`, req.params.seed);
    let svg = avatars.create(req.params.seed);
    res.send(svg);
    req.visitor
        .event({ ec: "api", ea: "/avatar/:seed" })
        .send();
};
// TODO build batch api for avatar until performance is an issue. We have cache anyway should be fine.
utilsRouter.get("/avatar/:seed", asyncHandler(avatar));

const flags = async (req, res) => {
    res.send({
        useStiki: useStiki,
        useOauth: useOauth,
        useDirectRevert: process.env.DIRECT_REVERT === '1',
        useCrossEditCheck: process.env.CROSS_EDIT_CHECK === '1',
    });
    req.visitor
        .event({ec: "api", ea: "/"})
        .send();
};
utilsRouter.get('/flags', asyncHandler(flags));

const root = async (req, res) => {
  res.send('API root > v4.0 with typescript');
  req.visitor
      .event({ ec: "api", ea: "/" })
      .send();
};
utilsRouter.get('/root', asyncHandler(root));

export const version = async (req, res) => {
  var packageson = require('@/package.json');
  res.send(packageson.version);
  req.visitor
      .event({ ec: "api", ea: "/" })
      .send();
};
utilsRouter.get('/version', asyncHandler(version));
