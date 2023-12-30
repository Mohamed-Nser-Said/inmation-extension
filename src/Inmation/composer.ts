'use strict';
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs-extra');
const path = require('path');
const scriptLoader = require('@inmation/inmation-compose-cli/lib/script-loader.js');
const { MappingManager } = require('@inmation/inmation-compose-cli/lib/mapping-manager');
const { ModelConfigManager } = require('@inmation/inmation-compose-cli/lib/model-config-manager.js');
const { Compose } = require('@inmation/inmation-compose-cli/lib/compose.js');
const {  model } = require('@inmation/inmation-api-client');
const WSConnectionInfo = model.WSConnectionInfo;
import { Buffer } from "buffer";
import * as vscode from 'vscode';

const isUndefined = (arg:any) => {
	return typeof arg === "undefined";
};

const isNull = (arg:any) => {
	return arg == null;
};

const isUndefinedOrNull = (arg:any) => {
	return isUndefined(arg) || isNull(arg);
};

export default class Composer {
	readonly workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
	readonly compose = new Compose(this.workspaceRoot);
    readonly client;
    readonly env;
    constructor(client: any) {
        this.client = client;
        this.env = console;
       
    }

    checkClient() {
        if (!this.client) {
            throw new Error(`Unable to run action, not connected to inmation WebAPI!`);
        }
    }


    /*
    * Read inmation-compose.json file.
    */
    async readComposeFile() {
        return this.compose;
    }

    /*
    * Read model by reading all config.json files.
    */
    async readModelConfigFolder(action:any, compose:any) {
        if (typeof (action.model) !== 'string') return null;
        const workspaceFolderPath = compose.workspaceFolderPath;
        let mappingManager = null;
        if (typeof (action.mapping) === 'string') {
            const mappingFilename = path.resolve(workspaceFolderPath, action.mapping);
            mappingManager = new MappingManager(mappingFilename);
        }
        const scriptLibraryManager = compose.scriptLibraryManager();
        const folderPath = path.resolve(workspaceFolderPath, action.model);
        const modelConfigManager = new ModelConfigManager(folderPath, scriptLibraryManager, mappingManager);
        const objects = modelConfigManager.inmationConfig();
        // const filePath = path.resolve(workspaceFolderPath, './output/objects.json');
        // fs.writeFileSync(filePath, JSON.stringify(objects), 'utf-8');
        return objects;
    }

    readScript(scriptRef:string, compose:any) {
   
        // First check whether script is referenced directly.
        let scriptBody:string = scriptLoader(compose.workspaceFolderPath, scriptRef);
        if (!scriptBody) {
            // Load from Script Library
            scriptBody = compose.scriptByName(scriptRef);
        }
        if (typeof (scriptBody) !== 'string') {
            throw new Error(`Unable to read script with name '${scriptRef}!'`);
        }
        return scriptBody;
    }

    debug(action:any, compose:any, data:any) {
        if (typeof (action.debug) === 'string') {
            let _data = data;
            let debugFilename = action.name || 'action';
            if (typeof (data) === 'object') {
                _data = JSON.stringify(data, null, 4);
                debugFilename = `${debugFilename}.json`;
            }
            else {
                debugFilename = `${debugFilename}.lua`;
            }
            const filePath = path.resolve(compose.workspaceFolderPath, action.debug, debugFilename);
            fs.writeFileSync(filePath, _data, 'utf-8');
            this.env.log(`Debug, action written to file: ${filePath}.`);
        }
    }

    handleResponseData(action:any, compose:any, err:any, data:any) {
        if (err) return;

        if (Array.isArray(data)) {
            data = data[0];
        }
        if (typeof (data) !== 'object' || isUndefinedOrNull(data)) return;
        if (!isUndefinedOrNull(data.v)) {
            data = data.v;
        }

        if (data !== null && typeof (data) === 'object') {
            data = JSON.stringify(data, null, 4);
        }

        if (action.outputFile) {
            try {
                const filePath = path.resolve(compose.workspaceFolderPath, action.outputFile);
                fs.writeFileSync(filePath, data.toString(), 'utf-8');
                this.env.log(`Response written to output file: ${filePath}.`);
            }
            catch (err2:any) {
                throw new Error(`Error writing to output file: ${err2.message}!`);
            }
        }
        if (action.output) {
            const outputFolderPath = path.resolve(compose.workspaceFolderPath, action.output);
            if (!fs.existsSync(outputFolderPath)) {
                throw new Error(`Error: 'output' folder does not exist: ${outputFolderPath}!`);
            }
            try {
                const outputFilename = `${action.name || 'action'}.json`;
                const filePath = path.resolve(compose.workspaceFolderPath, action.output, outputFilename);
                fs.writeFileSync(filePath, data.toString(), 'utf-8');
                this.env.log(`Response written to output file: ${filePath}.`);
            }
            catch (err2:any) {
                throw new Error(`Error writing to output file: ${err2.message}!`);
            }
        }
        else {
            this.env.log(data);
        }
    }

    async execFunctionAction(action:any, compose:any) {
        const context = action.ctx || action.context;
        const lib = action.lib || action.library;
        const func = action.func || action.function;
        let farg = action.farg || action.functionarg;

        if (farg || action.model) {
            farg = farg || {};
            if (action.model) {
                const objects = await this.readModelConfigFolder(action, compose);
                this.debug(action, compose, objects);
                // Lua safe by encoding objects to Base64
                const jsonString = JSON.stringify(objects);
                const buffer = Buffer.from(jsonString, 'utf-8');
                farg.objects = buffer.toString('base64');
            }
        }

        if (!lib) {
            throw new Error(`Action '${action.type}' needs 'lib'`);
        }
        this.checkClient();
        return new Promise((resolve, reject) => {
            this.client.execFunction(context, lib, func, farg, (err:any, data:any) => {
                this.handleResponseData(action, compose, err, data);
                if (err) return reject(err);
                resolve(null);
            }, {
                scc: action.comment
            });
        });
    }

