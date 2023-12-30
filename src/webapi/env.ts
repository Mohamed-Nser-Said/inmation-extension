
import * as vscode from 'vscode';
const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;


export class env {

    static  connectionName :string = "docker WEBAPI-TAK";
    static actionName :string = "Update dependency (mass L)";
    static comment  :string = "docker WEBAPI-TAK";

    static credentials(connName: any, usr: any, pwd: any, auth: any) {

        return {
            username: usr,
            password: pwd,
            authority: auth
        };

    }

    static async pickAction(actionNames: any){
        const res = await vscode.window.showQuickPick(actionNames).then(selection => {
            const selected = selection || '';
            return selected;

        });
        
        return res ;
    }

    static async pickConnection(connectionNames: string[]): Promise<string> {
        return await vscode.window.showQuickPick(connectionNames).then(selection => {
            const selected = selection || '';
            return selected;
        });
    }

    static async pickComment(action: any, auditTrailInfo: any) {
    
        let comment = action.comment;
        if (!comment){
            comment  = await vscode.window.showInputBox({ prompt: "Comment", value: env.comment }).then(value => {
                return value;
            });
        }

        if (auditTrailInfo.user_comment_mandatory && !comment) {
            throw new Error("No comment provided. Audit Trail comment is mandatory.");
        }
        return comment;
    }

    static showErrorMessage(msg: string) {
        console.error(msg);
        vscode.window.showErrorMessage(msg);
    }

    static workspaceFolder ()  {
        console.log(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath);
        return {path:vscode.workspace.workspaceFolders?.[0]?.uri.fsPath};
    }

    static log(msg: any) {
        console.log(msg);
        vscode.window.showInformationMessage(msg);
    }









}


// export const enve = {
//     credentials: async (connName: any, usr: any, pwd: any, auth: any) => {

//         return {
//             username: usr,
//             password: pwd,
//             authority: auth
//         };

//     },

//     pickAction: (actionNames: any) => {

//         return new Promise((resolve) => {
//             resolve(actionName);
//         });
//     },

//     pickConnection: (connectionNames: any) => {


//         return new Promise((resolve) => {
//             resolve(connectionName);
//         });
//     },

//     pickComment: (action: any, auditTrailInfo: any) => {
//         const noComment = !action.comment && !comment;

//         if (auditTrailInfo.user_comment_mandatory && noComment) {
//             throw new Error("No comment provided. Audit Trail comment is mandatory.");
//         }
//         return comment;
//     },

//     showErrorMessage: (msg: string) => {
//         console.error(msg);
//         vscode.window.showErrorMessage(msg);
//     },

//     workspaceFolder: () => {
//         return new Promise((resolve) => {
//             const path = workspaceRoot;
//             env.log(`Workspace path: (${path}).`);
//             resolve({
//                 path: path
//             });
//         });
//     },

//     log: (msg: any) => {
//         console.log(msg);
//         vscode.window.showInformationMessage(msg);
//     }
// };
