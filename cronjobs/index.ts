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

var log4js = require('log4js');
var logger = log4js.getLogger(`default`);
logger.level = process.env.LOG_LEVEL || 'debug';

var mailCronLogger = log4js.getLogger(`Mail-CronJob`);
mailCronLogger.level = process.env.LOG_LEVEL || 'debug';
const ANONYMOUS_PLACEHOLDER:string = `(anonymous)`;

const frequencyToNumDaysMap = {
    'daily': 1,
    'weekly': 7,
    'monthly': 30,
    'quarterly': 90,
    'annually': 365,
};

const envAssert = (varName) => {
    console.assert(process.env[varName],`Warning Environment Varaible ${varName} doesn't exist.`);
    if (process.env[varName]) return true;
    else return false;
};

export class UsageReportCronJob {
    public cronJob:CronJob;
    private frequency:string;
    constructor(cronTime:string, frequency:string) {
        mailCronLogger.info(`Setting up UsageReportCronJob for cronTime=${cronTime}, frequency=${frequency}`);
        this.frequency = frequency;
        this.cronJob = new CronJob(cronTime/* 6am everyday */, async () => {
            mailCronLogger.info(`Running UsageReportCronJob at ${new Date()}`);
            await UsageReportCronJob.usageReport(this.frequency);
        }, null, false, process.env.CRON_TIMEZONE || "America/Los_Angeles");
    }

    public static usageReport = async function (frequency) {
        mailCronLogger.info(`Executing UsageReport at `, new Date());
        if (envAssert('REPORT_RECEIVER') && process.env['REPORT_RECEIVER'].length > 0) {
            if (envAssert('MAIL_SENDER_USERNAME') && envAssert('MAIL_SENDER_PASSWORD')) {
                const nodemailer = require("nodemailer");
                // create reusable transporter object using the default SMTP transport
                let transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true, // true for 465, false for other ports
                    auth: {
                        user: process.env.MAIL_SENDER_USERNAME,
                        pass: process.env.MAIL_SENDER_PASSWORD
                    }
                });
                let formatedDate/**format: YYYY-MM-DD */ = new Date().toISOString().split('T')[0]
                let report = await require('../server/routes/stats').getChampion(frequencyToNumDaysMap[frequency], formatedDate, 'enwiki');
                const json2html = require('node-json2html');
                let html = json2html.transform(
                    report,{
                        "<>":"tr","html":[
                            // TODO(xinbenlv): currently only supports English but will expand.
                            {"<>": "td", html: "<a href='http://en.wikipedia.org/wiki/User:${_id.wikiUserName}'>User:${_id.wikiUserName}</a>"},
                            {"<>": "td", html: "<a href='http://battlefield.wikiloop.org/marked/?wikiUserName=${_id.wikiUserName}'>${count}</a>"}
                        ]
                    });
                let info = await transporter.sendMail({
                    from: `WikiLoop Battlefield Mailer <zzn+wikiloop@zzn.im>`, // sender address
                    replyTo: 'zzn+wikiloop@zzn.im',
                    to: process.env.REPORT_RECEIVER, // list of receivers
                    subject: `Usage Report (${frequency}) for WikiLoop Battlefield at ${formatedDate}`, // Subject line
                    text: JSON.stringify(report, null, 2), // plain text body
                    html: html // html body
                });

                mailCronLogger.info(`Message sent: ${info.messageId}`);

            } else {
                mailCronLogger.info(`No ${[
                    'REPORT_RECEIVER', 'MAIL_SENDER_USERNAME', 'MAIL_SENDER_PASSWORD'
                ].join(' or ')}, not sending msg.`);
            }
        }
    };


    public startCronJob() {
        mailCronLogger.info(`Starting UsageReportCronJob cronjob.`);
        this.cronJob.start();
        mailCronLogger.info(`Next 3 occurrences`,
            JSON.stringify(this.cronJob.nextDates(3), null, 2));
    }
}

export class AwardBarnStarCronJob {
    public cronJob:CronJob;
    constructor(cronTime:string, frequency:string) {
        mailCronLogger.info(`Setting up AwardBarnStarCronJob for cronTime=${cronTime}, frequency=${frequency}`);
        this.cronJob = new CronJob(
            // "* * * * * Mon"/* 6am everyday */,
            cronTime,
            async () => {
                mailCronLogger.info(`Running weeklyBarnstarJob at ${new Date()}`);
                await AwardBarnStarCronJob.awardBarnstar(frequency);
            }, null, false, process.env.CRON_TIMEZONE || "America/Los_Angeles");
    }

    private static awardBarnstarMsg = async (mwMailer, user, frequency, endDate, isReal) => {
        await mwMailer.mail(
            isReal ? `User_talk:${user}` : `User:Xinbenlv/Sandbox/User_talk:${user}`,
            `== The WikiLoop Battlefield ${frequency}ly barnstar ==\n` +
            `{{subst:Xinbenlv/WikiLoop Battlefield Champion|user=${user}|enddate=${endDate}|timerange=${frequency}}}`,
            `Awarding The WikiLoop Battlefield ${frequency}ly barnstar to ${user} ending on ${endDate}`);
    };

    public static awardBarnstar = async function (frequency:string) {
        mailCronLogger.info(`Executing AwardBarnstar CronJob at `, new Date());
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
            mailCronLogger.error(`NOT Running awardBarnstar because of lack sufficient vars`);
        }
    };

    public startCronJob() {
        mailCronLogger.info(`Starting award barnstar cronjob`);
        this.cronJob.start();
        mailCronLogger.info(`Next 3 occurrences`,
            JSON.stringify(this.cronJob.nextDates(3), null, 2));
    }
}
