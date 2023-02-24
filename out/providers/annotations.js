"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const _ = require("lodash");
const util = require("../utilities");
var AnnotationStatus;
(function (AnnotationStatus) {
    AnnotationStatus[AnnotationStatus["PENDING"] = 0] = "PENDING";
    AnnotationStatus[AnnotationStatus["SUCCESS"] = 1] = "SUCCESS";
    AnnotationStatus[AnnotationStatus["ERROR"] = 2] = "ERROR";
    AnnotationStatus[AnnotationStatus["REPL_WINDOW"] = 3] = "REPL_WINDOW";
})(AnnotationStatus || (AnnotationStatus = {}));
const selectionBackgrounds = [
    'rgba(197, 197, 197, 0.07)',
    'rgba(63, 255, 63, 0.05)',
    'rgba(255, 63, 63, 0.06)',
    'rgba(63, 63, 255, 0.1)',
];
const selectionRulerColors = ['gray', 'green', 'red', 'blue'];
const evalResultsDecorationType = vscode.window.createTextEditorDecorationType({
    after: {
        textDecoration: 'none',
        fontWeight: 'normal',
        fontStyle: 'normal',
    },
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
});
let resultsLocations = [];
function getResultsLocation(pos) {
    for (const [range, _evaluatePosition, location] of resultsLocations) {
        if (range.contains(pos)) {
            return location;
        }
    }
}
function getEvaluationPosition(pos) {
    for (const [range, evaluatePosition, _location] of resultsLocations) {
        if (range.contains(pos)) {
            return evaluatePosition;
        }
    }
}
function evaluated(contentText, hoverText, hasError) {
    return {
        renderOptions: {
            after: {
                contentText: contentText.replace(/ /g, '\u00a0'),
                overflow: 'hidden',
            },
            light: {
                after: {
                    color: hasError ? 'rgb(255, 127, 127)' : 'black',
                },
            },
            dark: {
                after: {
                    color: hasError ? 'rgb(255, 175, 175)' : 'white',
                },
            },
        },
    };
}
function createEvalSelectionDecorationType(status) {
    return vscode.window.createTextEditorDecorationType({
        backgroundColor: selectionBackgrounds[status],
        overviewRulerColor: selectionRulerColors[status],
        overviewRulerLane: vscode.OverviewRulerLane.Right,
        rangeBehavior: vscode.DecorationRangeBehavior.OpenOpen,
    });
}
const evalSelectionDecorationTypes = [
    createEvalSelectionDecorationType(AnnotationStatus.PENDING),
    createEvalSelectionDecorationType(AnnotationStatus.SUCCESS),
    createEvalSelectionDecorationType(AnnotationStatus.ERROR),
    createEvalSelectionDecorationType(AnnotationStatus.REPL_WINDOW),
];
function setResultDecorations(editor, ranges) {
    const key = editor.document.uri + ':resultDecorationRanges';
    util.cljsLib.setStateValue(key, ranges);
    editor.setDecorations(evalResultsDecorationType, ranges);
}
function setSelectionDecorations(editor, ranges, status) {
    const key = editor.document.uri + ':selectionDecorationRanges:' + status;
    util.cljsLib.setStateValue(key, ranges);
    editor.setDecorations(evalSelectionDecorationTypes[status], ranges);
}
function clearEvaluationDecorations(editor) {
    editor = editor || util.tryToGetActiveTextEditor();
    if (editor) {
        util.cljsLib.removeStateValue(editor.document.uri + ':resultDecorationRanges');
        setResultDecorations(editor, []);
        for (const status of [
            AnnotationStatus.PENDING,
            AnnotationStatus.SUCCESS,
            AnnotationStatus.ERROR,
            AnnotationStatus.REPL_WINDOW,
        ]) {
            util.cljsLib.removeStateValue(editor.document.uri + ':selectionDecorationRanges:' + status);
            setSelectionDecorations(editor, [], status);
        }
    }
    resultsLocations = [];
}
function clearAllEvaluationDecorations() {
    vscode.window.visibleTextEditors.forEach((editor) => {
        clearEvaluationDecorations(editor);
    });
}
function decorateResults(resultString, hasError, codeSelection, editor) {
    const uri = editor.document.uri;
    const key = uri + ':resultDecorationRanges';
    let decorationRanges = util.cljsLib.getStateValue(key) || [];
    const decoration = evaluated(` => ${resultString} `, resultString, hasError);
    decorationRanges = _.filter(decorationRanges, (o) => {
        return !o.codeRange.intersection(codeSelection);
    });
    decoration['codeRange'] = codeSelection;
    decoration['range'] = new vscode.Selection(codeSelection.end, codeSelection.end);
    decorationRanges.push(decoration);
    setResultDecorations(editor, decorationRanges);
}
function decorateSelection(resultString, codeSelection, editor, evaluatePosition, resultsLocation, status) {
    const uri = editor.document.uri;
    const key = uri + ':selectionDecorationRanges:' + status;
    const decoration = {};
    let decorationRanges = util.cljsLib.getStateValue(key) || [];
    decorationRanges = _.filter(decorationRanges, (o) => {
        return !o.range.intersection(codeSelection);
    });
    decoration['range'] = codeSelection;
    if (status != AnnotationStatus.PENDING && status != AnnotationStatus.REPL_WINDOW) {
        const copyCommandUri = `command:janet.copyAnnotationHoverText?${encodeURIComponent(JSON.stringify([{ text: resultString }]))}`, copyCommandMd = `[Copy](${copyCommandUri} "Copy results to the clipboard")`;
        const openWindowCommandUri = `command:janet.showOutputWindow`, openWindowCommandMd = `[Open Output Window](${openWindowCommandUri} "Open the output window")`;
        const hoverMessage = new vscode.MarkdownString(`${copyCommandMd} | ${openWindowCommandMd}\n` + '```clojure\n' + resultString + '\n```');
        hoverMessage.isTrusted = true;
        decoration['hoverMessage'] = status == AnnotationStatus.ERROR ? resultString : hoverMessage;
    }
    // for (let s = 0; s < evalSelectionDecorationTypes.length; s++) {
    //     setSelectionDecorations(editor, [], s);.
    // }
    setSelectionDecorations(editor, [], status);
    decorationRanges.push(decoration);
    setSelectionDecorations(editor, decorationRanges, status);
    if (status == AnnotationStatus.SUCCESS || status == AnnotationStatus.ERROR) {
        resultsLocations.push([codeSelection, evaluatePosition, resultsLocation]);
    }
}
function onDidChangeTextDocument(event) {
    if (event.contentChanges.length) {
        const activeTextEditor = util.tryToGetActiveTextEditor();
        if (activeTextEditor) {
            const activeDocument = activeTextEditor.document, changeDocument = event.document;
            if (activeDocument.uri == changeDocument.uri) {
                clearEvaluationDecorations(activeTextEditor);
            }
        }
    }
}
function copyHoverTextCommand(args) {
    void vscode.env.clipboard.writeText(args['text']);
}
exports.default = {
    AnnotationStatus,
    clearEvaluationDecorations,
    clearAllEvaluationDecorations,
    copyHoverTextCommand,
    decorateResults,
    decorateSelection,
    onDidChangeTextDocument,
    getResultsLocation,
    getEvaluationPosition,
};
//# sourceMappingURL=annotations.js.map