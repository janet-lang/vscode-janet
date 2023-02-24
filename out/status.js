"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import statusbar from './statusbar';
const state = require("./state");
// import { updateReplSessionType } from './nrepl/repl-session';
// function updateNeedReplUi(isNeeded: boolean, context = state.extensionContext) {
//   void context.workspaceState.update('needReplUi', isNeeded);
//   update(context);
// }
// function shouldshowReplUi(context = state.extensionContext): boolean {
//   return context.workspaceState.get('needReplUi') || !getConfig().hideReplUi;
// }
function update(context = state.extensionContext) {
    // void vscode.commands.executeCommand('setContext', 'calva:showReplUi', shouldshowReplUi(context));
    // updateReplSessionType();
    // statusbar.update(context);
}
exports.default = {
    update,
    // updateNeedReplUi,
    // shouldshowReplUi,
};
//# sourceMappingURL=status.js.map