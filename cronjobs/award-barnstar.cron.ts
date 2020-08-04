// Copyright 2020 Google LLC
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
import { MwMailer }  from '../mailer/mw-mailer';
import {CronJob} from "cron";
import {cronLogger} from "@/server/common";
import { frequencyToNumDaysMap, ANONYMOUS_PLACEHOLDER, envAssert } from './util';

export class AwardBarnStarCronJob {
  public cronJob:CronJob;
  constructor(cronTime:string, frequency:string) {
      cronLogger.debug(`Setting up AwardBarnStarCronJob for cronTime=${cronTime}, frequency=${frequency}`);
      this.cronJob = new CronJob(
          // "* * * * * Mon"/* 6am everyday */,
          cronTime,
          async () => {
              cronLogger.debug(`Running weeklyBarnstarJob at ${new Date()}`);
              await AwardBarnStarCronJob.awardBarnstar(frequency);
          }, null, false, process.env.CRON_TIMEZONE || "America/Los_Angeles");
  }

  private static awardBarnstarMsg = async (mwMailer, user, frequency, endDate, isReal) => {
      await mwMailer.mail(
          isReal ? `User_talk:${user}` : `User:Xinbenlv/Sandbox/User_talk:${user}`,
          `== The WikiLoop DoubleCheck ${frequency} barnstar ==\n` +
          `{{subst:Xinbenlv/WikiLoop DoubleCheck Champion|user=${user}|enddate=${endDate}|timerange=${frequency}}}`,
          `Awarding The WikiLoop DoubleCheck ${frequency} barnstar to ${user} ending on ${endDate}`);
  };

  public static awardBarnstar = async function (frequency:string) {
      cronLogger.info(`Executing AwardBarnstar CronJob at `, new Date());
      if (envAssert('WP_USER') && envAssert('WP_PASSWORD')) {
          let mwMailer = new MwMailer();
          await mwMailer.init();
          let formattedDate/**format: YYYY-MM-DD */ = new Date().toISOString().split('T')[0];
          let report = await require('@/server/routes/stats')
              .getChampion(frequencyToNumDaysMap[frequency], formattedDate, 'enwiki');
          let users = report.slice(0, 10/*top 10*/)
              .filter(n => n !== ANONYMOUS_PLACEHOLDER)
              .map(item => item._id.wikiUserName)
          await Promise.all(users.map(async user => {
              await AwardBarnStarCronJob.awardBarnstarMsg(
              mwMailer, user, frequency, formattedDate, process.env.WP_LEVEL === 'real')
          }));
      } else {
          cronLogger.error(`NOT Running awardBarnstar because of lack sufficient vars`);
      }
  };

  public startCronJob() {
      cronLogger.info(`Starting award barnstar cronjob`);
      this.cronJob.start();
  }
}
