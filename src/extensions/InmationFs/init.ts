
'use strict';
import * as vscode from 'vscode';
import { MemFS } from './fsprovider';
import Inmation from '../../Inmation/Inmation';
import { AdvancedLuaScript } from '../../Models/AdvancedLuaScript';

export namespace InmationFs {




	export async function init(context: vscode.ExtensionContext) {


		const memFs = new MemFS();
		context.subscriptions.push(vscode.workspace.registerFileSystemProvider('memfs', memFs, { isCaseSensitive: true }));


		Inmation.Object.onceRunScriptEnable(async () => {
			vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('memfs:/'), name: "Inmation" });
			await memFs.pullScriptLibrary();
		});

		vscode.commands.registerCommand("InmationFs.Refresh", () => {
			Inmation.Object.onceRunScriptEnable(async () => {
				await memFs.pullScriptLibrary();
			});
		});


		vscode.workspace.onDidOpenTextDocument(async e => {
			if (e.uri.scheme === 'memfs') {
				// remove .lua from filename
				const filename = e.uri.path.split("/").pop()?.split(".")[0] ?? "";
				const path = e.uri.path.split("/").slice(0, -1).join("/");

				const item = await Inmation.Task.loadAdvancedLuaScript({ path: path, name: filename });

				memFs.writeFile(e.uri, Buffer.from(item.scriptBody ?? "--"), { create: true, overwrite: true });

			}
		});

		vscode.workspace.onDidCreateFiles(async e => {

			for (const file of e.files) {
				if (file.scheme === 'memfs') {
					const filename = file.path.split("/").pop()?.split(".")[0] ?? "";
					const path = file.path.split("/").slice(0, -1).join("/");
					const script = await Inmation.Task.createAdvancedLuaScript({ path: path, name: filename, scriptBody: "-- empty" });
					memFs.writeFile(file, Buffer.from(script), { create: true, overwrite: true });
					vscode.window.showInformationMessage("Created");
				}
			}
		});



		vscode.workspace.onDidRenameFiles(async e => {
			if (e.files[0].newUri.scheme === 'memfs') {

				const newFileName = e.files[0].newUri.path.split("/").pop()?.split(".")[0] ?? "";
				const newFilePath = e.files[0].newUri.path.split("/").slice(0, -1).join("/");
				const oldFileName = e.files[0].oldUri.path.split("/").pop()?.split(".")[0] ?? "";

				await Inmation.Task.updateScriptLibraryName(newFilePath, oldFileName, newFileName);

				vscode.window.showInformationMessage("Renamed");
			}
		});
		vscode.workspace.onDidSaveTextDocument(async e => {
			if (e.uri.scheme === 'memfs') {
				const filename = e.uri.path.split("/").pop()?.split(".")[0] ?? "";
				const path = e.uri.path.split("/").slice(0, -1).join("/");
				const script = e.getText();
				// remove .lua from filename
				await Inmation.Task.updateAdvancedLuaScript(path, filename, script);
				memFs.writeFile(e.uri, Buffer.from(script), { create: true, overwrite: true });
				vscode.window.showInformationMessage("Saved");

			}
		});

		vscode.workspace.onDidDeleteFiles(async e => {
			const items: AdvancedLuaScript[] = [];
			for (const file of e.files) {
				if (file.scheme === 'memfs') {
					const filename = file.path.split("/").pop()?.split(".")[0] ?? "";
					const path = file.path.split("/").slice(0, -1).join("/");
					items.push({ name: filename, path: path });
				}
			}
			await Inmation.Task.deleteAdvancedLuaScript(items);
		});






	}




}