    async runScriptAction(action:any, compose:any) {
        const context = action.ctx || action.context;
        let script = action.script || action.scriptBody;
        const scriptRef = action.scriptRef || action.scriptReference;
        if (typeof (script) !== 'string') {
            // Load script by reference
            script = this.readScript(scriptRef, compose);
        }

        if (action.data || action.model) {
            const data = action.data || {};
            if (action.model) {
                const objects = await this.readModelConfigFolder(action, compose);
                data.objects = objects;
            }
            this.debug(action, compose, data);
            // Lua safe by encoding data to Base64
            const jsonString = JSON.stringify(data);
            const buffer = Buffer.from(jsonString, 'utf-8');
            const dataBase64 = buffer.toString('base64');
            script = script.replace("%DATA-PLACEHOLDER%", dataBase64);
        }

        // Read Library
        if (Array.isArray(action.scriptLib)) {
            let scriptHeader = '';
            for (const scriptSpec of action.scriptLib) {
                if (typeof (scriptSpec) === 'object') {
                    let scriptLibStr = null;
                    if (typeof (scriptSpec.script) === 'string') {
                        scriptLibStr = scriptSpec.script;
                    }
                    else if (typeof (scriptSpec.scriptRef) === 'string' && typeof (scriptSpec.name) === 'string') {
                        scriptLibStr = this.readScript(scriptSpec.scriptRef, compose);
                    }
                    if (scriptLibStr !== null) {
                        scriptHeader += `package.loaded['${scriptSpec.name}'] = (function()\n${scriptLibStr}\nend)()\n\n`;
                    }
                }
            }
            if (scriptHeader !== '') {
                script = `local mime = require('mime')\n\n${scriptHeader}\n${script}`;
            }
        }

        // this.debug(action, compose, script)
        this.checkClient();
        return new Promise((resolve, reject) => {
            this.client.runScript(context, script, (err:any, data:any) => {
                this.handleResponseData(action, compose, err, data);
                if (err) return reject(err);
                resolve(null);
            }, {
                scc: action.comment
            });
        });
    }

    async massAction(action:any, compose:any) {
        if (!action.model) {
            throw new Error(`Action 'mass' needs a model!`);
        }

        const objects = await this.readModelConfigFolder(action, compose);
        this.debug(action, compose, objects);
        this.checkClient();
        return new Promise((resolve, reject) => {
            this.client.mass(objects, (err:any, data:any) => {
                this.handleResponseData(action, compose, err, data);
                if (err) return reject(err);
                const stats = data.stats;
                if (stats !== null && typeof (stats) === 'object') {
                    if (stats.failure > 0) {
                        return reject(new Error(`Mass resulted in ${stats.failure} failure(s)`));
                    }
                }
                resolve(data);
            }, {
                scc: action.comment
            });
        });
    }

    async flowAction(action:any, compose:any) {
        if (!Array.isArray(action.steps)) {
            throw new Error(`Action '${action.type}' needs 'steps' as an array!`);
        }
        this.env.log(`Starting Flow Action`);
        let stepIdx = 0;
        const runNextActionStep = async () => {
            if (stepIdx >= action.steps.length) {
                return this.env.log(`Finished Flow Action.`);
            }
            const step = action.steps[stepIdx];
            stepIdx += 1;
            if (typeof (step) === "string") {
                await this.runAction(step, compose);
                await runNextActionStep();
            }
        };
        await runNextActionStep();
    }

    async runAction(actionName:any, compose:any) {
        if (typeof (actionName) !== 'string') return;
        this.env.log(`Running Action: '${actionName}'.`);

        const actions = compose.actions();
        const action = actions.find((action:any, idx:any) => {
            if (action.name)
                return action.name === actionName;
            return `action[${idx}]` === actionName;
        });
        if (typeof (action) !== 'object' || action === null) {
            throw new Error(`Unable to read action: '${actionName}'!`);
        }

        const ensureComment = async () => {
            this.checkClient();
            const webapiStatus = this.client.wsConnectionInfo._webapi_status || {};
            const auditTrailInfo = webapiStatus.audit_trail || {};
            if (auditTrailInfo.enabled && !action.comment) {
                // const commentStr = await this.env.pickComment(action, auditTrailInfo);
                const commentStr = "default comment";
                if (commentStr) {
                    action.comment = commentStr;
                }
            }
        };

        const actionType = action.type;
        if (actionType === "exec-function") {
            await ensureComment();
            return await this.execFunctionAction(action, compose);
        }
        if (actionType === "run-script") {
            await ensureComment();
            return await this.runScriptAction(action, compose);
        }
        if (actionType === "reinit-objects") {
            // Load embedded script.
            const scriptFilename = '../scripts/reinit-objects.lua';
            action.script = scriptLoader(__dirname, scriptFilename);
            await ensureComment();
            return await this.runScriptAction(action, compose);
        }
        if (actionType === "mass-objects") {
            throw new Error(`Deprecated action type: ${actionType}, use: mass instead`);
        }
        if (actionType === "mass") {
            await ensureComment();
            return await this.massAction(action, compose);
        }
        if (actionType === "action-flow") {
            return await this.flowAction(action, compose);
        }
        throw new Error(`Unsupported action '${actionName}' type: ${actionType}`);
    }



    async template() {

        const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        const src = path.resolve(__dirname, '../template');
        this.env.log('Copying template files...');
        fs.copySync(src, workspacePath, {
            overwrite: false,
            errorOnExist: true
        });
        this.env.log('Successful copied template files.');
    }
}

exports.Composer = Composer;