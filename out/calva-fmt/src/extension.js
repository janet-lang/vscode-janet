"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const ontype_formatter_1 = require("./providers/ontype_formatter");
const range_formatter_1 = require("./providers/range_formatter");
const formatter = require("./format");
const inferer = require("./infer");
const docmirror = require("../../doc-mirror/index");
const config = require("./config");
const janetConfig = require("../../config");
function getLanguageConfiguration(autoIndentOn) {
    return {
        onEnterRules: autoIndentOn && janetConfig.getConfig().format
            ? [
                // When Calva is the formatter disable all vscode default indentation
                // (By outdenting a lot, which is the only way I have found that works)
                // TODO: Make it actually consider whether Calva is the formatter or not
                {
                    beforeText: /.*/,
                    action: {
                        indentAction: vscode.IndentAction.Outdent,
                        removeText: Number.MAX_VALUE,
                    },
                },
            ]
            : [],
    };
}
async function activate(context) {
    docmirror.activate();
    vscode.languages.setLanguageConfiguration('janet', getLanguageConfiguration(await config.getConfig()['format-as-you-type']));
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('janet.calva-fmt.formatCurrentForm', formatter.formatPositionCommand));
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('janet.calva-fmt.alignCurrentForm', formatter.alignPositionCommand));
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('janet.calva-fmt.trimCurrentFormWhiteSpace', formatter.trimWhiteSpacePositionCommand));
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('janet.calva-fmt.inferParens', inferer.inferParensCommand));
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('janet.calva-fmt.tabIndent', (e) => {
        inferer.indentCommand(e, ' ', true);
    }));
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('janet.calva-fmt.tabDedent', (e) => {
        inferer.indentCommand(e, ' ', false);
    }));
    context.subscriptions.push(vscode.languages.registerOnTypeFormattingEditProvider(janetConfig.documentSelector, new ontype_formatter_1.FormatOnTypeEditProvider(), '\r', '\n', ')', ']', '}'));
    context.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider(janetConfig.documentSelector, new range_formatter_1.RangeEditProvider()));
    vscode.window.onDidChangeActiveTextEditor(inferer.updateState);
    vscode.workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration('janet.calva.fmt.formatAsYouType')) {
            vscode.languages.setLanguageConfiguration('janet', getLanguageConfiguration(await config.getConfig()['format-as-you-type']));
        }
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map