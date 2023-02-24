"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = exports.documentSelector = exports.KEYBINDINGS_ENABLED_CONTEXT_KEY = exports.KEYBINDINGS_ENABLED_CONFIG_KEY = void 0;
const vscode = require("vscode");
// import { ReplConnectSequence } from './nrepl/connectSequence';
// import { PrettyPrintingOptions } from './printer';
// import { parseEdn } from '../out/cljs-lib/cljs-lib';
const state_1 = require("./state");
// import { isDefined } from './utilities';
// const REPL_FILE_EXT = 'calva-repl';
const KEYBINDINGS_ENABLED_CONFIG_KEY = 'janet.keybindingsEnabled';
exports.KEYBINDINGS_ENABLED_CONFIG_KEY = KEYBINDINGS_ENABLED_CONFIG_KEY;
const KEYBINDINGS_ENABLED_CONTEXT_KEY = 'janet:keybindingsEnabled';
exports.KEYBINDINGS_ENABLED_CONTEXT_KEY = KEYBINDINGS_ENABLED_CONTEXT_KEY;
// type ReplSessionType = 'clj' | 'cljs';
// include the 'file' and 'untitled' to the
// document selector. All other schemes are
// not known and therefore not supported.
const documentSelector = [
    { scheme: 'file', language: 'janet' },
    { scheme: 'jar', language: 'janet' },
    { scheme: 'untitled', language: 'janet' },
];
exports.documentSelector = documentSelector;
/**
 * Trims EDN alias and profile names from any surrounding whitespace or `:` characters.
 * This in order to free the user from having to figure out how the name should be entered.
 * @param  {string} name
 * @return {string} The trimmed name
 */
function _trimAliasName(name) {
    return name.replace(/^[\s,:]*/, '').replace(/[\s,:]*$/, '');
}
// async function readEdnWorkspaceConfig(uri?: vscode.Uri) {
//   try {
//     let resolvedUri: vscode.Uri;
//     const configPath = state.resolvePath('.calva/config.edn');
//     if (isDefined(uri)) {
//       resolvedUri = uri;
//     } else if (isDefined(configPath)) {
//       resolvedUri = vscode.Uri.file(configPath);
//     } else {
//       throw new Error('Expected a uri to be passed in or a config to exist at .calva/config.edn');
//     }
//     const data = await vscode.workspace.fs.readFile(resolvedUri);
//     return addEdnConfig(new TextDecoder('utf-8').decode(data));
//   } catch (error) {
//     return error;
//   }
// }
// function mergeSnippets(
//   oldSnippets: customREPLCommandSnippet[],
//   newSnippets: customREPLCommandSnippet[]
// ): customREPLCommandSnippet[] {
//   return newSnippets.concat(
//     _.reject(
//       oldSnippets,
//       (item) => _.findIndex(newSnippets, (newItem) => item.name === newItem.name) !== -1
//     )
//   );
// }
/**
 * Saves the EDN config in the state to be merged into the actual vsconfig.
 * Currently only `:customREPLCommandSnippets` is supported and the `:snippet` has to be a string.
 * @param {string} data a string representation of a clojure map
 * @returns an error of one was thrown
 */
