import * as vscode from 'vscode';
import * as fs from 'fs';
// import * as state from './state';
import * as path from 'path';

const filesCache: Map<string, string> = new Map();

function writeToCache(uri: vscode.Uri) {
  try {
    const content: string = fs.readFileSync(uri.fsPath, 'utf8');
    filesCache.set(uri.fsPath, content);
  } catch {
    // if the file is not readable anymore then don't keep old content in cache
    filesCache.delete(uri.fsPath);
  }
}

// From '../utilities'
function tryToGetActiveTextEditor(): vscode.TextEditor | undefined {
  return vscode.window.activeTextEditor;
}

function util_tryToGetDocument(
  document: vscode.TextDocument | Record<string, never> | undefined
): vscode.TextDocument | undefined {
  const activeTextEditor = tryToGetActiveTextEditor();
  if (document && Object.prototype.hasOwnProperty.call(document, 'fileName')) {
    return document as vscode.TextDocument;
  } else if (activeTextEditor?.document && activeTextEditor.document.languageId !== 'Log') {
    return activeTextEditor.document;
  } else if (vscode.window.visibleTextEditors.length > 0) {
    const editor = vscode.window.visibleTextEditors.find(
      (editor) => editor.document && editor.document.languageId !== 'Log'
    );
    return editor?.document;
  }
}

function getProjectWsFolder(): vscode.WorkspaceFolder | undefined {
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

export function resolvePath(filePath?: string) {
  const root = getProjectWsFolder();
  if (filePath && path.isAbsolute(filePath)) {
    return filePath;
  }
  return filePath && root && path.resolve(root.uri.fsPath, filePath);
}

/**
 * Tries to get content of cached file
 * @param path - absolute or relative to the project
 */
export const content = (path: string | undefined) => {
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
