"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatOnTypeEditProvider = void 0;
const vscode = require("vscode");
const formatter = require("../format");
const docMirror = require("../../../doc-mirror/index");
const paredit = require("../../../cursor-doc/paredit");
const config_1 = require("../../../config");
const util = require("../../../utilities");
class FormatOnTypeEditProvider {
    async provideOnTypeFormattingEdits(document, _position, ch, _options) {
        let keyMap = vscode.workspace.getConfiguration().get('janet.paredit.defaultKeyMap');
        keyMap = String(keyMap).trim().toLowerCase();
        if ([')', ']', '}'].includes(ch)) {
            if (keyMap === 'strict' && (0, config_1.getConfig)().strictPreventUnmatchedClosingBracket) {
                const mDoc = docMirror.getDocument(document);
                const tokenCursor = mDoc.getTokenCursor();
                if (tokenCursor.withinComment()) {
                    return undefined;
                }
                // TODO: We should make a function in/for the MirrorDoc that can return
                // edits instead of performing them. It is not awesome to perform edits
                // here, since we are expected to return them.
                await paredit.backspace(mDoc);
                await paredit.close(mDoc, ch);
            }
            else {
                return undefined;
            }
        }
        const editor = util.getActiveTextEditor();
        const pos = editor.selection.active;
        if (vscode.workspace.getConfiguration('janet.calva.fmt').get('formatAsYouType')) {
            if (vscode.workspace.getConfiguration('janet.calva.fmt').get('newIndentEngine')) {
                void formatter.indentPosition(pos, document);
            }
            else {
                try {
                    void formatter.formatPosition(editor, true);
                }
                catch (e) {
                    void formatter.indentPosition(pos, document);
                }
            }
        }
        return undefined;
    }
}
exports.FormatOnTypeEditProvider = FormatOnTypeEditProvider;
//# sourceMappingURL=ontype_formatter.js.map