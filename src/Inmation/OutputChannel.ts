import * as vscode from 'vscode';


export class OutputChannel {

	public outputchannel = vscode.window.createOutputChannel("Inmation");
	public logEverything: boolean = false;
	
	constructor(logEverything: boolean = false) {
	
		this.logEverything = logEverything;
	}



	public info(message: any) {
		vscode.window.showInformationMessage(message);

	}

	public error(message: any) {
		vscode.window.showErrorMessage(message);

	}

	public log(message: any) {
		this.outputchannel.appendLine(message);
		this.outputchannel.show();

	}

	public warn(message: any) {
		vscode.window.showWarningMessage(message);

	}

	public data(message: any) {
		vscode.window.showInformationMessage(message);
	}



}


