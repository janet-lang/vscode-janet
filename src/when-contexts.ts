import * as vscode from 'vscode';
import * as docMirror from './doc-mirror';
import * as context from './cursor-doc/cursor-context';
import * as util from './utilities';

let lastContexts: context.CursorContext[] = [];

function deepEqual(x: any, y: any): boolean {
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
    } else {
      return false;
    }
  } else if (
    !(x instanceof Array) &&
    !(y instanceof Array) &&
    x instanceof Object &&
    y instanceof Object
  ) {
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

export function setCursorContextIfChanged(editor: vscode.TextEditor) {
  if (
    !editor ||
    !editor.document ||
    editor.document.languageId !== 'janet' ||
    editor !== util.tryToGetActiveTextEditor()
  ) {
    return;
  }
  const currentContexts = determineCursorContexts(editor.document, editor.selection.active);
  if (!deepEqual(lastContexts, currentContexts)) {
    setCursorContexts(currentContexts);
  }
}

function determineCursorContexts(
  document: vscode.TextDocument,
  position: vscode.Position
): context.CursorContext[] {
  const mirrorDoc = docMirror.getDocument(document);
  return context.determineContexts(mirrorDoc, document.offsetAt(position));
}

function setCursorContexts(currentContexts: context.CursorContext[]) {
  lastContexts = currentContexts;
  context.allCursorContexts.forEach((context) => {
    void vscode.commands.executeCommand(
      'setContext',
      context,
      currentContexts.indexOf(context) > -1
    );
  });
}
