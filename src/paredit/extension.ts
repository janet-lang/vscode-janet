'use strict';
import { StatusBar } from './statusbar';
import * as vscode from 'vscode';
import {
  commands,
  window,
  Event,
  EventEmitter,
  ExtensionContext,
  workspace,
  ConfigurationChangeEvent,
} from 'vscode';
import * as paredit from '../cursor-doc/paredit';
import * as docMirror from '../doc-mirror/index';
import { EditableDocument } from '../cursor-doc/model';
// import { assertIsDefined } from '../utilities';

const onPareditKeyMapChangedEmitter = new EventEmitter<string>();

const languages = new Set(['clojure', 'lisp', 'scheme', 'janet']);
const enabled = true;

/**
 * Copies the text represented by the range from doc to the clipboard.
 * @param doc
 * @param range
 */
async function copyRangeToClipboard(doc: EditableDocument, [start, end]) {
  const text = doc.model.getText(start, end);
  await vscode.env.clipboard.writeText(text);
}

/**
 * Answers true when `calva.paredit.killAlsoCutsToClipboard` is enabled.
 * @returns boolean
 */
function shouldKillAlsoCutToClipboard() {
  return workspace.getConfiguration().get('janet.paredit.killAlsoCutsToClipboard');
}

function assertIsDefined<T>(
    value: T | undefined | null,
    message: string | (() => string)
  ): asserts value is T {
    if (value === null || value === undefined) {
      throw new Error(typeof message === 'string' ? message : message());
    }
  }

