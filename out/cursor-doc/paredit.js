"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shrinkSelection = exports.growSelectionStack = exports.growSelection = exports.stringQuote = exports.deleteForward = exports.backspace = exports.close = exports.open = exports.backwardBarfSexp = exports.forwardBarfSexp = exports.backwardSlurpSexp = exports.forwardSlurpSexp = exports.killForwardList = exports.killBackwardList = exports.spliceSexp = exports.joinSexp = exports.splitSexp = exports.rewrapSexpr = exports.wrapSexpr = exports.rangeToBackwardList = exports.rangeToForwardList = exports.rangeToBackwardDownList = exports.rangeToForwardDownList = exports.backwardSexpOrUpRange = exports.forwardSexpOrUpRange = exports.rangeToBackwardUpList = exports.rangeToForwardUpList = exports.forwardHybridSexpRange = exports.backwardListRange = exports.forwardListRange = exports.backwardSexpRange = exports.forwardSexpRange = exports.rangeForDefun = exports.selectOpenList = exports.selectCloseList = exports.selectBackwardSexpOrUp = exports.selectBackwardUpSexp = exports.selectForwardUpSexp = exports.selectBackwardDownSexp = exports.selectForwardDownSexp = exports.selectBackwardSexp = exports.selectForwardSexpOrUp = exports.selectRight = exports.selectForwardSexp = exports.selectRangeBackward = exports.selectRangeForward = exports.selectRange = exports.moveToRangeRight = exports.moveToRangeLeft = exports.killRange = void 0;
exports.addRichComment = exports.dragSexprBackwardDown = exports.dragSexprForwardUp = exports.dragSexprForwardDown = exports.dragSexprBackwardUp = exports.collectWhitespaceInfo = exports.dragSexprForward = exports.dragSexprBackward = exports.bindingForms = exports.transpose = exports.convolute = exports.raiseSexp = exports.setSelectionStack = void 0;
const janet_lexer_1 = require("./cdf-edits/janet-lexer");
const indent_1 = require("./indent");
const model_1 = require("./model");
// NB: doc.model.edit returns a Thenable, so that the vscode Editor can compose commands.
// But don't put such chains in this module because that won't work in the repl-console.
// In the repl-console, compose commands just by performing them in succession, making sure
// you provide selections, old and new.
// TODO: Implement all movement and selection commands here, instead of composing them
//       exactly the same way in the editor and in the repl-window.
//       Example: paredit.moveToRangeRight(this.readline, paredit.forwardSexpRange(this.readline))
//                => paredit.moveForwardSexp(this.readline)
async function killRange(doc, range, start = doc.selection.anchor, end = doc.selection.active) {
    const [left, right] = [Math.min(...range), Math.max(...range)];
    return doc.model.edit([new model_1.ModelEdit('deleteRange', [left, right - left, [start, end]])], {
        selection: new model_1.ModelEditSelection(left),
    });
}
exports.killRange = killRange;
function moveToRangeLeft(doc, range) {
    doc.selection = new model_1.ModelEditSelection(Math.min(range[0], range[1]));
}
exports.moveToRangeLeft = moveToRangeLeft;
function moveToRangeRight(doc, range) {
    doc.selection = new model_1.ModelEditSelection(Math.max(range[0], range[1]));
}
exports.moveToRangeRight = moveToRangeRight;
function selectRange(doc, range) {
    growSelectionStack(doc, range);
}
exports.selectRange = selectRange;
function selectRangeForward(doc, range) {
    const selectionLeft = doc.selection.anchor;
    const rangeRight = Math.max(range[0], range[1]);
    growSelectionStack(doc, [selectionLeft, rangeRight]);
}
exports.selectRangeForward = selectRangeForward;
function selectRangeBackward(doc, range) {
    const selectionRight = doc.selection.anchor;
    const rangeLeft = Math.min(range[0], range[1]);
    growSelectionStack(doc, [selectionRight, rangeLeft]);
}
exports.selectRangeBackward = selectRangeBackward;
function selectForwardSexp(doc) {
    const rangeFn = doc.selection.active >= doc.selection.anchor
        ? forwardSexpRange
        : (doc) => forwardSexpRange(doc, doc.selection.active, true);
    selectRangeForward(doc, rangeFn(doc));
}
exports.selectForwardSexp = selectForwardSexp;
function selectRight(doc) {
    const rangeFn = doc.selection.active >= doc.selection.anchor
        ? forwardHybridSexpRange
        : (doc) => forwardHybridSexpRange(doc, doc.selection.active, true);
    selectRangeForward(doc, rangeFn(doc));
}
exports.selectRight = selectRight;
function selectForwardSexpOrUp(doc) {
    const rangeFn = doc.selection.active >= doc.selection.anchor
        ? forwardSexpOrUpRange
        : (doc) => forwardSexpOrUpRange(doc, doc.selection.active, true);
    selectRangeForward(doc, rangeFn(doc));
}
exports.selectForwardSexpOrUp = selectForwardSexpOrUp;
function selectBackwardSexp(doc) {
    const rangeFn = doc.selection.active <= doc.selection.anchor
        ? backwardSexpRange
        : (doc) => backwardSexpRange(doc, doc.selection.active, false);
    selectRangeBackward(doc, rangeFn(doc));
}
exports.selectBackwardSexp = selectBackwardSexp;
function selectForwardDownSexp(doc) {
    const rangeFn = doc.selection.active >= doc.selection.anchor
        ? (doc) => rangeToForwardDownList(doc, doc.selection.active, true)
        : (doc) => rangeToForwardDownList(doc, doc.selection.active, true);
    selectRangeForward(doc, rangeFn(doc));
}
exports.selectForwardDownSexp = selectForwardDownSexp;
function selectBackwardDownSexp(doc) {
    selectRangeBackward(doc, rangeToBackwardDownList(doc));
}
exports.selectBackwardDownSexp = selectBackwardDownSexp;
function selectForwardUpSexp(doc) {
    selectRangeForward(doc, rangeToForwardUpList(doc, doc.selection.active));
}
exports.selectForwardUpSexp = selectForwardUpSexp;
function selectBackwardUpSexp(doc) {
    const rangeFn = doc.selection.active <= doc.selection.anchor
        ? (doc) => rangeToBackwardUpList(doc, doc.selection.active, false)
        : (doc) => rangeToBackwardUpList(doc, doc.selection.active, false);
    selectRangeBackward(doc, rangeFn(doc));
}
exports.selectBackwardUpSexp = selectBackwardUpSexp;
function selectBackwardSexpOrUp(doc) {
    const rangeFn = doc.selection.active <= doc.selection.anchor
        ? (doc) => backwardSexpOrUpRange(doc, doc.selection.active, false)
        : (doc) => backwardSexpOrUpRange(doc, doc.selection.active, false);
    selectRangeBackward(doc, rangeFn(doc));
}
exports.selectBackwardSexpOrUp = selectBackwardSexpOrUp;
function selectCloseList(doc) {
    selectRangeForward(doc, rangeToForwardList(doc, doc.selection.active));
}
exports.selectCloseList = selectCloseList;
function selectOpenList(doc) {
    selectRangeBackward(doc, rangeToBackwardList(doc));
}
exports.selectOpenList = selectOpenList;
/**
 * Gets the range for the ”current” top level form
 * @see ListTokenCursor.rangeForDefun
 */
