import * as vscode from 'vscode';


import Inmation  from './Inmation/Inmation';
import { Io } from './extensions/IoModel/IO.View';
import { Props } from './extensions/Props/Props.View';
import { Action } from './extensions/Compose/Action.View';
import { Notebook } from './extensions/Notebook/init';
import { InmationFs } from './extensions/InmationFs/init';


// eslint-disable-next-line no-var



export function activate(context: vscode.ExtensionContext) {

	Io.init();
	InmationFs.init(context);
	// Props.init();
	Action.init();
	Notebook.init(context);



}


export function deactivate() {
	Inmation.Object.dispose();
}

