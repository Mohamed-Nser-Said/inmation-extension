
import {Connection} from "./Connection";
import ScriptReference from "../types/ScriptReference";
import { ComposeAction, ExecFuncAction, FlowAction, MassAction } from "./ComposeActions";

export default  class Compose {

	version: string;
	connections: Connection[];
	scriptReferences: ScriptReference[];
	actions: ComposeAction [];

	constructor(version: string, connections: Connection[], scriptReferences: ScriptReference[], actions: ComposeAction []) {
		this.version = version;
		this.connections = connections.map(connection => new Connection(connection.name, connection.hostname, connection.port, connection.usr, connection.pwd));
		this.scriptReferences = scriptReferences.map(scriptReference => new ScriptReference(scriptReference.namespace, scriptReference.folderPath));
		this.actions = actions;
	}

	public getConnectionsNames(): string[] {
		return this.connections.map(connection => connection.name);
	}

	public getConnectionByName(name: string): Connection  {
		return this.connections.find(connection => connection.name === name) || Connection.Default();
	}

	public groupActionByType(): Map<string, ComposeAction[]> {
		const groupedActions = new Map<string, ComposeAction[]>();
		this.actions.forEach(action => {
			const type = action.type;
			const actions = groupedActions.get(type) || [];
			actions.push(action);
			groupedActions.set(type, actions);
		});
		return groupedActions;
	}

	public getActionByName(name: string): ComposeAction| undefined {
		return this.actions.find((action :ComposeAction) => action.name === name);
	}

	static FromJson(json: string): Compose {
		const compose = JSON.parse(json);
		return new Compose(compose.version, compose.connections, compose.scriptReferences, compose.actions);
	}







}