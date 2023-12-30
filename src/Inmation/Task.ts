import { MassAction } from "../Models/ComposeActions";
import { InmationObject } from "./InmationObject";

export class Task {

	private inmation: InmationObject;
	constructor(inmation: InmationObject) {
		this.inmation = inmation;
	}


	async addObject(parentPath: string, objName: string, objClass: string): Promise<any> {

		const lua = `
						obj = syslib.createobject("${parentPath}", "${objClass}")
						obj.ObjectName = "${objName}"
						obj:commit()`;

		return await this.inmation.runScript("/System", lua);

	}


	async deleteObject(item: any): Promise<any> {

		const deleteObjectLua = `return syslib.deleteobject("${item.path}")`;

		return await this.inmation.runScript("/System", deleteObjectLua);

	}



	async getFullIoTree(): Promise<any> {
		console.log("getFullIoTree");

		const getChildrenLua = `
		
			local function getChildren(path)
			local obj = syslib.getobject(path)
			local children = obj:children()
			local  ok, value = pcall(function  () return syslib.getvalue(obj:path()) end)
		
			if ok == false then 
				value = nil
			end
		
			local path = obj:path()
			local lable = string.match(path, "[^/]+$")
			
			local result = {
					label = lable,
					type = obj:type(),
					path = path,
					value = value,
					children = {},
				}
		
			
			if children == nil then
				return result
			else 
		
			for _,c in pairs(children) do
				table.insert(result.children, getChildren(c:path()) )
				
			end
				return result
			end
			
		
		end
		
		local json = require("dkjson")
		local result = getChildren("/System")
		return json.encode(result)
		
				`;
		return await this.inmation.runScript("/System", getChildrenLua);

	}


	async getScriptLibray(item: any): Promise<string[]> {
		console.log(item.path);

		const lua = `return syslib.getvalue("${item.path}.ScriptLibrary.LuaModuleName")`;

		return await this.inmation.runScript("/System", lua);
	}












}

