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

import {CESP_Info, Revision} from "./interface";
import {
  DecisionLog,
  DecisionLogProps,
  DecisionLogDoc
} from '~/shared/models/decision-log.model';

export class CESP implements Revision {

	// Enum of Operating Mode of the CESP Detection Mechanism. 
	// Two Possibilities: "author" for author-based detection and "article" for article-based detection. 
	mode:string;

	// Configurable Parameters 
	// These are set upon creation and are fixed during analysis process
	url:string;
    window_size:number;
	baseline:number;
	percentage:number;
	margin:number;
	warning_timeframe:number; //Timeframe to get previous warnings to determine blocks, in days
	warning_threshold:number;
	revID:string;
	db;

	// Adding additional fields because the instance's execution will be suspended awaiting the reviewer's decision
	// Hence the instance has to be able to store intermediate results.
	title: string;
	author: string;
	window_start: number;
	window_end: number;
	avg: number;
	diff: number;
	timestamp: string;
	edits_list;
	type: string;
	recipient: string;
	previous_revision_infos;


	constructor (info: CESP_Info) {
		this.mode = info.mode;
		this.url = info.url;
    	this.window_size = info.window_size;
		this.baseline = info.baseline;
		this.percentage = info.percentage;
		this.margin = info.margin;
		this.warning_timeframe = info.warning_timeframe; //Timeframe to get previous warnings to determine blocks, in days
		this.warning_threshold = info.warning_threshold;
		this.revID = info.revID.replace(/[^0-9]/g,'');;	
		this.db = {};
		this.type = "";
		this.recipient = "";
		this.previous_revision_infos = [];
	}

	async sleep(milliseconds: number) {
  		return new Promise(resolve => setTimeout(resolve, milliseconds));
	}

	public async resetDecisionLog() {
    	//Simulating a real database in demo 
    	this.db = {};
	}

	/*
	  Queries the MediaWiki API to get the article title and author ID from revision ID.
	*/
	async getUserAndTitle(){
	    var this_url = this.url;
	    var params = {
	        action: "query",
	        format: "json",
	        prop: "info|revisions",
	 		revids: this.revID,
	    }
	    Object.keys(params).forEach(function(key){this_url += "&" + key + "=" + params[key];});
	    var response = await fetch(this_url, {headers: {"User-Agent": "WikiLoop DoubleCheck Team"}});
	    var response_json = await response.json();
	    
	    var pages_object = response_json.query.pages;

	    for (var v in pages_object) {
	    	var page_object = pages_object[v];
	    }

	    var title = page_object.title;
	    var author = page_object.revisions[0].user;
	    var timestamp = page_object.revisions[0].timestamp;
	    this.title = title;
	    this.author = author;
	    this.timestamp = timestamp;
	    console.log("Loaded metadata for revision ID: " + this.revID);
	    return;
	}

	async findEditHistoryAuthor(){
	    var title = this.title;
	    var author = this.author;
	    var timestamp = this.timestamp;
	    console.log("Timestamp in findEditHistoryAuthor is: " + timestamp);

	    var this_url = this.url;
	    var params = {
	        action: "query",
	        format: "json",
	        list: "allrevisions",
	        arvuser: author,
	        arvstart: timestamp,
	        arvdir: "older",
	        arvlimit: this.window_size,
	        arvprop: "oresscores|timestamp",
	    }
	    Object.keys(params).forEach(function(key){this_url += "&" + key + "=" + params[key];});
	    var response = await fetch(this_url, {headers: {"User-Agent": "WikiLoop DoubleCheck Team"}});
	    console.log(response);
	    var response_json = await response.json();
	    console.log(response_json);

	    var edits_by_article = response_json.query.allrevisions;

	    var edits_list = [];
	    for (var page in edits_by_article) {
	        edits_list.push(edits_by_article[page].revisions[0]);
	        edits_list[edits_list.length - 1].title = edits_by_article[page].title;
	    }
	    this.edits_list = edits_list;
	    console.log("Retrieved past " + edits_list.length + " edits for author " + author);
	    return;
	}

