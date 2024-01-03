import * as vscode from 'vscode';
import * as p from 'path';



export namespace Props {

	const viewId = "Main:Props.View";

	export namespace Model {
		export class IoObjectProps extends vscode.TreeItem {

			constructor(
				public label: string,
				public type: string | null,
				public value: any,
				public path: string | null,
				public children: IoObjectProps[],
				public collapsibleState: vscode.TreeItemCollapsibleState,

				public readonly command?: vscode.Command
			) {
				super(label, collapsibleState);
				this.iconPath = {
					light: p.join(__filename, '..', '..', '..', '..', 'resources', 'light', `${type}.svg`),
					dark: p.join(__filename, '..', '..', '..', '..', 'resources', 'dark', `${type}.svg`)
				};

				this.tooltip = `${this.label}-${this.type}`;
				this.description = this.value?.toString();
				this.contextValue = "IoModel.Object.Props.Hide";
			}


		}


	}

	export class DataProvider implements vscode.TreeDataProvider<Model.IoObjectProps> {


		private _onDidChangeTreeData: vscode.EventEmitter<Model.IoObjectProps | undefined | void> = new vscode.EventEmitter<Model.IoObjectProps | undefined | void>();
		readonly onDidChangeTreeData: vscode.Event<Model.IoObjectProps | undefined | void> = this._onDidChangeTreeData.event;

		private _inmationCompose: any;

		constructor() {


		}

		refresh(): void {
			this._onDidChangeTreeData.fire();
		}

		getTreeItem(element: Model.IoObjectProps): vscode.TreeItem {
			return new vscode.TreeItem(element, vscode.TreeItemCollapsibleState.None);
		}

		getChildren(element?: Model.IoObjectProps): any {
			return [
				"props1",
				"props2",
				"props3"
			];
		}



	}



	export function init() {

		// -->
		const dataProvider = new DataProvider();
		vscode.window.registerTreeDataProvider(viewId, dataProvider);

	}









}



