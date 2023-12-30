
import { InmationObject } from "./InmationObject";
import { Task } from "./Task";
import { OutputChannel } from "./OutputChannel";
import { InputChannel } from "./InputChannel";
import * as vscode from 'vscode';
import { MassAction } from "../Models/ComposeActions";

// create the inmation object


// define the user commands


const oc = new OutputChannel();
const ic = new InputChannel();
const inmation = new InmationObject(oc, ic);
const task = new Task(inmation);

vscode.commands.registerCommand("Inmation.Disconnect", async () => {
	inmation.disconnect();
});

vscode.commands.registerCommand("Inmation.Connect", async () => {
	inmation.selectConnection();
});

// create status bar items
const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
statusBarItem.text = "$(plug) Inmation";
statusBarItem.command = "Inmation.Connect";
statusBarItem.show();


// listen to connection changes

inmation.onConnectionChanged((connectionInfo: any) => {
	statusBarItem.color = (connectionInfo.state === 4 && connectionInfo.authenticated) ? "lightgreen" : statusBarItem.color = "yellow";
	statusBarItem.tooltip = `${inmation.connection?.name}: ${connectionInfo.stateString} ${connectionInfo.authenticated ? " and Authenticated" : ""}`;
});


export namespace Inmation {


	export function Object() {
		return inmation;
	}

	export namespace Task {
		export async function deleteObject(item: any) {
			return await task.deleteObject(item);
		}
		export async function addObject(parentPath: string, objName: string, objClass: string) {
			return await task.addObject(parentPath, objName, objClass);
		}
		export async function getFullIoTree() {
			return await task.getFullIoTree();
		}
		export async function getScriptLibray(item: any) {
			return await task.getScriptLibray(item);
		}



		
	}











}