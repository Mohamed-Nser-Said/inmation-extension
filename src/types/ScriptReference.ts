
export default class ScriptReference {
	public namespace: string;
	public folderPath: string;

	constructor(namespace: string, folderPath: string) {
		this.namespace = namespace;
		this.folderPath = folderPath;
	}
}