	async findEditHistoryArticle(){
		var title = this.title;
	    var author = this.author;
	    var timestamp = this.timestamp;
	    console.log("Timestamp in findEditHistoryArticle is: " + timestamp);

	    var this_url = this.url;
	    var params = {
	        action: "query",
	        rvdir: "older",
	        rvstart: timestamp,
	        rvlimit: this.window_size,
    		prop: "revisions",
    		titles: title,
    		rvprop: "timestamp|user|oresscores",
    		rvslots: "main",
    		formatversion: "2",
    		format: "json",
	    }
	    Object.keys(params).forEach(function(key){this_url += "&" + key + "=" + params[key];});
	    var response = await fetch(this_url, {headers: {"User-Agent": "WikiLoop DoubleCheck Team"}});
	    console.log(response);
	    var response_json = await response.json();
	    console.log(response_json);

	    var edits_by_article = response_json.query.pages["0"].revisions;
	    var edits_list = [];
	    for (var key in edits_by_article) {
	    	edits_list.push(edits_by_article[key]);
	    }
	    this.edits_list = edits_list;
	    console.log("Retrieved past " + edits_list.length + " edits for author " + author);
	    return;
	}

	displayWarningChoice() {
	    //Returns whether the reviewer agrees on issuing a warning
	    console.log("Choice displayed to reviewer on whether to warn " + this.author);
	    return true;
	}

	displayBlockChoice() {
    	//Returns whether the reviewer agrees on issuing a block
    	console.log("Choice displayed to reviewer on whether to block " + this.author);
    	return true;
	}

	displayEventChoice() {
		//Returns whether the reviewer agrees on logging the event for future protects
    	console.log("Choice displayed to reviewer on whether to log event for " + this.title);
    	return true;
	}

	displayProtectChoice(userID: string) {
		//Returns whether the reviewer agrees on issuing a block
    	console.log("Choice displayed to reviewer on whether to protect " + this.title);
    	return true;

	}

	async sendWarningMessage(recipient: string){
		console.log("Warning message sent to " + recipient);
    	return;
	}

	async sendBlockMessage(recipient: string){
		console.log("Block message sent to " + recipient);
    	return;
	}

	async sendProtectMessage(recipient: string){
		console.log("Protect message sent to " + recipient);
    	return;
	}

	async getRecipientForBlock(){
    	return "Block_Recipient_Placeholder";
	}

	async getRecipientForProtect(){
		return "Protect_Recipient_Placeholder";
	}

	async getPreviousWarningsAuthor(
		user_id: string,
		end_timestamp: Date
	) {
		/*
		// Simulated Database
	    if(!(user_id in this.db)) {
	    	console.log("User id: " + user_id + " not found in database.");
	    	return [];
	    }else{
	    	var events_by_user = this.db[user_id];
    		// Within body of anonymous function, the keyword "this" cannot reference the outside
    		// class. Hence using this.warning_timeframe directly inside anonymous function 
    		// will be undefined. 
    		var warning_timeframe = this.warning_timeframe;
	    	var events_before_end = events_by_user.filter(function(edit){
	    		var warning_period_start = new Date(end_timestamp);
	    		warning_period_start.setDate(warning_period_start.getDate() - warning_timeframe);
	    		var warning_period_end = new Date(end_timestamp);
	    		var this_edit_time = new Date(edit.timestamp);
	    		// Reason to use <= and >=: enable easier testing of Decision Log and Messaging service
	    		return (this_edit_time >= warning_period_start && this_edit_time <= warning_period_end); 
	    	});
	    	console.log("Get " + events_before_end.length + " past events for " + user_id);
	    	return events_before_end;
	    }
	    */
	    let start_timestamp = new Date();
	    start_timestamp.setDate(end_timestamp.getDate() - this.warning_timeframe);
	    let events_before_end: DecisionLogProps[] = await DecisionLog.find({
	    	user_id: user_id,
	    	type: {$in: ["warning", "block"]},
	    	timestamp: {$gte: start_timestamp, $lte: end_timestamp}
	    }).sort([['timestamp', 1]]).limit(this.warning_threshold * 10); //Avoid too many events 
	    console.log("Get " + events_before_end.length + " past events for " + user_id);
	    return events_before_end;
	}

