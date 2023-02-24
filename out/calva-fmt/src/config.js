"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const vscode = require("vscode");
const filesCache = require("../../files-cache");
const cljsLib = require("../../../out/cljs-lib/cljs-lib.js");
// import * as lsp from '../../lsp/main';
const defaultCljfmtContent = '\
{:remove-surrounding-whitespace? true\n\
 :remove-trailing-whitespace? true\n\
 :remove-consecutive-blank-lines? false\n\
 :insert-missing-whitespace? true\n\
 :align-associative? false}';
const LSP_CONFIG_KEY = 'CLOJURE-LSP';
let lspFormatConfig;
function configuration(workspaceConfig, cljfmt) {
    return {
        'format-as-you-type': !!workspaceConfig.get('formatAsYouType'),
        'keep-comment-forms-trail-paren-on-own-line?': !!workspaceConfig.get('keepCommentTrailParenOnOwnLine'),
        'cljfmt-options-string': cljfmt,
        'cljfmt-options': cljsLib.cljfmtOptionsFromString(cljfmt),
    };
}
async function readConfiguration() {
    const workspaceConfig = vscode.workspace.getConfiguration('janet.calva.fmt');
    const configPath = workspaceConfig.get('configPath');
    // if (configPath === LSP_CONFIG_KEY) {
    //   lspFormatConfig = await lsp.getCljFmtConfig();
    // }
    if (configPath === LSP_CONFIG_KEY && !lspFormatConfig) {
        void vscode.window.showErrorMessage('Fetching formatting settings from clojure-lsp failed. Check that you are running a version of clojure-lsp that provides "cljfmt-raw" in serverInfo.', 'Roger that');
    }
    const cljfmtContent = configPath === LSP_CONFIG_KEY
        ? lspFormatConfig
            ? lspFormatConfig
            : defaultCljfmtContent
        : filesCache.content(configPath);
    const config = configuration(workspaceConfig, cljfmtContent ? cljfmtContent : defaultCljfmtContent);
    if (!config['cljfmt-options']['error']) {
        return config;
    }
    else {
        void vscode.window.showErrorMessage(`Error parsing ${configPath}: ${config['cljfmt-options']['error']}\n\nUsing default formatting configuration.`);
        return configuration(workspaceConfig, defaultCljfmtContent);
    }
}
async function getConfig() {
    const config = await readConfiguration();
    return config;
}
exports.getConfig = getConfig;
//# sourceMappingURL=config.js.map