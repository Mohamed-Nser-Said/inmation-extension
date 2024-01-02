import * as vscode from 'vscode';


import Inmation  from './Inmation/Inmation';
import { Io } from './Views/IO.View';
import { Props } from './Views/Props.View';
import { Action } from './Views/Action.View';
import { ScriptLibrary } from './Views/ScriptLibaray.View';
import { Notebook } from './Notebook/Notebook.View';




export function activate(context: vscode.ExtensionContext) {

	
	
	Io.registerView();
	Props.registerView();
	Action.registerView();
	ScriptLibrary.registerView(context);
	Notebook.registerView(context);


	










	

}

