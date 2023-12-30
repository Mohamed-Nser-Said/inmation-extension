import * as vscode from 'vscode';

import { ScriptLibraryDataProvider } from './Views/DataProviders/ScriptLibraryDataProvider';
import { ScriptLibraryUI } from './UI Components/ScriptLibrary.UI';
import { Inmation } from './Inmation/Inmation';
import { Io } from './Views/IO.View';
import { Props } from './Views/Props.View';
import { Action } from './Views/Action.View';




export function activate(context: vscode.ExtensionContext) {

	
	const inmation = Inmation.Object();
	const connection = inmation.compose.connectionByName("docker WEBAPI-TAK");
	inmation.connect(connection);
	
	Io.registerView();
	Props.registerView();
	Action.registerView();
	

	










	

}

