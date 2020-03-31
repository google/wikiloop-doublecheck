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

const cron = require('cron');

var log4js = require('log4js');
var logger = log4js.getLogger(`default`);
logger.level = process.env.LOG_LEVEL || 'debug';

var mailCronLogger = log4js.getLogger(`Mail-CronJob`);
mailCronLogger.level = process.env.LOG_LEVEL || 'debug';
const ANONYMOUS_PLACEHOLDER = `(anonymous)`;

const envAssert = (varName) => {
    console.assert(process.env[varName],`Warning Environment Varaible ${varName} doesn't exist.`);
    if (process.env[varName]) return true;
    else return false;
}

export class ReportCronJob {
    public dailyReport = async function () {
        if (envAssert('CRON_DAILY_REPORT') && process.env['CRON_DAILY_REPORT'].length > 0) {
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
                let report = await require('../server/routes/stats').getChampion(1, formatedDate, 'enwiki');
    
                let mailAddresss = process.env['CRON_DAILY_REPORT'].split(',').map(e=> e.trim()); // trimming emails
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
                    from: '"User:Xinbenlv\'s Messenger for WikiLoop" <zzn+wikiloop@zzn.im>', // sender address
                    replyTo: 'zzn+wikiloop@zzn.im',
                    to: process.env.CRON_DAILY_REPORT, // list of receivers
                    subject: `Daily Report for WikiLoop Battlefield ${formatedDate}`, // Subject line
                    text: JSON.stringify(report, null, 2), // plain text body
                    html: html // html body
                });
    
                mailCronLogger.info(`Message sent: ${info.messageId}`);
            
            } else {
                mailCronLogger.info(`No ${[
                    'CRON_DAILY_REPORT', 'MAIL_SENDER_USERNAME', 'MAIL_SENDER_PASSWORD'
                ].join(' or ')}, not sending msg.`);
            }
        }
    };
    
    public dailyReportJob = new cron.CronJob("0 0 6 * * *"/* 6am everyday */, async () => {
        mailCronLogger.info(`Running dailyReportJob agt ${new Date()}`);
        await this.dailyReport();
    }, null, true, "America/Los_Angeles");
}

export class AwardBarnStarCronJob {
    public awardBarnstar = async function () {
        if (envAssert('WP_USER') && envAssert('WP_PASSWORD')) {
       
        let mwMailer = new MwMailer();
    
        let awardBarnstarMsg = async (mwMailer, user, timeRange, endDate, isReal) => {
            await mwMailer.mail(isReal ? `User_talk:${user}` : `User:Xinbenlv/Sandbox/User_talk:${user}`, `
    == The WikiLoop Battlefield ${timeRange}ly barnstar ==
    {{subst:Xinbenlv/WikiLoop Battlefield Champion|user=${user}|enddate=${endDate}|timerange=${timeRange}}}
    `, 
    `Awarding The WikiLoop Battlefield ${timeRange}ly barnstar to ${user} ending on ${endDate}`);
        };
    
        let formatedDate/**format: YYYY-MM-DD */ = new Date().toISOString().split('T')[0]
        let report = await require('../server/routes/stats').getChampion(7, formatedDate, 'enwiki');
        let users = report.slice(0,10/*top 10*/)
            .filter(n => n !== ANONYMOUS_PLACEHOLDER)
            .map(item => item._id.wikiUserName)
        await Promise.all(users.map(async user => {
            await awardBarnstarMsg(mwMailer, user, 'week', formatedDate, process.env.WP_LEVEL === 'real')
        }));
    
    } else {
        mailCronLogger.info(`Running CRON_WEEKLY_BARNSTAR without sufficient vars`);
    }
    };
    
    public weeklyBarnstarJob = new cron.CronJob(
        // "* * * * * Mon"/* 6am everyday */, 
        "0 43 15 * * *", 
        async () => {
        mailCronLogger.info(`Running weeklyBarnstarJob at ${new Date()}`);
        await this.awardBarnstar();
    }, null, true, "America/Los_Angeles");
}
