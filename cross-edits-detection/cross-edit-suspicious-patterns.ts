/**
  Copyright 2019 Google LLC

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
**/

import { CrossEditSuspiciousPatternsInfo, Revision } from './interface';
import {
  DecisionLogProps,
  DecisionLogDoc,
} from '~/shared/models/decision-log.model';

export class CrossEditSuspiciousPatterns implements Revision {
  // Enum of Operating Mode of the CrossEditSuspiciousPatterns Detection Mechanism.
  // Two Possibilities: "author" for author-based detection and "article" for article-based detection.
  mode:string;

  // Configurable Parameters
  // These are set upon creation and are fixed during analysis process
  url:string;
  windowSize:number;
  baseline:number;
  percentage:number;
  margin:number;
  warningTimeframe:number; // Timeframe to get previous warnings to determine blocks, in days
  warningThreshold:number;
  revID:string;
  axiosClient:any;
  db;

  // Adding additional fields because the instance's execution will be suspended awaiting the reviewer's decision
  // Hence the instance has to be able to store intermediate results.
  title: string;
  author: string;
  windowStart: number;
  windowEnd: number;
  avg: number;
  diff: number;
  timestamp: string;
  editsList;
  type: string;
  recipient: string;
  previousRevisionInfos;

  constructor(info: CrossEditSuspiciousPatternsInfo) {
    this.mode = info.mode;
    this.url = info.url;
    this.windowSize = info.windowSize;
    this.baseline = info.baseline;
    this.percentage = info.percentage;
    this.margin = info.margin;
    this.warningTimeframe = info.warningTimeframe; // Timeframe to get previous warnings to determine blocks, in days
    this.warningThreshold = info.warningThreshold;
    this.revID = info.revID.replace(/[^0-9]/g, '');
    this.axiosClient = info.axiosClient;
    this.db = {};
    this.type = '';
    this.recipient = '';
    this.previousRevisionInfos = [];
  }

