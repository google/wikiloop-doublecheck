# WikiLoop Battlefield: Fight vandalism on Wikipedia together

[![WikiLoop Logo](./assets/wikiloop-battlefield-logo.svg)](https://meta.wikimedia.org/wiki/WikiProject_WikiLoop)

[![CircleCI](https://circleci.com/gh/google/wikiloop-battlefield/tree/master.svg?style=svg)](https://circleci.com/gh/google/wikiloop-battlefield/tree/master) 
[![GitHub watchers](https://img.shields.io/github/watchers/google/wikiloop-battlefield.svg?label=Watch&style=social)](https://img.shields.io/github/watchers/google/wikiloop-battlefield.svg?label=Watch&style=social)
![GitHub watchers](https://img.shields.io/github/watchers/google/wikiloop-battlefield.svg?label=Fork&style=social)
![GitHub watchers](https://img.shields.io/github/watchers/google/wikiloop-battlefield.svg?label=Star&style=social)
![GitHub followers](https://img.shields.io/github/followers/xinbenlv.svg?label=Follow&style=social)

This is a project of web app built to allow people to fight vandalism collaboratively. See [[[m:WikiProject_WikiLoop]]](https://meta.wikimedia.org/wiki/WikiProject_WikiLoop) for more introduction. The documentation in this repository focus on development of the software itself.

[![Vandalism Example](./assets/vandal-example.png)](http://battlfield.wikiloop.org/?utm_source=github&utm_medium=markdown&utm_campaign=repo_readme_img)

## Website Status

[![Uptime Robot status](https://img.shields.io/uptimerobot/status/m783127048-3a1e3c13cdc8e36abba87357.svg?label=prod)](http://battlefield.wikiloop.org/?utm_source=github&utm_medium=markdown&utm_campaign=repo_readme_up_badge)
[![Prod Site Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m783127048-3a1e3c13cdc8e36abba87357.svg?label=prod%20uptime)](http://battlefield.wikiloop.org/?utm_source=github&utm_medium=markdown&utm_campaign=repo_readme_up_ratio_badge)
[![Dev Uptime Robot status](https://img.shields.io/uptimerobot/status/m783127051-01afa8e12cb12e059a95f54c.svg?label=dev)](http://dev.battlefield.wikiloop.org/?utm_source=github&utm_medium=markdown&utm_campaign=repo_readme_up_badge)
[![Dev Site Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m783127051-01afa8e12cb12e059a95f54c.svg?label=dev%20uptime)](http://dev.battlefield.wikiloop.org/?utm_source=github&utm_medium=markdown&utm_campaign=repo_readme_up_ratio_badge)

## Contributor Instruction

![GitHub](https://img.shields.io/github/license/google/wikiloop-battlefield.svg)
![GitHub contributors](https://img.shields.io/github/contributors/google/wikiloop-battlefield.svg)
![GitHub closed issues](https://img.shields.io/github/issues-closed-raw/google/wikiloop-battlefield.svg)
![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/google/wikiloop-battlefield/master.svg) 
[![Tech Stack](https://img.shields.io/badge/tech-stack-blue.svg)](https://stackshare.io/project-wikiloop/battlefield)

We welcome contributions! See [our contribution policy](CONTRIBUTING.md). Please checkout [our stack diagram](https://stackshare.io/project-wikiloop/battlefield) to get familiar with required with technologies we depend on.

<a frameborder="0" data-theme="light" data-layers="2,3,4,1" data-stack-embed="true" href="https://embed.stackshare.io/stacks/embed/7e5b6b934c500dfce8fe7c60f80203"/></a><script async src="https://cdn1.stackshare.io/javascripts/client-code.js" charset="utf-8"></script>

### Install

Prerequisite: [git](https://git-scm.com), [nodejs](https://nodejs.org), [npm](https://npmjs.com)  

```sh
git clone git@github.com:google/wikiloop-battlefield.git
cd wikiloop-battlefield
npm install 
```

### Setup Environment for local development

You should create a `.env` file containing environment variables needed by this project used by [`dotenv`](https://www.npmjs.com/package/dotenv). A template has been provided in the `template.env`. Once set, you should do `cp template.env .env` to create such file in the exact name. 

### Tests

Prerequisite: [Docker](https://www.docker.com/), [CircleCI](http://circleci.com)

```sh
npm test
```

```sh
circleci local execute build
```
