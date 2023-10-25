import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import * as paredit from './paredit/extension';
import * as fmt from './calva-fmt/src/extension';
import * as lsp from './lsp/extension';
import * as model from './cursor-doc/model';
import * as config from './config';
import * as whenContexts from './when-contexts';
import * as edit from './edit';
import annotations from './providers/annotations';
// import * as util from './utilities';
import * as state from './state';
import status from './status';

const windows: boolean = os.platform() == 'win32';

const janetBinary: string = windows ? 'janet.exe' : 'janet';
const terminalName = 'Janet REPL';

function janetExists(): boolean {
	return process.env['PATH'].split(path.delimiter)
		.some((x) => fs.existsSync(path.resolve(x, janetBinary)));
}

function newREPL(): Thenable<vscode.Terminal> {
	const terminal = vscode.window.createTerminal(terminalName);
	// Original: terminal.sendText(janetBinary + ' -s', true); changed on 2022-10-22
	terminal.sendText(janetBinary, true);
	return vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: "Running Janet REPL...",
		cancellable: false
	}, (progress, token) => {
		return new Promise<vscode.Terminal>(resolve => {
			setTimeout(() => {
				terminal.show();
				// thenFocusTextEditor();
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

// async function onDidSave(testController: vscode.TestController, document: vscode.TextDocument) {
// 	const { evaluate, test } = config.getConfig();
  
// 	if (document.languageId !== 'janet') {
// 		return;
// 	}
  
// 	// 	if (test && util.getConnectedState()) {
// 	// 	//   void testRunner.runNamespaceTests(testController, document);
// 	// 	  state.analytics().logEvent('Calva', 'OnSaveTest').send();
// 	// 	} else if (evaluate) {
// 	// 	  if (!outputWindow.isResultsDoc(document)) {
// 	// 		await eval.loadFile(document, config.getConfig().prettyPrintingOptions);
// 	// 		outputWindow.appendPrompt();
// 	// 		state.analytics().logEvent('Calva', 'OnSaveLoad').send();
// 	// 	  }
// 	// 	}
// }  

function onDidOpen(document) {
	if (document.languageId !== 'janet') {
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

	console.log('Extension "vscode-janet" is activating.');

	// Janet stuff
	if (!janetExists()) {
		vscode.window.showErrorMessage('Can\'t find Janet language on your computer! Check your PATH variable.');
		return;
	}

	const officialExtension = vscode.extensions.getExtension('janet-lang.vscode-janet');

	if(!officialExtension){

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
				const terminal: vscode.Terminal = vscode.window.terminals.find(x => x.name === terminalName);
				const newTerminal = (terminal) ? false : true;
				getREPL(true).then(terminal => {
					function send(terminal: vscode.Terminal) {
						sendSource(terminal, editor.document.getText(editor.selection));
						if (!newTerminal) {
							thenFocusTextEditor();
						}
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
					sendSource(terminal, "(import spork/fmt) (fmt/format-file \""+
						vscode.window.activeTextEditor.document.uri.fsPath.replace(/\\/g, "/")
					+"\")");
					thenFocusTextEditor();
				});
			}
		));
	} else {
		void vscode.window.showWarningMessage(
			'The official Janet VS Code extension is detected. Features unique to the Janet++ extension should work fine, but you will not benefit from updated/improved versions of the official extension\'s functionality. You probably want to uninstall or disable the official extension.',
			'Got it!'
		);
	}

	context.subscriptions.push(vscode.commands.registerCommand(
		'janet.letdef',
		() => {
			const editor = vscode.window.activeTextEditor;
			if (editor == null) return;
			const terminal: vscode.Terminal = vscode.window.terminals.find(x => x.name === terminalName);
			const newTerminal = (terminal) ? false :true;
			getREPL(true).then(terminal => {
				function sendWithDef(terminal: vscode.Terminal) {
					editor.document.getText(editor.selection).split("\n").forEach(x => 
						sendSource(terminal, "(def " + x.trim() + ")"));
					if(!newTerminal) {
						thenFocusTextEditor();
					}
				}

				if (editor.selection.isEmpty)
					vscode.commands.executeCommand('editor.action.selectToBracket', 
													{ 'selectBrackets' : false})
													.then(() => sendWithDef(terminal));
				else
					sendWithDef(terminal);
			});
		}
	));

	// Calva stuff 

	context.subscriptions.push(
		vscode.commands.registerCommand('janet.continueComment', edit.continueCommentCommand)
	);

	//EVENTS
	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument((document) => {
			onDidOpen(document);
		})
	);
	context.subscriptions.push(
		vscode.workspace.onDidSaveTextDocument((document) => {
			// void onDidSave(controller, document);
		})
	);
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			status.update();
			onDidChangeEditorOrSelection(editor);
		})
	);
	context.subscriptions.push(
		vscode.window.onDidChangeTextEditorSelection((editor) => {
			status.update();
			onDidChangeEditorOrSelection(editor.textEditor);
		})
	);
	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(annotations.onDidChangeTextDocument)
	);
	

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

	if(janetExists() && config.getConfig().enableLsp){
		try {
			lsp.activate(context);
		} catch (e) {
			console.error('Failed activating LSP: ' + e.message);
		}
	}
		
	console.log('Extension "vscode-janet" is now active!');
} 

function deactivate() {
	state.analytics().logEvent('LifeCycle', 'Deactivated').send();
	// jackIn.calvaJackout();
	lsp.deactivate();
	return paredit.deactivate();
}
