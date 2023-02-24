"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UndoManager = exports.UndoStepGroup = exports.UndoStep = void 0;
/**
 * A reversable operation to a document of type T.
 */
class UndoStep {
    /**
     * Given another UndoStep, attempts to modify this undo-step to include the subsequent one.
     * If successful, returns true, if unsuccessful, returns false, and the step must be added to the
     * UndoManager, too.
     */
    coalesce(c) {
        return false;
    }
}
exports.UndoStep = UndoStep;
class UndoStepGroup extends UndoStep {
    constructor() {
        super(...arguments);
        this.steps = [];
    }
    addUndoStep(step) {
        const prevStep = this.steps.length && this.steps[this.steps.length - 1];
        if (prevStep && !prevStep.undoStop && prevStep.coalesce(step)) {
            return;
        }
        this.steps.push(step);
    }
    undo(c) {
        for (let i = this.steps.length - 1; i >= 0; i--) {
            this.steps[i].undo(c);
        }
    }
    redo(c) {
        for (let i = 0; i < this.steps.length; i++) {
            this.steps[i].redo(c);
        }
    }
}
exports.UndoStepGroup = UndoStepGroup;
/**
 * Handles the undo/redo stacks.
 */
class UndoManager {
    constructor() {
        this.undos = [];
        this.redos = [];
    }
    /**
     * Adds the step to the undo stack, and clears the redo stack.
     * If possible, coalesces it into the previous undo.
     *
     * @param step the UndoStep to add.
     */
    addUndoStep(step) {
        if (this.groupedUndo) {
            this.groupedUndo.addUndoStep(step);
        }
        else if (this.undos.length) {
            const prevUndo = this.undos[this.undos.length - 1];
            if (prevUndo.undoStop) {
                this.undos.push(step);
            }
            else if (!prevUndo.coalesce(step)) {
                this.undos.push(step);
            }
        }
        else {
            this.undos.push(step);
        }
        this.redos = [];
    }
    withUndo(f) {
        if (!this.groupedUndo) {
            try {
                this.groupedUndo = new UndoStepGroup();
                f();
                const undo = this.groupedUndo;
                this.groupedUndo = null;
                switch (undo.steps.length) {
                    case 0:
                        break;
                    case 1:
                        this.addUndoStep(undo.steps[0]);
                        break;
                    default:
                        this.addUndoStep(undo);
                }
            }
            finally {
                this.groupedUndo = null;
            }
        }
        else {
            f();
        }
    }
    /** Prevents this undo from becoming coalesced with future undos */
    insertUndoStop() {
        if (this.undos.length) {
            this.undos[this.undos.length - 1].undoStop = true;
        }
    }
    /** Performs the top undo operation on the document (if it exists), moving it to the redo stack. */
    undo(c) {
        if (this.undos.length) {
            const step = this.undos.pop();
            step.undo(c);
            this.redos.push(step);
        }
    }
    /** Performs the top redo operation on the document (if it exists), moving it back onto the undo stack. */
    redo(c) {
        if (this.redos.length) {
            const step = this.redos.pop();
            step.redo(c);
            this.undos.push(step);
        }
    }
}
exports.UndoManager = UndoManager;
//# sourceMappingURL=undo.js.map