  async sleep(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  public async resetDecisionLog() {
    // Simulating a real database in demo
    this.db = {};
  }

  /*
    Queries the MediaWiki API to get the article title and author ID from revision ID.
  */
  async getUserAndTitle() {
    let thisUrl = this.url;
    const params = {
      action: 'query',
      format: 'json',
      prop: 'info|revisions',
      revids: this.revID,
    };
    Object.keys(params).forEach(function(key) {thisUrl += '&' + key + '=' + params[key];});
    const response = await fetch(thisUrl, { headers: { 'User-Agent': 'WikiLoop DoubleCheck Team' } });
    const responseJson = await response.json();

    const pagesObject = responseJson.query.pages;

    for (const v in pagesObject) {
      var pageObject = pagesObject[v];
    }

    const title = pageObject.title;
    const author = pageObject.revisions[0].user;
    const timestamp = pageObject.revisions[0].timestamp;
    this.title = title;
    this.author = author;
    this.timestamp = timestamp;
    console.log('Loaded metadata for revision ID: ' + this.revID);
  }

  async findEditHistoryAuthor() {
    const title = this.title;
    const author = this.author;
    const timestamp = this.timestamp;
    console.log('Timestamp in findEditHistoryAuthor is: ' + timestamp);

    let thisUrl = this.url;
    const params = {
      action: 'query',
      format: 'json',
      list: 'allrevisions',
      arvuser: author,
      arvstart: timestamp,
      arvdir: 'older',
      arvlimit: this.windowSize,
      arvprop: 'oresscores|timestamp|ids',
    };
    Object.keys(params).forEach(function(key) {thisUrl += '&' + key + '=' + params[key];});
    const response = await fetch(thisUrl, { headers: { 'User-Agent': 'WikiLoop DoubleCheck Team' } });
    console.log(response);
    const responseJson = await response.json();
    console.log(responseJson);

    const editsByArticle = responseJson.query.allrevisions;

    const editsList = [];
    for (const page in editsByArticle) {
      editsList.push(editsByArticle[page].revisions[0]);
      editsList[editsList.length - 1].title = editsByArticle[page].title;
    }
    this.editsList = editsList;
    console.log('Retrieved past ' + editsList.length + ' edits for author ' + author);
  }

  async findEditHistoryArticle() {
    const title = this.title;
    const author = this.author;
    const timestamp = this.timestamp;
    console.log('Timestamp in findEditHistoryArticle is: ' + timestamp);

    let thisUrl = this.url;
    const params = {
      action: 'query',
      rvdir: 'older',
      rvstart: timestamp,
      rvlimit: this.windowSize,
      prop: 'revisions',
      titles: title,
      rvprop: 'timestamp|user|oresscores|ids',
      rvslots: 'main',
      formatversion: '2',
      format: 'json',
    };
    Object.keys(params).forEach(function(key) {thisUrl += '&' + key + '=' + params[key];});
    const response = await fetch(thisUrl, { headers: { 'User-Agent': 'WikiLoop DoubleCheck Team' } });
    console.log(response);
    const responseJson = await response.json();
    console.log(responseJson);

    const editsByArticle = responseJson.query.pages['0'].revisions;
    const editsList = [];
    for (const key in editsByArticle) {
      editsList.push(editsByArticle[key]);
    }
    this.editsList = editsList;
    console.log('Retrieved past ' + editsList.length + ' edits for author ' + author);
  }

  displayWarningChoice() {
    // Returns whether the reviewer agrees on issuing a warning
    console.log('Choice displayed to reviewer on whether to warn ' + this.author);
    return true;
  }

  displayBlockChoice() {
    // Returns whether the reviewer agrees on issuing a block
    console.log('Choice displayed to reviewer on whether to block ' + this.author);
    return true;
  }

  displayEventChoice() {
    // Returns whether the reviewer agrees on logging the event for future protects
    console.log('Choice displayed to reviewer on whether to log event for ' + this.title);
    return true;
  }

  displayProtectChoice(userID: string) {
    // Returns whether the reviewer agrees on issuing a block
    console.log('Choice displayed to reviewer on whether to protect ' + this.title);
    return true;
  }

  async sendWarningMessage(recipient: string) {
    console.log('Warning message sent to ' + recipient);
  }

  async sendBlockMessage(recipient: string) {
    console.log('Block message sent to ' + recipient);
  }

  async sendProtectMessage(recipient: string) {
    console.log('Protect message sent to ' + recipient);
  }

  async getRecipientForBlock() {
    return 'BlockRecipientPlaceholder';
  }

  async getRecipientForProtect() {
    return 'ProtectRecipientPlaceholder';
  }

  async getPreviousWarningsAuthor(
    userId: string,
    endTimestamp: number,
  ) {
    var url = '/api/decisionLog/author/';
    var url = url + userId + '/' + endTimestamp + '/' + this.warningTimeframe + '/' + this.warningThreshold;
    console.log(url);
    const events = await this.axiosClient.$get(url);
    console.log('Get ' + events.length + ' past events for ' + userId);
    console.log(events);
    return events;
  }

  async getPreviousWarningsArticle(
    title: string,
    endTimestamp: number,
  ) {
    var url = '/api/decisionLog/article/';
    var url = url + title + '/' + endTimestamp + '/' + this.warningTimeframe + '/' + this.warningThreshold;
    console.log(url);
    const events = await this.axiosClient.$get(url);
    console.log('Get ' + events.length + ' past events for ' + title);
    console.log(events);
    return events;
  }

  async writeNewDecisionAuthor(
    userId: string,
    title: string,
    type: string,
    timestamp: Date,
    recipientId: string,
    startWindow: Date,
    avgScore: number,
  ) {
    const decisionObject = {
      userId,
      title,
      type,
      timestamp,
      recipientId,
      startWindow,
      avgScore,
    };
    await this.axiosClient.$post('/api/decisionLog/author', decisionObject);
    console.log('Suspicious event of type ' + type + ' logged for author ' + userId + ' at ' + timestamp);
  }

  async writeNewDecisionArticle(
    userId: string,
    title: string,
    type: string,
    timestamp: Date,
    recipientId: string,
    startWindow: Date,
    avgScore: number,
  ) {
    const decisionObject = {
      userId,
      title,
      type,
      timestamp,
      recipientId,
      startWindow,
      avgScore,
    };
    await this.axiosClient.$post('/api/decisionLog/article', decisionObject);
    console.log('Suspicious event of type ' + type + ' logged for article ' + title + ' at ' + timestamp);
  }

  // Used for both "author" mode and "article" mode
  async getScoreAndProcess() {
    const title = this.title;
    const author = this.author;
    const editsList = this.editsList;

    const scores = new Array(Math.min(this.windowSize, editsList.length));
    const previousRevisionInfos = new Array(Math.min(this.windowSize, editsList.length));
    for (let i = 0; i < scores.length; i++) {
      // Only take ORES_DAMAGING score
      // If ORES Scores are missing, skip this edit entirely.
      if (editsList[i].oresscores.damaging == undefined) {
        let missingScoreString = '';
        missingScoreString += 'Title: ' + title + ' Author: ' + author + '\n';
        missingScoreString += 'ORES Scores are missing. Hence no detection is performed. \n';
        missingScoreString += 'Timestamp: ' + editsList[0].timestamp + '\n';
        console.log(missingScoreString);
        var decisionInfo = {
          mode: this.mode,
          type: this.type,
          author: this.author,
          recipient: this.recipient,
          percentage: (this.avg * 100).toFixed(0),
          previousRevisionInfos: this.previousRevisionInfos,
        };
        return decisionInfo;
      }
      scores[i] = editsList[i].oresscores.damaging.true;
      if (this.mode == 'author') {
        var editInfo = {
          author: this.author,
          title: String(editsList[i].title),
          score: (scores[i] * 100).toFixed(0),
          timestamp: editsList[i].timestamp,
          parentid: editsList[i].parentid,
        };
      } else if (this.mode == 'article') {
        var editInfo = {
          author: String(editsList[i].user),
          title: this.title,
          score: (scores[i] * 100).toFixed(0),
          timestamp: editsList[i].timestamp,
          parentid: editsList[i].parentid,
        };
      }
      previousRevisionInfos[i] = editInfo;
    }

    const windowStart: number = editsList[editsList.length - 1].timestamp;
    const windowEnd: number = editsList[0].timestamp;
    const windowStartDate: Date = new Date(windowStart);
    const windowEndDate: Date = new Date(windowEnd);
    const avg: number = scores.reduce((acc, e) => acc + e, 0) / scores.length;
    const diff: number = avg - this.baseline;
    this.windowStart = windowStart;
    this.windowEnd = windowEnd;
    this.avg = avg;
    this.diff = diff;
    this.previousRevisionInfos = previousRevisionInfos;

    if (diff > this.margin) {
      if (this.mode == 'author') {
        var warnings = await this.getPreviousWarningsAuthor(author, windowEnd);
        if (warnings.length > this.warningThreshold) {
          this.type = 'block';
          this.recipient = await this.getRecipientForBlock();
        } else {
          this.type = 'warning';
          this.recipient = author;
        }
        this.writeNewDecisionAuthor(author, title, this.type, windowEndDate, this.recipient, windowStartDate, avg);
      } else if (this.mode == 'article') {
        var warnings = await this.getPreviousWarningsArticle(title, windowEnd);
        if (warnings.length > this.warningThreshold) {
          this.type = 'protect';
          this.recipient = await this.getRecipientForProtect();
        } else {
          this.type = 'articleLogEvent';
          this.recipient = '';
        }
        this.writeNewDecisionArticle(author, title, this.type, windowEndDate, this.recipient, windowStartDate, avg);
      }
    } else if (this.mode == 'author') {
      console.log('Author ' + author + 'is not engaged in suspicious behavior.');
    } else if (this.mode == 'article') {
      console.log('Article ' + title + 'is not affected by suspicious activity.');
    }

    // Display on prototype.html
    let resultString = '';
    resultString += 'Title: ' + title + ' Author: ' + author + '\n';
    resultString += 'Detection Type: ' + this.mode + '\n';
    resultString += 'Avg ORES Damaging score is: ' + avg.toFixed(2) + '\n';
    resultString += 'Difference from baseline score is: ' + diff.toFixed(2) + '\n';
    resultString += 'Starting time of window is: ' + windowStart + '\n';
    resultString += 'Ending time of window is: ' + windowEnd + '\n';
    console.log(resultString);
    var decisionInfo = {
      mode: this.mode,
      type: this.type,
      author: this.author,
      recipient: this.recipient,
      percentage: (this.avg * 100).toFixed(0),
      previousRevisionInfos: this.previousRevisionInfos,
    };
    return decisionInfo;
  }

  public async executeDecision() {
    if (this.mode == 'author') {
      if (this.type == 'block') {
        this.sendBlockMessage(this.recipient);
      }
      if (this.type == 'warning') {
        this.sendWarningMessage(this.recipient);
      }
    } else if (this.mode == 'article') {
      if (this.type == 'protect') {
        this.sendProtectMessage(this.recipient);
      }
    }
  }

  public async analyze() {
    await this.getUserAndTitle();
    if (this.mode == 'author') {
      await this.findEditHistoryAuthor();
    } else if (this.mode == 'article') {
      await this.findEditHistoryArticle();
    }
    const decisionInfo = await this.getScoreAndProcess();
    console.log('Executed test for revision ID: ' + this.revID + decisionInfo);
    return decisionInfo;
  }
}
