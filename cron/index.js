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
var mw_mailer_1 = require('../mailer/mw-mailer');
var cron = require('cron');
var log4js = require('log4js');
var logger = log4js.getLogger("default");
logger.level = process.env.LOG_LEVEL || 'debug';
var mailCronLogger = log4js.getLogger("Mail-CronJob");
mailCronLogger.level = process.env.LOG_LEVEL || 'debug';
var ANONYMOUS_PLACEHOLDER = "(anonymous)";
var envAssert = function (varName) {
    console.assert(process.env[varName], "Warning Environment Varaible " + varName + " doesn't exist.");
    if (process.env[varName])
        return true;
    else
        return false;
};
var ReportCronJob = (function () {
    function ReportCronJob() {
        this.dailyReport = async;
        this.dailyReportJob = new cron.CronJob("0 0 6 * * *" /* 6am everyday */, async(), {
            mailCronLogger: .info("Running dailyReportJob agt " + new Date()),
            await: this.dailyReport()
        }, null, true, "America/Los_Angeles");
    }
    ReportCronJob.prototype.function = function () {
        if (envAssert('CRON_DAILY_REPORT') && process.env['CRON_DAILY_REPORT'].length > 0) {
            if (envAssert('MAIL_SENDER_USERNAME') && envAssert('MAIL_SENDER_PASSWORD')) {
                var nodemailer = require("nodemailer");
                // create reusable transporter object using the default SMTP transport
                var transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.MAIL_SENDER_USERNAME,
                        pass: process.env.MAIL_SENDER_PASSWORD
                    }
                });
                var formatedDate /**format: YYYY-MM-DD */ = new Date().toISOString().split('T')[0];
                var report = await, require = ('../server/routes/stats').getChampion(1, formatedDate, 'enwiki');
                var mailAddresss = process.env['CRON_DAILY_REPORT'].split(',').map(function (e) { return e.trim(); }); // trimming emails
                var json2html = require('node-json2html');
                var html = json2html.transform(report, {
                    "<>": "tr", "html": [
                        // TODO(xinbenlv): currently only supports English but will expand.
                        { "<>": "td", html: "<a href='http://en.wikipedia.org/wiki/User:${_id.wikiUserName}'>User:${_id.wikiUserName}</a>" },
                        { "<>": "td", html: "<a href='http://battlefield.wikiloop.org/marked/?wikiUserName=${_id.wikiUserName}'>${count}</a>" }
                    ]
                });
                var info = await, transporter, sendMail = ({
                    from: '"User:Xinbenlv\'s Messenger for WikiLoop" <zzn+wikiloop@zzn.im>',
                    replyTo: 'zzn+wikiloop@zzn.im',
                    to: process.env.CRON_DAILY_REPORT,
                    subject: "Daily Report for WikiLoop Battlefield " + formatedDate,
                    text: JSON.stringify(report, null, 2),
                    html: html // html body
                });
                mailCronLogger.info("Message sent: " + info.messageId);
            }
            else {
                mailCronLogger.info("No " + [
                    'CRON_DAILY_REPORT', 'MAIL_SENDER_USERNAME', 'MAIL_SENDER_PASSWORD'
                ].join(' or ') + ", not sending msg.");
            }
        }
    };
    ;
    return ReportCronJob;
})();
exports.ReportCronJob = ReportCronJob;
var AwardBarnStarCronJob = (function () {
    function AwardBarnStarCronJob() {
        this.awardBarnstar = async;
        this.weeklyBarnstarJob = new cron.CronJob(
        // "* * * * * Mon"/* 6am everyday */, 
        "0 43 15 * * *", async(), {
            mailCronLogger: .info("Running weeklyBarnstarJob at " + new Date()),
            await: this.awardBarnstar()
        }, null, true, "America/Los_Angeles");
    }
    AwardBarnStarCronJob.prototype.function = function () {
        if (envAssert('WP_USER') && envAssert('WP_PASSWORD')) {
            var mwMailer = new mw_mailer_1.MwMailer();
            var awardBarnstarMsg = async(mwMailer, user, timeRange, endDate, isReal);
            {
                await;
                mwMailer.mail(isReal ? "User_talk:" + user : "User:Xinbenlv/Sandbox/User_talk:" + user, "\n    == The WikiLoop Battlefield " + timeRange + "ly barnstar ==\n    {{subst:Xinbenlv/WikiLoop Battlefield Champion|user=" + user + "|enddate=" + endDate + "|timerange=" + timeRange + "}}\n    ", "Awarding The WikiLoop Battlefield " + timeRange + "ly barnstar to " + user + " ending on " + endDate);
            }
            ;
            var formatedDate /**format: YYYY-MM-DD */ = new Date().toISOString().split('T')[0];
            var report = await, require = ('../server/routes/stats').getChampion(7, formatedDate, 'enwiki');
            var users = report.slice(0, 10 /*top 10*/)
                .filter(function (n) { return n !== ANONYMOUS_PLACEHOLDER; })
                .map(function (item) { return item._id.wikiUserName; });
            await;
            Promise.all(users.map(async, function (user) {
                await;
                awardBarnstarMsg(mwMailer, user, 'week', formatedDate, process.env.WP_LEVEL === 'real');
            }));
        }
        else {
            mailCronLogger.info("Running CRON_WEEKLY_BARNSTAR without sufficient vars");
        }
    };
    ;
    return AwardBarnStarCronJob;
})();
exports.AwardBarnStarCronJob = AwardBarnStarCronJob;
