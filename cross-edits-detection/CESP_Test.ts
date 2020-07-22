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

import {CESP_Test_Info, Revision_Test} from "./interface";

export class CESP_Test implements Revision_Test {

	url:string;
    window_size:number;
	baseline:number;
	percentage:number;
	margin:number;
	warning_timeframe:number; //Timeframe to get previous warnings to determine blocks, in days
	warning_threshold:number;
	revID_list:Array<number>;
	db;

	constructor (info: CESP_Test_Info) {
		this.url = info.url;
    	this.window_size = info.window_size;
		this.baseline = info.baseline;
		this.percentage = info.percentage;
		this.margin = info.margin;
		this.warning_timeframe = info.warning_timeframe; //Timeframe to get previous warnings to determine blocks, in days
		this.warning_threshold = info.warning_threshold;
		this.revID_list = info.revID_list;	
		this.db = {};
	}

	async sleep(milliseconds) {
  		return new Promise(resolve => setTimeout(resolve, milliseconds));
	}

	public async resetDecisionLog() {
    	//Simulating a real database in demo 
    	this.db = {};
	}

	/*
	  Queries the MediaWiki API to get the article title and author ID from revision ID.
	*/
	async getUserAndTitle(revID){
	    var this_url = this.url;
	    var params = {
	        action: "query",
	        format: "json",
	        prop: "info|revisions",
	 		revids: revID,
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
	    var results = {
	    	title: title,
	    	author: author,
	    	timestamp: timestamp,
	    }
	    console.log("Loaded metadata for revision ID: " + revID);
	    return results;
	}

	async findEditHistoryAuthor(edit_params_promise){
		var edit_params = await edit_params_promise;
	    var title = edit_params.title;
	    var author = edit_params.author;
	    var timestamp = edit_params.timestamp;

	    var this_url = this.url;
	    var params = {
	        action: "query",
	        format: "json",
	        list: "allrevisions",
	        arvuser: author,
	        arvstart: timestamp,
	        arvlimit: this.window_size,
	        arvprop: "oresscores|timestamp",
	    }
	    Object.keys(params).forEach(function(key){this_url += "&" + key + "=" + params[key];});
	    var response = await fetch(this_url, {headers: {"User-Agent": "WikiLoop DoubleCheck Team"}});
	    var response_json = await response.json();

	    var edits_by_article = response_json.query.allrevisions;

	    var edits_list = [];
	    for (var page in edits_by_article) {
	        edits_list.push(edits_by_article[page].revisions[0]);
	    }
	    var results = {
	        title: title,
	        author: author,
	        edits_list: edits_list,
	    }
	    console.log("Retrieved past " + edits_list.length + " edits for author " + author);
	    return results;
	}

	displayWarningChoice(userID) {
	    //Returns whether the reviewer agrees on issuing a warning
	    console.log("Choice displayed to reviewer on whether to warn " + userID);
	    return true;
	}

	displayBlockChoice(userID) {
    	//Returns whether the reviewer agrees on issuing a block
    	console.log("Choice displayed to reviewer on whether to block " + userID);
    	return true;
	}

	async sendWarningMessage(recipient){
		console.log("Warning message sent to " + recipient);
    	return;
	}

	async sendBlockMessage(recipient){
		console.log("Block message sent to " + recipient);
    	return;
	}

	async getRecipientForBlock(){
    	return "Block_Recipient_Placeholder";
	}

	getPreviousWarnings(user_id, end_timestamp) {
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
	}

	writeNewDecision(user_id, title, type, timestamp, recipient_id, start_window, avg_score) {
		var decision_object = {
			user_id: user_id,
			title: title,
			timestamp: timestamp,
			recipient_id: recipient_id,
			start_window: start_window,
			avg_score: avg_score,
		}
	    if(!(user_id in this.db)) {
	    	this.db[user_id] = [decision_object];
	    }else {
	    	this.db[user_id].push(decision_object);
	    }
	    console.log("Suspicious event of type " + type + " logged for " + user_id + " at " + timestamp);
	}

	async getScoreAndProcess(props_and_edits_list_promise){
	    var props_and_edits_list = await props_and_edits_list_promise;
	    var title = props_and_edits_list.title;
	    var author = props_and_edits_list.author;
	    var edits_list = props_and_edits_list.edits_list;

	    var scores = new Array(Math.min(this.window_size, edits_list.length));
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
	    }

	    var window_start = edits_list[edits_list.length-1].timestamp;
	    var window_end = edits_list[0].timestamp;
	    var avg = scores.reduce((acc, e) => acc + e, 0) / scores.length;
	    var diff = avg - this.baseline;
	    
	    if(diff > this.margin) {
	        var warnings = this.getPreviousWarnings(author, window_end);
	        var decision;
	        var type;
	        var recipient;
	        if (warnings.length > this.warning_threshold) {
	            type = "block";
	            decision = this.displayBlockChoice(author);
	            if (decision) {
	                recipient = await this.getRecipientForBlock();
	                this.sendBlockMessage(recipient);
	            }
	        }else{
	            type = "warning";
	            decision = this.displayWarningChoice(author);
	            if (decision) {
	                recipient = author;
	                this.sendWarningMessage(recipient);
	            }
	        }
	        this.writeNewDecision(author, title, type, window_end, recipient, window_start, avg);
	    }else{
	        console.log("Author " + author + "is not engaged in suspicious behavior.");
	    }

	    //Display on prototype.html
	    var result_string = "";
	    result_string += "Title: " + title + " Author: " + author + "\n";
	    result_string += "Avg ORES Damaging score is: " + avg.toFixed(2) + "\n";
	    result_string += "Difference from baseline score is: " + diff.toFixed(2) + "\n";
	    result_string += "Starting time of window is: " + window_start +"\n"; 
	    result_string += "Ending time of window is: " + window_end + "\n";
	    console.log(result_string);
	}

	public run_test(revID) {
		console.log("Starting to execute test for revision ID: " + revID);
		revID = revID.replace(/[^0-9]/g,'');
		console.log("The stripped revision ID is: " + revID);
		var sample_edit_params = this.getUserAndTitle(revID);
    	var params_and_history = this.findEditHistoryAuthor(sample_edit_params);
    	this.getScoreAndProcess(params_and_history);
    	console.log("Executed test for revision ID: " + revID);
	}

	public async run_all(){
		this.resetDecisionLog();
	    //for(var i = 0; i < sample_revID_list.length; i++){
	    for(var i = 0; i < this.revID_list.length; i++){
	    	await this.run_test(this.revID_list[i]);
	    	await this.sleep(1000);
	    }
	}
}