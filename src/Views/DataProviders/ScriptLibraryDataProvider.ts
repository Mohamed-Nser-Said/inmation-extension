import * as vscode from 'vscode';
import Inmation  from '../../Inmation/Inmation';
import * as p from 'path';

export class Script extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly path: string,
		public readonly command?: vscode.Command
	) {
		super(label);
		this.iconPath = {
			light: p.join(__filename,'..', '..','..','..', 'resources', 'light', `lua.svg`),
			dark: p.join(__filename, '..', '..','..','..', 'resources', 'dark', `lua.svg`)
		};
		this.collapsibleState = vscode.TreeItemCollapsibleState.None;
		this.contextValue = 'explorer:ScriptLibrary.View.Script';
		this.tooltip = `Inmation: ${this.path}`;
	}
}

export class LibraryName extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly path: string,
		public readonly scriptLibrary: Script[],
		public readonly command?: vscode.Command
	) {
		super(label);
		this.iconPath = {
			light: p.join(__filename, '..', '..','..','..', 'resources', 'light', `folder.svg`),
			dark: p.join(__filename,  '..', '..','..',  '..', 'resources', 'dark', `folder.svg`)
		};
		this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		this.contextValue = 'explorer:ScriptLibrary.View.ScriptLibrary';
		this.tooltip = `Inmation: ${this.path}`;
	}
}

export class ScriptLibraryDataProvider implements vscode.TreeDataProvider<any> {


	private _onDidChangeTreeData: vscode.EventEmitter<string | undefined|void> = new vscode.EventEmitter<any | undefined|void>();
	readonly onDidChangeTreeData: vscode.Event<any | undefined|void> = this._onDidChangeTreeData.event;
	public scriptLibrary: object[];

	constructor() {
		this.scriptLibrary = [];

	}

	
	

	refresh(): void {
		Inmation.Task.getScriptLibray().then((scriptLibrary) => {
			this.scriptLibrary = scriptLibrary;
			console.log(this.scriptLibrary);
		});
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: any) {
		if (element.scriptLibrary) {
			return new LibraryName(element.label, element.path, element.scriptLibrary);
		}
		return element;
	}

	getChildren(element?: any):any {
		if ( element ) {
			return element.scriptLibrary.map((script:any) => new Script(script, element.path));
		} 
		
		return this.scriptLibrary.map((script:any) => new LibraryName(script.label, script.path, script.scriptLibrary));
	}
}