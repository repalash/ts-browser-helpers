/*!
 * Fork Of -
 * JavaScript Undo Manager 1.0.0
 * Simple JavaScript undo/redo command manager supporting transactions with no dependencies.
 *
 * Copyright: Alexey Grinko, 2017
 * Git repository: https://github.com/agrinko/js-undo-manager.git
 *
 * @license MIT - https://opensource.org/licenses/MIT
 *
 * Changes -
 * 1. Added presets commands
 * 2. Port to TypeScript
 * 3. Remove transactions
 */

/////////// SOURCE CODE ///////////////

export interface JSUndoManagerOptions{
    limit: number;
    debug: boolean;
    bindHotKeys: boolean;
    hotKeyRoot?: HTMLElement;
    // useTransactions: boolean;
}
export type JSUndoManagerCommand1 = {
    redo: Function;
    undo: Function;
}
export type JSUndoManagerCommand2 = {
    type: string,
    // [key: string]: any
}
export type JSUndoManagerCommand = JSUndoManagerCommand1 | JSUndoManagerCommand2

/**
 * Main class
 * @class JSUndoManager
 */
export class JSUndoManager {
    limit: number;
    options: JSUndoManagerOptions = {
        limit: 500,             // maximum commands stack size
        debug: false,           // whether to emit execution status in console
        bindHotKeys: false,     // whether to bind "undo" and "redo" commands to "Ctrl+Z", "Ctrl+Y" & "Ctrl+Shift+Z" hot keys
        // useTransactions: true   // whether to initialize transactions manager
    }
    enabled = true;
    stack: JSUndoManagerCommand[];
    sp: number;
    // transaction: TransactionManager;
    presets: Record<string, (c: JSUndoManagerCommand2)=>JSUndoManagerCommand1> = {}

    constructor(options: JSUndoManagerOptions) {
        Object.assign(this.options, options);

        this.limit = options.limit;
        this.options = options;
        this.reset();

        // if (options.useTransactions) {
        //     this.transaction = new TransactionManager(this);
        // }
        if (options.bindHotKeys) {
            this.bindHotKeys();
        }

        this.log(`Initialized with stack limit of ${this.limit} commands`);
    }

    /**
     * Bind 'undo' and 'redo' actions to 'Ctrl/Cmd+Z', 'Ctrl+Y' & 'Ctrl/Cmd+Shift+Z' hot keys.
     * It is a basic implementation for quick testing and should be replaced with custom event handlers
     * for more flexible processing.
     * @returns {JSUndoManager}
     */
    bindHotKeys() {
        this.log("Bound 'undo' and 'redo' actions to 'Ctrl/Cmd+Z', 'Ctrl+Y' & 'Ctrl/Cmd+Shift+Z' hot keys");

        const elem = this.options.hotKeyRoot??document
        elem.addEventListener("keydown", this._keyDown);

        return this;
    }

    dispose() {
        const elem = this.options.hotKeyRoot??document
        elem.removeEventListener("keydown", this._keyDown);
        return this.reset()
    }

    private _keyDown = (e: KeyboardEvent) => {
        if(!this.enabled) return
        const ctrlKey = e.ctrlKey || e.metaKey;
        if (e.code === 'KeyZ' && ctrlKey && !e.shiftKey) {
            this.undo();
        } else if ((e.code === 'KeyZ' && ctrlKey && e.shiftKey) || (e.code === 'KeyY' && e.ctrlKey)) {
            this.redo();
        }
    }

    /**
     * Remember executed command containing "redo" and "undo" functions
     * @param {Object|Function} command - either an object with "redo" and "undo" functions
     * @returns {JSUndoManager}
     */
    record(command: JSUndoManagerCommand): this {
        if(!this.enabled) return this
        this._record(command);
        return this;
    }

    replaceLast(command: JSUndoManagerCommand) {
        const last = this.peek()
        if(!last) return

        this.log('replace', last, 'with', command)

        this.stack[this.sp] = command

        return this
    }

    /**
     * Execute function and record it with its opposite "undo" function
     * @param {Object|Function} command - either an object with "redo" and "undo" functions
     * @param {Function} [undo] - "undo" function, used if the first argument is also a function
     * @returns {JSUndoManager}
     */
    execute(command: JSUndoManagerCommand) {
        if(!this.enabled) return

        let command1 = this._rc(command);
        let doFunction = command1.redo;

        this.record.apply(this, command1);

        this.log("Executing function...");
        doFunction.apply(command);

        return this;
    }

    _rc(command: JSUndoManagerCommand1 | JSUndoManagerCommand2) {
        if ((command as JSUndoManagerCommand2).type) {
            const p = this.presets[(command as JSUndoManagerCommand2).type]
            if (typeof p === 'function') {
                return p((command as JSUndoManagerCommand2))
            } else {
                console.error(command, p, this.presets)
                throw new Error(`Preset command not found`)
            }
        } else
            return command as JSUndoManagerCommand1
    }

    _record(command: JSUndoManagerCommand) {
        if(!this.enabled) return
        // if (this.transaction.isInProgress())
        //     return this.transaction._record(command);

        this.log("Recording command", command);

        this._rebase();

        this.stack.push(command);
        this.sp++;

        this._keepLimit();
    }

    //forget "future" commands if stack pointer is not at the end
    _rebase() {
        if (this.canRedo())
            this.stack.length = this.sp + 1;
    }

