import * as vscode from 'vscode';
import { ActionDataProvider } from './DataProviders/ComposeActionDataProvider';
import Inmation from '../Inmation/Inmation';
import { MassAction } from '../Models/ComposeActions';
import { ActionType } from '../Enums/ActionsPropType';


export namespace Action {

	const ViewId = "Compose:Action.View";







	export function registerView() {

		const compose = Inmation.Object.compose;
		const dataProvider = new ActionDataProvider();
		vscode.window.registerTreeDataProvider(ViewId, dataProvider);

		vscode.commands.registerCommand(`${ViewId}.FavoriteAction`, (action) => {
			dataProvider.addFavorite(action);
			dataProvider.refresh();
		});

		vscode.commands.registerCommand(`${ViewId}.RenderModel`, (action) => {
			if (action.type === ActionType.Mass) {
				const massAction = new MassAction(action.name, action.type, action.model, action.comment);

				(async () => {
					const objects = await massAction.readModelConfigFolder(compose.scriptReferences);
					vscode.window.showTextDocument(vscode.Uri.parse(`untitled:${massAction.name}.json`), { viewColumn: vscode.ViewColumn.Beside }).then((editor) => {
						editor.edit(editBuilder => {
							editBuilder.insert(new vscode.Position(0, 0), JSON.stringify(objects, null, 2));
						});
			
					});

				})();

				
			}

		}
		);

		// 	if (action.type === ActionType.Mass) {
		// 		const massAction = new MassAction(action.name, action.type, action.model, action.comment);

		// 		(async () => {
		// 			const objects = await massAction.readModelConfigFolder(compose.scriptReferences);
		// 			const webview = vscode.window.createWebviewPanel(
		// 				'compose',
		// 				'Compose',
		// 				vscode.ViewColumn.One,
		// 				{
		// 					enableScripts: true,
		// 					retainContextWhenHidden: true,
		// 				}
		// 			);
		// 			webview.webview.html = `
		// 			<!DOCTYPE html>
		// 			<html lang="en">
		// 			<head>
						
		// 				<meta charset="UTF-8">
		// 				<meta name="viewport" content="width=device-width, initial-scale=1.0">
		// 				<title>Compose</title>
		// 				</head>
		// 				<body>
		// 				<h1>Compose</h1>
		// 				<p>Compose</p>
		// 				<pre>${JSON.stringify(objects, null, 2)}</pre>
		// 				</body>
		// 				</html>
		// 				`;

		// 		})();

		// 		// this._webApi.runMassAction(massAction.model, massAction.comment);
		// 	}

		// }
		// );

		vscode.commands.registerCommand(`${ViewId}.RunAction`, async (action) => {
			dataProvider.addRecent(action);
			if (action.type === ActionType.Mass) {

				const massAction = new MassAction(action.name, action.type, action.model, action.comment);

				const result = await Inmation.Object.mass(massAction);
				let message = '';
				for (const item of result.items) {
					message = message + `${item.p} is ${item.n}\n`;
				}

				message = message + `\nwith success=${result.stats.success}/${result.stats.total}, and failure=${result.stats.failure},`;
				vscode.window.showInformationMessage(message);


			} else if (action.type === ActionType.ExecFunc) {

				const result = await Inmation.Object.execFunc(action);
				for (const item of result) {
					vscode.window.showInformationMessage(`${item.v}`);
				}
			} else if (action.type === ActionType.Flow) {
				const results = await Inmation.Object.flow(action);
				if (results === undefined) return;

				vscode.window.showInformationMessage(`Flow Action finished with ${results.length} steps`);
				let message = '';
				for (const result of results) {
					for (const item of result.items) {
						message = message + `${item.p} is ${item.n}\n`;
					}
				}
				vscode.window.showInformationMessage(message);

			}
		});







	}




}