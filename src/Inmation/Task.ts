import { AdvancedLuaScript } from "../Models/AdvancedLuaScript";
import { MassAction } from "../Models/ComposeActions";
import Inmation from "./Inmation";
import { InmationObject } from "./InmationObject";

export class Task {

	private inmation: InmationObject;
	constructor(inmation: InmationObject) {
		this.inmation = inmation;
	}


	public async addObject(parentPath: string, objName: string, objClass: string): Promise<any> {

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



	public async getFullIoTree(): Promise<any> {
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


	public async getScriptLibray(): Promise<any> {
		console.log("getScriptLibray");

		const lua = `
		
			local scriptLib = {}
			local function getChildren(path)
			local obj = syslib.getobject(path)
			local children = obj:children()
			local  ok, value = pcall(function  () return syslib.getvalue(obj:path()) end)
		
			if ok == false then 
				value = nil
			end
		
			local path = obj:path()
			local label = string.match(path, "[^/]+$")
			
			local result = {
					label = label,
					type = obj:type(),
					path = path,
					value = value,
					children = {},
				}
				
			local ok , scriptLibrary = pcall(function () return syslib.getvalue(path ..".ScriptLibrary.LuaModuleName")end )
			if ok ==true then table.insert(scriptLib,{label = label,scriptLibrary =scriptLibrary, path=path }) end
				
		
			
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
		return json.encode(scriptLib);

`;

		return await this.inmation.runScript("/System", lua);
	}


	public async loadAdvancedLuaScript(item: AdvancedLuaScript): Promise<AdvancedLuaScript> {
		console.log("getAdvancedLuaScript");

		const lua = ` 
		local scriptName = [[${item.name}]]
		local path = [[${item.path}]]
	   	local libName =  syslib.get(path ..".ScriptLibrary.LuaModuleName")
	   	local scripts = syslib.getvalue(path .. ".ScriptLibrary.AdvancedLuaScript")
	   
	   	local newLibName = {}
	   	local newScrips = {}
	   	for k, v in ipairs(libName) do 
			   if v == scriptName then
				   return scripts[k]
			   end
	   	end
	   
	   	return "-- empty"
	   
	   `;

		return { path: item.path, name: item.name, scriptBody: await this.inmation.runScript("/System", lua) };
	}


	public async updateAdvancedLuaScript(path: string, scriptName: string, script: string): Promise<any> {
		console.log("updateAdvancedLuaScript");

		const lua = ` 
		local scriptName = [[${scriptName}]]
		local path = [[${path}]]
	   	local libName =  syslib.getvalue(path ..".ScriptLibrary.LuaModuleName")
	   	local scripts = syslib.getvalue(path .. ".ScriptLibrary.AdvancedLuaScript")
	
	   	for k, v in ipairs(libName) do 
			   if v == scriptName then
				   scripts[k] = [[${script}]]
			   end
	   	end
	   
	   	syslib.set(path .. ".ScriptLibrary.AdvancedLuaScript",scripts )
	   `;

		console.log(lua);
		return await this.inmation.runScript("/System", lua);
	}

	public async updateScriptLibraryName(path: string, oldName: string, newName: string): Promise<any> {
		console.log("updateScriptLibraryName");

		const lua = ` 
		local path = [[${path}]]
	   	local libName =  syslib.getvalue(path ..".ScriptLibrary.LuaModuleName")
	   	local scripts = syslib.getvalue(path .. ".ScriptLibrary.AdvancedLuaScript")
	
	   	for k, v in ipairs(libName) do 
			   if v == [[${oldName}]] then
				   libName[k] = [[${newName}]]
			   end
	   	end
	   
	   	syslib.set(path .. ".ScriptLibrary.LuaModuleName",libName )
	   `;

		return await this.inmation.runScript("/System", lua);
	}


	public async deleteAdvancedLuaScript(items: AdvancedLuaScript[] | AdvancedLuaScript): Promise<void> {

		const deleteOnce = async (item: AdvancedLuaScript) => {
			return ` 
			local scriptName = [[${item.name}]]
			local path = [[${item.path}]]
			local libName =  syslib.getvalue(path ..".ScriptLibrary.LuaModuleName")
			local scripts = syslib.getvalue(path .. ".ScriptLibrary.AdvancedLuaScript")
		
			local newLibName = {}
			local newScrips = {}
			for k, v in ipairs(libName) do 
				   if v ~= scriptName then
					   table.insert(newLibName,v)
					   table.insert(newScrips,scripts[k])
				   end
			end
		
			syslib.set(path .. ".ScriptLibrary.LuaModuleName",newLibName )
			syslib.set(path .. ".ScriptLibrary.AdvancedLuaScript",newScrips )
		   `;
		};

		const deleteMany = async (items: AdvancedLuaScript[]) => {
			let lua = "";
			for (const item of items) {
				lua += await deleteOnce(item);
			}
			return lua;
		};

		const lua = await deleteMany(Array.isArray(items) ? items : [items]);

		return await this.inmation.runScript("/System", lua);

	}

	public async createAdvancedLuaScript(item: AdvancedLuaScript): Promise<any> {
		console.log("createAdvancedLuaScript");
		const lua = ` 
		local scriptName = [[${item.name}]]
		local path = [[${item.path}]]
	   	local libName =  syslib.get(path ..".ScriptLibrary.LuaModuleName")
	   	local scripts = syslib.getvalue(path .. ".ScriptLibrary.AdvancedLuaScript")
	   
	   	table.insert(libName, scriptName)
	   	table.insert(scripts, [[${item.scriptBody}]])
	   
	   	syslib.set(path .. ".ScriptLibrary.LuaModuleName",libName )
	   	syslib.set(path .. ".ScriptLibrary.AdvancedLuaScript",scripts )
	   `;

		return await this.inmation.runScript("/System", lua);
	}














}

