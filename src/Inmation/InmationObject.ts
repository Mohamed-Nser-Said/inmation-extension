// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client } = require('@inmation/inmation-api-client/lib/client');
import { ComposeManager } from "./ComposeManger";
import { Connection } from "../Models/Connection";
import WebApi from "./WebApi";
import { OutputChannel } from "./OutputChannel";
import { InputChannel } from "./InputChannel";
import { ComposeAction, ExecFuncAction, FlowAction, MassAction } from "../Models/ComposeActions";
import * as vscode from 'vscode';
import { promises } from "dns";




export class InmationObject {


	public webapi = new WebApi();
	public compose = new ComposeManager();
	public runScriptEnable = false;
	public connection: Connection | undefined;
	public outputChannel: OutputChannel;
	public inputChannel: InputChannel;
	public connectionStateListener: ((connectionInfo: any) => void)[] = [];
	public clientErrorListener: ((err: any) => void)[] = [];

	constructor(outputChannel: OutputChannel, inputChannel: InputChannel) {
		this.outputChannel = outputChannel;
		this.inputChannel = inputChannel;

		this.webapi.onConnectionChanged((connectionInfo: any) => {
			const state = `${this.connection?.name}: ${connectionInfo.stateString} ${connectionInfo.authenticated ? " and Authenticated" : ""}`;
			this.outputChannel.log(state);
			// this.outputChannel.info(state); // the information is already in the log and is not sutiable nofification widget
			this.connectionStateListener.forEach((callback) => {
				callback(connectionInfo);
			});
		});


		this.webapi.onError((err: any) => {
			// this.outputChannel.error(err.message);
			this.outputChannel.log(err.message);

			this.clientErrorListener.forEach((callback) => {
				callback(err);
			});
		});


		this.onceReady(async () => {
			const result: any = await this.enableRunScript();
			if (result.stats.failure === 0) {
				outputChannel.log("Run Script Enabled");
				setTimeout(() => {
					this.runScriptEnable = true;
					outputChannel.log("1 second passed.");
				}, 1000);

			}
		});

	}



	public onClientError(callback: (err: any) => void): void {
		this.clientErrorListener.push(callback);
	}


	public onConnectionChanged(callback: (connectionInfo: any) => void): void {
		this.connectionStateListener.push(callback);
	}

	public async selectConnection() {

		const selected = await this.inputChannel.selectConnection(this.compose.connectionsNames);
		if (!selected) {
			this.outputChannel.warn("No connection selected!");
			return;
		}

		const connection = this.compose.connectionByName(selected);
		await this.connect(connection);
	}

	public onceReady(callback: () => void): void {
		const interval = setInterval(() => {
			if (this.webapi.isReady()) {
				clearInterval(interval);
				callback();
			}
		}, 100);
	}


	public onceRunScriptEnable(callback: () => void): void {
		const interval = setInterval(() => {
			if (this.runScriptEnable && this.webapi.isReady()) {
				this.outputChannel.log("running callback");
				clearInterval(interval);
				callback();
			}
		}, 100);
	}

	public async enableRunScript() {

		const model = [{
			"path": "/WebAPIServer_WEBAPI-TAK_01",
			"class": "WebAPIServer",
			"ObjectName": "WebAPIServer_WEBAPI-TAK_01",
			"ObjectDescription": "Web API Server",
			"ContextPath": "/System/Core",
			"RunScriptEnable": true
		}];

		const mass = new MassAction(
			"Enable Run Script",
			"mass",
			model,
			"Enable Run Script"
		);


		const result = await this.mass(mass);
		this.outputChannel.log(`Enable Run Script: ${result.stats.success} success, ${result.stats.failure} failure`);
		return result;


	}

	public get isReady(): boolean {
		return this.webapi.isReady();
	}

	public async connect(connection: Connection): Promise<void> {
		this.connection = connection;
		this.webapi.connect(connection);
	}

	public async disconnect(): Promise<void> {
		this.webapi.disconnect();
	}

	public async runScript(ctx: any, script: string) {
		if (!this.webapi.isReady()) {
			this.outputChannel.error("Cannot run script. Not connected!");
			return;
		}
		return await this.webapi.runScript(ctx, script);
	}


	public async mass(item: MassAction) {
		if (!this.webapi.isReady()) {
			this.outputChannel.warn("Cannot Run Mass Action. Connection issue!");
			return;
		}
		if (typeof item.model === "string") {
			item.model = await item.readModelConfigFolder(this.compose.scriptReferences);
		}
		const result = await this.webapi.mass(item.model);
		return result;
	}


	public async execFunc(item: ExecFuncAction): Promise<any> {
		if (!this.webapi.isReady()) {
			this.outputChannel.warn("Cannot Run ExecFunc Action. Connection issue!");
			return;
		}
		return await this.webapi.execFunc(item);
	}

	public async flow(item: FlowAction) {
		if (!this.webapi.isReady()) {
			this.outputChannel.warn("Cannot Run Flow Action. Connection issue!");
			return;
		}
		const result: any[] = [];

		for (const step of item.steps) {

			const action = this.compose.getActionByName(step);
			if (action === undefined) return;
			action instanceof MassAction ?
				result.push(await this.mass(action)) :
				result.push(await this.execFunc(action as ExecFuncAction));

		}

		console.log(result);

		return result;
	}

	public dispose(): void {
		this.webapi.disconnect();
	}

}
