function rangeForDefun(doc, offset = doc.selection.active, commentCreatesTopLevel = true) {
    const cursor = doc.getTokenCursor(offset);
    return cursor.rangeForDefun(offset, commentCreatesTopLevel);
}
exports.rangeForDefun = rangeForDefun;
/**
 * Required : If the cursor can move up and out of an sexp, it must
 * Never : If the cursor is at the inner limit of an sexp, it may not escape
 * WhenAtLimit : If the cursor is at the inner limit of an sexp, it may move up and out
 */
var GoUpSexpOption;
(function (GoUpSexpOption) {
    GoUpSexpOption[GoUpSexpOption["Required"] = 0] = "Required";
    GoUpSexpOption[GoUpSexpOption["Never"] = 1] = "Never";
    GoUpSexpOption[GoUpSexpOption["WhenAtLimit"] = 2] = "WhenAtLimit";
})(GoUpSexpOption || (GoUpSexpOption = {}));
/**
 * Return a modified selection range on doc. Moves the right limit around sexps, potentially moving up.
 */
function _forwardSexpRange(doc, offset = Math.max(doc.selection.anchor, doc.selection.active), goUpSexp, goPastWhitespace = false) {
    const cursor = doc.getTokenCursor(offset);
    if (goUpSexp == GoUpSexpOption.Never || goUpSexp == GoUpSexpOption.WhenAtLimit) {
        // Normalize our position by scooting to the beginning of the closest sexp
        cursor.forwardWhitespace();
        if (cursor.forwardSexp(true, true)) {
            if (goPastWhitespace) {
                cursor.forwardWhitespace();
            }
            return [offset, cursor.offsetStart];
        }
    }
    if (goUpSexp == GoUpSexpOption.Required || goUpSexp == GoUpSexpOption.WhenAtLimit) {
        cursor.forwardList();
        if (cursor.upList()) {
            if (goPastWhitespace) {
                cursor.forwardWhitespace();
            }
            return [offset, cursor.offsetStart];
        }
    }
    return [offset, offset];
}
/**
 * Return a modified selection range on doc. Moves the left limit around sexps, potentially moving up.
 */
function _backwardSexpRange(doc, offset = Math.min(doc.selection.anchor, doc.selection.active), goUpSexp, goPastWhitespace = false) {
    const cursor = doc.getTokenCursor(offset);
    if (goUpSexp == GoUpSexpOption.Never || goUpSexp == GoUpSexpOption.WhenAtLimit) {
        if (!cursor.isWhiteSpace() && cursor.offsetStart < offset) {
            // This is because cursor.backwardSexp() can't move backwards when "on" the first sexp inside a list
            // TODO: Try to fix this in LispTokenCursor instead.
            cursor.forwardSexp();
        }
        cursor.backwardWhitespace();
        if (cursor.backwardSexp(true, true)) {
            if (goPastWhitespace) {
                cursor.backwardWhitespace();
            }
            return [cursor.offsetStart, offset];
        }
    }
    if (goUpSexp == GoUpSexpOption.Required || goUpSexp == GoUpSexpOption.WhenAtLimit) {
        cursor.backwardList();
        if (cursor.backwardUpList()) {
            cursor.forwardSexp(true, true);
            cursor.backwardSexp(true, true);
            if (goPastWhitespace) {
                cursor.backwardWhitespace();
            }
            return [cursor.offsetStart, offset];
        }
    }
    return [offset, offset];
}
function forwardSexpRange(doc, offset = Math.max(doc.selection.anchor, doc.selection.active), goPastWhitespace = false) {
    return _forwardSexpRange(doc, offset, GoUpSexpOption.Never, goPastWhitespace);
}
exports.forwardSexpRange = forwardSexpRange;
function backwardSexpRange(doc, offset = Math.min(doc.selection.anchor, doc.selection.active), goPastWhitespace = false) {
    return _backwardSexpRange(doc, offset, GoUpSexpOption.Never, goPastWhitespace);
}
exports.backwardSexpRange = backwardSexpRange;
function forwardListRange(doc, start = doc.selection.active) {
    const cursor = doc.getTokenCursor(start);
    cursor.forwardList();
    return [start, cursor.offsetStart];
}
exports.forwardListRange = forwardListRange;
function backwardListRange(doc, start = doc.selection.active) {
    const cursor = doc.getTokenCursor(start);
    cursor.backwardList();
    return [cursor.offsetStart, start];
}
exports.backwardListRange = backwardListRange;
/**
 * Aims to find the end of the current form (list|vector|map|set|string etc)
 * When there is a newline before the end of the current form either:
 *  - Return the end of the nearest form to the right of the cursor location if one exists
 *  - Returns the newline's offset if no form exists
 *
 * This function's output range is needed to implement features similar to paredit's
 * killRight or smartparens' sp-kill-hybrid-sexp.
 *
 * @param doc
 * @param offset
 * @param goPastWhitespace
 * @returns [number, number]
 */
