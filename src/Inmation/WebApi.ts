
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client } = require('@inmation/inmation-api-client/lib/client');

import { ExecFuncAction } from '../Models/ComposeActions';
import { Connection } from '../Models/Connection';






export default class WebApi  {

	private _client = new Client();

	constructor() {

	
		this._client.onDataChanged((err:any, items:any) => {
			if (err) console.log(err.message);
			for (const item of items) {
				console.log(`Path: ${item.p} value: ${item.v}`);
			}
		});


		

	}


	public onDataChanged(callback: (err:any, items:any) => void): void {
		this._client.onDataChanged(callback);
	}


	public onError(callback: (err:any) => void): void {
		this._client.onError(callback);
	}

	public onConnectionChanged(callback: (connectionInfo:any) => void): void {
		this._client.onWSConnectionChanged(callback);
	}


	public async connect(connection :Connection): Promise<void> {

		const wsURL = connection.getWsUrl();
		const options = connection.getOptions();

		this._client.connectWS(wsURL, (err:any) => {
			if (err) return console.log(err.message);
	
		}, options);



	}

	public disconnect(): void {
		this._client.disconnectWS();
	}

	public isReady(): boolean {
		return this._client.wsConnectionInfo.state === 4 && this._client.wsConnectionInfo.authenticated;
	}

	public async runScript(ctx: string, script: string): Promise<any> {

		const res = new Promise((resolve, reject) => {
			this._client.runScript(ctx, script,
				(err: any, data: any) => {
					if (err) {
						reject(err);
					}
					if (data) {
						resolve(data[0].v);
					}

				},
				{ ign: false }
			);
		});

		return res;

	}

	public async mass(model: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this._client.mass(model,
				(err: any, data: any) => {
					if (err) {
						console.log(`Error: ${err.message}`);
						reject(err);
					}
					if (data) {
						resolve(data);
					}

				},
				{ ign: false }
			);
		});
	}


	public async execFunc(func:ExecFuncAction){
		console.log(func);
		return new Promise((resolve, reject) => {
			this._client.execFunction(func.ctx, func.lib, func.func, func.farg,
				(err: any, data: any) => {
					if (err) {
						console.log(`Error: ${err.message}`);
						reject(err);
					}
					if (data) {
						resolve(data);
					}

				},
				{ ign: false,scc:func.comment}
			);
		});
	}









}
