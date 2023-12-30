import { ScriptLibraryDataProvider } from '../Views/DataProviders/ScriptLibraryDataProvider';
import * as vscode from 'vscode';
export class ScriptLibraryUI {


	constructor (private scriptLibraryDataProvider: ScriptLibraryDataProvider) {

		vscode.window.registerTreeDataProvider('ScriptLibrary', this.scriptLibraryDataProvider);

	}



}