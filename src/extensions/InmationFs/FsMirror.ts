import * as vscode from 'vscode';
import * as path from 'path';
import { InmationObject } from '../../Inmation/InmationObject';
import Inmation from '../../Inmation/Inmation';

export class FsMirror {


	public sync = false;


	writeFile(basename: string, parnet: string, options: { create: boolean, overwrite: boolean }): void {
		
		Inmation.Object.onceRunScriptEnable(async () => {
			console.log("writeFile", basename, parnet, options);
		});
	}

	// --- manage files/folders

	rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean }): void {

		console.log("rename", oldUri, newUri, options);
		
	}

	delete(uri: vscode.Uri): void {
		console.log("delete", uri);
	}

	createDirectory(parent:string, name:string): void {
		if (!this.sync) return;
		Inmation.Object.onceRunScriptEnable(async () => {
			Inmation.Task.createGenFolder(name, parent);
		});
		
	}

}