

import * as vscode from 'vscode';

import { ExecFuncAction, FlowAction, MassAction } from '../../Models/ComposeActions';
import { ActionType, ActionPropType } from '../../Enums/ActionsPropType';
import { Inmation } from '../../Inmation/Inmation';
import * as p from 'path';




export class ActionDataProvider implements vscode.TreeDataProvider<MassAction | ExecFuncAction | FlowAction> {

	private _inmationCompose = Inmation.Object().compose;
	private _onDidChangeTreeData = new vscode.EventEmitter<MassAction | ExecFuncAction | FlowAction | undefined | void>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;



	async refresh(): Promise<void> {


		this._onDidChangeTreeData.fire();

	}



	getTreeItem(item: any): vscode.TreeItem {
		switch (typeof item) {
			case 'string':
				if (item === ActionType.RunScript || item === ActionType.ExecFunc || item === ActionType.Flow || item === ActionType.Mass) {
					return new vscode.TreeItem(item.toUpperCase(), vscode.TreeItemCollapsibleState.Collapsed);
				} else return new vscode.TreeItem(item, vscode.TreeItemCollapsibleState.None);

			case 'object':
				switch (item.type) {
					case ActionType.Mass:
						return new MassAction(item.name, item.type, item.model, item.comment);
					case ActionType.ExecFunc:
						return new ExecFuncAction(item.name, item.type, item.ctx || "", item.lib, item.func, item.farg, item.output || "", item.comment);
					case ActionType.Flow:
						return new FlowAction(item.name, item.type, item.steps, item.comment);


				}
		}
		return new vscode.TreeItem(item, vscode.TreeItemCollapsibleState.None);
	}

	getChildren(item?: any): any {
		if (!item) return [... this._inmationCompose.actionTypes, "Recent"];
		switch (typeof item) {
			case 'string':
				switch (item) {
					case ActionType.Mass:
						return this._inmationCompose.mass;
					case ActionType.ExecFunc:
						return this._inmationCompose.execFunctions;
					case ActionType.Flow:
						return this._inmationCompose.flow;
					default:
						return null;
				}

		}

	}
}
