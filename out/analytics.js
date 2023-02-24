"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const UA = require("universal-analytics");
const uuid = require("uuidv4");
const os = require("os");
const lodash_1 = require("lodash");
// var debug = require('debug');
// debug.log = console.info.bind(console);
function userAllowsTelemetry() {
    const config = vscode.workspace.getConfiguration('telemetry');
    return config.get('enableTelemetry', false);
}
class Analytics {
    constructor(context) {
        this.GA_ID = (process.env.CALVA_DEV_GA
            ? process.env.CALVA_DEV_GA
            : 'FUBAR-69796730-3').replace(/^FUBAR/, 'UA');
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.extension = vscode.extensions.getExtension('betterthantomorrow.calva');
        this.extensionVersion = this.extension.packageJSON.version;
        this.store = context.globalState;
        this.visitor = UA(this.GA_ID, this.userID());
        this.visitor.set('cd1', this.extensionVersion);
        this.visitor.set('cd2', vscode.version);
        this.visitor.set('cd3', this.extensionVersion);
        this.visitor.set('cd4', `${os.platform()}/${os.release()}`);
        this.visitor.set('cn', `calva-${this.extensionVersion}`);
        this.visitor.set('ua', `Calva/${this.extensionVersion} (${os.platform()}; ${os.release()}; ${os.type}) VSCode/${vscode.version}`);
    }
    userID() {
        const KEY = 'userLogID';
        const value = this.store.get(KEY);
        if ((0, lodash_1.isUndefined)(value)) {
            const newID = uuid.uuid();
            void this.store.update(KEY, newID);
            return newID;
        }
        else {
            return value;
        }
    }
    logPath(path) {
        if (userAllowsTelemetry()) {
            this.visitor.pageview(path);
        }
        return this;
    }
    logEvent(category, action, label, value) {
        if (userAllowsTelemetry()) {
            this.visitor.event({
                ec: category,
                ea: action,
                el: label,
                ev: value,
            });
        }
        return this;
    }
    send() {
        if (userAllowsTelemetry()) {
            this.visitor.send();
        }
    }
}
exports.default = Analytics;
//# sourceMappingURL=analytics.js.map