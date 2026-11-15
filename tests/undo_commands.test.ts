import {describe, expect, it} from 'vitest'
import {JSUndoManager} from '../src/JSUndoManager'
import {recordUndoCommand, SetValueUndoCommand} from '../src/undo_commands'

describe('recordUndoCommand', () => {
    const setup = () => {
        const m = new JSUndoManager({limit: 20, debug: false, bindHotKeys: false})
        const obj: Record<string, number> = {a: 0, b: 0}
        m.presets.set = (c) => {
            const s = c as SetValueUndoCommand<number>
            const key = s.uid as string
            return {undo: () => { obj[key] = s.lastVal }, redo: () => { obj[key] = s.val }}
        }
        let t = 1000
        const edit = (key: string, val: number) => {
            const c = {type: 'set', uid: key, lastVal: obj[key], val, final: false, props: {}, time: t += 100} as SetValueUndoCommand<number>
            obj[key] = val
            recordUndoCommand(m, c, 'set')
        }
        return {m, obj, edit}
    }

    it('merges continuous edits of one value into one step', () => {
        const {m, obj, edit} = setup()
        edit('a', 1); edit('a', 2); edit('a', 3)
        expect(m.getSize()).toBe(1)
        m.undo()
        expect(obj.a).toBe(0)
    })

    it('an edit after an undo is a new step and clears the redo', () => {
        const {m, obj, edit} = setup()
        edit('a', 1)
        edit('b', 5)
        m.undo() // b back to 0
        edit('a', 2) // soon after: it was merged into the a step, and b could still be redone on top of it
        expect(m.canRedo()).toBe(false)
        m.undo()
        expect(obj.a).toBe(1)
        m.undo()
        expect(obj.a).toBe(0)
        expect(obj.b).toBe(0)
    })
})
