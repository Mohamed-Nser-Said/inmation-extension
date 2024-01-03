import * as vscode from 'vscode';

interface RawNotebook {
	cells: RawNotebookCell[];
}

interface RawNotebookCell {
	source: string[];
	cell_type: 'code' | 'markdown';
}

export default class Serializer implements vscode.NotebookSerializer {
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
			item => new vscode.NotebookCellData(
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