function forwardHybridSexpRange(doc, offset = Math.max(doc.selection.anchor, doc.selection.active), goPastWhitespace = false) {
    let cursor = doc.getTokenCursor(offset);
    if (cursor.getToken().type === 'open') {
        return forwardSexpRange(doc);
    }
    else if (cursor.getToken().type === 'close') {
        return [offset, offset];
    }
    const currentLineText = doc.model.getLineText(cursor.line);
    const lineStart = doc.model.getOffsetForLine(cursor.line);
    const currentLineNewlineOffset = lineStart + currentLineText.length;
    const remainderLineText = doc.model.getText(offset, currentLineNewlineOffset + 1);
    cursor.forwardList(); // move to the end of the current form
    const currentFormEndToken = cursor.getToken();
    // when we've advanced the cursor but start is behind us then go to the end
    // happens when in a clojure comment i.e:  ;; ----
    const cursorOffsetEnd = cursor.offsetStart <= offset ? cursor.offsetEnd : cursor.offsetStart;
    const text = doc.model.getText(offset, cursorOffsetEnd);
    let hasNewline = text.indexOf('\n') > -1;
    let end = cursorOffsetEnd;
    // Want the min of closing token or newline
    // After moving forward, the cursor is not yet at the end of the current line,
    // and it is not a close token. So we include the newline
    // because what forms are here extend beyond the end of the current line
    if (currentLineNewlineOffset > cursor.offsetEnd && currentFormEndToken.type != 'close') {
        hasNewline = true;
        end = currentLineNewlineOffset;
    }
    if (remainderLineText === '' || remainderLineText === '\n') {
        end = currentLineNewlineOffset + doc.model.lineEndingLength;
    }
    else if (hasNewline) {
        // Try to find the first open token to the right of the document's cursor location if any
        let nearestOpenTokenOffset = -1;
        // Start at the newline.
        // Work backwards to find the smallest open token offset
        // greater than the document's cursor location if any
        cursor = doc.getTokenCursor(currentLineNewlineOffset);
        while (cursor.offsetStart > offset) {
            while (cursor.backwardSexp()) {
                // move backward until the cursor cannot move backward anymore
            }
            if (cursor.offsetStart > offset) {
                nearestOpenTokenOffset = cursor.offsetStart;
                cursor = doc.getTokenCursor(cursor.offsetStart - 1);
            }
        }
        if (nearestOpenTokenOffset > 0) {
            cursor = doc.getTokenCursor(nearestOpenTokenOffset);
            cursor.forwardList();
            end = cursor.offsetEnd; // include the closing token
        }
        else {
            // no open tokens found so the end is the newline
            end = currentLineNewlineOffset;
        }
    }
    return [offset, end];
}
exports.forwardHybridSexpRange = forwardHybridSexpRange;
function rangeToForwardUpList(doc, offset = Math.max(doc.selection.anchor, doc.selection.active), goPastWhitespace = false) {
    return _forwardSexpRange(doc, offset, GoUpSexpOption.Required, goPastWhitespace);
}
exports.rangeToForwardUpList = rangeToForwardUpList;
function rangeToBackwardUpList(doc, offset = Math.min(doc.selection.anchor, doc.selection.active), goPastWhitespace = false) {
    return _backwardSexpRange(doc, offset, GoUpSexpOption.Required, goPastWhitespace);
}
exports.rangeToBackwardUpList = rangeToBackwardUpList;
function forwardSexpOrUpRange(doc, offset = Math.max(doc.selection.anchor, doc.selection.active), goPastWhitespace = false) {
    return _forwardSexpRange(doc, offset, GoUpSexpOption.WhenAtLimit, goPastWhitespace);
}
exports.forwardSexpOrUpRange = forwardSexpOrUpRange;
function backwardSexpOrUpRange(doc, offset = Math.min(doc.selection.anchor, doc.selection.active), goPastWhitespace = false) {
    return _backwardSexpRange(doc, offset, GoUpSexpOption.WhenAtLimit, goPastWhitespace);
}
exports.backwardSexpOrUpRange = backwardSexpOrUpRange;
function rangeToForwardDownList(doc, offset = Math.max(doc.selection.anchor, doc.selection.active), goPastWhitespace = false) {
    const cursor = doc.getTokenCursor(offset);
    if (cursor.downListSkippingMeta()) {
        if (goPastWhitespace) {
            cursor.forwardWhitespace();
        }
        return [offset, cursor.offsetStart];
    }
    else {
        return [offset, offset];
    }
}
exports.rangeToForwardDownList = rangeToForwardDownList;
function rangeToBackwardDownList(doc, offset = Math.min(doc.selection.anchor, doc.selection.active), goPastWhitespace = false) {
    const cursor = doc.getTokenCursor(offset);
    do {
        cursor.backwardWhitespace();
        if (cursor.getPrevToken().type === 'close') {
            break;
        }
    } while (cursor.backwardSexp());
    if (cursor.backwardDownList()) {
        if (goPastWhitespace) {
            cursor.backwardWhitespace();
        }
        return [cursor.offsetStart, offset];
    }
    else {
        return [offset, offset];
    }
}
exports.rangeToBackwardDownList = rangeToBackwardDownList;
function rangeToForwardList(doc, offset = Math.max(doc.selection.anchor, doc.selection.active)) {
    const cursor = doc.getTokenCursor(offset);
    if (cursor.forwardList()) {
        return [offset, cursor.offsetStart];
    }
    else {
        return [offset, offset];
    }
}
exports.rangeToForwardList = rangeToForwardList;
function rangeToBackwardList(doc, offset = Math.min(doc.selection.anchor, doc.selection.active)) {
    const cursor = doc.getTokenCursor(offset);
    if (cursor.backwardList()) {
        return [cursor.offsetStart, offset];
    }
    else {
        return [offset, offset];
    }
}
exports.rangeToBackwardList = rangeToBackwardList;
async function wrapSexpr(doc, open, close, start = doc.selection.anchor, end = doc.selection.active, options = { skipFormat: false }) {
    const cursor = doc.getTokenCursor(end);
    if (cursor.withinString() && open == '"') {
        open = close = '\\"';
    }
    if (start == end) {
        // No selection
        const currentFormRange = cursor.rangeForCurrentForm(start);
        if (currentFormRange) {
            const range = currentFormRange;
            return doc.model.edit([
                new model_1.ModelEdit('insertString', [range[1], close]),
                new model_1.ModelEdit('insertString', [
                    range[0],
                    open,
                    [end, end],
                    [start + open.length, start + open.length],
                ]),
            ], {
                selection: new model_1.ModelEditSelection(start + open.length),
                skipFormat: options.skipFormat,
            });
        }
    }
    else {
        // there is a selection
        const range = [Math.min(start, end), Math.max(start, end)];
        return doc.model.edit([
            new model_1.ModelEdit('insertString', [range[1], close]),
            new model_1.ModelEdit('insertString', [range[0], open]),
        ], {
            selection: new model_1.ModelEditSelection(start + open.length),
            skipFormat: options.skipFormat,
        });
    }
}
exports.wrapSexpr = wrapSexpr;
async function rewrapSexpr(doc, open, close, start = doc.selection.anchor, end = doc.selection.active) {
    const cursor = doc.getTokenCursor(end);
    if (cursor.backwardList()) {
        const openStart = cursor.offsetStart - 1, openEnd = cursor.offsetStart;
        if (cursor.forwardList()) {
            const closeStart = cursor.offsetStart, closeEnd = cursor.offsetEnd;
            return doc.model.edit([
                new model_1.ModelEdit('changeRange', [closeStart, closeEnd, close]),
                new model_1.ModelEdit('changeRange', [openStart, openEnd, open]),
            ], { selection: new model_1.ModelEditSelection(end) });
        }
    }
}
exports.rewrapSexpr = rewrapSexpr;
async function splitSexp(doc, start = doc.selection.active) {
    const cursor = doc.getTokenCursor(start);
    if (!cursor.withinString() && !(cursor.isWhiteSpace() || cursor.previousIsWhiteSpace())) {
        cursor.forwardWhitespace();
    }
    const splitPos = cursor.withinString() ? start : cursor.offsetStart;
    if (cursor.backwardList()) {
        const open = cursor.getPrevToken().raw;
        if (cursor.forwardList()) {
            const close = cursor.getToken().raw;
            return doc.model.edit([new model_1.ModelEdit('changeRange', [splitPos, splitPos, `${close}${open}`])], {
                selection: new model_1.ModelEditSelection(splitPos + 1),
            });
        }
    }
}
exports.splitSexp = splitSexp;
/**
 * If `start` is between two strings or two lists of the same type: join them. Otherwise do nothing.
 * @param doc
 * @param start
 */
