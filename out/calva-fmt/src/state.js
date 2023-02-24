"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.reset = exports.deref = exports.mode = exports.cursor = void 0;
const vscode = require("vscode");
const Immutable = require("immutable");
const ImmutableCursor = require("immutable-cursor");
const mode = {
    language: 'clojure',
    //scheme: 'file'
};
exports.mode = mode;
let data;
const initialData = {
    documents: {},
};
reset();
const cursor = ImmutableCursor.from(data, [], (nextState) => {
    data = Immutable.fromJS(nextState);
});
exports.cursor = cursor;
function deref() {
    return data;
}
exports.deref = deref;
function reset() {
    data = Immutable.fromJS(initialData);
}
exports.reset = reset;
function config() {
    const configOptions = vscode.workspace.getConfiguration('janet.calva.fmt');
    return {
        parinferOnSelectionChange: configOptions.get('inferParensOnCursorMove'),
    };
}
exports.config = config;
//# sourceMappingURL=state.js.map