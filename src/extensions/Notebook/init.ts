import * as vscode from 'vscode';
import Controller from './Controller';
import Serializer from './Serializer';

export namespace Notebook {
	
	export function init(context: vscode.ExtensionContext) {
		context.subscriptions.push(vscode.workspace.registerNotebookSerializer('inmation-lua-notebook', new Serializer()));
		context.subscriptions.push(new Controller());
	}


}