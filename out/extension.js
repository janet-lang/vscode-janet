"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const janetCommand = 'janet';
const terminalName = 'Janet REPL';
function newREPL() {
    let terminal = vscode.window.createTerminal(terminalName);
    terminal.sendText(janetCommand, true);
    // TODO: Check janet availability
    return terminal;
}
function getREPL(show) {
    let terminal = vscode.window.terminals.find(x => x._name === terminalName);
    if (terminal == null)
        terminal = newREPL();
    if (show)
        terminal.show();
    return terminal;
}
function thenFocusTextEditor() {
    setTimeout(() => vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup'), 100);
}
function activate(context) {
    console.log('Extension "vscode-janet" is now active!');
    context.subscriptions.push(vscode.commands.registerCommand('janet.startREPL', () => {
        getREPL(true);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('janet.eval', () => {
        let editor = vscode.window.activeTextEditor;
        if (editor == null)
            return;
        function send(terminal) {
            terminal.sendText(editor.document.getText(editor.selection), true);
            thenFocusTextEditor();
        }
        let terminal = getREPL(true);
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
        terminal.sendText(editor.document.getText(), true);
        thenFocusTextEditor();
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map