"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const janetCommand = 'janet';
const terminalName = 'Janet REPL';
const windows = os.platform() == 'win32';
const linux = os.platform() == 'linux';
const pathSeparator = windows ? ';' : ':';
function janetExists() {
    return process.env['PATH'].split(pathSeparator)
        .some((x) => fs.existsSync(path.resolve(x, janetCommand + (windows ? '.exe' : ''))));
}
function newREPL() {
    let terminal = vscode.window.createTerminal(terminalName);
    terminal.sendText(janetCommand, true);
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Running Janet REPL...",
        cancellable: false
    }, (progress, token) => {
        var p = new Promise(resolve => {
            setTimeout(() => {
                terminal.show();
                resolve();
            }, 2000);
        });
        return p;
    });
    return terminal;
}
function getREPL(show) {
    let terminal = vscode.window.terminals.find(x => x._name === terminalName);
    if (terminal == null) {
        newREPL();
        return null;
    }
    if (show)
        terminal.show();
    return terminal;
}
function prep(input) {
    // I don't know why, multiline send broken on Linux. Make 'em one liners!
    if (linux)
        return input.replace(/(\r\n\t|\n|\r\t)/gm, ' ').replace(/ +/gm, ' ');
    return input;
}
function thenFocusTextEditor() {
    setTimeout(() => vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup'), 100);
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
        let terminal = getREPL(true);
        if (terminal == null)
            return;
        function send(terminal) {
            terminal.sendText(prep(editor.document.getText(editor.selection)), true);
            thenFocusTextEditor();
        }
        if (editor.selection.isEmpty)
            vscode.commands.executeCommand('editor.action.selectToBracket').then(() => send(terminal));
        else
            send(terminal);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('janet.evalFile', () => {
        let editor = vscode.window.activeTextEditor;
        if (editor == null)
            return;
        let terminal = getREPL(true);
        if (terminal == null)
            return;
        terminal.sendText(prep(editor.document.getText()), true);
        thenFocusTextEditor();
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map