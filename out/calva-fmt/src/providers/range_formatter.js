"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangeEditProvider = void 0;
const formatter = require("../format");
class RangeEditProvider {
    provideDocumentRangeFormattingEdits(document, range, _options, _token) {
        return formatter.formatRangeEdits(document, range);
    }
}
exports.RangeEditProvider = RangeEditProvider;
//# sourceMappingURL=range_formatter.js.map