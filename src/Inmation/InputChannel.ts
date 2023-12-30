import * as vscode from 'vscode';

export class InputChannel {

	
	public async selectConnection(connectionNames: string[]): Promise<string | undefined> {

		const connectionName = await vscode.window.showQuickPick(connectionNames, { placeHolder: "Select connection" });
		if (!connectionName) {
			return undefined;
		}
		return connectionName;


	}





}
