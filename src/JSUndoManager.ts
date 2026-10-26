/**
 * JSUndoManagerOptions interface that defines the options for the JSUndoManager class.
 *
 * @category Undo
 */
export interface JSUndoManagerOptions{
    /**
     * Maximum commands stack size.
     */
    limit: number;
    /**
     * Whether to emit execution status in console.
     */
    debug: boolean;
    /**
     * Whether to bind "undo" and "redo" commands to "Ctrl+Z", "Ctrl+Y" & "Ctrl+Shift+Z" hot keys in the DOM
     */
    bindHotKeys: boolean;
    /**
     * Root element for hot keys binding.
     */
    hotKeyRoot?: HTMLElement;
    // useTransactions: boolean;
}

/**
 * Simple command interface for JSUndoManager with explicit actions
 *
 * This is used for commands that are executed immediately and have no type field.
 *
 * @category Undo
 */
export type JSUndoManagerCommand1 = {
    redo: Function;
    undo: Function;
    /** What the step is called in an undo history, e.g. `Move`, `Extrude`. Optional. */
    label?: string;
}
/**
 * Command interface for JSUndoManager with a type field.
 *
 * This is used for commands that can be preset or predefined, allowing for easier management of commands.
 *
 * @category Undo
 */
export type JSUndoManagerCommand2 = {
    type: string,
    /** What the step is called in an undo history. Optional; a preset may also supply one. */
    label?: string,
    // [key: string]: any
}

/**
 * Combined command type for JSUndoManager that can be either a simple command or a preset command.
 *
 * @category Undo
 */
export type JSUndoManagerCommand = JSUndoManagerCommand1 | JSUndoManagerCommand2

/**
 * What changed in a {@link JSUndoManager}, passed to listeners added with
 * {@link JSUndoManager.addChangeListener}.
 *
 * @category Undo
 */
export interface JSUndoManagerChangeEvent {
    /** What happened to the stack. */
    action: 'record' | 'undo' | 'redo' | 'replace' | 'reset' | 'limit' | 'enabled'
    manager: JSUndoManager
    /** The command recorded, undone, redone or put in by `replaceLast`, when there is one. */
    command?: JSUndoManagerCommand
}

/**
 * Simple JavaScript undo/redo command manager supporting transactions with no dependencies.
 *
 * Fork Of JavaScript Undo Manager 1.0.0, by Alexey Grinko, licensed under MIT License.
 *
 * Changes -
 * 1. Added presets commands
 * 2. Port to TypeScript
 * 3. Remove transactions, see {@link SetValueUndoCommand} for a replacement
 * @class JSUndoManager
 * @category Undo
 */
export class JSUndoManager {
    limit: number;
    options: JSUndoManagerOptions = {
        limit: 500,             // maximum commands stack size
        debug: false,           // whether to emit execution status in console
        bindHotKeys: false,     // whether to bind "undo" and "redo" commands to "Ctrl+Z", "Ctrl+Y" & "Ctrl+Shift+Z" hot keys
        // useTransactions: true   // whether to initialize transactions manager
    }
    private _enabled = true;

    /** When false, nothing is recorded, undone or redone. */
    get enabled(): boolean {
        return this._enabled
    }

    set enabled(value: boolean) {
        if (value === this._enabled) return
        this._enabled = value
        this._changed('enabled')
    }

    stack: JSUndoManagerCommand[];
    sp: number;
    // transaction: TransactionManager;
    /**
     * Presets for commands, allows to define command types and their handlers.
     * A preset maps from a JSUndoManagerCommand2 to a JSUndoManagerCommand1.
     *
     * To add a preset, simply set it on this object, or using `Object.assign`.
     *
     * @type {Record<string, (c: JSUndoManagerCommand2)=>JSUndoManagerCommand1>}
     */
    presets: Record<string, (c: JSUndoManagerCommand2)=>JSUndoManagerCommand1> = {}

    private _changeListeners = new Set<(e: JSUndoManagerChangeEvent) => void>()

    /**
     * Be told whenever the stack changes: a step recorded, undone, redone or replaced, the stack reset,
     * the limit changed, or the manager enabled/disabled. An undo history list or a menu's enabled state
     * listens here instead of polling `stack` and `sp`.
     * @returns a function that removes the listener
     */
    addChangeListener(listener: (e: JSUndoManagerChangeEvent) => void): () => void {
        this._changeListeners.add(listener)
        return () => this.removeChangeListener(listener)
    }

    removeChangeListener(listener: (e: JSUndoManagerChangeEvent) => void): void {
        this._changeListeners.delete(listener)
    }

    private _changed(action: JSUndoManagerChangeEvent['action'], command?: JSUndoManagerCommand): void {
        if (!this._changeListeners) return // during construction
        for (const listener of [...this._changeListeners]) {
            try {
                listener({action, manager: this, command})
            } catch (e) {
                console.error('JSUndoManager: a change listener threw', e)
            }
        }
    }

    /**
     * The label of a command: its own `label`, or for a preset command the label of what the preset
     * makes of it.
     */
    labelOf(command: JSUndoManagerCommand | null | undefined): string | undefined {
        if (!command) return undefined
        if (command.label !== undefined) return command.label
        if ((command as JSUndoManagerCommand2).type) {
            const p = this.presets[(command as JSUndoManagerCommand2).type]
            return typeof p === 'function' ? p(command as JSUndoManagerCommand2).label : undefined
        }
        return undefined
    }

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

    /**
     * Removes the event listeners and clears the stack
     */
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
        this._changed('replace', command)

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

        const command1 = this._rc(command);

        // Record the command itself. This used to be `this.record.apply(this, command1)`, which passed the
        // command object as the argument list, so `record` received `undefined` and pushed it onto the stack.
        this.record(command);

        this.log("Executing function...");
        command1.redo.apply(command1);

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
        this._changed('record', command);
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
        this._changed('undo', command);

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
        this._changed('redo', command);

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
            this._changed('limit');
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
        this._changed('reset');
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
