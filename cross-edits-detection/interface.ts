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

export interface Revision_Test {
	run_all();
	run_test(id:number);
}

export interface CESP_Test_Info {
	url:string;
  window_size:number;
	baseline:number;
	percentage:number;
	margin:number;
	warning_timeframe:number; //Timeframe to get previous warnings to determine blocks, in days
	warning_threshold:number;
	revID_list:Array<number>;
}