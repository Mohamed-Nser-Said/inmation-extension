

import * as vscode from 'vscode';

import { ComposeAction, ExecFuncAction, FlowAction, MassAction } from '../../Models/ComposeActions';
import { ActionType, ActionPropType } from '../../Enums/ActionsPropType';
import Inmation  from '../../Inmation/Inmation';
import * as p from 'path';




export class ActionDataProvider implements vscode.TreeDataProvider<ComposeAction> {

	private _inmationCompose = Inmation.Object.compose;
	private _onDidChangeTreeData = new vscode.EventEmitter<ComposeAction | undefined | void>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
	public favorites: Array<ComposeAction> = [];
	public recent: Array<ComposeAction> = [];


	async refresh(): Promise<void> {
		this._onDidChangeTreeData.fire();

	}

	addRecent(action: ComposeAction) {
		if (this.recent.find((a) => a.name === action.name)) 
		{
			this.recent = this.recent.filter((a) => a.name !== action.name);
			this.recent.unshift(action);
			this.refresh();
			return;
		}
		this.recent.unshift(action);
		this.refresh();
		
	}

	addFavorite(action: ComposeAction) {
		if (this.favorites.find((a) => a.name === action.name)) 
		{
			this.favorites = this.favorites.filter((a) => a.name !== action.name);
			return;
		}
		this.favorites.push(action);
	}


	getTreeItem(item: any): vscode.TreeItem {
		switch (typeof item) {
			case 'string':
				return new vscode.TreeItem(item.toUpperCase(), vscode.TreeItemCollapsibleState.Collapsed);

			case 'object':
				switch (item.type) {
					case ActionType.Mass:
						return new MassAction(item.name, item.type, item.model, item.comment);
					case ActionType.ExecFunc:
						return new ExecFuncAction(item.name, item.type, item.ctx || "", item.lib, item.func, item.farg, item.output || "", item.comment);
					case ActionType.Flow:
						return new FlowAction(item.name, item.type, item.steps, item.comment);
					case new vscode.TreeItem(item.name, vscode.TreeItemCollapsibleState.None):

				}
		}
		return new vscode.TreeItem(item, vscode.TreeItemCollapsibleState.None);
	}

	getChildren(item?: any): any {
		if (!item) return ["Recent",... this._inmationCompose.actionTypes, "Favorites"];
		switch (typeof item) {
			case 'string':
				switch (item) {
					case ActionType.Mass:
						return this._inmationCompose.mass;
					case ActionType.ExecFunc:
						return this._inmationCompose.execFunctions;
					case ActionType.Flow:
						return this._inmationCompose.flow;
					case "Favorites":
						return this.favorites;
					case "Recent":
						return this.recent;
					default:
						return null;
				}

		}

	}
}
