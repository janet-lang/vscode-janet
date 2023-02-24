"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.content = exports.resolvePath = void 0;
const vscode = require("vscode");
const fs = require("fs");
// import * as state from './state';
const path = require("path");
const filesCache = new Map();
function writeToCache(uri) {
    try {
        const content = fs.readFileSync(uri.fsPath, 'utf8');
        filesCache.set(uri.fsPath, content);
    }
    catch {
        // if the file is not readable anymore then don't keep old content in cache
        filesCache.delete(uri.fsPath);
    }
}
// From '../utilities'
function tryToGetActiveTextEditor() {
    return vscode.window.activeTextEditor;
}
function util_tryToGetDocument(document) {
    const activeTextEditor = tryToGetActiveTextEditor();
    if (document && Object.prototype.hasOwnProperty.call(document, 'fileName')) {
        return document;
    }
    else if ((activeTextEditor === null || activeTextEditor === void 0 ? void 0 : activeTextEditor.document) && activeTextEditor.document.languageId !== 'Log') {
        return activeTextEditor.document;
    }
    else if (vscode.window.visibleTextEditors.length > 0) {
        const editor = vscode.window.visibleTextEditors.find((editor) => editor.document && editor.document.languageId !== 'Log');
        return editor === null || editor === void 0 ? void 0 : editor.document;
    }
}
function getProjectWsFolder() {
    const doc = util_tryToGetDocument({});
    if (doc) {
        const folder = vscode.workspace.getWorkspaceFolder(doc.uri);
        if (folder) {
            return folder;
        }
    }
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        return vscode.workspace.workspaceFolders[0];
    }
    return undefined;
}
function resolvePath(filePath) {
    const root = getProjectWsFolder();
    if (filePath && path.isAbsolute(filePath)) {
        return filePath;
    }
    return filePath && root && path.resolve(root.uri.fsPath, filePath);
}
exports.resolvePath = resolvePath;
/**
 * Tries to get content of cached file
 * @param path - absolute or relative to the project
 */
const content = (path) => {
    const resolvedPath = resolvePath(path);
    if (resolvedPath) {
        if (!filesCache.has(resolvedPath)) {
            writeToCache(vscode.Uri.file(resolvedPath));
            const filesWatcher = vscode.workspace.createFileSystemWatcher(resolvedPath);
            filesWatcher.onDidChange(writeToCache);
            filesWatcher.onDidCreate(writeToCache);
            filesWatcher.onDidDelete((uri) => filesCache.delete(uri.fsPath));
        }
        return filesCache.get(resolvedPath);
    }
};
exports.content = content;
//# sourceMappingURL=files-cache.js.map