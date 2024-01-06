
import { InmationObject } from "./InmationObject";
import { Task } from "./Task";
import { OutputChannel } from "./OutputChannel";
import { InputChannel } from "./InputChannel";
import * as vscode from 'vscode';




class Inmation {

	private static object: InmationObject;
	private static task: Task;
	public dev: boolean = true;

	constructor() {

		const oc = new OutputChannel();
		const ic = new InputChannel();
		Inmation.object = new InmationObject(oc, ic);



		if (this.dev) {
			const connection = Inmation.object.compose.connectionByName("docker WEBAPI-TAK");
			Inmation.object.connect(connection);
		}

		

		else {
			Inmation.object.selectConnection();
		}
		

		vscode.commands.registerCommand("Inmation.Disconnect", async () => Inmation.object.disconnect()
		);

		vscode.commands.registerCommand("Inmation.Connect", async () => {
			Inmation.object.selectConnection();
		});

		// create status bar items
		const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
		statusBarItem.text = "$(plug) Inmation";
		statusBarItem.command = "Inmation.Connect";
		statusBarItem.show();


		// listen to connection changes

		Inmation.object.onConnectionChanged((connectionInfo: any) => {
			statusBarItem.color = (connectionInfo.state === 4 && connectionInfo.authenticated) ? "lightgreen" : statusBarItem.color = "yellow";
			statusBarItem.tooltip = `${Inmation.object.connection?.name}: ${connectionInfo.stateString} ${connectionInfo.authenticated ? " and Authenticated" : ""}`;
		});

		// ask for connection on startup
		// then create a notebook client

		Inmation.task = new Task(Inmation.object);


	}

	get Object() {
		return Inmation.object;
	}

	get Task() {
		return Inmation.task;
	}



}



const inmation = new Inmation();
export default inmation;
