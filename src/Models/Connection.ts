import * as vscode from "vscode";
import { Options } from "./Options";
import path = require("path");


export  class Connection extends vscode.TreeItem{
	name: string;
	hostname: string;
	port: number;
	usr: string;
	pwd: string;

	constructor(name:string, hostname: string, port: number, usr: string, pwd: string) {
		super(name, vscode.TreeItemCollapsibleState.None);
		this.iconPath = {
			light: path.join(__filename, "..", "..", "..", "resources", "light", "connection.svg"),
			dark: path.join(__filename, "..", "..", "..", "resources", "dark", "connection.svg"),
		};
		this.contextValue = "Compose.Connection.Disconnected";
		this.name = name;
		this.hostname = hostname;
		
		this.port = port;
		this.usr = usr;
		this.pwd = pwd;
	}

	public getOptions(): Options {
		return {
			auth: {
				username: this.usr,
				password: this.pwd,
				authority: "builtin",
				grant_type: "password",
			}
		};
	}

	public getWsUrl() {
		return `ws://${this.hostname}:${this.port}/ws`;
	}

	static Default(): Connection {
		return new Connection("Default", "localhost", 8002, "so", "inmation");
	}

	public isDefault(): boolean {
		return this.name === "Default";
	}
}