async function joinSexp(doc, start = doc.selection.active) {
    const cursor = doc.getTokenCursor(start);
    cursor.backwardWhitespace();
    const prevToken = cursor.getPrevToken(), prevEnd = cursor.offsetStart;
    if (['close', 'str-end', 'str'].includes(prevToken.type)) {
        cursor.forwardWhitespace();
        const nextToken = cursor.getToken(), nextStart = cursor.offsetStart;
        if ((0, janet_lexer_1.validPair)(nextToken.raw[0], prevToken.raw[prevToken.raw.length - 1])) {
            return doc.model.edit([
                new model_1.ModelEdit('changeRange', [
                    prevEnd - 1,
                    nextStart + 1,
                    prevToken.type === 'close' ? ' ' : '',
                    [start, start],
                    [prevEnd, prevEnd],
                ]),
            ], { selection: new model_1.ModelEditSelection(prevEnd), formatDepth: 2 });
        }
    }
}
exports.joinSexp = joinSexp;
async function spliceSexp(doc, start = doc.selection.active, undoStopBefore = true) {
    const cursor = doc.getTokenCursor(start);
    // TODO: this should unwrap the string, not the enclosing list.
    cursor.backwardList();
    const open = cursor.getPrevToken();
    const beginning = cursor.offsetStart;
    if (open.type == 'open') {
        cursor.forwardList();
        const close = cursor.getToken();
        const end = cursor.offsetStart;
        if (close.type == 'close' && (0, janet_lexer_1.validPair)(open.raw, close.raw)) {
            return doc.model.edit([
                new model_1.ModelEdit('changeRange', [end, end + close.raw.length, '']),
                new model_1.ModelEdit('changeRange', [beginning - open.raw.length, beginning, '']),
            ], { undoStopBefore, selection: new model_1.ModelEditSelection(start - 1) });
        }
    }
}
exports.spliceSexp = spliceSexp;
async function killBackwardList(doc, [start, end]) {
    return doc.model.edit([new model_1.ModelEdit('changeRange', [start, end, '', [end, end], [start, start]])], {
        selection: new model_1.ModelEditSelection(start),
    });
}
exports.killBackwardList = killBackwardList;
async function killForwardList(doc, [start, end]) {
    const cursor = doc.getTokenCursor(start);
    const inComment = (cursor.getToken().type == 'comment' && start > cursor.offsetStart) ||
        cursor.getPrevToken().type == 'comment';
    return doc.model.edit([
        new model_1.ModelEdit('changeRange', [
            start,
            end,
            inComment ? '\n' : '',
            [start, start],
            [start, start],
        ]),
    ], { selection: new model_1.ModelEditSelection(start) });
}
exports.killForwardList = killForwardList;
async function forwardSlurpSexp(doc, start = doc.selection.active, extraOpts = { formatDepth: 1 }) {
    const cursor = doc.getTokenCursor(start);
    cursor.forwardList();
    if (cursor.getToken().type == 'close') {
        const currentCloseOffset = cursor.offsetStart;
        const close = cursor.getToken().raw;
        const wsInsideCursor = cursor.clone();
        wsInsideCursor.backwardWhitespace(false);
        const wsStartOffset = wsInsideCursor.offsetStart;
        cursor.upList();
        const wsOutSideCursor = cursor.clone();
        if (cursor.forwardSexp(true, true)) {
            wsOutSideCursor.forwardWhitespace(false);
            const wsEndOffset = wsOutSideCursor.offsetStart;
            const newCloseOffset = cursor.offsetStart;
            const replacedText = doc.model.getText(wsStartOffset, wsEndOffset);
            const changeArgs = replacedText.indexOf('\n') >= 0
                ? [currentCloseOffset, currentCloseOffset + close.length, '']
                : [wsStartOffset, wsEndOffset, ' '];
            return doc.model.edit([
                new model_1.ModelEdit('insertString', [newCloseOffset, close]),
                new model_1.ModelEdit('changeRange', changeArgs),
            ], {
                ...{
                    undoStopBefore: true,
                },
                ...extraOpts,
            });
        }
        else {
            const formatDepth = extraOpts['formatDepth'] ? extraOpts['formatDepth'] : 1;
            return forwardSlurpSexp(doc, cursor.offsetStart, {
                formatDepth: formatDepth + 1,
            });
        }
    }
}
exports.forwardSlurpSexp = forwardSlurpSexp;
async function backwardSlurpSexp(doc, start = doc.selection.active, extraOpts = {}) {
    const cursor = doc.getTokenCursor(start);
    cursor.backwardList();
    const tk = cursor.getPrevToken();
    if (tk.type == 'open') {
        const offset = cursor.clone().previous().offsetStart;
        const open = cursor.getPrevToken().raw;
        cursor.previous();
        cursor.backwardSexp(true, true);
        cursor.forwardWhitespace(false);
        if (offset !== cursor.offsetStart) {
            return doc.model.edit([
                new model_1.ModelEdit('deleteRange', [offset, tk.raw.length]),
                new model_1.ModelEdit('changeRange', [cursor.offsetStart, cursor.offsetStart, open]),
            ], {
                ...{
                    undoStopBefore: true,
                },
                ...extraOpts,
            });
        }
        else {
            const formatDepth = extraOpts['formatDepth'] ? extraOpts['formatDepth'] : 1;
            return backwardSlurpSexp(doc, cursor.offsetStart, {
                formatDepth: formatDepth + 1,
            });
        }
    }
}
exports.backwardSlurpSexp = backwardSlurpSexp;
async function forwardBarfSexp(doc, start = doc.selection.active) {
    const cursor = doc.getTokenCursor(start);
    cursor.forwardList();
    if (cursor.getToken().type == 'close') {
        const offset = cursor.offsetStart, close = cursor.getToken().raw;
        cursor.backwardSexp(true, true);
        cursor.backwardWhitespace();
        return doc.model.edit([
            new model_1.ModelEdit('deleteRange', [offset, close.length]),
            new model_1.ModelEdit('insertString', [cursor.offsetStart, close]),
        ], start >= cursor.offsetStart
            ? {
                selection: new model_1.ModelEditSelection(cursor.offsetStart),
                formatDepth: 2,
            }
            : { formatDepth: 2 });
    }
}
exports.forwardBarfSexp = forwardBarfSexp;
async function backwardBarfSexp(doc, start = doc.selection.active) {
    const cursor = doc.getTokenCursor(start);
    cursor.backwardList();
    const tk = cursor.getPrevToken();
    if (tk.type == 'open') {
        cursor.previous();
        const offset = cursor.offsetStart;
        const close = cursor.getToken().raw;
        cursor.next();
        cursor.forwardSexp(true, true);
        cursor.forwardWhitespace(false);
        return doc.model.edit([
            new model_1.ModelEdit('changeRange', [cursor.offsetStart, cursor.offsetStart, close]),
            new model_1.ModelEdit('deleteRange', [offset, tk.raw.length]),
        ], start <= cursor.offsetStart
            ? {
                selection: new model_1.ModelEditSelection(cursor.offsetStart),
                formatDepth: 2,
            }
            : { formatDepth: 2 });
    }
}
exports.backwardBarfSexp = backwardBarfSexp;
function open(doc, open, close, start = doc.selection.active) {
    const [cs, ce] = [doc.selection.anchor, doc.selection.active];
    doc.insertString(open + doc.getSelectionText() + close);
    if (cs != ce) {
        doc.selection = new model_1.ModelEditSelection(cs + open.length, ce + open.length);
    }
    else {
        doc.selection = new model_1.ModelEditSelection(start + open.length);
    }
}
exports.open = open;
function docIsBalanced(doc, start = doc.selection.active) {
    const cursor = doc.getTokenCursor(0);
    while (cursor.forwardSexp(true, true, true)) {
        // move forward until the cursor cannot move forward anymore
    }
    cursor.forwardWhitespace(true);
    return cursor.atEnd();
}
async function close(doc, close, start = doc.selection.active) {
    console.log("cursor-doc/paredit.ts/close triggered");
    const cursor = doc.getTokenCursor(start);
    const inString = cursor.withinString();
    cursor.forwardWhitespace(false);
    if (cursor.getToken().raw === close) {
        doc.selection = new model_1.ModelEditSelection(cursor.offsetEnd);
    }
    else {
        if (!inString && docIsBalanced(doc)) {
            // Do nothing when there is balance
        }
        else {
            return doc.model.edit([new model_1.ModelEdit('insertString', [start, close])], {
                selection: new model_1.ModelEditSelection(start + close.length),
            });
        }
    }
}
exports.close = close;
function onlyWhitespaceLeftOfCursor(doc, cursor) {
    const token = cursor.getToken();
    if (token.type === 'ws') {
        return token.offset === 0;
    }
    else if (doc.selection.anchor > cursor.offsetStart) {
        return false;
    }
    const prevToken = cursor.getPrevToken();
    return prevToken.type === 'ws' && prevToken.offset === 0;
}
function backspaceOnWhitespaceEdit(doc, cursor) {
    const origIndent = (0, indent_1.getIndent)(doc.model, cursor.offsetStart);
    const onCloseToken = cursor.getToken().type === 'close';
    let start = doc.selection.anchor;
    let token = cursor.getToken();
    if (token.type === 'ws') {
        start = cursor.offsetEnd;
    }
    cursor.previous();
    const prevToken = cursor.getToken();
    if (prevToken.type === 'ws' && start === cursor.offsetEnd) {
        token = prevToken;
    }
    let end = start;
    if (token.type === 'ws') {
        end = cursor.offsetStart;
        cursor.previous();
        if (cursor.getToken().type === 'eol') {
            end = cursor.offsetStart;
            cursor.previous();
            if (cursor.getToken().type === 'ws') {
                end = cursor.offsetStart;
                cursor.previous();
            }
        }
    }
    const destTokenType = cursor.getToken().type;
    let indent = destTokenType === 'eol' ? origIndent : 1;
    if (destTokenType === 'open' || onCloseToken) {
        indent = 0;
    }
    const changeArgs = [start, end, ' '.repeat(indent)];
    return doc.model.edit([new model_1.ModelEdit('changeRange', changeArgs)], {
        selection: new model_1.ModelEditSelection(end + indent),
        skipFormat: true,
    });
}
async function backspace(doc, start = doc.selection.anchor, end = doc.selection.active) {
    if (start != end) {
        return doc.backspace();
    }
    else {
        const cursor = doc.getTokenCursor(start);
        const nextToken = cursor.getToken();
        const p = start;
        const prevToken = p > cursor.offsetStart && !['open', 'close'].includes(nextToken.type)
            ? nextToken
            : cursor.getPrevToken();
        if (prevToken.type == 'prompt') {
            return new Promise((resolve) => resolve(true));
        }
        else if (nextToken.type == 'prompt') {
            return new Promise((resolve) => resolve(true));
        }
        else if (doc.model.getText(p - 2, p, true) == '\\"') {
            return doc.model.edit([new model_1.ModelEdit('deleteRange', [p - 2, 2])], {
                selection: new model_1.ModelEditSelection(p - 2),
            });
        }
        else if (prevToken.type === 'open' && nextToken.type === 'close') {
            return doc.model.edit([new model_1.ModelEdit('deleteRange', [p - prevToken.raw.length, prevToken.raw.length + 1])], {
                selection: new model_1.ModelEditSelection(p - prevToken.raw.length),
            });
        }
        else if (!cursor.withinString() && onlyWhitespaceLeftOfCursor(doc, cursor)) {
            return backspaceOnWhitespaceEdit(doc, cursor);
        }
        else {
            if (['open', 'close'].includes(prevToken.type) && docIsBalanced(doc)) {
                doc.selection = new model_1.ModelEditSelection(p - prevToken.raw.length);
                return new Promise((resolve) => resolve(true));
            }
            else {
                return doc.backspace();
            }
        }
    }
}
exports.backspace = backspace;
async function deleteForward(doc, start = doc.selection.anchor, end = doc.selection.active) {
    if (start != end) {
        await doc.delete();
    }
    else {
        const cursor = doc.getTokenCursor(start);
        const prevToken = cursor.getPrevToken();
        const nextToken = cursor.getToken();
        const p = start;
        if (doc.model.getText(p, p + 2, true) == '\\"') {
            return doc.model.edit([new model_1.ModelEdit('deleteRange', [p, 2])], {
                selection: new model_1.ModelEditSelection(p),
            });
        }
        else if (prevToken.type === 'open' && nextToken.type === 'close') {
            return doc.model.edit([new model_1.ModelEdit('deleteRange', [p - prevToken.raw.length, prevToken.raw.length + 1])], {
                selection: new model_1.ModelEditSelection(p - prevToken.raw.length),
            });
        }
        else {
            if (['open', 'close'].includes(nextToken.type) && docIsBalanced(doc)) {
                doc.selection = new model_1.ModelEditSelection(p + 1);
                return new Promise((resolve) => resolve(true));
            }
            else {
                return doc.delete();
            }
        }
    }
}
exports.deleteForward = deleteForward;
async function stringQuote(doc, start = doc.selection.anchor, end = doc.selection.active) {
    if (start != end) {
        doc.insertString('"');
    }
    else {
        const cursor = doc.getTokenCursor(start);
        if (cursor.withinString()) {
            // inside a string, let's be clever
            if (cursor.getToken().type == 'close') {
                if (doc.model.getText(0, start).endsWith('\\')) {
                    return doc.model.edit([new model_1.ModelEdit('changeRange', [start, start, '"'])], {
                        selection: new model_1.ModelEditSelection(start + 1),
                    });
                }
                else {
                    return close(doc, '"', start);
                }
            }
            else {
                if (doc.model.getText(0, start).endsWith('\\')) {
                    return doc.model.edit([new model_1.ModelEdit('changeRange', [start, start, '"'])], {
                        selection: new model_1.ModelEditSelection(start + 1),
                    });
                }
                else {
                    return doc.model.edit([new model_1.ModelEdit('changeRange', [start, start, '\\"'])], {
                        selection: new model_1.ModelEditSelection(start + 2),
                    });
                }
            }
        }
        else {
            return doc.model.edit([new model_1.ModelEdit('changeRange', [start, start, '""'])], {
                selection: new model_1.ModelEditSelection(start + 1),
            });
        }
    }
}
exports.stringQuote = stringQuote;
function growSelection(doc, start = doc.selection.anchor, end = doc.selection.active) {
    const startC = doc.getTokenCursor(start), endC = doc.getTokenCursor(end), emptySelection = startC.equals(endC);
    if (emptySelection) {
        const currentFormRange = startC.rangeForCurrentForm(start);
        if (currentFormRange) {
            growSelectionStack(doc, currentFormRange);
        }
    }
    else {
        if (startC.getPrevToken().type == 'open' && endC.getToken().type == 'close') {
            startC.backwardList();
            startC.backwardUpList();
            endC.forwardList();
            growSelectionStack(doc, [startC.offsetStart, endC.offsetEnd]);
        }
        else {
            if (startC.backwardList()) {
                // we are in an sexpr.
                endC.forwardList();
                endC.previous();
            }
            else {
                if (startC.backwardDownList()) {
                    startC.backwardList();
                    if (emptySelection) {
                        endC.set(startC);
                        endC.forwardList();
                        endC.next();
                    }
                    startC.previous();
                }
                else if (startC.downList()) {
                    if (emptySelection) {
                        endC.set(startC);
                        endC.forwardList();
                        endC.next();
                    }
                    startC.previous();
                }
            }
            growSelectionStack(doc, [startC.offsetStart, endC.offsetEnd]);
        }
    }
}
exports.growSelection = growSelection;
function growSelectionStack(doc, range) {
    const [start, end] = range;
    if (doc.selectionStack.length > 0) {
        const prev = doc.selectionStack[doc.selectionStack.length - 1];
        if (!(doc.selection.anchor == prev.anchor && doc.selection.active == prev.active)) {
            setSelectionStack(doc);
        }
        else if (prev.anchor === range[0] && prev.active === range[1]) {
            return;
        }
    }
    else {
        doc.selectionStack = [doc.selection];
    }
    doc.selection = new model_1.ModelEditSelection(start, end);
    doc.selectionStack.push(doc.selection);
}
exports.growSelectionStack = growSelectionStack;
function shrinkSelection(doc) {
    if (doc.selectionStack.length) {
        const latest = doc.selectionStack.pop();
        if (doc.selectionStack.length &&
            latest.anchor == doc.selection.anchor &&
            latest.active == doc.selection.active) {
            doc.selection = doc.selectionStack[doc.selectionStack.length - 1];
        }
    }
}
exports.shrinkSelection = shrinkSelection;
function setSelectionStack(doc, selection = doc.selection) {
    doc.selectionStack = [selection];
}
exports.setSelectionStack = setSelectionStack;
async function raiseSexp(doc, start = doc.selection.anchor, end = doc.selection.active) {
    const cursor = doc.getTokenCursor(end);
    const [formStart, formEnd] = cursor.rangeForCurrentForm(start);
    const isCaretTrailing = formEnd - start < start - formStart;
    const startCursor = doc.getTokenCursor(formStart);
    const endCursor = startCursor.clone();
    if (endCursor.forwardSexp()) {
        const raised = doc.model.getText(startCursor.offsetStart, endCursor.offsetStart);
        startCursor.backwardList();
        endCursor.forwardList();
        if (startCursor.getPrevToken().type == 'open') {
            startCursor.previous();
            if (endCursor.getToken().type == 'close') {
                return doc.model.edit([new model_1.ModelEdit('changeRange', [startCursor.offsetStart, endCursor.offsetEnd, raised])], {
                    selection: new model_1.ModelEditSelection(isCaretTrailing ? startCursor.offsetStart + raised.length : startCursor.offsetStart),
                });
            }
        }
    }
}
exports.raiseSexp = raiseSexp;
async function convolute(doc, start = doc.selection.anchor, end = doc.selection.active) {
    if (start == end) {
        const cursorStart = doc.getTokenCursor(end);
        const cursorEnd = cursorStart.clone();
        if (cursorStart.backwardList()) {
            if (cursorEnd.forwardList()) {
                const head = doc.model.getText(cursorStart.offsetStart, end);
                if (cursorStart.getPrevToken().type == 'open') {
                    cursorStart.previous();
                    const headStart = cursorStart.clone();
                    if (headStart.backwardList() && headStart.backwardUpList()) {
                        const headEnd = cursorStart.clone();
                        if (headEnd.forwardList() && cursorEnd.getToken().type == 'close') {
                            return doc.model.edit([
                                new model_1.ModelEdit('changeRange', [headEnd.offsetEnd, headEnd.offsetEnd, ')']),
                                new model_1.ModelEdit('changeRange', [cursorEnd.offsetStart, cursorEnd.offsetEnd, '']),
                                new model_1.ModelEdit('changeRange', [cursorStart.offsetStart, end, '']),
                                new model_1.ModelEdit('changeRange', [
                                    headStart.offsetStart,
                                    headStart.offsetStart,
                                    '(' + head,
                                ]),
                            ], {});
                        }
                    }
                }
            }
        }
    }
}
exports.convolute = convolute;
async function transpose(doc, left = doc.selection.anchor, right = doc.selection.active, newPosOffset = {}) {
    const cursor = doc.getTokenCursor(right);
    cursor.backwardWhitespace();
    if (cursor.getPrevToken().type == 'open') {
        cursor.forwardSexp();
    }
    cursor.forwardWhitespace();
    if (cursor.getToken().type == 'close') {
        cursor.backwardSexp();
    }
    if (cursor.getToken().type != 'close') {
        const rightStart = cursor.offsetStart;
        if (cursor.forwardSexp()) {
            const rightEnd = cursor.offsetStart;
            cursor.backwardSexp();
            cursor.backwardWhitespace();
            const leftEnd = cursor.offsetStart;
            if (cursor.backwardSexp()) {
                const leftStart = cursor.offsetStart, leftText = doc.model.getText(leftStart, leftEnd), rightText = doc.model.getText(rightStart, rightEnd);
                let newCursorPos = leftStart + rightText.length;
                if (newPosOffset.fromLeft != undefined) {
                    newCursorPos = leftStart + newPosOffset.fromLeft;
                }
                else if (newPosOffset.fromRight != undefined) {
                    newCursorPos = rightEnd - newPosOffset.fromRight;
                }
                return doc.model.edit([
                    new model_1.ModelEdit('changeRange', [rightStart, rightEnd, leftText]),
                    new model_1.ModelEdit('changeRange', [
                        leftStart,
                        leftEnd,
                        rightText,
                        [left, left],
                        [newCursorPos, newCursorPos],
                    ]),
                ], { selection: new model_1.ModelEditSelection(newCursorPos) });
            }
        }
    }
}
exports.transpose = transpose;
exports.bindingForms = [
    'let',
    'for',
    'loop',
    'binding',
    'with-local-vars',
    'doseq',
    'with-redefs',
    'when-let',
];
function isInPairsList(cursor, pairForms) {
    const probeCursor = cursor.clone();
    if (probeCursor.backwardList()) {
        const opening = probeCursor.getPrevToken().raw;
        if (opening.endsWith('{') && !opening.endsWith('#{')) {
            return true;
        }
        if (opening.endsWith('[')) {
            probeCursor.backwardUpList();
            probeCursor.backwardList();
            if (probeCursor.getPrevToken().raw.endsWith('{')) {
                return false;
            }
            const fn = probeCursor.getFunctionName();
            if (fn && pairForms.includes(fn)) {
                return true;
            }
        }
        return false;
    }
    return false;
}
/**
 * Returns the range of the current form
 * or the current form pair, if usePairs is true
 */