	async getPreviousWarningsArticle(
		title: string, 
		end_timestamp: Date
	) {
		/*
		// Simulated Database
	    if(!(title in this.db)) {
	    	console.log("User id: " + title + " not found in database.");
	    	return [];
	    }else{
	    	var events_on_article = this.db[title];
    		// Within body of anonymous function, the keyword "this" cannot reference the outside
    		// class. Hence using this.warning_timeframe directly inside anonymous function 
    		// will be undefined. 
    		var warning_timeframe = this.warning_timeframe;
	    	var events_before_end = events_on_article.filter(function(edit){
	    		var warning_period_start = new Date(end_timestamp);
	    		warning_period_start.setDate(warning_period_start.getDate() - warning_timeframe);
	    		var warning_period_end = new Date(end_timestamp);
	    		var this_edit_time = new Date(edit.timestamp);
	    		// Reason to use <= and >=: enable easier testing of Decision Log and Messaging service
	    		return (this_edit_time >= warning_period_start && this_edit_time <= warning_period_end); 
	    	});
	    	console.log("Get " + events_before_end.length + " past events for " + title);
	    	return events_before_end;
	    }
	    */
	    let start_timestamp = new Date();
	    start_timestamp.setDate(end_timestamp.getDate() - this.warning_timeframe);
	    let events_before_end: DecisionLogProps[] = await DecisionLog.find({
	    	title: title,
	    	type: {$in: ["protect", "articleLogEvent"]},
	    	timestamp: {$gte: start_timestamp, $lte: end_timestamp}
	    }).sort([['timestamp', 1]]).limit(this.warning_threshold * 10); //Avoid too many events 
	    console.log("Get " + events_before_end.length + " past events for " + title);
	    return events_before_end;
	}

	async writeNewDecisionAuthor(
		user_id: string, 
		title: string, 
		type: string, 
		timestamp: Date, 
		recipient_id: string, 
		start_window: Date, 
		avg_score: number
	) {
		var decision_object = {
			user_id: user_id,
			title: title,
			type: type,
			timestamp: timestamp,
			recipient_id: recipient_id,
			start_window: start_window,
			avg_score: avg_score,
		}
		/*
		// Simulated Database
	    if(!(user_id in this.db)) {
	    	this.db[user_id] = [decision_object];
	    }else {
	    	this.db[user_id].push(decision_object);
	    }
	    */
	    await DecisionLog.create(decision_object);
	    console.log("Suspicious event of type " + type + " logged for author " + user_id + " at " + timestamp);
	}

	async writeNewDecisionArticle(
		user_id: string, 
		title: string, 
		type: string, 
		timestamp: Date, 
		recipient_id: string, 
		start_window: Date, 
		avg_score: number
	) {
		var decision_object = {
			user_id: user_id,
			title: title,
			type: type,
			timestamp: timestamp,
			recipient_id: recipient_id,
			start_window: start_window,
			avg_score: avg_score,
		}
		/*
		// Simulated Database
	    if(!(title in this.db)) {
	    	this.db[title] = [decision_object];
	    }else {
	    	this.db[title].push(decision_object);
	    }
	    */
	    await DecisionLog.create(decision_object);
	    console.log("Suspicious event of type " + type + " logged for article " + title + " at " + timestamp);
	}

