
import { TextDecoder, TextEncoder } from 'util';
import * as vscode from 'vscode';
import Inmation from '../Inmation/Inmation';

export namespace Notebook {

	interface RawNotebook {
		cells: RawNotebookCell[];
	}

	interface RawNotebookCell {
		source: string[];
		cell_type: 'code' | 'markdown';
	}

	class SampleSerializer implements vscode.NotebookSerializer {
		async deserializeNotebook(
			content: Uint8Array,
			_token: vscode.CancellationToken
		): Promise<vscode.NotebookData> {
			const contents = new TextDecoder().decode(content);

			let raw: RawNotebookCell[];
			try {
				console.log(contents);
				raw = JSON.parse(contents);
				console.log(contents);
				// raw = <RawNotebook[]>JSON.parse(contents);
			} catch {
				raw = [];
			}

			console.log(raw);
			const cells = raw.map(
				item =>
					new vscode.NotebookCellData(
						item.cell_type === 'code'
							? vscode.NotebookCellKind.Code
							: vscode.NotebookCellKind.Markup,
						item.source.join('\n'),
						item.cell_type === 'code' ? 'lua' : 'markdown'
					)
			);

			return new vscode.NotebookData(cells);
		}

		async serializeNotebook(
			data: vscode.NotebookData,
			_token: vscode.CancellationToken
		): Promise<Uint8Array> {
			const contents: RawNotebookCell[] = [];

			for (const cell of data.cells) {
				contents.push({
					cell_type: cell.kind === vscode.NotebookCellKind.Code ? 'code' : 'markdown',
					source: cell.value.split(/\r?\n/g)
				});
			}

			return new TextEncoder().encode(JSON.stringify(contents));
		}
	}


	class Controller {
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


			Inmation.notebook.execute(code).then((result) => {

				const resultObj = JSON.stringify(result);
				execution.replaceOutput([
					new vscode.NotebookCellOutput([
						vscode.NotebookCellOutputItem.text(resultObj, "text/plain")
					])
				]);
			}).catch((err:any) => {
				console.log(err.message);
			
				execution.replaceOutput([
					new vscode.NotebookCellOutput([
						vscode.NotebookCellOutputItem.stderr( err.message)
					])
				]);
			}).finally(() => {
				execution.end(true, Date.now());
			});
		}
	}




	export function registerView(context : vscode.ExtensionContext) {

		context.subscriptions.push(vscode.workspace.registerNotebookSerializer('inmation-lua-notebook', new SampleSerializer()));
		context.subscriptions.push(new Controller());

		// vscode.workspace.registerNotebookSerializer('inmation-lua-notebook', new SampleSerializer());
		// new Controller();


	}








}