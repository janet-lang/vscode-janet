"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCode = exports.trimWhiteSpacePositionCommand = exports.alignPositionCommand = exports.formatPositionCommand = exports.formatPosition = exports.isResultsDoc = exports.formatPositionInfo = exports.formatRange = exports.formatRangeEdits = exports.indentPosition = void 0;
const vscode = require("vscode");
const config = require("./config");
const path = require("path");
// import * as outputWindow from '../../results-output/results-doc';
const index_1 = require("../../doc-mirror/index");
const cljs_lib_1 = require("../../../out/cljs-lib/cljs-lib");
const util = require("../../utilities");
const lodash_1 = require("lodash");
async function indentPosition(position, document) {
    const editor = util.getActiveTextEditor();
    const pos = new vscode.Position(position.line, 0);
    const indent = (0, index_1.getIndent)((0, index_1.getDocument)(document).model.lineInputModel, (0, index_1.getDocumentOffset)(document, position), await config.getConfig());
    let delta = document.lineAt(position.line).firstNonWhitespaceCharacterIndex - indent;
    if (delta > 0) {
        return editor.edit((edits) => edits.delete(new vscode.Range(pos, new vscode.Position(pos.line, delta))), {
            undoStopAfter: false,
            undoStopBefore: false,
        });
    }
    else if (delta < 0) {
        let str = '';
        while (delta++ < 0) {
            str += ' ';
        }
        return editor.edit((edits) => edits.insert(pos, str), {
            undoStopAfter: false,
            undoStopBefore: false,
        });
    }
}
exports.indentPosition = indentPosition;
async function formatRangeEdits(document, range) {
    const text = document.getText(range);
    const mirroredDoc = (0, index_1.getDocument)(document);
    const startIndex = document.offsetAt(range.start);
    const endIndex = document.offsetAt(range.end);
    const cursor = mirroredDoc.getTokenCursor(startIndex);
    if (!cursor.withinString()) {
        const rangeTuple = [startIndex, endIndex];
        const newText = await _formatRange(text, document.getText(), rangeTuple, document.eol == 2 ? '\r\n' : '\n');
        if (newText) {
            return [vscode.TextEdit.replace(range, newText)];
        }
    }
}
exports.formatRangeEdits = formatRangeEdits;
async function formatRange(document, range) {
    const wsEdit = new vscode.WorkspaceEdit();
    const edits = await formatRangeEdits(document, range);
    if ((0, lodash_1.isUndefined)(edits)) {
        console.error('formatRangeEdits returned undefined!', (0, lodash_1.cloneDeep)({ document, range }));
        return false;
    }
    wsEdit.set(document.uri, edits);
    return vscode.workspace.applyEdit(wsEdit);
}
exports.formatRange = formatRange;
async function formatPositionInfo(editor, onType = false, extraConfig = {}) {
    const doc = editor.document;
    const pos = editor.selection.active;
    const index = doc.offsetAt(pos);
    const mirroredDoc = (0, index_1.getDocument)(doc);
    const cursor = mirroredDoc.getTokenCursor(index);
    const formatDepth = extraConfig['format-depth'] ? extraConfig['format-depth'] : 1;
    const isComment = cursor.getFunctionName() === 'comment';
    const config = { ...extraConfig, 'comment-form?': isComment };
    let formatRange = cursor.rangeForList(formatDepth);
    if (!formatRange) {
        formatRange = cursor.rangeForCurrentForm(index);
        if (!formatRange || !formatRange.includes(index)) {
            return;
        }
    }
    const formatted = await _formatIndex(doc.getText(), formatRange, index, doc.eol == 2 ? '\r\n' : '\n', onType, config);
    const range = new vscode.Range(doc.positionAt(formatted.range[0]), doc.positionAt(formatted.range[1]));
    const newIndex = doc.offsetAt(range.start) + formatted['new-index'];
    const previousText = doc.getText(range);
    return {
        formattedText: formatted['range-text'],
        range: range,
        previousText: previousText,
        previousIndex: index,
        newIndex: newIndex,
    };
}
exports.formatPositionInfo = formatPositionInfo;
// From results-doc.ts
const RESULTS_DOC_NAME = "thing";
function isResultsDoc(doc) {
    return !!doc && path.basename(doc.fileName) === RESULTS_DOC_NAME;
}
exports.isResultsDoc = isResultsDoc;
// End from results-doc.ts
async function formatPosition(editor, onType = false, extraConfig = {}) {
    // console.log("calva-fmt/src/format.ts/formatPosition called")
    const doc = editor.document, formattedInfo = await formatPositionInfo(editor, onType, extraConfig);
    if (formattedInfo && formattedInfo.previousText != formattedInfo.formattedText) {
        return editor
            .edit((textEditorEdit) => {
            textEditorEdit.replace(formattedInfo.range, formattedInfo.formattedText);
        }, { undoStopAfter: false, undoStopBefore: false })
            .then((onFulfilled) => {
            editor.selection = new vscode.Selection(doc.positionAt(formattedInfo.newIndex), doc.positionAt(formattedInfo.newIndex));
            return onFulfilled;
        });
    }
    if (formattedInfo) {
        return new Promise((resolve, _reject) => {
            if (formattedInfo.newIndex != formattedInfo.previousIndex) {
                editor.selection = new vscode.Selection(doc.positionAt(formattedInfo.newIndex), doc.positionAt(formattedInfo.newIndex));
            }
            resolve(true);
        });
    }
    if (!onType && !isResultsDoc(doc)) {
        return formatRange(doc, new vscode.Range(doc.positionAt(0), doc.positionAt(doc.getText().length)));
    }
    return new Promise((resolve, _reject) => {
        resolve(true);
    });
}
exports.formatPosition = formatPosition;
function formatPositionCommand(editor) {
    void formatPosition(editor);
}
exports.formatPositionCommand = formatPositionCommand;
function alignPositionCommand(editor) {
    void formatPosition(editor, true, { 'align-associative?': true });
}
exports.alignPositionCommand = alignPositionCommand;
function trimWhiteSpacePositionCommand(editor) {
    void formatPosition(editor, false, { 'remove-multiple-non-indenting-spaces?': true });
}
exports.trimWhiteSpacePositionCommand = trimWhiteSpacePositionCommand;
async function formatCode(code, eol) {
    const d = {
        'range-text': code,
        eol: eol == 2 ? '\r\n' : '\n',
        config: await config.getConfig(),
    };
    const result = (0, cljs_lib_1.jsify)((0, cljs_lib_1.formatText)(d));
    if (!result['error']) {
        return result['range-text'];
    }
    else {
        console.error('Error in `formatCode`:', result['error']);
        return code;
    }
}
exports.formatCode = formatCode;
async function _formatIndex(allText, range, index, eol, onType = false, extraConfig = {}) {
    const d = {
        'all-text': allText,
        idx: index,
        eol: eol,
        range: range,
        config: { ...(await config.getConfig()), ...extraConfig },
    };
    const result = (0, cljs_lib_1.jsify)(onType ? (0, cljs_lib_1.formatTextAtIdxOnType)(d) : (0, cljs_lib_1.formatTextAtIdx)(d));
    if (!result['error']) {
        return result;
    }
    else {
        console.error('Error in `_formatIndex`:', result['error']);
        throw result['error'];
    }
}
async function _formatRange(rangeText, allText, range, eol) {
    const d = {
        'range-text': rangeText,
        'all-text': allText,
        range: range,
        eol: eol,
        config: await config.getConfig(),
    };
    const result = (0, cljs_lib_1.jsify)((0, cljs_lib_1.formatTextAtRange)(d));
    if (!result['error']) {
        return result['range-text'];
    }
}
//# sourceMappingURL=format.js.map