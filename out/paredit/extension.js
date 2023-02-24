'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPareditKeyMapChanged = exports.deactivate = exports.activate = exports.getKeyMapConf = void 0;
const statusbar_1 = require("./statusbar");
const vscode = require("vscode");
const vscode_1 = require("vscode");
const paredit = require("../cursor-doc/paredit");
const docMirror = require("../doc-mirror/index");
// import { assertIsDefined } from '../utilities';
const onPareditKeyMapChangedEmitter = new vscode_1.EventEmitter();
const languages = new Set(['clojure', 'lisp', 'scheme', 'janet']);
const enabled = true;
/**
 * Copies the text represented by the range from doc to the clipboard.
 * @param doc
 * @param range
 */
async function copyRangeToClipboard(doc, [start, end]) {
    const text = doc.model.getText(start, end);
    await vscode.env.clipboard.writeText(text);
}
/**
 * Answers true when `calva.paredit.killAlsoCutsToClipboard` is enabled.
 * @returns boolean
 */
function shouldKillAlsoCutToClipboard() {
    return vscode_1.workspace.getConfiguration().get('janet.paredit.killAlsoCutsToClipboard');
}
function assertIsDefined(value, message) {
    if (value === null || value === undefined) {
        throw new Error(typeof message === 'string' ? message : message());
    }
}
const pareditCommands = [
    // NAVIGATING
    {
        command: 'janet.paredit.forwardSexp',
        handler: (doc) => {
            paredit.moveToRangeRight(doc, paredit.forwardSexpRange(doc));
        },
    },
    {
        command: 'janet.paredit.backwardSexp',
        handler: (doc) => {
            paredit.moveToRangeLeft(doc, paredit.backwardSexpRange(doc));
        },
    },
    {
        command: 'janet.paredit.forwardDownSexp',
        handler: (doc) => {
            paredit.moveToRangeRight(doc, paredit.rangeToForwardDownList(doc));
        },
    },
    {
        command: 'janet.paredit.backwardDownSexp',
        handler: (doc) => {
            paredit.moveToRangeLeft(doc, paredit.rangeToBackwardDownList(doc));
        },
    },
    {
        command: 'janet.paredit.forwardUpSexp',
        handler: (doc) => {
            paredit.moveToRangeRight(doc, paredit.rangeToForwardUpList(doc));
        },
    },
    {
        command: 'janet.paredit.backwardUpSexp',
        handler: (doc) => {
            paredit.moveToRangeLeft(doc, paredit.rangeToBackwardUpList(doc));
        },
    },
    {
        command: 'janet.paredit.forwardSexpOrUp',
        handler: (doc) => {
            paredit.moveToRangeRight(doc, paredit.forwardSexpOrUpRange(doc));
        },
    },
    {
        command: 'janet.paredit.backwardSexpOrUp',
        handler: (doc) => {
            paredit.moveToRangeLeft(doc, paredit.backwardSexpOrUpRange(doc));
        },
    },
    {
        command: 'janet.paredit.closeList',
        handler: (doc) => {
            paredit.moveToRangeRight(doc, paredit.rangeToForwardList(doc));
        },
    },
    {
        command: 'janet.paredit.openList',
        handler: (doc) => {
            paredit.moveToRangeLeft(doc, paredit.rangeToBackwardList(doc));
        },
    },
    // SELECTING
    {
        command: 'janet.paredit.rangeForDefun',
        handler: (doc) => {
            paredit.selectRange(doc, paredit.rangeForDefun(doc));
        },
    },
    {
        command: 'janet.paredit.sexpRangeExpansion',
        handler: paredit.growSelection,
    },
    {
        command: 'janet.paredit.sexpRangeContraction',
        handler: paredit.shrinkSelection,
    },
    {
        command: 'janet.paredit.selectForwardSexp',
        handler: paredit.selectForwardSexp,
    },
    {
        command: 'janet.paredit.selectRight',
        handler: paredit.selectRight,
    },
    {
        command: 'janet.paredit.selectBackwardSexp',
        handler: paredit.selectBackwardSexp,
    },
    {
        command: 'janet.paredit.selectForwardDownSexp',
        handler: paredit.selectForwardDownSexp,
    },
    {
        command: 'janet.paredit.selectBackwardDownSexp',
        handler: paredit.selectBackwardDownSexp,
    },
    {
        command: 'janet.paredit.selectForwardUpSexp',
        handler: paredit.selectForwardUpSexp,
    },
    {
        command: 'janet.paredit.selectForwardSexpOrUp',
        handler: paredit.selectForwardSexpOrUp,
    },
    {
        command: 'janet.paredit.selectBackwardSexpOrUp',
        handler: paredit.selectBackwardSexpOrUp,
    },
    {
        command: 'janet.paredit.selectBackwardUpSexp',
        handler: paredit.selectBackwardUpSexp,
    },
    {
        command: 'janet.paredit.selectCloseList',
        handler: paredit.selectCloseList,
    },
    {
        command: 'janet.paredit.selectOpenList',
        handler: paredit.selectOpenList,
    },
    // EDITING
    {
        command: 'janet.paredit.slurpSexpForward',
        handler: paredit.forwardSlurpSexp,
    },
    {
        command: 'janet.paredit.barfSexpForward',
        handler: paredit.forwardBarfSexp,
    },
    {
        command: 'janet.paredit.slurpSexpBackward',
        handler: paredit.backwardSlurpSexp,
    },
    {
        command: 'janet.paredit.barfSexpBackward',
        handler: paredit.backwardBarfSexp,
    },
    {
        command: 'janet.paredit.splitSexp',
        handler: paredit.splitSexp,
    },
    {
        command: 'janet.paredit.joinSexp',
        handler: paredit.joinSexp,
    },
    {
        command: 'janet.paredit.spliceSexp',
        handler: paredit.spliceSexp,
    },
    // ['paredit.transpose', ], // TODO: Not yet implemented
    {
        command: 'janet.paredit.raiseSexp',
        handler: paredit.raiseSexp,
    },
    {
        command: 'janet.paredit.transpose',
        handler: paredit.transpose,
    },
    {
        command: 'janet.paredit.dragSexprBackward',
        handler: paredit.dragSexprBackward,
    },
    {
        command: 'janet.paredit.dragSexprForward',
        handler: paredit.dragSexprForward,
    },
    {
        command: 'janet.paredit.dragSexprBackwardUp',
        handler: paredit.dragSexprBackwardUp,
    },
    {
        command: 'janet.paredit.dragSexprForwardDown',
        handler: paredit.dragSexprForwardDown,
    },
    {
        command: 'janet.paredit.dragSexprForwardUp',
        handler: paredit.dragSexprForwardUp,
    },
    {
        command: 'janet.paredit.dragSexprBackwardDown',
        handler: paredit.dragSexprBackwardDown,
    },
    {
        command: 'janet.paredit.convolute',
        handler: paredit.convolute,
    },
    {
        command: 'janet.paredit.killRight',
        handler: async (doc) => {
            const range = paredit.forwardHybridSexpRange(doc);
            if (shouldKillAlsoCutToClipboard()) {
                await copyRangeToClipboard(doc, range);
            }
            return paredit.killRange(doc, range);
        },
    },
    {
        command: 'janet.paredit.killSexpForward',
        handler: async (doc) => {
            const range = paredit.forwardSexpRange(doc);
            if (shouldKillAlsoCutToClipboard()) {
                await copyRangeToClipboard(doc, range);
            }
            return paredit.killRange(doc, range);
        },
    },
    {
        command: 'janet.paredit.killSexpBackward',
        handler: async (doc) => {
            const range = paredit.backwardSexpRange(doc);
            if (shouldKillAlsoCutToClipboard()) {
                await copyRangeToClipboard(doc, range);
            }
            return paredit.killRange(doc, range);
        },
    },
    {
        command: 'janet.paredit.killListForward',
        handler: async (doc) => {
            const range = paredit.forwardListRange(doc);
            if (shouldKillAlsoCutToClipboard()) {
                await copyRangeToClipboard(doc, range);
            }
            return await paredit.killForwardList(doc, range);
        },
    },
    {
        command: 'janet.paredit.killListBackward',
        handler: async (doc) => {
            const range = paredit.backwardListRange(doc);
            if (shouldKillAlsoCutToClipboard()) {
                await copyRangeToClipboard(doc, range);
            }
            return await paredit.killBackwardList(doc, range);
        },
    },
    {
        command: 'janet.paredit.spliceSexpKillForward',
        handler: async (doc) => {
            const range = paredit.forwardListRange(doc);
            if (shouldKillAlsoCutToClipboard()) {
                await copyRangeToClipboard(doc, range);
            }
            await paredit.killForwardList(doc, range).then((isFulfilled) => {
                return paredit.spliceSexp(doc, doc.selection.active, false);
            });
        },
    },
    {
        command: 'janet.paredit.spliceSexpKillBackward',
        handler: async (doc) => {
            const range = paredit.backwardListRange(doc);
            if (shouldKillAlsoCutToClipboard()) {
                await copyRangeToClipboard(doc, range);
            }
            await paredit.killBackwardList(doc, range).then((isFulfilled) => {
                return paredit.spliceSexp(doc, doc.selection.active, false);
            });
        },
    },
    {
        command: 'janet.paredit.wrapAroundParens',
        handler: (doc) => {
            return paredit.wrapSexpr(doc, '(', ')');
        },
    },
    {
        command: 'janet.paredit.wrapAroundSquare',
        handler: (doc) => {
            return paredit.wrapSexpr(doc, '[', ']');
        },
    },
    {
        command: 'janet.paredit.wrapAroundCurly',
        handler: (doc) => {
            return paredit.wrapSexpr(doc, '{', '}');
        },
    },
    {
        command: 'janet.paredit.wrapAroundQuote',
        handler: (doc) => {
            return paredit.wrapSexpr(doc, '"', '"');
        },
    },
    {
        command: 'janet.paredit.rewrapParens',
        handler: (doc) => {
            return paredit.rewrapSexpr(doc, '(', ')');
        },
    },
    {
        command: 'janet.paredit.rewrapSquare',
        handler: (doc) => {
            return paredit.rewrapSexpr(doc, '[', ']');
        },
    },
    {
        command: 'janet.paredit.rewrapCurly',
        handler: (doc) => {
            return paredit.rewrapSexpr(doc, '{', '}');
        },
    },
    {
        command: 'janet.paredit.rewrapQuote',
        handler: (doc) => {
            return paredit.rewrapSexpr(doc, '"', '"');
        },
    },
    {
        command: 'janet.paredit.deleteForward',
        handler: async (doc) => {
            await paredit.deleteForward(doc);
        },
    },
    {
        command: 'janet.paredit.deleteBackward',
        handler: async (doc) => {
            await paredit.backspace(doc);
        },
    },
    {
        command: 'janet.paredit.forceDeleteForward',
        handler: () => {
            return vscode.commands.executeCommand('deleteRight');
        },
    },
    {
        command: 'janet.paredit.forceDeleteBackward',
        handler: () => {
            return vscode.commands.executeCommand('deleteLeft');
        },
    },
    {
        command: 'janet.paredit.addRichComment',
        handler: async (doc) => {
            await paredit.addRichComment(doc);
        },
    },
];
function wrapPareditCommand(command) {
    return async () => {
        try {
            const textEditor = vscode_1.window.activeTextEditor;
            assertIsDefined(textEditor, 'Expected window to have an activeTextEditor!');
            const mDoc = docMirror.getDocument(textEditor.document);
            if (!enabled || !languages.has(textEditor.document.languageId)) {
                return;
            }
            return command.handler(mDoc);
        }
        catch (e) {
            console.error(e.message);
        }
    };
}
function getKeyMapConf() {
    const keyMap = vscode_1.workspace.getConfiguration().get('janet.paredit.defaultKeyMap');
    return String(keyMap);
}
exports.getKeyMapConf = getKeyMapConf;
function setKeyMapConf() {
    const keyMap = vscode_1.workspace.getConfiguration().get('janet.paredit.defaultKeyMap');
    void vscode_1.commands.executeCommand('setContext', 'paredit:keyMap', keyMap);
    onPareditKeyMapChangedEmitter.fire(String(keyMap));
}
setKeyMapConf();
function activate(context) {
    const statusBar = new statusbar_1.StatusBar(getKeyMapConf());
    context.subscriptions.push(statusBar, vscode_1.commands.registerCommand('paredit.togglemode', () => {
        let keyMap = vscode_1.workspace.getConfiguration().get('janet.paredit.defaultKeyMap');
        keyMap = String(keyMap).trim().toLowerCase();
        if (keyMap == 'original') {
            void vscode_1.workspace
                .getConfiguration()
                .update('janet.paredit.defaultKeyMap', 'strict', vscode.ConfigurationTarget.Global);
        }
        else if (keyMap == 'strict') {
            void vscode_1.workspace
                .getConfiguration()
                .update('janet.paredit.defaultKeyMap', 'original', vscode.ConfigurationTarget.Global);
        }
    }), vscode_1.window.onDidChangeActiveTextEditor((e) => e && e.document && languages.has(e.document.languageId)), vscode_1.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('janet.paredit.defaultKeyMap')) {
            setKeyMapConf();
        }
    }), ...pareditCommands.map((command) => vscode_1.commands.registerCommand(command.command, wrapPareditCommand(command))));
}
exports.activate = activate;
function deactivate() {
    // do nothing
}
exports.deactivate = deactivate;
exports.onPareditKeyMapChanged = onPareditKeyMapChangedEmitter.event;
//# sourceMappingURL=extension.js.map