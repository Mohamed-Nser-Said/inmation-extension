/* eslint-disable @typescript-eslint/no-var-requires */



const ScriptLibraryManager = require('@inmation/inmation-compose-cli/lib/script-library-manager').ScriptLibraryManager;
const MappingManager = require('@inmation/inmation-compose-cli/lib/mapping-manager').MappingManager;
const ModelConfigManager = require('@inmation/inmation-compose-cli/lib/model-config-manager').ModelConfigManager;
import path = require('path');
import ScriptReference from '../types/ScriptReference';
import * as vscode from 'vscode';



export interface IComposeAction {
	name: string;
	type: string;
	comment: string|null;

}



export class MassAction extends vscode.TreeItem implements IComposeAction{

	readonly name: string;
	readonly type: string;
	public model: string;
	public comment: string|null;
	public mapping: string|null = null;

	constructor(name: string, type: string, model: string, comment: string|null) {
		super(name, vscode.TreeItemCollapsibleState.None);
		this.iconPath = {
			light: path.join(__filename, '..', '..', '..', 'resources', 'light', `mass.svg`),
			dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', `mass.svg`)
		};
		this.contextValue = "Compose:Actions.View.Mass";

		this.tooltip = comment??'no comment';
		// this.description = "Mass Action";
		

		this.name = name;
		this.type = type;
		this.model = model;
		this.comment = comment;

		if (this.type !== 'mass') throw new Error('invalid type for MassAction');
		
	}



	async readModelConfigFolder(scriptReferences: ScriptReference[]) : Promise<any> {

		const workspaceFolderPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath|| '';
		let mappingManager = null;
		if (typeof (this.mapping) === 'string') {
			const mappingFilename = path.resolve(workspaceFolderPath, this.mapping);
			mappingManager = new MappingManager(mappingFilename);
		}
		const scriptLibraryManager = new ScriptLibraryManager(workspaceFolderPath, scriptReferences);
		const folderPath = path.resolve(workspaceFolderPath, this.model);
		const modelConfigManager = new ModelConfigManager(folderPath, scriptLibraryManager, mappingManager);
		const objects = modelConfigManager.inmationConfig();

		return objects;
	}
	


}




export class ExecFuncAction extends vscode.TreeItem implements IComposeAction{
	
	readonly name: string;
	readonly type: string;
	public ctx : string|null;
	public lib : string;
	public func : string;
	public farg : any|null;
	public output : string|null;
	public comment: string|null;

	constructor(name: string, type: string, ctx : string, lib : string, func : string, farg : any, output : string, comment: string|null) {
		super(name, vscode.TreeItemCollapsibleState.None);
		this.name = name;
		this.type = type;
		this.ctx = ctx || "/System";
		this.lib = lib;
		this.func = func;
		this.farg = farg;
		this.output = output;
		this.comment = comment;
		this.iconPath = {
			light: path.join(__filename, '..', '..', '..', 'resources', 'light', `execfunc.svg`),
			dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', `execfunc.svg`)
		};
		this.contextValue = "Compose:Actions.View.ExecFunction";

		if (this.type !== 'exec-function') throw new Error('invalid type for ExecFuncAction');
	}

	public static  fargToString(action: ExecFuncAction): string [] {
		const str =  Object.entries(action.farg).map(([key, value]) => `${key}=${value}`);
		console.log(str);
		return  str;
	}



}



export class FlowAction  extends vscode.TreeItem implements IComposeAction{
	
	readonly name: string;
	readonly type: string;
	public steps: Array<string>;
	public comment: string|null;

	constructor(name: string, type: string, steps: Array<string>, comment: string|null) {
		super(name, vscode.TreeItemCollapsibleState.None);
		this.name = name;
		this.type = type;
		this.steps = steps;
		this.comment = comment;
		this.iconPath = {
			light: path.join(__filename, '..', '..', '..', 'resources', 'light', `flow.svg`),
			dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', `flow.svg`)
		};

		this.contextValue = "Compose:Actions.View.Flow";

		if (this.type !== 'action-flow') throw new Error('invalid type for FlowAction');
	}

}



