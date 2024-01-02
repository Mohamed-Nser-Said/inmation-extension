import * as vscode from 'vscode';
import path = require('path');
import fs = require('fs');
import ScriptLibraryManagerAdapter from './ScriptLibraryManagerAdapter';
import {ExecFuncAction, FlowAction, MassAction, ComposeAction} from '../Models/ComposeActions';
import  Compose from '../Models/Compose';
import {Connection} from '../Models/Connection';
import ScriptReference from '../types/ScriptReference';
import { ActionType } from '../Enums/ActionsPropType';
import { error } from 'console';



export class ComposeManager {

	private _worksapcePath: string;
	private _compose: Compose;
	private _scriptLibraryManager: ScriptLibraryManagerAdapter;

	constructor(worksapcePath: string = ComposeManager.defaultWorkspacePath) {
		this._worksapcePath = worksapcePath;
		// compose was not found in workspace 
		if (!fs.existsSync(this.composePath)) {
			error(`compose file not found in ${this.composePath}`);
		}

		// load compose file

		const composeFile = fs.readFileSync(this.composePath).toString();
		this._compose = Compose.FromJson(composeFile);

		this._scriptLibraryManager = new ScriptLibraryManagerAdapter(this._worksapcePath, this._compose.scriptReferences);
	}

	static get defaultWorkspacePath(): string {
		return  vscode.workspace.workspaceFolders?.[0]?.uri.fsPath|| '';
	}

	get composePath(): string {
		return  path.join( this._worksapcePath , 'inmation-compose.json');
	}

	get workspacePath(): string {
		return this._worksapcePath;
	}

	public get compose(): Compose {
		return this._compose;
	}

	public get actionTypes(): string[] {
		const types = new Set<string>(this._compose.actions.map(action => action.type));
		return types.size > 0 ? Array.from(types) : ["No Actions"];
	}
	public async getscriptByName(name: string): Promise<string> {
		return this._scriptLibraryManager.scriptByName(name);
	}

	public get connectionsNames(): string[] {
		return this._compose.connections.map(connection => connection.name);
	}

	public get actions(): ComposeAction[] {
		return this._compose.actions;
	}

	public get mass(): MassAction[] {
		return this._compose.actions.filter(action => action.type === ActionType.Mass) as MassAction[];
	}

	public get execFunctions(): ExecFuncAction[] {
		return this._compose.actions.filter(action => action.type === ActionType.ExecFunc) as ExecFuncAction[];
	}

	public get flow(): FlowAction[] {
		return this._compose.actions.filter(action => action.type === ActionType.Flow) as FlowAction[];
	}

	public get actionByTypes(): Map<string, ComposeAction[]> {
		return this._compose.groupActionByType();
	}

	public getActionByName(name: string) {
		const action = this._compose.getActionByName(name);
		if (action === undefined)  return undefined;
		if (action.type === ActionType.Mass) {
			return new MassAction(action.name, action.type, action.model, action.comment);
		} else if (action.type === ActionType.ExecFunc) {
			return new ExecFuncAction(action.name, action.type, action.ctx || "", action.lib, action.func, action.farg, action.output || "", action.comment);
		} else if (action.type === ActionType.Flow) {
			return new FlowAction(action.name, action.type, action.steps, action.comment);
		}
	}

	public get scriptReferences(): ScriptReference[] {
		return this._compose.scriptReferences;
	}

	public connectionByName(name: string): Connection{
		return this._compose.getConnectionByName(name);
	}

	


}