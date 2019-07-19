# WikiLoop Battlefiled: Fight vandalisim on Wikipedia together

[![WikiLoop Logo](./assets/wikiloop-logo.svg)](https://meta.wikimedia.org/wiki/WikiProject_WikiLoop)

[![CircleCI](https://circleci.com/gh/google/wikiloop-battlefield/tree/master.svg?style=svg)](https://circleci.com/gh/google/wikiloop-battlefield/tree/master) 

This is a project of Webapp built to allow people to fight vandalism together. See [[[m:WikiProject_WikiLoop]]](https://meta.wikimedia.org/wiki/WikiProject_WikiLoop) for more introduction. The readme in this repository focus on development of the software itself.


## Status

![Uptime Robot status](https://img.shields.io/uptimerobot/status/m783127048-3a1e3c13cdc8e36abba87357.svg?label=prod)![Prod Site Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m783127048-3a1e3c13cdc8e36abba87357.svg?label=prod%20uptime) 
![Dev Uptime Robot status](https://img.shields.io/uptimerobot/status/m783127051-01afa8e12cb12e059a95f54c.svg?label=dev)
![Dev Site Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m783127051-01afa8e12cb12e059a95f54c.svg?label=dev%20uptime)

## Contributor Instruction

We welcome contributions! See [our contribution policy](CONTRIBUTING.md).

![GitHub](https://img.shields.io/github/license/google/wikiloop-battlefield.svg)
![GitHub contributors](https://img.shields.io/github/contributors/google/wikiloop-battlefield.svg)
![GitHub closed issues](https://img.shields.io/github/issues-closed-raw/google/wikiloop-battlefield.svg)
![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/google/wikiloop-battlefield/master.svg) 
[![Tech Stack](https://img.shields.io/badge/tech-stack-blue.svg)](https://stackshare.io/project-wikiloop/battlefield)


### Install & Setup development environment

* Step 1, you should install `node`([NodeJS](https://nodejs.org)), `npm`, and we recommend `nvm` to manage versions of your NodeJS runtime and environment.

* Step 2, fork and clone this repository. If you are new to [Git](https://git-scm.com/) and [Github](https://github.com), follow [this Git helloworld instruction](https://guides.github.com/activities/hello-world/) by Github

Example of a command to clone a copy.

```sh
git clone https://github.com/xinbenlv/wikiloop-battlefield-vue
```

* Step 3, standard npm install
```sh
cd <dir of your git cloned repository>
npm install 
```

* Step 4, setup `.env` file

You should have create a `.env` file containing evironment variables needed by this project used by [`dotenv`](https://www.npmjs.com/package/dotenv). A template has been provided in the `template.env`. Once set, you should do `cp template.env .env` to create such file in the exact name. 

### Tests

Prerequisite: [Docker](https://www.docker.com/), [CircleCI](http://circleci.com)

```sh
npm test
```

```sh
circleci local execute build
```

[![GitHub watchers](https://img.shields.io/github/watchers/google/wikiloop-battlefield.svg?label=Watch&style=social)](https://img.shields.io/github/watchers/google/wikiloop-battlefield.svg?label=Watch&style=social)
![GitHub watchers](https://img.shields.io/github/watchers/google/wikiloop-battlefield.svg?label=Fork&style=social)
![GitHub watchers](https://img.shields.io/github/watchers/google/wikiloop-battlefield.svg?label=Star&style=social)
![GitHub followers](https://img.shields.io/github/followers/xinbenlv.svg?label=Follow&style=social)