type PareditCommand = {
  command: string;
  handler: (doc: EditableDocument) => void | Promise<any>;
};
const pareditCommands: PareditCommand[] = [
  // NAVIGATING
  {
    command: 'janet.paredit.forwardSexp',
    handler: (doc: EditableDocument) => {
      paredit.moveToRangeRight(doc, paredit.forwardSexpRange(doc));
    },
  },
  {
    command: 'janet.paredit.backwardSexp',
    handler: (doc: EditableDocument) => {
      paredit.moveToRangeLeft(doc, paredit.backwardSexpRange(doc));
    },
  },
  {
    command: 'janet.paredit.forwardDownSexp',
    handler: (doc: EditableDocument) => {
      paredit.moveToRangeRight(doc, paredit.rangeToForwardDownList(doc));
    },
  },
  {
    command: 'janet.paredit.backwardDownSexp',
    handler: (doc: EditableDocument) => {
      paredit.moveToRangeLeft(doc, paredit.rangeToBackwardDownList(doc));
    },
  },
  {
    command: 'janet.paredit.forwardUpSexp',
    handler: (doc: EditableDocument) => {
      paredit.moveToRangeRight(doc, paredit.rangeToForwardUpList(doc));
    },
  },
  {
    command: 'janet.paredit.backwardUpSexp',
    handler: (doc: EditableDocument) => {
      paredit.moveToRangeLeft(doc, paredit.rangeToBackwardUpList(doc));
    },
  },
  {
    command: 'janet.paredit.forwardSexpOrUp',
    handler: (doc: EditableDocument) => {
      paredit.moveToRangeRight(doc, paredit.forwardSexpOrUpRange(doc));
    },
  },
  {
    command: 'janet.paredit.backwardSexpOrUp',
    handler: (doc: EditableDocument) => {
      paredit.moveToRangeLeft(doc, paredit.backwardSexpOrUpRange(doc));
    },
  },
  {
    command: 'janet.paredit.closeList',
    handler: (doc: EditableDocument) => {
      paredit.moveToRangeRight(doc, paredit.rangeToForwardList(doc));
    },
  },
  {
    command: 'janet.paredit.openList',
    handler: (doc: EditableDocument) => {
      paredit.moveToRangeLeft(doc, paredit.rangeToBackwardList(doc));
    },
  },

  // SELECTING
  {
    command: 'janet.paredit.rangeForDefun',
    handler: (doc: EditableDocument) => {
      paredit.selectRange(doc, paredit.rangeForDefun(doc));
    },
  },
  {
    command: 'janet.paredit.sexpRangeExpansion',
    handler: paredit.growSelection,
  }, // TODO: Inside string should first select contents
  {
    command: 'janet.paredit.sexpRangeContraction',
    handler: paredit.shrinkSelection,
  },

  {
    command: 'janet.paredit.selectForwardSexp',
    handler: paredit.selectForwardSexp,
  },
  {
    command: 'janet.paredit.selectRight',
    handler: paredit.selectRight,
  },
  {
    command: 'janet.paredit.selectBackwardSexp',
    handler: paredit.selectBackwardSexp,
  },
  {
    command: 'janet.paredit.selectForwardDownSexp',
    handler: paredit.selectForwardDownSexp,
  },
  {
    command: 'janet.paredit.selectBackwardDownSexp',
    handler: paredit.selectBackwardDownSexp,
  },
  {
    command: 'janet.paredit.selectForwardUpSexp',
    handler: paredit.selectForwardUpSexp,
  },
  {
    command: 'janet.paredit.selectForwardSexpOrUp',
    handler: paredit.selectForwardSexpOrUp,
  },
  {
    command: 'janet.paredit.selectBackwardSexpOrUp',
    handler: paredit.selectBackwardSexpOrUp,
  },
  {
    command: 'janet.paredit.selectBackwardUpSexp',
    handler: paredit.selectBackwardUpSexp,
  },
  {
    command: 'janet.paredit.selectCloseList',
    handler: paredit.selectCloseList,
  },
  {
    command: 'janet.paredit.selectOpenList',
    handler: paredit.selectOpenList,
  },

  // EDITING
  {
    command: 'janet.paredit.slurpSexpForward',
    handler: paredit.forwardSlurpSexp,
  },
  {
    command: 'janet.paredit.barfSexpForward',
    handler: paredit.forwardBarfSexp,
  },
  {
    command: 'janet.paredit.slurpSexpBackward',
    handler: paredit.backwardSlurpSexp,
  },
  {
    command: 'janet.paredit.barfSexpBackward',
    handler: paredit.backwardBarfSexp,
  },
  {
    command: 'janet.paredit.splitSexp',
    handler: paredit.splitSexp,
  },
  {
    command: 'janet.paredit.joinSexp',
    handler: paredit.joinSexp,
  },
  {
    command: 'janet.paredit.spliceSexp',
    handler: paredit.spliceSexp,
  },
  // ['paredit.transpose', ], // TODO: Not yet implemented
  {
    command: 'janet.paredit.raiseSexp',
    handler: paredit.raiseSexp,
  },
  {
    command: 'janet.paredit.transpose',
    handler: paredit.transpose,
  },
  {
    command: 'janet.paredit.dragSexprBackward',
    handler: paredit.dragSexprBackward,
  },
  {
    command: 'janet.paredit.dragSexprForward',
    handler: paredit.dragSexprForward,
  },
  {
    command: 'janet.paredit.dragSexprBackwardUp',
    handler: paredit.dragSexprBackwardUp,
  },
  {
    command: 'janet.paredit.dragSexprForwardDown',
    handler: paredit.dragSexprForwardDown,
  },
  {
    command: 'janet.paredit.dragSexprForwardUp',
    handler: paredit.dragSexprForwardUp,
  },
  {
    command: 'janet.paredit.dragSexprBackwardDown',
    handler: paredit.dragSexprBackwardDown,
  },
  {
    command: 'janet.paredit.convolute',
    handler: paredit.convolute,
  },
  {
    command: 'janet.paredit.killRight',
    handler: async (doc: EditableDocument) => {
      const range = paredit.forwardHybridSexpRange(doc);
      if (shouldKillAlsoCutToClipboard()) {
        await copyRangeToClipboard(doc, range);
      }
      return paredit.killRange(doc, range);
    },
  },
  {
    command: 'janet.paredit.killSexpForward',
    handler: async (doc: EditableDocument) => {
      const range = paredit.forwardSexpRange(doc);
      if (shouldKillAlsoCutToClipboard()) {
        await copyRangeToClipboard(doc, range);
      }
      return paredit.killRange(doc, range);
    },
  },
  {
    command: 'janet.paredit.killSexpBackward',
    handler: async (doc: EditableDocument) => {
      const range = paredit.backwardSexpRange(doc);
      if (shouldKillAlsoCutToClipboard()) {
        await copyRangeToClipboard(doc, range);
      }
      return paredit.killRange(doc, range);
    },
  },
  {
    command: 'janet.paredit.killListForward',
    handler: async (doc: EditableDocument) => {
      const range = paredit.forwardListRange(doc);
      if (shouldKillAlsoCutToClipboard()) {
        await copyRangeToClipboard(doc, range);
      }
      return await paredit.killForwardList(doc, range);
    },
  }, // TODO: Implement with killRange
  {
    command: 'janet.paredit.killListBackward',
    handler: async (doc: EditableDocument) => {
      const range = paredit.backwardListRange(doc);
      if (shouldKillAlsoCutToClipboard()) {
        await copyRangeToClipboard(doc, range);
      }
      return await paredit.killBackwardList(doc, range);
    },
  }, // TODO: Implement with killRange
  {
    command: 'janet.paredit.spliceSexpKillForward',
    handler: async (doc: EditableDocument) => {
      const range = paredit.forwardListRange(doc);
      if (shouldKillAlsoCutToClipboard()) {
        await copyRangeToClipboard(doc, range);
      }
      await paredit.killForwardList(doc, range).then((isFulfilled) => {
        return paredit.spliceSexp(doc, doc.selection.active, false);
      });
    },
  },
  {
    command: 'janet.paredit.spliceSexpKillBackward',
    handler: async (doc: EditableDocument) => {
      const range = paredit.backwardListRange(doc);
      if (shouldKillAlsoCutToClipboard()) {
        await copyRangeToClipboard(doc, range);
      }
      await paredit.killBackwardList(doc, range).then((isFulfilled) => {
        return paredit.spliceSexp(doc, doc.selection.active, false);
      });
    },
  },
  {
    command: 'janet.paredit.wrapAroundParens',
    handler: (doc: EditableDocument) => {
      return paredit.wrapSexpr(doc, '(', ')');
    },
  },
  {
    command: 'janet.paredit.wrapAroundSquare',
    handler: (doc: EditableDocument) => {
      return paredit.wrapSexpr(doc, '[', ']');
    },
  },
  {
    command: 'janet.paredit.wrapAroundCurly',
    handler: (doc: EditableDocument) => {
      return paredit.wrapSexpr(doc, '{', '}');
    },
  },
  {
    command: 'janet.paredit.wrapAroundQuote',
    handler: (doc: EditableDocument) => {
      return paredit.wrapSexpr(doc, '"', '"');
    },
  },
  {
    command: 'janet.paredit.rewrapParens',
    handler: (doc: EditableDocument) => {
      return paredit.rewrapSexpr(doc, '(', ')');
    },
  },
  {
    command: 'janet.paredit.rewrapSquare',
    handler: (doc: EditableDocument) => {
      return paredit.rewrapSexpr(doc, '[', ']');
    },
  },
  {
    command: 'janet.paredit.rewrapCurly',
    handler: (doc: EditableDocument) => {
      return paredit.rewrapSexpr(doc, '{', '}');
    },
  },
  {
    command: 'janet.paredit.rewrapQuote',
    handler: (doc: EditableDocument) => {
      return paredit.rewrapSexpr(doc, '"', '"');
    },
  },
  {
    command: 'janet.paredit.deleteForward',
    handler: async (doc: EditableDocument) => {
      await paredit.deleteForward(doc);
    },
  },
  {
    command: 'janet.paredit.deleteBackward',
    handler: async (doc: EditableDocument) => {
      await paredit.backspace(doc);
    },
  },
  {
    command: 'janet.paredit.forceDeleteForward',
    handler: () => {
      return vscode.commands.executeCommand('deleteRight');
    },
  },
  {
    command: 'janet.paredit.forceDeleteBackward',
    handler: () => {
      return vscode.commands.executeCommand('deleteLeft');
    },
  },
  {
    command: 'janet.paredit.addRichComment',
    handler: async (doc: EditableDocument) => {
      await paredit.addRichComment(doc);
    },
  },
];