	// Used for both "author" mode and "article" mode
	async getScoreAndProcess(){
	    var title = this.title;
	    var author = this.author;
	    var edits_list = this.edits_list;

	    var scores = new Array(Math.min(this.window_size, edits_list.length));
	    var previous_revision_infos = new Array(Math.min(this.window_size, edits_list.length));
	    for (var i = 0; i < scores.length; i++) {
	        //Only take ORES_DAMAGING score 
	        //If ORES Scores are missing, skip this edit entirely. 
	        if(edits_list[i].oresscores.damaging == undefined) {
	        	var missing_score_string = "";
	        	missing_score_string += "Title: " + title + " Author: " + author + "\n";
	        	missing_score_string += "ORES Scores are missing. Hence no detection is performed. \n";
	        	missing_score_string += "Timestamp: " + edits_list[0].timestamp + "\n";
	        	console.log(missing_score_string);
	        	return;
	        }
	        scores[i] = edits_list[i].oresscores.damaging.true;
	        if (this.mode == "author") {
		        var edit_info = {
		        	author: this.author,
		        	title: String(edits_list[i].title),
		        	score: (scores[i] * 100).toFixed(0),
		        	timestamp: edits_list[i].timestamp,
		        };
		    } else if (this.mode == "article") {
		    	var edit_info = {
		        	author: String(edits_list[i].user),
		        	title: this.title,
		        	score: (scores[i] * 100).toFixed(0),
		        	timestamp: edits_list[i].timestamp,
		        };

		    }
	        previous_revision_infos[i] = edit_info;
	    }

	    var window_start: number = edits_list[edits_list.length-1].timestamp;
	    var window_end: number = edits_list[0].timestamp;
	    var window_start_Date: Date = new Date(window_start);
	    var window_end_Date: Date = new Date(window_end);
	    var avg: number = scores.reduce((acc, e) => acc + e, 0) / scores.length;
	    var diff: number = avg - this.baseline;
	   	this.window_start = window_start;
	   	this.window_end = window_end;
	   	this.avg = avg;
	   	this.diff = diff;
	   	this.previous_revision_infos = previous_revision_infos;
	    
	    if(diff > this.margin) {
	    	if (this.mode == "author") {
		        var warnings = await this.getPreviousWarningsAuthor(author, window_end_Date);
		        if (warnings.length > this.warning_threshold) {
		            this.type = "block";
		            this.recipient = await this.getRecipientForBlock();
		        }else{
		            this.type = "warning";
		            this.recipient = author;
		        }
		        this.writeNewDecisionAuthor(author, title, this.type, window_end_Date, this.recipient, window_start_Date, avg);
		    } else if (this.mode == "article") {
		    	var warnings = await this.getPreviousWarningsArticle(title, window_end_Date);
		    	if (warnings.length > this.warning_threshold) {
		            this.type = "protect";
		            this.recipient = await this.getRecipientForProtect();
		        }else{
		            this.type = "articleLogEvent";
		            this.recipient = "";
		        }
		        this.writeNewDecisionArticle(author, title, this.type, window_end_Date, this.recipient, window_start_Date, avg);
		    }
	    }else{
	    	if (this.mode == "author") {
	    		console.log("Author " + author + "is not engaged in suspicious behavior.");
	    	} else if (this.mode == "article") {
	    		console.log("Article " + title + "is not affected by suspicious activity.");
	    	}
	    }

	    //Display on prototype.html
	    var result_string = "";
	    result_string += "Title: " + title + " Author: " + author + "\n";
	    result_string += "Detection Type: " + this.mode + "\n";
	    result_string += "Avg ORES Damaging score is: " + avg.toFixed(2) + "\n";
	    result_string += "Difference from baseline score is: " + diff.toFixed(2) + "\n";
	    result_string += "Starting time of window is: " + window_start +"\n"; 
	    result_string += "Ending time of window is: " + window_end + "\n";
	    console.log(result_string);
	    var decision_info = {
	    	mode: this.mode,
	    	type: this.type,
	    	author: this.author,
	    	recipient: this.recipient, 
	    	percentage: (this.avg * 100).toFixed(0), 
	    	previous_revision_infos: this.previous_revision_infos,
	    }
	    return decision_info;
	}

	public async execute_decision() {
		if(this.mode == "author") {
			if(this.type == "block") {
				this.sendBlockMessage(this.recipient);
			}
			if(this.type == "warning") {
				this.sendWarningMessage(this.recipient);
			}
		}else if (this.mode == "article") {
			if(this.type == "protect") {
				this.sendProtectMessage(this.recipient);
			}
		}
		return;
	}

	public async analyze() {
		await this.getUserAndTitle();
		if(this.mode == "author") {
			await this.findEditHistoryAuthor();
		}else if (this.mode == "article") {
			await this.findEditHistoryArticle();
		}
		var decision_info = await this.getScoreAndProcess();
		console.log("Executed test for revision ID: " + this.revID + decision_info);
		return decision_info;
	}
}