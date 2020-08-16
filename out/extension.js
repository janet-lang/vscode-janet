"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const formatter_1 = require("./formatter");
const windows = os.platform() == 'win32';
const janetBinary = windows ? 'janet.exe' : 'janet';
const terminalName = 'Janet REPL';
function janetExists() {
    return process.env['PATH'].split(path.delimiter)
        .some((x) => fs.existsSync(path.resolve(x, janetBinary)));
}
function newREPL() {
    const terminal = vscode.window.createTerminal(terminalName);
    terminal.sendText(janetBinary + ' -s', true);
    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Running Janet REPL...",
        cancellable: false
    }, (progress, token) => {
        return new Promise(resolve => {
            setTimeout(() => {
                terminal.show();
                thenFocusTextEditor();
                resolve(terminal);
            }, 2000);
        });
    });
}
function getREPL(show) {
    let terminal = vscode.window.terminals.find(x => x._name === terminalName);
    let terminalP = (terminal) ? Promise.resolve(terminal) : newREPL();
    return terminalP.then(t => {
        if (show) {
            t.show();
        }
        return t;
    });
}
function sendSource(terminal, text) {
    terminal.sendText(text, true);
}
function thenFocusTextEditor() {
    setTimeout(() => vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup'), 250);
}
function activate(context) {
    console.log('Extension "vscode-janet" is now active!');
    if (!janetExists()) {
        vscode.window.showErrorMessage('Can\'t find Janet language on your computer! Check your PATH variable.');
        return;
    }
    context.subscriptions.push(vscode.commands.registerCommand('janet.startREPL', () => {
        getREPL(true);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('janet.eval', () => {
        let editor = vscode.window.activeTextEditor;
        if (editor == null)
            return;
        getREPL(true).then(terminal => {
            function send(terminal) {
                sendSource(terminal, editor.document.getText(editor.selection));
                thenFocusTextEditor();
            }
            if (editor.selection.isEmpty)
                vscode.commands.executeCommand('editor.action.selectToBracket').then(() => send(terminal));
            else
                send(terminal);
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('janet.evalFile', () => {
        let editor = vscode.window.activeTextEditor;
        if (editor == null)
            return;
        getREPL(true).then(terminal => {
            sendSource(terminal, editor.document.getText());
            thenFocusTextEditor();
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('janet.formatFile', () => {
        let editor = vscode.window.activeTextEditor;
        if (editor == null)
            return;
        formatter_1.format(editor.document.fileName);
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map