function wrapPareditCommand(command: PareditCommand) {
  return async () => {
    try {
      const textEditor = window.activeTextEditor;

      assertIsDefined(textEditor, 'Expected window to have an activeTextEditor!');

      const mDoc: EditableDocument = docMirror.getDocument(textEditor.document);
      if (!enabled || !languages.has(textEditor.document.languageId)) {
        return;
      }
      return command.handler(mDoc);
    } catch (e) {
      console.error(e.message);
    }
  };
}

export function getKeyMapConf(): string {
  const keyMap = workspace.getConfiguration().get('janet.paredit.defaultKeyMap');
  return String(keyMap);
}

function setKeyMapConf() {
  const keyMap = workspace.getConfiguration().get('janet.paredit.defaultKeyMap');
  void commands.executeCommand('setContext', 'paredit:keyMap', keyMap);
  onPareditKeyMapChangedEmitter.fire(String(keyMap));
}
setKeyMapConf();

export function activate(context: ExtensionContext) {
  const statusBar = new StatusBar(getKeyMapConf());

  context.subscriptions.push(
    statusBar,
    commands.registerCommand('paredit.togglemode', () => {
      let keyMap = workspace.getConfiguration().get('janet.paredit.defaultKeyMap');
      keyMap = String(keyMap).trim().toLowerCase();
      if (keyMap == 'original') {
        void workspace
          .getConfiguration()
          .update('janet.paredit.defaultKeyMap', 'strict', vscode.ConfigurationTarget.Global);
      } else if (keyMap == 'strict') {
        void workspace
          .getConfiguration()
          .update('janet.paredit.defaultKeyMap', 'original', vscode.ConfigurationTarget.Global);
      }
    }),
    window.onDidChangeActiveTextEditor(
      (e) => e && e.document && languages.has(e.document.languageId)
    ),
    workspace.onDidChangeConfiguration((e: ConfigurationChangeEvent) => {
      if (e.affectsConfiguration('janet.paredit.defaultKeyMap')) {
        setKeyMapConf();
      }
    }),
    ...pareditCommands.map((command) =>
      commands.registerCommand(command.command, wrapPareditCommand(command))
    )
  );
}

export function deactivate() {
  // do nothing
}

export const onPareditKeyMapChanged: Event<string> = onPareditKeyMapChangedEmitter.event;
