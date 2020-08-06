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
import { envAssert, frequencyToNumDaysMap } from './util';


export class UsageReportCronJob {
    public cronJob:CronJob;
    private frequency:string;
    constructor(cronTime:string, frequency:string) {
        cronLogger.info(`Setting up UsageReportCronJob for cronTime=${cronTime}, frequency=${frequency}`);
        this.frequency = frequency;
        this.cronJob = new CronJob(cronTime/* 6am everyday */, async () => {
            cronLogger.info(`Running UsageReportCronJob at ${new Date()}`);
            await UsageReportCronJob.usageReport(this.frequency);
        }, null, false, process.env.CRON_TIMEZONE || "America/Los_Angeles");
    }

    public static usageReport = async function (frequency) {
        cronLogger.info(`Executing UsageReport at `, new Date());
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
                            {"<>": "td", html: "<a href='http://doublecheck.wikiloop.org/history/?wikiUserName=${_id.wikiUserName}'>${count}</a>"}
                        ]
                    });
                let info = await transporter.sendMail({
                    from: `WikiLoop DoubleCheck Mailer <zzn+wikiloop@zzn.im>`, // sender address
                    replyTo: 'zzn+wikiloop@zzn.im',
                    to: process.env.REPORT_RECEIVER, // list of receivers
                    subject: `Usage Report (${frequency}) for WikiLoop DoubleCheck at ${formatedDate}`, // Subject line
                    text: JSON.stringify(report, null, 2), // plain text body
                    html: html // html body
                });

                cronLogger.info(`Message sent: ${info.messageId}`);

            } else {
                cronLogger.info(`No ${[
                    'REPORT_RECEIVER', 'MAIL_SENDER_USERNAME', 'MAIL_SENDER_PASSWORD'
                ].join(' or ')}, not sending msg.`);
            }
        }
    };


    public startCronJob() {
        cronLogger.info(`Starting UsageReportCronJob cronjob.`);
        this.cronJob.start();
    }
}
