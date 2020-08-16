"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Module = require("../janet/janet");
let repl_input;
Module.postRun = () => {
    Module._repl_init();
    repl_input = Module.cwrap('repl_input', 'void', ['string']);
    repl_input(`(import ${__dirname}/../janet/fmt)`);
};
function format(fileName) {
    if (!fileName.endsWith('.janet'))
        return;
    if (!repl_input) {
        setTimeout(() => format(fileName), 1000);
        return;
    }
    repl_input(`(fmt/format-file "${fileName}")`);
}
exports.format = format;
//# sourceMappingURL=formatter.js.map