// function addEdnConfig(data: string) {
//   try {
//     const parsed = parseEdn(data);
//     const old = getProjectConfig();
//     state.setProjectConfig({
//       customREPLCommandSnippets: mergeSnippets(
//         old?.customREPLCommandSnippets ?? [],
//         parsed?.customREPLCommandSnippets ?? []
//       ),
//       customREPLHoverSnippets: mergeSnippets(
//         old?.customREPLHoverSnippets ?? [],
//         parsed?.customREPLHoverSnippets ?? []
//       ),
//     });
//   } catch (error) {
//     return error;
//   }
// }
// const watcher = vscode.workspace.createFileSystemWatcher(
//   '**/.calva/**/config.edn',
//   false,
//   false,
//   false
// );
// watcher.onDidChange((uri: vscode.Uri) => {
//   void readEdnWorkspaceConfig(uri);
// });
// TODO find a way to validate the configs
function getConfig() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const configOptions = vscode.workspace.getConfiguration('janet');
    const pareditOptions = vscode.workspace.getConfiguration('janet.paredit');
    const w = (_b = (_a = configOptions.inspect('customREPLCommandSnippets')) === null || _a === void 0 ? void 0 : _a.workspaceValue) !== null && _b !== void 0 ? _b : [];
    const commands = w.concat((_d = (_c = (0, state_1.getProjectConfig)()) === null || _c === void 0 ? void 0 : _c.customREPLCommandSnippets) !== null && _d !== void 0 ? _d : []);
    const hoverSnippets = ((_f = (_e = configOptions.inspect('customREPLHoverSnippets')) === null || _e === void 0 ? void 0 : _e.workspaceValue) !== null && _f !== void 0 ? _f : []).concat((_h = (_g = (0, state_1.getProjectConfig)()) === null || _g === void 0 ? void 0 : _g.customREPLHoverSnippets) !== null && _h !== void 0 ? _h : []);
    return {
        format: configOptions.get('formatOnSave'),
        evaluate: configOptions.get('evalOnSave'),
        test: configOptions.get('testOnSave'),
        showDocstringInParameterHelp: configOptions.get('showDocstringInParameterHelp'),
        jackInEnv: configOptions.get('jackInEnv'),
        jackInDependencyVersions: configOptions.get('jackInDependencyVersions'),
        clojureLspVersion: configOptions.get('clojureLspVersion'),
        clojureLspPath: configOptions.get('clojureLspPath'),
        openBrowserWhenFigwheelStarted: configOptions.get('openBrowserWhenFigwheelStarted'),
        customCljsRepl: configOptions.get('customCljsRepl', null),
        // replConnectSequences: configOptions.get<ReplConnectSequence[]>('replConnectSequences'),
        myLeinProfiles: configOptions.get('myLeinProfiles', []).map(_trimAliasName),
        myCljAliases: configOptions.get('myCljAliases', []).map(_trimAliasName),
        asyncOutputDestination: configOptions.get('sendAsyncOutputTo'),
        customREPLCommandSnippets: configOptions.get('customREPLCommandSnippets', []),
        customREPLCommandSnippetsGlobal: (_k = (_j = configOptions.inspect('customREPLCommandSnippets')) === null || _j === void 0 ? void 0 : _j.globalValue) !== null && _k !== void 0 ? _k : [],
        customREPLCommandSnippetsWorkspace: commands,
        customREPLCommandSnippetsWorkspaceFolder: (_m = (_l = configOptions.inspect('customREPLCommandSnippets')) === null || _l === void 0 ? void 0 : _l.workspaceFolderValue) !== null && _m !== void 0 ? _m : [],
        customREPLHoverSnippets: hoverSnippets,
        // prettyPrintingOptions: configOptions.get<PrettyPrintingOptions>('prettyPrintingOptions'),
        evaluationSendCodeToOutputWindow: configOptions.get('evaluationSendCodeToOutputWindow'),
        enableJSCompletions: configOptions.get('enableJSCompletions'),
        autoOpenREPLWindow: configOptions.get('autoOpenREPLWindow'),
        autoOpenJackInTerminal: configOptions.get('autoOpenJackInTerminal'),
        referencesCodeLensEnabled: configOptions.get('referencesCodeLens.enabled'),
        hideReplUi: configOptions.get('hideReplUi'),
        strictPreventUnmatchedClosingBracket: pareditOptions.get('strictPreventUnmatchedClosingBracket'),
        showCalvaSaysOnStart: configOptions.get('showCalvaSaysOnStart'),
        jackIn: {
            useDeprecatedAliasFlag: configOptions.get('jackIn.useDeprecatedAliasFlag'),
        },
        enableClojureLspOnStart: configOptions.get('enableClojureLspOnStart'),
        projectRootsSearchExclude: configOptions.get('projectRootsSearchExclude', []),
        useLiveShare: configOptions.get('useLiveShare'),
        definitionProviderPriority: configOptions.get('definitionProviderPriority'),
    };
}
exports.getConfig = getConfig;
//# sourceMappingURL=config.js.map