import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

const windows: boolean = os.platform() == 'win32';

const janetBinary: string = windows ? 'janet.exe' : 'janet';
const terminalName: string = 'Janet REPL';

function janetExists(): boolean {
	return process.env['PATH'].split(path.delimiter)
		.some((x) => fs.existsSync(path.resolve(x, janetBinary)));
}

function newREPL(): Thenable<vscode.Terminal> {
	const terminal = vscode.window.createTerminal(terminalName);
	terminal.sendText(janetBinary + ' -s', true);
	return vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: "Running Janet REPL...",
		cancellable: false
	}, (progress, token) => {
		return new Promise<vscode.Terminal>(resolve => {
			setTimeout(() => {
				terminal.show();
				thenFocusTextEditor();
				resolve(terminal);
			}, 2000);
		});
	});
}

function getREPL(show: boolean): Thenable<vscode.Terminal> {
	let terminal: vscode.Terminal = (<any>vscode.window).terminals.find(x => x._name === terminalName);
	let terminalP = (terminal) ? Promise.resolve(terminal) : newREPL();
	return terminalP.then(t => {
		if (show) {
			t.show();
		}
		return t;
	});
}

function sendSource(terminal: vscode.Terminal, text: string) {
	terminal.sendText(text, true);
}

function thenFocusTextEditor() {
	setTimeout(() => vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup'), 250);
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
			getREPL(true).then(terminal => {
				function send(terminal: vscode.Terminal) {
					sendSource(terminal, editor.document.getText(editor.selection));
					thenFocusTextEditor();
				}
				if (editor.selection.isEmpty)
					vscode.commands.executeCommand('editor.action.selectToBracket').then(() => send(terminal));
				else
					send(terminal);
			});
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		'janet.evalFile',
		() => {
			let editor = vscode.window.activeTextEditor;
			if (editor == null) return;
			getREPL(true).then(terminal => {
				sendSource(terminal, editor.document.getText());
				thenFocusTextEditor();
			});
		}
	));
}

export function deactivate() { }
