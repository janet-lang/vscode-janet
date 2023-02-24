"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analytics = exports.extensionContext = exports.getProjectConfig = void 0;
// import * as util from './utilities';
// import * as path from 'path';
// import * as os from 'os';
const cljs_lib_1 = require("../out/cljs-lib/cljs-lib");
// import * as projectRoot from './project-root';
let extensionContext;
exports.extensionContext = extensionContext;
// export function setExtensionContext(context: vscode.ExtensionContext) {
//   extensionContext = context;
//   if (context.workspaceState.get('selectedCljTypeName') == undefined) {
//     void context.workspaceState.update('selectedCljTypeName', 'unknown');
//   }
// }
// Super-quick fix for: https://github.com/BetterThanTomorrow/calva/issues/144
// TODO: Revisit the whole state management business.
// function _outputChannel(name: string): vscode.OutputChannel {
//   const channel = getStateValue(name);
//   if (channel.toJS !== undefined) {
//     return channel.toJS();
//   } else {
//     return channel;
//   }
// }
// function outputChannel(): vscode.OutputChannel {
//   return _outputChannel('outputChannel');
// }
// function connectionLogChannel(): vscode.OutputChannel {
//   return _outputChannel('connectionLogChannel');
// }
function analytics() {
    const analytics = (0, cljs_lib_1.getStateValue)('analytics');
    if (analytics.toJS !== undefined) {
        return analytics.toJS();
    }
    else {
        return analytics;
    }
}
exports.analytics = analytics;
// const PROJECT_DIR_KEY = 'connect.projectDir';
// const PROJECT_DIR_URI_KEY = 'connect.projectDirNew';
const PROJECT_CONFIG_MAP = 'config';
// export function getProjectRootLocal(useCache = true): string | undefined {
//   if (useCache) {
//     return getStateValue(PROJECT_DIR_KEY);
//   }
// }
function getProjectConfig(useCache = true) {
    if (useCache) {
        return (0, cljs_lib_1.getStateValue)(PROJECT_CONFIG_MAP);
    }
}
exports.getProjectConfig = getProjectConfig;
//# sourceMappingURL=state.js.map