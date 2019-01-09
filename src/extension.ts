import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

const janetCommand: string = 'janet';
const terminalName: string = 'Janet REPL';

const win: boolean = os.platform() == 'win32';
const pathSeparator: string = win ? ';' : ':';

function janetExists(): boolean {
	return process.env['PATH'].split(pathSeparator)
		.some((x) => fs.existsSync(path.resolve(x, janetCommand + (win ? '.exe' : ''))));
}

function newREPL(): vscode.Terminal {
	let terminal = vscode.window.createTerminal(terminalName);
	terminal.sendText(janetCommand, true);

	return terminal;
}

function getREPL(show: boolean): vscode.Terminal {
	let terminal: vscode.Terminal = (<any>vscode.window).terminals.find(x => x._name === terminalName);

	if (terminal == null) terminal = newREPL();
	if (show) terminal.show();

	return terminal;
}

function thenFocusTextEditor() {
	setTimeout(() => vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup'), 100);
}

export function activate(context: vscode.ExtensionContext) {

	console.log('Extension "vscode-janet" is now active!');

	if (!janetExists()) {
		vscode.window.showErrorMessage('Can\'t find Janet language on your computer! Check your PATH variable.')
		return;
	}

	context.subscriptions.push(vscode.commands.registerCommand(
		'janet.startREPL',
		() => {
			getREPL(true);
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		'janet.eval',
		() => {
			let editor = vscode.window.activeTextEditor;
			if (editor == null) return;

			function send(terminal: vscode.Terminal) {
				terminal.sendText(editor.document.getText(editor.selection), true);
				thenFocusTextEditor();
			}

			let terminal = getREPL(true);
			if (editor.selection.isEmpty)
				vscode.commands.executeCommand('editor.action.selectToBracket').then(() => send(terminal));
			else
				send(terminal);
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		'janet.evalFile',
		() => {
			let editor = vscode.window.activeTextEditor;
			if (editor == null) return;

			let terminal = getREPL(true);
			terminal.sendText(editor.document.getText(), true);
			thenFocusTextEditor();
		}
	));
}

export function deactivate() { }
