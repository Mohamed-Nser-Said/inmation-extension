import * as vscode from 'vscode';
import * as p from 'path';
import Inmation from '../../Inmation/Inmation';


export namespace Io {

	const ioViewId = "Main:Io.View";

	export namespace Model {
		export class IoObject extends vscode.TreeItem {

			constructor(
				public label: string,
				public type: string | null,
				public value: any,
				public path: string | null,
				public children: IoObject[],
				public collapsibleState: vscode.TreeItemCollapsibleState,

				public readonly command?: vscode.Command
			) {
				super(label, collapsibleState);
				this.iconPath = {
					light: p.join(__filename, '..', '..', '..', '..', 'resources', 'light', `${type}.svg`),
					dark: p.join(__filename, '..', '..', '..', '..', 'resources', 'dark', `${type}.svg`)
				};

				this.tooltip = `${this.label}-${this.type}`;
				this.description = this.value?.toString();
				this.contextValue = "IoModel.Object.Props.Hide";
			}


		}


	}

	class IODataProvider implements vscode.TreeDataProvider<Model.IoObject> {
		public refreshRate = 10000;
		public refreshFunction: NodeJS.Timer | undefined;
		private _onDidChangeTreeData: vscode.EventEmitter<Model.IoObject | undefined | void> = new vscode.EventEmitter<Model.IoObject | undefined | void>();
		readonly onDidChangeTreeData: vscode.Event<Model.IoObject | undefined | void> = this._onDidChangeTreeData.event;
		public inmNode = new Model.IoObject("Loading", "", null, "/System", [], vscode.TreeItemCollapsibleState.None);

		constructor() {

			Inmation.Object.onceRunScriptEnable(() => {
				this.refresh();
				setInterval(async () => this.refresh(), this.refreshRate);
			});
		}



		setRefreshRate(rate: number) {
			this.refreshRate = rate;
			clearInterval(this.refreshFunction);

			if (this.refreshRate == -1) return;
			this.refreshFunction = setInterval(async () => Inmation.Object.isReady && this.refresh(), this.refreshRate);
		}

		async refresh(): Promise<void> {

			Inmation.Object.onceRunScriptEnable(async () => {
				const tree = await Inmation.Task.getFullIoTree();

				if (!tree) {
					return;
				}
				this.inmNode = new Model.IoObject(tree.label, tree.type, tree.value, tree.path, tree.children, vscode.TreeItemCollapsibleState.Collapsed);
				this._onDidChangeTreeData.fire();
			});

		}

		public async showObject(item: any): Promise<any> {

			const scriptLibray = await Inmation.Task.getScriptLibray();
			vscode.window.showInformationMessage(scriptLibray?.join(', '));
			this.refresh();

		}

		public async getObjectProps(item: Model.IoObject): Promise<any> {

			// const props = await this.webapiCommands.getObjectProps(item);
			// return props;

			return [
				{ "scriptLibray": ["test1", "test2"] },
				{ "Methods": ["test1", "test2"] },
				{ "Properties": ["test1", "test2"] }

			];

		}


		public addObject(objname: string, parentItem: Model.IoObject, ioClass: string): void {

			Inmation.Task.addObject(parentItem.path || "", objname, ioClass);
			this.refresh();

		}

		public deleteObject(item: Model.IoObject): void {

			Inmation.Task.deleteObject(item);

			this.refresh();

		}


		getTreeItem(item: Model.IoObject): vscode.TreeItem {

			return new Model.IoObject(item.label, item.type, item.value, item.path, item.children || [],
				item.children?.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);

		}

		async getChildren(item?: any) {

			if (item) {
				return item.children;
			}


			return [this.inmNode];


		}
	}


	export function init() {

		const dataProvider = new IODataProvider();
		vscode.window.registerTreeDataProvider(ioViewId, dataProvider);

		vscode.commands.registerCommand(`${ioViewId}.Settings`, () => {

			const inputbox = vscode.window.createInputBox();
			inputbox.title = "Refresh Rate";
			inputbox.placeholder = "Refresh Rate";
			// inputbox.show();
			vscode.window.showQuickPick(["Refresh Rate"]).then(selected => {
				if (selected === "Refresh Rate") {
					inputbox.show();
					inputbox.onDidAccept(async () => {
						vscode.window.showInformationMessage(`Refresh Rate set to ${inputbox.value}`);
						dataProvider.setRefreshRate(parseInt(inputbox.value));
						inputbox.hide();
					});



				}
			});
		});

		vscode.commands.registerCommand(`${ioViewId}.Refresh`, () => dataProvider.refresh());

		vscode.commands.registerCommand(`${ioViewId}.AddObject`, (item: Model.IoObject) => {

			const inputbox = vscode.window.createInputBox();
			inputbox.title = "Add Object";
			inputbox.placeholder = "Object Name";
			inputbox.show();

			const classes: string[] = ['MODEL_CLASS_GENFOLDER', 'MODEL_CLASS_ACTIONITEM', 'MODEL_CLASS_VARIABLE', 'MODEL_CLASS_DATAFOLDER', 'MODEL_CLASS_HOLDERITEM'];

			inputbox.onDidAccept(async () => {
				vscode.window.showQuickPick(classes).then(selected => {

					dataProvider.addObject(inputbox.value, item, selected || "");
					vscode.window.showInformationMessage(`Added ${inputbox.value} to ${item.label}`);
					dataProvider.refresh();



				});

			});
		});

		vscode.commands.registerCommand(`${ioViewId}.DeleteObject`, (item: Model.IoObject) => dataProvider.deleteObject(item));

		vscode.commands.registerCommand(`${ioViewId}.ShowObject`, (item: Model.IoObject) => dataProvider.showObject(item));
	}








}
