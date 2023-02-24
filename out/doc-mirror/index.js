"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = exports.getDocumentOffset = exports.getDocument = exports.tryToGetDocument = exports.MirroredDocument = exports.DocumentModel = exports.getIndent = void 0;
var indent_1 = require("../cursor-doc/indent");
Object.defineProperty(exports, "getIndent", { enumerable: true, get: function () { return indent_1.getIndent; } });
const vscode = require("vscode");
const utilities = require("../utilities");
const formatter = require("../calva-fmt/src/format");
const model_1 = require("../cursor-doc/model");
const lodash_1 = require("lodash");
const documents = new Map();
class DocumentModel {
    constructor(document) {
        this.document = document;
        this.lineEndingLength = document.document.eol == vscode.EndOfLine.CRLF ? 2 : 1;
        this.lineInputModel = new model_1.LineInputModel(this.lineEndingLength);
    }
    edit(modelEdits, options) {
        const editor = utilities.getActiveTextEditor(), undoStopBefore = !!options.undoStopBefore;
        return editor
            .edit((builder) => {
            for (const modelEdit of modelEdits) {
                switch (modelEdit.editFn) {
                    case 'insertString':
                        this.insertEdit.apply(this, [builder, ...modelEdit.args]);
                        break;
                    case 'changeRange':
                        this.replaceEdit.apply(this, [builder, ...modelEdit.args]);
                        break;
                    case 'deleteRange':
                        this.deleteEdit.apply(this, [builder, ...modelEdit.args]);
                        break;
                    default:
                        break;
                }
            }
        }, { undoStopBefore, undoStopAfter: false })
            .then((isFulfilled) => {
            if (isFulfilled) {
                if (options.selection) {
                    this.document.selection = options.selection;
                }
                if (!options.skipFormat) {
                    return formatter.formatPosition(editor, false, {
                        'format-depth': options.formatDepth ? options.formatDepth : 1,
                    });
                }
            }
            return isFulfilled;
        });
    }
    insertEdit(builder, offset, text, oldSelection, newSelection) {
        const editor = utilities.getActiveTextEditor(), document = editor.document;
        builder.insert(document.positionAt(offset), text);
    }
    replaceEdit(builder, start, end, text, oldSelection, newSelection) {
        const editor = utilities.getActiveTextEditor(), document = editor.document, range = new vscode.Range(document.positionAt(start), document.positionAt(end));
        builder.replace(range, text);
    }
    deleteEdit(builder, offset, count, oldSelection, newSelection) {
        const editor = utilities.getActiveTextEditor(), document = editor.document, range = new vscode.Range(document.positionAt(offset), document.positionAt(offset + count));
        builder.delete(range);
    }
    getText(start, end, mustBeWithin = false) {
        return this.lineInputModel.getText(start, end, mustBeWithin);
    }
    getLineText(line) {
        return this.lineInputModel.getLineText(line);
    }
    getOffsetForLine(line) {
        return this.lineInputModel.getOffsetForLine(line);
    }
    getTokenCursor(offset, previous) {
        return this.lineInputModel.getTokenCursor(offset, previous);
    }
}
exports.DocumentModel = DocumentModel;
class MirroredDocument {
    constructor(document) {
        this.document = document;
        this.model = new DocumentModel(this);
        this.selectionStack = [];
    }
    getTokenCursor(offset = this.selection.active, previous = false) {
        return this.model.getTokenCursor(offset, previous);
    }
    insertString(text) {
        const editor = utilities.getActiveTextEditor(), selection = editor.selection, wsEdit = new vscode.WorkspaceEdit(), 
        // TODO: prob prefer selection.active or .start
        edit = vscode.TextEdit.insert(this.document.positionAt(this.selection.anchor), text);
        wsEdit.set(this.document.uri, [edit]);
        void vscode.workspace.applyEdit(wsEdit).then((_v) => {
            editor.selection = selection;
        });
    }
    set selection(selection) {
        const editor = utilities.getActiveTextEditor(), document = editor.document, anchor = document.positionAt(selection.anchor), active = document.positionAt(selection.active);
        editor.selection = new vscode.Selection(anchor, active);
        editor.revealRange(new vscode.Range(active, active));
    }
    get selection() {
        const editor = utilities.getActiveTextEditor(), document = editor.document, anchor = document.offsetAt(editor.selection.anchor), active = document.offsetAt(editor.selection.active);
        return new model_1.ModelEditSelection(anchor, active);
    }
    getSelectionText() {
        const editor = utilities.getActiveTextEditor(), selection = editor.selection;
        return this.document.getText(selection);
    }
    delete() {
        return vscode.commands.executeCommand('deleteRight');
    }
    backspace() {
        return vscode.commands.executeCommand('deleteLeft');
    }
}
exports.MirroredDocument = MirroredDocument;
let registered = false;
function processChanges(event) {
    const model = documents.get(event.document).model;
    for (const change of event.contentChanges) {
        // vscode may have a \r\n marker, so it's line offsets are all wrong.
        const myStartOffset = model.getOffsetForLine(change.range.start.line) + change.range.start.character, myEndOffset = model.getOffsetForLine(change.range.end.line) + change.range.end.character;
        void model.lineInputModel.edit([
            new model_1.ModelEdit('changeRange', [
                myStartOffset,
                myEndOffset,
                change.text.replace(/\r\n/g, '\n'),
            ]),
        ], {});
    }
    model.lineInputModel.flushChanges();
    // we must clear out the repaint cache data, since we don't use it.
    model.lineInputModel.dirtyLines = [];
    model.lineInputModel.insertedLines.clear();
    model.lineInputModel.deletedLines.clear();
}
function tryToGetDocument(doc) {
    return documents.get(doc);
}
exports.tryToGetDocument = tryToGetDocument;
function getDocument(doc) {
    const mirrorDoc = tryToGetDocument(doc);
    if ((0, lodash_1.isUndefined)(mirrorDoc)) {
        throw new Error('Missing mirror document!');
    }
    return mirrorDoc;
}
exports.getDocument = getDocument;
function getDocumentOffset(doc, position) {
    const model = getDocument(doc).model;
    return model.getOffsetForLine(position.line) + position.character;
}
exports.getDocumentOffset = getDocumentOffset;
function addDocument(doc) {
    if (doc && doc.languageId == 'janet') {
        if (!documents.has(doc)) {
            const document = new MirroredDocument(doc);
            document.model.lineInputModel.insertString(0, doc.getText());
            documents.set(doc, document);
            return false;
        }
        else {
            return true;
        }
    }
    return false;
}
function activate() {
    // the last thing we want is to register twice and receive double events...
    if (registered) {
        return;
    }
    registered = true;
    addDocument(utilities.tryToGetDocument({}));
    vscode.workspace.onDidCloseTextDocument((e) => {
        if (e.languageId == 'janet') {
            documents.delete(e);
        }
    });
    vscode.window.onDidChangeActiveTextEditor((e) => {
        if (e && e.document && e.document.languageId == 'janet') {
            addDocument(e.document);
        }
    });
    vscode.workspace.onDidOpenTextDocument((doc) => {
        addDocument(doc);
    });
    vscode.workspace.onDidChangeTextDocument((e) => {
        if (addDocument(e.document)) {
            processChanges(e);
        }
    });
}
exports.activate = activate;
//# sourceMappingURL=index.js.map