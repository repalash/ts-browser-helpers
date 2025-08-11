import {clonePrimitive, copyPrimitive, equalsPrimitive, PrimitiveVal} from './primitive_value'
import {JSUndoManager, JSUndoManagerCommand, JSUndoManagerCommand2} from "./JSUndoManager";
import {safeSetProperty} from "./obj-property";

/**
 * Properties for the SetValueUndoCommand.
 *
 * @category Undo
 */
export interface SetValueUndoCommandProps<T extends PrimitiveVal = PrimitiveVal>{
    /**
     * If true, the command is final and will not be merged with the previous command.
     * This is ideally set to tru when the user has finished editing the value like on pressing enter or pointer up.
     */
    last?: boolean,
    /**
     * Optional. The current before the change.
     * It can be set if known (but it should be exactly equal to the value in the binding and not cloned).
     * If not provided, it will be taken from the target object.
     */
    lastValue?: T
}

/**
 * Interface for a command that sets a value with a binding.
 *
 * @category Undo
 */
export interface SetValueUndoCommand<
    T extends PrimitiveVal = PrimitiveVal,
    TS extends string = string,
    TD = any,
    TP extends SetValueUndoCommandProps<T> = SetValueUndoCommandProps<T>,
    TB = any
> extends JSUndoManagerCommand2{
    type: TS,
    lastVal: T
    val: T
    final: boolean
    props: TP
    uid: TD
    time: number
    binding?: [TB, keyof TB]
    onUndoRedo?: (c: SetValueUndoCommand)=>void
}

/**
 * Interface for a command that performs an action(function).
 *
 * @category Undo
 */
export interface ActionUndoCommand<
    TS extends string = string,
    TD = any,
    TA = any[]
> extends JSUndoManagerCommand2{
    type: TS,
    target: object
    undo: ()=>any
    redo: ()=>any
    args: TA
    uid: TD
    onUndoRedo?: (c: ActionUndoCommand)=>void
}

/**
 * Records an undo command in the undo manager, supports merging of subsequent setValue commands. See uiconfig.js or threepipe `UndoManagerPlugin` for usage.
 * @param um - the undo manager to record the command in, if undefined, or not enabled the command will not be recorded
 * @param com - the command to record, should be of type SetValueUndoCommand, ActionUndoCommand or JSUndoManagerCommand
 * @param setValueCommandType - command type for the setValue command, used to identify the command type for merging
 * @param undoEditingWaitTime - time in milliseconds to wait before considering the command final, defaults to 2000ms
 * @category Undo
 */
export function recordUndoCommand<T extends SetValueUndoCommand|ActionUndoCommand|JSUndoManagerCommand>(um: JSUndoManager|undefined, com: T, setValueCommandType: string, undoEditingWaitTime = 2000) {
    if (!um || !um.enabled) return
    const c = com as SetValueUndoCommand
    if (c.type !== setValueCommandType) return um.record(com)

    const lastCommand = um.peek()
    let sameType = !!lastCommand && (lastCommand as SetValueUndoCommand).type === setValueCommandType && (lastCommand as SetValueUndoCommand).uid === c.uid
    if (sameType) {
        const cLast = lastCommand as SetValueUndoCommand
        if (!cLast.final && c.time - cLast.time < undoEditingWaitTime) {
            // replace cLast with c using lastVal from cLast
            c.lastVal = cLast.lastVal
            c.val = clonePrimitive(c.val)
            um.replaceLast(c)
        } else {
            sameType = false
        }
    }
    if (!sameType) {
        if (!equalsPrimitive(c.lastVal, c.val)) {
            c.val = clonePrimitive(c.val)
            um.record(c)
        }
    }
}

/**
 * Sets a value in the target object with undo/redo support. See uiconfig.js or threepipe `UndoManagerPlugin` for usage
 * @param um - the undo manager to record the command in, if undefined, or not enabled the command will not be recorded but the value will still be set.
 * @param binding - a tuple of target object and key to set the value on
 * @param value - the value to set
 * @param props - properties for the undo command, including last, and lastValue(optional)
 * @param uid - unique identifier for the command, used to merge commands
 * @param setValueCommandType - command type for the setValue command
 * @param trackUndo - whether to track the undo command or not, defaults to true
 * @param undoEditingWaitTime - time in milliseconds to wait before considering the command final, defaults to 2000ms
 * @param saveBinding - whether to save the binding in the command or not, defaults to false
 * @param onUndoRedo - optional callback function to be called on undo/redo of the command
 * @returns an object containing the last value, the new value, the last value before the change, and whether the command is undoable or not.
 * @category Undo
 */
export function setValueUndoCommand<T extends PrimitiveVal, T1 = any>(um: JSUndoManager|undefined, binding: [T1, keyof T1], value: PrimitiveVal, props: SetValueUndoCommandProps, uid: any, setValueCommandType: string, trackUndo = true, undoEditingWaitTime = 2000, saveBinding = false, onUndoRedo?: (c: SetValueUndoCommand)=>void) {
    const [tar, key] = binding
    const lastValueRaw = props.lastValue ?? tar?.[key] as T
    let failed = false
    const final = props.last ?? true

    const same = equalsPrimitive(lastValueRaw, value)
    const lastValue = clonePrimitive(lastValueRaw)
    if (same) failed = !final
    else if (tar) {
        const a = copyPrimitive(lastValueRaw, value)
        if (a !== lastValueRaw) failed = !safeSetProperty(tar, key, value as any, true, true)
        else failed = false
    } else failed = true

    const undoable = !failed && (final || !same)
    // console.log('set', restProps.config, value, lastValue, failed, same, final)
    const record = trackUndo && undoable
    if (record && um) {
        recordUndoCommand<SetValueUndoCommand>(um, {
            type: setValueCommandType,
            lastVal: lastValue,
            val: value,
            final,
            props,
            time: Date.now(),
            uid,
            binding: saveBinding ? binding : undefined, // save binding only if required, otherwise it could cause memory leaks
            onUndoRedo,
        }, setValueCommandType, undoEditingWaitTime)
    }

    return {last: final, value, lastValue, undoable}
}
