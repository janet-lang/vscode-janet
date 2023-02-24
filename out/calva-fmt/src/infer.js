"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateState = exports.indentCommand = exports.inferParensCommand = void 0;
const vscode = require("vscode");
const cljs_lib_1 = require("../../../out/cljs-lib/cljs-lib");
const lodash_1 = require("lodash");
function inferParensCommand(editor) {
    // console.log("calva-fmt/src/infer.ts/inferParensCommand called");
    const position = editor.selection.active, document = editor.document, currentText = document.getText(), r = (0, cljs_lib_1.inferParens)({
        text: currentText,
        line: position.line,
        character: position.character,
        'previous-line': position.line,
        'previous-character': position.character,
    });
    applyResults(r, editor);
}
exports.inferParensCommand = inferParensCommand;
function indentCommand(editor, spacing, forward = true) {
    const prevPosition = editor.selection.active, document = editor.document;
    let deletedText = '', doEdit = true;
    void editor
        .edit((editBuilder) => {
        if (forward) {
            editBuilder.insert(new vscode.Position(prevPosition.line, prevPosition.character), spacing);
        }
        else {
            const startOfLine = new vscode.Position(prevPosition.line, 0), headRange = new vscode.Range(startOfLine, prevPosition), headText = document.getText(headRange), xOfFirstLeadingSpace = headText.search(/ *$/), leadingSpaces = xOfFirstLeadingSpace >= 0 ? prevPosition.character - xOfFirstLeadingSpace : 0;
            if (leadingSpaces > 0) {
                const spacingSize = Math.max(spacing.length, 1), deleteRange = new vscode.Range(prevPosition.translate(0, -spacingSize), prevPosition);
                deletedText = document.getText(deleteRange);
                editBuilder.delete(deleteRange);
            }
            else {
                doEdit = false;
            }
        }
    }, { undoStopAfter: false, undoStopBefore: false })
        .then((_onFulfilled) => {
        if (doEdit) {
            const position = editor.selection.active, currentText = document.getText(), r = (0, cljs_lib_1.inferIndents)({
                text: currentText,
                line: position.line,
                character: position.character,
                'previous-line': prevPosition.line,
                'previous-character': prevPosition.character,
                changes: [
                    {
                        line: forward ? prevPosition.line : position.line,
                        character: forward ? prevPosition.character : position.character,
                        'old-text': forward ? '' : deletedText,
                        'new-text': forward ? spacing : '',
                    },
                ],
            });
            applyResults(r, editor);
        }
    });
}
exports.indentCommand = indentCommand;
function applyResults(r, editor) {
    if (r.success) {
        void editor
            .edit((editBuilder) => {
            if ((0, lodash_1.isUndefined)(r.edits)) {
                console.error('Edits were undefined!', (0, lodash_1.cloneDeep)({ editBuilder, r, editor }));
                return;
            }
            r.edits.forEach((edit) => {
                const start = new vscode.Position(edit.start.line, edit.start.character), end = new vscode.Position(edit.end.line, edit.end.character);
                if ((0, lodash_1.isUndefined)(edit.text)) {
                    console.error('edit.text was undefined!', (0, lodash_1.cloneDeep)({ edit, editBuilder, r, editor }));
                    return;
                }
                editBuilder.replace(new vscode.Range(start, end), edit.text);
            });
        }, { undoStopAfter: true, undoStopBefore: false })
            .then((_onFulfilled) => {
            // these will never be undefined in practice:
            // https://github.com/BetterThanTomorrow/calva/blob/5d23da5704989e000b1f860fc09f5935d7bac3f5/src/cljs-lib/src/calva/fmt/editor.cljs#L5-L21
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
            const newPosition = new vscode.Position(r.line, r.character);
            editor.selections = [new vscode.Selection(newPosition, newPosition)];
        });
    }
    else {
        void vscode.window.showErrorMessage('Calva Formatter Error: ' + (r.error ? r.error.message : r['error-msg']));
    }
}
function updateState(editor) {
    // do nothing
}
exports.updateState = updateState;
//# sourceMappingURL=infer.js.map