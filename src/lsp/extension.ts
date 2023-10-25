// import * as vscode_lsp from 'vscode-languageclient/node';
import * as vscode from 'vscode';
import * as path from 'path';
import {
    ExtensionContext,
} from 'vscode';

import * as config from '../config';

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind,
} from "vscode-languageclient/node";
import * as child_process from "child_process";

// export enum LspStatus {
//     Stopped = 'Stopped',
//     Starting = 'Starting',
//     Running = 'Running',
//     Failed = 'Failed',
//     Unknown = 'Unknown',
// }

// export type LspClient = {
//     id: string;
//     uri: vscode.Uri;
//     client: vscode_lsp.LanguageClient;
//     status: LspStatus;
//   };

let client: LanguageClient;

function getServer(): string {
    const windows = process.platform === "win32";
    const suffix = windows ? ".exe" : "";
    const binaryName = "janet-lsp" + suffix;

    return path.resolve(__dirname, binaryName);
	// const bundledPath = path.resolve(__dirname, binaryName);

    // const bundledValidation = validateServer(bundledPath);
    // if (bundledValidation.valid) {
    //     return bundledPath;
    // }

    // const binaryValidation = validateServer(binaryName);
    // if (binaryValidation.valid) {
    //     return binaryName;
    // }

    // throw new Error(
    //     `Could not find a valid janet-lsp binary.\nBundled: ${bundledValidation.message}\nIn PATH: ${binaryValidation.message}`
    // );
}

function getServerImage(): string {
    // const windows = process.platform === "win32";
    // const suffix = windows ? ".exe" : "";
    // const binaryName = "janet-lsp" + suffix;
    const binaryName = "janet-lsp.jimage";

    return path.resolve(__dirname, binaryName);
	// const bundledPath = path.resolve(__dirname, binaryName);

    // const bundledValidation = validateServer(bundledPath);
    // if (bundledValidation.valid) {
    //     return bundledPath;
    // }

    // const binaryValidation = validateServer(binaryName);
    // if (binaryValidation.valid) {
    //     return binaryName;
    // }

    // throw new Error(
    //     `Could not find a valid janet-lsp binary.\nBundled: ${bundledValidation.message}\nIn PATH: ${binaryValidation.message}`
    // );
}

function getServerOptions(): ServerOptions {
    let options: ServerOptions;

    if (config.getConfig().customJanetLspCommand) {
        options = {
            command: config.getConfig().customJanetLspCommand[0],
            args: config.getConfig().customJanetLspCommand.slice(1),
            transport: TransportKind.stdio
        };
    } else {
        options = {
            command: "janet",
            args: ["-i", getServerImage()],
            transport: TransportKind.stdio
        };
    }
    
    return options;
}

// TODO: This is a good idea, figure it out later

// function validateServer(path: string): { valid: boolean; message: string } {
//     try {
//         const result = child_process.spawnSync(path);
//         if (result.status === 0) {
//             return { valid: true , message: "ok"};
//         } else {
//             const statusMessage = result.status !== null ? [`return status: ${result.status}`] : [];
//             const errorMessage =
//                 result.error?.message !== undefined ? [`error: ${result.error.message}`] : [];
//             const messages = [statusMessage, errorMessage];
//             const messageSuffix =
//                 messages.length !== 0 ? `:\n\t${messages.flat().join("\n\t")}` : "";
//             const message = `Failed to launch '${path}'${messageSuffix}`;
//             return { valid: false, message };
//         }
//     } catch (e) {
//         if (e instanceof Error) {
//             return { valid: false, message: `Failed to launch '${path}': ${e.message}` };
//         } else {
//             return { valid: false, message: `Failed to launch '${path}': ${JSON.stringify(e)}` };
//         }
//     }
// }

// TODO: Add a status bar showing current health of janet-lsp 

// function updateStatusBarFn(item: vscode.StatusBarItem, status: LspStatus) {
//   switch (status) {
//     case LspStatus.Stopped: {
//       item.text = "$(circle-outline) Janet LSP";
//       item.tooltip = "Janet LSP is not active, click to get a menu";
//       break;
//     }
//     case LspStatus.Starting: {
//       item.text = "$(sync~spin) Janet LSP";
//       item.tooltip = "Janet LSP is starting";
//       break;
//     }
//     case LspStatus.Running: {
//       item.text = "$(circle-filled) Janet LSP";
//       item.tooltip = "Janet LSP is active";
//       break;
//     }
//     case LspStatus.Failed: {
//       item.text = "$(error) Janet LSP";
//       item.tooltip = "Janet LSP failed to start";
//       break;
//     }
//     case LspStatus.Unknown: {
//       item.text = "Janet LSP";
//       item.tooltip = "Open a .janet file to see the server status";
//       break;
//     }
//   }
// }

export function activate(context: ExtensionContext) {
    
    // TODO: Add a status bar showing current health of janet-lsp 

    // const status_bar_item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    // // status_bar_item.command = 'calva.clojureLsp.manage';
    // const updateStatusBar = () => {
    //     const any_starting = Array.from(clients.values()).find(
    //       (client) => client.status === defs.LspStatus.Starting
    //     );
    //     if (any_starting) {
    //       return updateStatusBarFn(status_bar_item, defs.LspStatus.Starting);
    //     }
    
    //     const active_editor = vscode.window.activeTextEditor?.document;
    //     if (!active_editor || active_editor.languageId !== 'clojure') {
    //       // If there are multiple clients then we don't know which client to show the status for and we set it to unknown
    //       if (clients.size !== 1) {
    //         updateStatusBarFn(status_bar_item, defs.LspStatus.Unknown);
    //         return;
    //       }
    
    //       const client = Array.from(clients.values())[0];
    //       updateStatusBarFn(status_bar_item, client.status);
    //       return;
    //     }
    
    //     const client = api.getActiveClientForUri(clients, active_editor.uri);
    //     if (!client) {
    //         updateStatusBarFn(status_bar_item, defs.LspStatus.Stopped);
    //       return;
    //     }
    
    //     updateStatusBarFn(status_bar_item, client.status);
    //   };
    
    // const serverOptions: ServerOptions = {
	// 	command: getServer(),
	// 	args: [],
	// 	transport: TransportKind.stdio
	// };

    // const serverOptions: ServerOptions = {
	// 	command: "janet",
	// 	args: ["-i", getServerImage()],
	// 	transport: TransportKind.stdio
	// };

    const serverOptions: ServerOptions = getServerOptions();

	const clientOptions: LanguageClientOptions = {
		documentSelector: [
			{language: "janet", scheme: "file"},
			{language: "janet", scheme: "untitled"}
		],
		synchronize: {
			fileEvents: vscode.workspace.createFileSystemWatcher("**/.clientrc")
		},
		diagnosticCollectionName: "janet"
	};

	client = new LanguageClient(
		"Janet LSP",
		"Janet Language Server",
		serverOptions,
		clientOptions
	);

	client.start();
}

export function deactivate(){
    client.stop();
}