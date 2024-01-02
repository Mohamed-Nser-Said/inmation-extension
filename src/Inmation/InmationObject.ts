// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client } = require('@inmation/inmation-api-client/lib/client');
import { ComposeManager } from "./ComposeManger";
import { Connection } from "../Models/Connection";
import WebApi from "./WebApi";
import { OutputChannel } from "./OutputChannel";
import { InputChannel } from "./InputChannel";
import { ComposeAction, ExecFuncAction, FlowAction, MassAction } from "../Models/ComposeActions";
import * as vscode from 'vscode';




export class InmationObject {


	public webapi = new WebApi();
	public compose = new ComposeManager();
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
		const model = await item.readModelConfigFolder(this.compose.scriptReferences);
		const result = await this.webapi.mass(model);
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

}
