function currentSexpsRange(doc, cursor, offset, usePairs = false) {
    const currentSingleRange = cursor.rangeForCurrentForm(offset);
    if (usePairs) {
        const ranges = cursor.rangesForSexpsInList();
        if (ranges.length > 1) {
            const indexOfCurrentSingle = ranges.findIndex((r) => r[0] === currentSingleRange[0] && r[1] === currentSingleRange[1]);
            if (indexOfCurrentSingle % 2 == 0) {
                const pairCursor = doc.getTokenCursor(currentSingleRange[1]);
                pairCursor.forwardSexp();
                return [currentSingleRange[0], pairCursor.offsetStart];
            }
            else {
                const pairCursor = doc.getTokenCursor(currentSingleRange[0]);
                pairCursor.backwardSexp();
                return [pairCursor.offsetStart, currentSingleRange[1]];
            }
        }
    }
    return currentSingleRange;
}
async function dragSexprBackward(doc, pairForms = exports.bindingForms, left = doc.selection.anchor, right = doc.selection.active) {
    const cursor = doc.getTokenCursor(right);
    const usePairs = isInPairsList(cursor, pairForms);
    const currentRange = currentSexpsRange(doc, cursor, right, usePairs);
    const newPosOffset = right - currentRange[0];
    const backCursor = doc.getTokenCursor(currentRange[0]);
    backCursor.backwardSexp();
    const backRange = currentSexpsRange(doc, backCursor, backCursor.offsetStart, usePairs);
    if (backRange[0] !== currentRange[0]) {
        // there is a sexp to the left
        const leftText = doc.model.getText(backRange[0], backRange[1]);
        const currentText = doc.model.getText(currentRange[0], currentRange[1]);
        return doc.model.edit([
            new model_1.ModelEdit('changeRange', [currentRange[0], currentRange[1], leftText]),
            new model_1.ModelEdit('changeRange', [backRange[0], backRange[1], currentText]),
        ], { selection: new model_1.ModelEditSelection(backRange[0] + newPosOffset) });
    }
}
exports.dragSexprBackward = dragSexprBackward;
async function dragSexprForward(doc, pairForms = exports.bindingForms, left = doc.selection.anchor, right = doc.selection.active) {
    const cursor = doc.getTokenCursor(right);
    const usePairs = isInPairsList(cursor, pairForms);
    const currentRange = currentSexpsRange(doc, cursor, right, usePairs);
    const newPosOffset = currentRange[1] - right;
    const forwardCursor = doc.getTokenCursor(currentRange[1]);
    forwardCursor.forwardSexp();
    const forwardRange = currentSexpsRange(doc, forwardCursor, forwardCursor.offsetStart, usePairs);
    if (forwardRange[0] !== currentRange[0]) {
        // there is a sexp to the right
        const rightText = doc.model.getText(forwardRange[0], forwardRange[1]);
        const currentText = doc.model.getText(currentRange[0], currentRange[1]);
        return doc.model.edit([
            new model_1.ModelEdit('changeRange', [forwardRange[0], forwardRange[1], currentText]),
            new model_1.ModelEdit('changeRange', [currentRange[0], currentRange[1], rightText]),
        ], {
            selection: new model_1.ModelEditSelection(currentRange[1] + (forwardRange[1] - currentRange[1]) - newPosOffset),
        });
    }
}
exports.dragSexprForward = dragSexprForward;
/**
 * Collect and return information about the current form regarding its surrounding whitespace
 * @param doc
 * @param p the position in `doc` from where to determine the current form
 */
