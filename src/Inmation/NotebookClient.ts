import { Connection } from "../Models/Connection";
import WebApi from "./WebApi";
import * as vscode from 'vscode';

export class NotebookClient {

	private _webapi;
	constructor(webapi: WebApi) {
		this._webapi = webapi;
	}

	public async execute(code: string) {

	
		const scriptSequence = [
			"local __return_array = { __print = {}, __return = {}, __error = {}}",
			"_ENV.print = function (value) table.insert(__return_array.__print, value) end",
			"local function __main()",
			` ${code}`,
			"end",
			"local result =  __main() ",
			"table.insert(__return_array.__return, result)",
			"do local json = require('rapidjson') return json.encode(__return_array) end",

		];

		// console.log(scriptSequence.join('\n'));

		if (!this._webapi.isReady()){
			vscode.window.showInformationMessage("Not connected to inmation server");
			return;
		}

		return this._webapi.runScript("/System", scriptSequence.join('\n'));



	// 	try {
	// 		const result = await this._webapi.runScript("/System", scriptSequence.join('\n'));
	// 		return result;
	// 	} catch (error:any) {
	// 		console.log(error.message);
	// 		vscode.window.showErrorMessage(error.message);
	// 		return error.message; // because it string its not a json
	// }


}
}