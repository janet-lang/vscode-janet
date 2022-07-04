import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import * as paredit from './paredit/extension';
import * as fmt from './calva-fmt/src/extension';
import * as model from './cursor-doc/model';
import * as config from './config';
import * as whenContexts from './when-contexts';

const windows: boolean = os.platform() == 'win32';

const janetBinary: string = windows ? 'janet.exe' : 'janet';
const terminalName = 'Janet REPL';

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
	const terminal: vscode.Terminal = vscode.window.terminals.find(x => x.name === terminalName);
	const terminalP = (terminal) ? Promise.resolve(terminal) : newREPL();
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

function onDidOpen(document) {
	if (document.languageId !== 'clojure') {
	  return;
	}
}
  
  function onDidChangeEditorOrSelection(editor: vscode.TextEditor) {
	// replHistory.setReplHistoryCommandsActiveContext(editor);
	whenContexts.setCursorContextIfChanged(editor);
}
  
function setKeybindingsEnabledContext() {
	const keybindingsEnabled = vscode.workspace
	  .getConfiguration()
	  .get(config.KEYBINDINGS_ENABLED_CONFIG_KEY);
	void vscode.commands.executeCommand(
	  'setContext',
	  config.KEYBINDINGS_ENABLED_CONTEXT_KEY,
	  keybindingsEnabled
	);
}

export function activate(context: vscode.ExtensionContext) {

	console.log('Extension "vscode-janet" is now active!');

	if (!janetExists()) {
		vscode.window.showErrorMessage('Can\'t find Janet language on your computer! Check your PATH variable.');
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
			const editor = vscode.window.activeTextEditor;
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
			const editor = vscode.window.activeTextEditor;
			if (editor == null) return;
			getREPL(true).then(terminal => {
				sendSource(terminal, editor.document.getText());
				thenFocusTextEditor();
			});
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		'janet.formatFile',
		() => {
			
			getREPL(true).then(terminal => {
				sendSource(terminal, "(import spork/fmt)(fmt/format-file \""+
					vscode.window.activeTextEditor.document.uri.fsPath.replace(/\\/g, "/")
				+"\")");
				thenFocusTextEditor();
			});
		}
	));

	model.initScanner(vscode.workspace.getConfiguration('editor').get('maxTokenizationLineLength'));

	// Initial set of the provided contexts
	setKeybindingsEnabledContext();

	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
		  if (e.affectsConfiguration(config.KEYBINDINGS_ENABLED_CONFIG_KEY)) {
			setKeybindingsEnabledContext();
		  }
		})
	);

	try {
		void fmt.activate(context);
	} catch (e) {
		console.error('Failed activating Formatter: ' + e.message);
	}

	try {
		paredit.activate(context);
	} catch (e) {
		console.error('Failed activating Paredit: ' + e.message);
	}
}
