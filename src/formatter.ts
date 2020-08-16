import * as Module from '../janet/janet';

let repl_input: any;

Module.postRun = () => {
    Module._repl_init();
    repl_input = Module.cwrap('repl_input', 'void', ['string']);
    repl_input(`(import ${__dirname}/../janet/fmt)`);
}

export function format(fileName: string) {
    if (!fileName.endsWith('.janet')) return;
    if (!repl_input) {
        setTimeout(() => format(fileName), 1000);
        return;
    }

    repl_input(`(fmt/format-file "${fileName}")`);
}
