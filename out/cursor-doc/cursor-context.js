"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineContexts = exports.isAtLineEndInclWS = exports.isAtLineStartInclWS = exports.allCursorContexts = void 0;
exports.allCursorContexts = [
    'janet:cursorInString',
    'janet:cursorInComment',
    'janet:cursorAtStartOfLine',
    'janet:cursorAtEndOfLine',
    'janet:cursorBeforeComment',
    'janet:cursorAfterComment',
];
/**
 * Returns true if documentOffset is either at the first char of the token under the cursor, or
 * in the whitespace between the token and the first preceding EOL, otherwise false
 */
function isAtLineStartInclWS(doc, offset = doc.selection.active) {
    const tokenCursor = doc.getTokenCursor(offset);
    let startOfLine = false;
    //  only at start if we're in ws, or at the 1st char of a non-ws sexp
    if (tokenCursor.getToken().type === 'ws' || tokenCursor.offsetStart >= offset) {
        while (tokenCursor.getPrevToken().type === 'ws') {
            tokenCursor.previous();
        }
        startOfLine = tokenCursor.getPrevToken().type === 'eol';
    }
    return startOfLine;
}
exports.isAtLineStartInclWS = isAtLineStartInclWS;
/**
 * Returns true if position is after the last char of the last lisp token on the line, including
 * any trailing whitespace or EOL, otherwise false
 */
function isAtLineEndInclWS(doc, offset = doc.selection.active) {
    const tokenCursor = doc.getTokenCursor(offset);
    if (tokenCursor.getToken().type === 'eol') {
        return true;
    }
    if (tokenCursor.getPrevToken().type === 'eol' && tokenCursor.getToken().type !== 'ws') {
        return false;
    }
    if (tokenCursor.getToken().type === 'ws') {
        tokenCursor.next();
        if (tokenCursor.getToken().type !== 'eol') {
            return false;
        }
        tokenCursor.previous();
    }
    tokenCursor.forwardWhitespace();
    const textFromOffset = doc.model.getText(offset, tokenCursor.offsetStart);
    if (textFromOffset.match(/^\s+/)) {
        return true;
    }
    return false;
}
exports.isAtLineEndInclWS = isAtLineEndInclWS;
function determineContexts(doc, offset = doc.selection.active) {
    const tokenCursor = doc.getTokenCursor(offset);
    const contexts = [];
    if (isAtLineStartInclWS(doc)) {
        contexts.push('janet:cursorAtStartOfLine');
    }
    else if (isAtLineEndInclWS(doc)) {
        contexts.push('janet:cursorAtEndOfLine');
    }
    if (tokenCursor.withinString()) {
        contexts.push('janet:cursorInString');
    }
    else if (tokenCursor.withinComment()) {
        contexts.push('janet:cursorInComment');
    }
    // Compound contexts
    if (contexts.includes('janet:cursorInComment')) {
        if (contexts.includes('janet:cursorAtEndOfLine')) {
            tokenCursor.forwardWhitespace(false);
            if (tokenCursor.getToken().type != 'comment') {
                contexts.push('janet:cursorAfterComment');
            }
        }
        else if (contexts.includes('janet:cursorAtStartOfLine')) {
            tokenCursor.backwardWhitespace(false);
            if (tokenCursor.getPrevToken().type != 'comment') {
                contexts.push('janet:cursorBeforeComment');
            }
        }
    }
    return contexts;
}
exports.determineContexts = determineContexts;
//# sourceMappingURL=cursor-context.js.map