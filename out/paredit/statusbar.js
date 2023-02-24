'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBar = void 0;
const vscode_1 = require("vscode");
// import statusbar from '../statusbar';
const paredit = require("./extension");
const color = {
    active: 'white',
    inactive: '#b3b3b3',
};
class StatusBar {
    constructor(keymap) {
        this._toggleBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right);
        this._toggleBarItem.text = '(λ)';
        this._toggleBarItem.tooltip = '';
        this._toggleBarItem.command = 'paredit.togglemode';
        this._visible = false;
        this.keyMap = keymap;
        paredit.onPareditKeyMapChanged((keymap) => {
            this.keyMap = keymap;
        });
    }
    get keyMap() {
        return this._keyMap;
    }
    set keyMap(keymap) {
        this._keyMap = keymap;
        this.updateUIState();
    }
    updateUIState() {
        switch (this.keyMap.trim().toLowerCase()) {
            case 'original':
                this.visible = true;
                this._toggleBarItem.text = '(λ)';
                this._toggleBarItem.tooltip = 'Toggle to Strict Mode';
                this._toggleBarItem.color = undefined;
                break;
            case 'strict':
                this.visible = true;
                this._toggleBarItem.text = '[λ]';
                this._toggleBarItem.tooltip = 'Toggle to Original Mode';
                this._toggleBarItem.color = undefined;
                break;
            default:
                this.visible = true;
                this._toggleBarItem.text = 'λ';
                this._toggleBarItem.tooltip =
                    'Janet Paredit Keymap is set to none, Toggle to Strict Mode is Disabled';
                this._toggleBarItem.color = color.inactive;
        }
    }
    get visible() {
        return this._visible;
    }
    set visible(value) {
        if (value) {
            this._toggleBarItem.show();
        }
        else {
            this._toggleBarItem.hide();
        }
    }
    dispose() {
        this._toggleBarItem.dispose();
    }
}
exports.StatusBar = StatusBar;
//# sourceMappingURL=statusbar.js.map