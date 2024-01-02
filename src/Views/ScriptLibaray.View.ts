
import * as vscode from 'vscode';
import { ScriptLibraryDataProvider } from './DataProviders/ScriptLibraryDataProvider';
import Inmation from '../Inmation/Inmation';
import { on } from 'events';

export namespace ScriptLibrary {

	const ViewId = "explorer:ScriptLibrary.View";



	export function registerView(context: vscode.ExtensionContext) {

		const dataProvider = new ScriptLibraryDataProvider();

		vscode.window.registerTreeDataProvider(ViewId, dataProvider);

		// edit 



		// finish edit

		vscode.commands.registerCommand(`${ViewId}.Refresh`, async () => {
			dataProvider.refresh();
			vscode.window.showInformationMessage("Refreshed Script Library View");
		});

		vscode.commands.registerCommand(`${ViewId}.ScriptLibrary.New`, async (scriptLibrary: any) => {
			vscode.window.showInputBox({ prompt: "Enter Script Library Name" }).then(async (name) => {
				if (name !== undefined) {
					const lua = `local newLib = "${name}"
					local oldLib = syslib.get("${scriptLibrary.path}.ScriptLibrary.LuaModuleName")
					
					for k,v in ipairs(oldLib) do 
						if v== newLib then
							error("Library with this name already exsist")
						end
					end
					table.insert(oldLib, newLib)
					syslib.set("${scriptLibrary.path}.ScriptLibrary.LuaModuleName",oldLib )`;
					Inmation.Object.runScript("/System", lua);
					setTimeout(() => vscode.commands.executeCommand(`${ViewId}.Refresh`), 400);


				}

			});

		});

		vscode.commands.registerCommand(`${ViewId}.Script.Delete`, async (script) => {
			const lua = ` local todelete = "${script.label}"
			local path = "${script.path}"
		   local libName =  syslib.get(path ..".ScriptLibrary.LuaModuleName")
		   local scrips = syslib.getvalue(path .. ".ScriptLibrary.AdvancedLuaScript")
		   
		   local newLibName = {}
		   local newScrips = {}
		   for k,v in ipairs(libName) do 
				   if v ~= todelete then
					   table.insert(newLibName, v)
					   table.insert(newScrips, scrips[k])
				   end
			   end
		   syslib.set(path.. ".ScriptLibrary.LuaModuleName",newLibName )
		   syslib.set(path .. ".ScriptLibrary.AdvancedLuaScript",newScrips )`;

			Inmation.Object.runScript("/System", lua);
			setTimeout(() => vscode.commands.executeCommand(`${ViewId}.Refresh`), 400);
		});

		vscode.commands.registerCommand(`${ViewId}.Script.Edit`, async (script) => {

			const lua = `local scriptName = "${script.label}"
			local path = "${script.path}"
			local libName =  syslib.get(path ..".ScriptLibrary.LuaModuleName")
			local scripts = syslib.getvalue(path .. ".ScriptLibrary.AdvancedLuaScript")
			
			for k, v in ipairs(libName) do 
					if v == scriptName then
						return scripts[k]
					end
			end`;

			const loadedScript = await Inmation.Object.runScript("/System", lua);
			const uri = vscode.Uri.parse(`inmation://${script.path}/${script.label}.lua`);


			const doc = await vscode.workspace.openTextDocument({language: "lua", content: loadedScript});
			

			vscode.window.showTextDocument(doc);
			// vscode.workspace.openTextDocument(uri).then((doc) => {
			// 	vscode.window.showTextDocument(doc, {preview: false, viewColumn: vscode.ViewColumn.Beside});
			// });









		});


	}
}