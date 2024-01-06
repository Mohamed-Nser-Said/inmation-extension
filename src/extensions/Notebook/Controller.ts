import * as vscode from 'vscode';
import Inmation from '../../Inmation/Inmation';


async function execute(code: string) {


	const scriptSequence = [
		"local __return_array = { __print = {}, __return = {}, __error = {}}",
		"_ENV.print = function (value) table.insert(__return_array.__print, value) end",
		"local function __main()",
		` ${code}`,
		"end",
		"local result =  __main() ",
		"table.insert(__return_array.__return, result)",
		"do local json = require('rapidjson') return json.encode(__return_array) end",

	];

	return Inmation.Object.onceRunScriptEnable(
		() => Inmation.Object.runScript("/System", scriptSequence.join('\n'))
		
	);




}

export default class Controller {
	readonly controllerId = 'inmation-lua-notebook-controller-id';
	readonly notebookType = 'inmation-lua-notebook';
	readonly label = 'Inmation Notebook';
	readonly supportedLanguages = ['lua'];

	private readonly _controller: vscode.NotebookController;
	private _executionOrder = 0;

	constructor() {
		this._controller = vscode.notebooks.createNotebookController(
			this.controllerId,
			this.notebookType,
			this.label
		);

		this._controller.supportedLanguages = this.supportedLanguages;
		this._controller.supportsExecutionOrder = true;
		this._controller.executeHandler = this._execute.bind(this);
	}

	private _execute(
		cells: vscode.NotebookCell[],
		_notebook: vscode.NotebookDocument,
		_controller: vscode.NotebookController
	): void {
		for (const cell of cells) {
			this._doExecution(cell);
		}
	}

	private async _doExecution(cell: vscode.NotebookCell): Promise<void> {
		const execution = this._controller.createNotebookCellExecution(cell);
		execution.executionOrder = ++this._executionOrder;
		execution.start(Date.now()); // Keep track of elapsed time to execute cell.
		const code = cell.document.getText();


		execute(code).then((result) => {

			const resultObj = JSON.stringify(result);
			execution.replaceOutput([
				new vscode.NotebookCellOutput([
					vscode.NotebookCellOutputItem.text(resultObj, "text/plain")
				])
			]);
		}).catch((err: any) => {
			console.log(err.message);

			execution.replaceOutput([
				new vscode.NotebookCellOutput([
					vscode.NotebookCellOutputItem.stderr(err.message)
				])
			]);
		}).finally(() => {
			execution.end(true, Date.now());
		});
	}

	dispose() {
		this._controller.dispose();
	}
}