    //sustain limited size of stack; cut extra commands starting with the latest ones
    _keepLimit() {
        if (this.stack.length <= this.limit)
            return;

        let exceedsBy = this.stack.length - this.limit;

        this.log("Stack size reached its limit: ${this.limit} commands. Cutting off most old commands...");

        if (exceedsBy === 1)
            this.stack.shift(); //this is the most common case, so using "shift" will increase performance a bit
        else
            this.stack.splice(0, exceedsBy);

        this.sp -= exceedsBy; //normalize stack pointer for the new stack length
    }

    /**
     * Undo previous command if possible
     * @returns {JSUndoManager}
     */
    undo() {
        if (!this.canUndo())
            return this;

        let command = this.stack[this.sp];

        this.log("undo");

        this.sp--;

        this._rc(command).undo();

        return this;
    }

    /**
     * Check whether undoing previous command is possible
     * @returns {boolean}
     */
    canUndo() {
        return this.sp >= 0 && this.enabled;
    }

    /**
     * Get the last command that was done
     */
    peek() {
        return this.canUndo() ? this.stack[this.sp] : null
    }

    /**
     * Redo the command which was previously undone
     * @returns {JSUndoManager}
     */
    redo() {
        if (!this.canRedo())
            return this;

        let command = this.stack[this.sp + 1]; //execute next command after stack pointer

        this.log("redo");

        this.sp++;

        this._rc(command).redo();

        return this;
    }

    /**
     * Check whether redoing command is possible
     * @returns {boolean}
     */
    canRedo() {
        return this.sp < this.stack.length - 1 && this.enabled; //if stack pointer is not at the end
    }

    /**
     * Gets the last command that was undone
     */
    peekForward() {
        return this.canRedo() ? this.stack[this.sp + 1] : null
    }

    /**
     * Change stack size limit initially defined in the constructor options
     * @param {number} limit
     */
    setLimit(limit: number) {
        let redoable = this.stack.length - this.sp - 1;

        if (limit < 1 || !(typeof limit === "number"))
            throw new TypeError(`JSUndoManager.setLimit(): unexpected argument limit=${limit}. Should be a positive number`);

        if (limit < redoable) {
            console.warn(`JSUndoManager.setLimit(): cannot set stack limit (${limit}) less than the number of 'redoable' commands (${redoable})`);
        } else {
            this.limit = Math.floor(limit);
            this._keepLimit();
        }

        return this;
    }

    /**
     * Reset all commands from memory
     */
    reset() {
        this.log("reset");
        this.stack = [];
        this.sp = -1;
        return this;
    }

    /**
     * Check whether the commands stack is empty
     * @returns {boolean}
     */
    isEmpty() {
        return !this.stack.length;
    }

    /**
     * Check whether the commands stack size reaches its limit
     * @returns {boolean}
     */
    isFull() {
        return this.stack.length === this.limit;
    }

    /**
     * Get number of commands in memory stack
     * @returns {Number}
     */
    getSize() {
        return this.stack.length;
    }

    log(msg: string, ...args: any[]) {
        if (this.options.debug)
            console.log(`Command Manager: ${msg}`, ...args);
    }
}

// /**
//  * Transaction manager helper.
//  * Allows working with transactions from JSUndoManager. Requires its instance as a constructor's parameter.
//  * @class TransactionManager
//  */
// class TransactionManager {
//     static _execForward(sequence) {
//         for (let i = 0; i < sequence.length; i++)
//             sequence[i].redo();
//     }
//
//     static _execBack(sequence) {
//         for (let i = sequence.length - 1; i >= 0; i--)
//             sequence[i].undo();
//     }
//
//     constructor(tracker) {
//         this.tracker = tracker;
//         this._reset();
//
//         tracker.log("TransactionManager is initialized");
//     }
//
//     begin() {
//         this.state = TransactionManager.IN_PROGRESS;
//         this.tracker.log("Begin transaction");
//     }
//
//     end() {
//         let seq = this.sequence;
//
//         this._reset();
//
//         if (seq.length > 0) {
//             this.tracker.record({
//                 redo: TransactionManager._execForward.bind(null, seq),
//                 undo: TransactionManager._execBack.bind(null, seq)
//             });
//         }
//
//         this.tracker.log("End transaction");
//     }
//
//     cancel() {
//         TransactionManager._execBack(this.sequence);
//         this._reset();
//
//         this.tracker.log("Cancel transaction");
//     }
//
//     isInProgress() {
//         return this.state === TransactionManager.IN_PROGRESS;
//     }
//
//     isPending() {
//         return this.state === TransactionManager.PENDING;
//     }
//
//     _record(command) {
//         this.sequence.push(command);
//         this.tracker.log("Recording command in transaction...", command);
//     }
//
//     _reset() {
//         this.state = TransactionManager.PENDING;
//         this.sequence = [];
//     }
// }
//
// TransactionManager.PENDING = 0;
// TransactionManager.IN_PROGRESS = 1;
//
// /////////// SOURCE CODE END ///////////////
//
// // HELPER FUNCTIONS
// /**
//  * Emulate ES6 Object.assign behaviour if native function is not defined
//  */
// let assign = Object.assign || function (target) {
//     for (let i = 1; i < arguments.length; i++) {
//         for (let key in arguments[i]) {
//             if (arguments[i].hasOwnProperty(key)) {
//                 target[key] = arguments[i][key];
//             }
//         }
//     }
//
//     return target;
// };
