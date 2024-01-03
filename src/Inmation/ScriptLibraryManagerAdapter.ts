import ScriptReference from "../Models/ScriptReference";

/* eslint-disable @typescript-eslint/no-var-requires */
const { ScriptLibraryManager } = require('@inmation/inmation-compose-cli/lib/script-library-manager.js');


export default class ScriptLibraryManagerAdapter {
	private _scriptLibraryManager :any;
	constructor(workspaceFolderPath:string, scriptReferences:  ScriptReference[]){

		this._scriptLibraryManager = new ScriptLibraryManager(workspaceFolderPath, scriptReferences);

	}

	public  scriptByName(name: string): string {
	
		return this._scriptLibraryManager.scriptByName(name);
	}

}