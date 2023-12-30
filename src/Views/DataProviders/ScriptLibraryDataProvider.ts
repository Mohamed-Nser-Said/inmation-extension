import * as vscode from 'vscode';


export class ScriptLibraryDataProvider implements vscode.TreeDataProvider<string> {


	private _onDidChangeTreeData: vscode.EventEmitter<string | undefined|void> = new vscode.EventEmitter<string | undefined|void>();
	readonly onDidChangeTreeData: vscode.Event<string | undefined|void> = this._onDidChangeTreeData.event;

	

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: string): vscode.TreeItem {
		return new vscode.TreeItem(element);
	}

	getChildren(element?: string): any {
		if (element) {
			return Promise.resolve([]);
		} 
		
		return ["Script 1", "Script 2", "Script 3"];
	}
}