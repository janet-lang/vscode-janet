"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCursorContextIfChanged = void 0;
const vscode = require("vscode");
const docMirror = require("./doc-mirror");
const context = require("./cursor-doc/cursor-context");
const util = require("./utilities");
let lastContexts = [];
function deepEqual(x, y) {
    if (x == y) {
        return true;
    }
    if (x instanceof Array && y instanceof Array) {
        if (x.length == y.length) {
            for (let i = 0; i < x.length; i++) {
                if (!deepEqual(x[i], y[i])) {
                    return false;
                }
            }
            return true;
        }
        else {
            return false;
        }
    }
    else if (!(x instanceof Array) &&
        !(y instanceof Array) &&
        x instanceof Object &&
        y instanceof Object) {
        for (const f in x) {
            if (!deepEqual(x[f], y[f])) {
                return false;
            }
        }
        for (const f in y) {
            if (!Object.prototype.hasOwnProperty.call(x, f)) {
                return false;
            }
        }
        return true;
    }
    return false;
}
function setCursorContextIfChanged(editor) {
    if (!editor ||
        !editor.document ||
        editor.document.languageId !== 'janet' ||
        editor !== util.tryToGetActiveTextEditor()) {
        return;
    }
    const currentContexts = determineCursorContexts(editor.document, editor.selection.active);
    if (editor.selection.active.line == 0 && editor.selection.active.character == 0) {
        delete currentContexts[currentContexts.indexOf("janet:cursorInComment")];
    }
    if (!deepEqual(lastContexts, currentContexts)) {
        setCursorContexts(currentContexts);
    }
}
exports.setCursorContextIfChanged = setCursorContextIfChanged;
function determineCursorContexts(document, position) {
    const mirrorDoc = docMirror.getDocument(document);
    return context.determineContexts(mirrorDoc, document.offsetAt(position));
}
function setCursorContexts(currentContexts) {
    lastContexts = currentContexts;
    context.allCursorContexts.forEach((context) => {
        void vscode.commands.executeCommand('setContext', context, currentContexts.indexOf(context) > -1);
    });
}
//# sourceMappingURL=when-contexts.js.map