function collectWhitespaceInfo(doc, p = doc.selection.active) {
    const cursor = doc.getTokenCursor(p);
    const currentRange = cursor.rangeForCurrentForm(p);
    const leftWsRight = currentRange[0];
    const leftWsCursor = doc.getTokenCursor(leftWsRight);
    const rightWsLeft = currentRange[1];
    const rightWsCursor = doc.getTokenCursor(rightWsLeft);
    leftWsCursor.backwardWhitespace(false);
    rightWsCursor.forwardWhitespace(false);
    const leftWsLeft = leftWsCursor.offsetStart;
    const leftWs = doc.model.getText(leftWsLeft, leftWsRight);
    const leftWsHasNewline = leftWs.indexOf('\n') !== -1;
    const rightWsRight = rightWsCursor.offsetStart;
    const rightWs = doc.model.getText(rightWsLeft, rightWsRight);
    const rightWsHasNewline = rightWs.indexOf('\n') !== -1;
    return {
        hasLeftWs: leftWs !== '',
        leftWsRange: [leftWsLeft, leftWsRight],
        leftWs,
        leftWsHasNewline,
        hasRightWs: rightWs !== '',
        rightWsRange: [rightWsLeft, rightWsRight],
        rightWs,
        rightWsHasNewline,
    };
}
exports.collectWhitespaceInfo = collectWhitespaceInfo;
async function dragSexprBackwardUp(doc, p = doc.selection.active) {
    const wsInfo = collectWhitespaceInfo(doc, p);
    const cursor = doc.getTokenCursor(p);
    const currentRange = cursor.rangeForCurrentForm(p);
    if (cursor.backwardList() && cursor.backwardUpList()) {
        const listStart = cursor.offsetStart;
        const newPosOffset = p - currentRange[0];
        const newCursorPos = listStart + newPosOffset;
        const listIndent = cursor.getToken().offset;
        let dragText, deleteEdit;
        if (wsInfo.hasLeftWs) {
            dragText =
                doc.model.getText(...currentRange) +
                    (wsInfo.leftWsHasNewline ? '\n' + ' '.repeat(listIndent) : ' ');
            const lineCommentCursor = doc.getTokenCursor(wsInfo.leftWsRange[0]);
            const havePrecedingLineComment = lineCommentCursor.getPrevToken().type === 'comment';
            const wsLeftStart = wsInfo.leftWsRange[0] + (havePrecedingLineComment ? 1 : 0);
            deleteEdit = new model_1.ModelEdit('deleteRange', [wsLeftStart, currentRange[1] - wsLeftStart]);
        }
        else {
            dragText =
                doc.model.getText(...currentRange) +
                    (wsInfo.rightWsHasNewline ? '\n' + ' '.repeat(listIndent) : ' ');
            deleteEdit = new model_1.ModelEdit('deleteRange', [
                currentRange[0],
                wsInfo.rightWsRange[1] - currentRange[0],
            ]);
        }
        return doc.model.edit([
            deleteEdit,
            new model_1.ModelEdit('insertString', [listStart, dragText, [p, p], [newCursorPos, newCursorPos]]),
        ], {
            selection: new model_1.ModelEditSelection(newCursorPos),
            skipFormat: false,
            undoStopBefore: true,
        });
    }
}
exports.dragSexprBackwardUp = dragSexprBackwardUp;
async function dragSexprForwardDown(doc, p = doc.selection.active) {
    const wsInfo = collectWhitespaceInfo(doc, p);
    const currentRange = doc.getTokenCursor(p).rangeForCurrentForm(p);
    const newPosOffset = p - currentRange[0];
    const cursor = doc.getTokenCursor(currentRange[0]);
    while (cursor.forwardSexp()) {
        cursor.forwardWhitespace();
        const token = cursor.getToken();
        if (token.type === 'open') {
            const listStart = cursor.offsetStart;
            const deleteLength = wsInfo.rightWsRange[1] - currentRange[0];
            const insertStart = listStart + token.raw.length;
            const newCursorPos = insertStart - deleteLength + newPosOffset;
            const insertText = doc.model.getText(...currentRange) + (wsInfo.rightWsHasNewline ? '\n' : ' ');
            return doc.model.edit([
                new model_1.ModelEdit('insertString', [
                    insertStart,
                    insertText,
                    [p, p],
                    [newCursorPos, newCursorPos],
                ]),
                new model_1.ModelEdit('deleteRange', [currentRange[0], deleteLength]),
            ], {
                selection: new model_1.ModelEditSelection(newCursorPos),
                skipFormat: false,
                undoStopBefore: true,
            });
        }
    }
}
exports.dragSexprForwardDown = dragSexprForwardDown;
async function dragSexprForwardUp(doc, p = doc.selection.active) {
    const wsInfo = collectWhitespaceInfo(doc, p);
    const cursor = doc.getTokenCursor(p);
    const currentRange = cursor.rangeForCurrentForm(p);
    if (cursor.forwardList() && cursor.upList()) {
        const listEnd = cursor.offsetStart;
        const newPosOffset = p - currentRange[0];
        const listWsInfo = collectWhitespaceInfo(doc, listEnd);
        const dragText = (listWsInfo.rightWsHasNewline ? '\n' : ' ') + doc.model.getText(...currentRange);
        let deleteStart = wsInfo.leftWsRange[0];
        let deleteLength = currentRange[1] - deleteStart;
        if (wsInfo.hasRightWs) {
            deleteStart = currentRange[0];
            deleteLength = wsInfo.rightWsRange[1] - deleteStart;
        }
        const newCursorPos = listEnd + newPosOffset + 1 - deleteLength;
        return doc.model.edit([
            new model_1.ModelEdit('insertString', [listEnd, dragText, [p, p], [newCursorPos, newCursorPos]]),
            new model_1.ModelEdit('deleteRange', [deleteStart, deleteLength]),
        ], {
            selection: new model_1.ModelEditSelection(newCursorPos),
            skipFormat: false,
            undoStopBefore: true,
        });
    }
}
exports.dragSexprForwardUp = dragSexprForwardUp;
async function dragSexprBackwardDown(doc, p = doc.selection.active) {
    const wsInfo = collectWhitespaceInfo(doc, p);
    const currentRange = doc.getTokenCursor(p).rangeForCurrentForm(p);
    const newPosOffset = p - currentRange[0];
    const cursor = doc.getTokenCursor(currentRange[1]);
    while (cursor.backwardSexp()) {
        cursor.backwardWhitespace();
        const token = cursor.getPrevToken();
        if (token.type === 'close') {
            cursor.previous();
            const listEnd = cursor.offsetStart;
            cursor.backwardWhitespace();
            const siblingWsInfo = collectWhitespaceInfo(doc, cursor.offsetStart);
            const deleteLength = currentRange[1] - wsInfo.leftWsRange[0];
            const insertStart = listEnd;
            const newCursorPos = insertStart + newPosOffset + 1;
            let insertText = doc.model.getText(...currentRange);
            insertText = (siblingWsInfo.leftWsHasNewline ? '\n' : ' ') + insertText;
            return doc.model.edit([
                new model_1.ModelEdit('deleteRange', [wsInfo.leftWsRange[0], deleteLength]),
                new model_1.ModelEdit('insertString', [
                    insertStart,
                    insertText,
                    [p, p],
                    [newCursorPos, newCursorPos],
                ]),
            ], {
                selection: new model_1.ModelEditSelection(newCursorPos),
                skipFormat: false,
                undoStopBefore: true,
            });
            break;
        }
    }
}
exports.dragSexprBackwardDown = dragSexprBackwardDown;
function adaptContentsToRichComment(contents) {
    return contents
        .split(/\n/)
        .map((line) => `  ${line}`)
        .join('\n')
        .trim();
}
async function addRichComment(doc, p = doc.selection.active, contents) {
    const richComment = `(comment\n  ${contents ? adaptContentsToRichComment(contents) : ''}\n  )`;
    let cursor = doc.getTokenCursor(p);
    const topLevelRange = rangeForDefun(doc, p, false);
    const isInsideForm = !(p <= topLevelRange[0] || p >= topLevelRange[1]);
    const checkIfAtStartCursor = doc.getTokenCursor(p);
    checkIfAtStartCursor.backwardWhitespace(true);
    const isAtStart = checkIfAtStartCursor.atStart();
    if (isInsideForm || isAtStart) {
        cursor = doc.getTokenCursor(topLevelRange[1]);
    }
    const inLineComment = cursor.getPrevToken().type === 'comment' || cursor.getToken().type === 'comment';
    if (inLineComment) {
        cursor.forwardWhitespace(true);
        cursor.backwardWhitespace(false);
    }
    const insertStart = cursor.offsetStart;
    const insideNextTopLevelFormPos = rangeToForwardDownList(doc, insertStart)[1];
    if (!contents && insideNextTopLevelFormPos !== insertStart) {
        const checkIfRichCommentExistsCursor = doc.getTokenCursor(insideNextTopLevelFormPos);
        checkIfRichCommentExistsCursor.forwardWhitespace(true);
        if (checkIfRichCommentExistsCursor.getToken().raw == 'comment') {
            checkIfRichCommentExistsCursor.forwardSexp();
            checkIfRichCommentExistsCursor.forwardWhitespace(false);
            // insert nothing, just place cursor
            const newCursorPos = checkIfRichCommentExistsCursor.offsetStart;
            return doc.model.edit([
                new model_1.ModelEdit('insertString', [
                    newCursorPos,
                    '',
                    [newCursorPos, newCursorPos],
                    [newCursorPos, newCursorPos],
                ]),
            ], {
                selection: new model_1.ModelEditSelection(newCursorPos),
                skipFormat: true,
                undoStopBefore: false,
            });
        }
    }
    cursor.backwardWhitespace(false);
    const leftWs = doc.model.getText(cursor.offsetStart, insertStart);
    cursor.forwardWhitespace(false);
    const rightWs = doc.model.getText(insertStart, cursor.offsetStart);
    const numPrependNls = leftWs.match('\n\n') ? 0 : leftWs.match('\n') ? 1 : 2;
    const numAppendNls = rightWs.match('\n\n') ? 0 : rightWs.match('^\n') ? 1 : 2;
    const prepend = '\n'.repeat(numPrependNls);
    const append = '\n'.repeat(numAppendNls);
    const insertText = `${prepend}${richComment}${append}`;
    const newCursorPos = insertStart + 11 + numPrependNls * doc.model.lineEndingLength;
    return doc.model.edit([
        new model_1.ModelEdit('insertString', [
            insertStart,
            insertText,
            [insertStart, insertStart],
            [newCursorPos, newCursorPos],
        ]),
    ], {
        selection: new model_1.ModelEditSelection(newCursorPos),
        skipFormat: false,
        undoStopBefore: true,
    });
}
exports.addRichComment = addRichComment;
//# sourceMappingURL=paredit.js.map