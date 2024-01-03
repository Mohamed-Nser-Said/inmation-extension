import * as vscode from 'vscode';
import { ActionDataProvider } from './ComposeActionDataProvider';
import Inmation from '../../Inmation/Inmation';
import { MassAction } from '../../Models/ComposeActions';
import { ActionType } from '../../Enums/ActionsPropType';
import * as p from 'path';


export namespace Action {

	const ViewId = "Compose:Action.View";







	export function init() {

		const compose = Inmation.Object.compose;
		const dataProvider = new ActionDataProvider();
		vscode.window.registerTreeDataProvider(ViewId, dataProvider);

		vscode.commands.registerCommand(`${ViewId}.FavoriteAction`, (action) => {
			dataProvider.addFavorite(action);
			dataProvider.refresh();
		});

		vscode.commands.registerCommand(`${ViewId}.RenderModel`, async (action) => {
			if (action.type === ActionType.Mass) {
				const massAction = new MassAction(action.name, action.type, action.model, action.comment);

				const doc = await massAction.readModelConfigFolder(Inmation.Object.compose.scriptReferences);
				const editor = await vscode.workspace.openTextDocument({ content: JSON.stringify(doc, null, 2), language: 'json' });
				await vscode.window.showTextDocument(editor, { preview: false });

				
			}

		}
		);

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