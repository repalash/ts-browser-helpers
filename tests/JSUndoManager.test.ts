import {describe, expect, it} from 'vitest'
import {JSUndoManager, JSUndoManagerChangeEvent} from '../src/JSUndoManager'

const manager = (limit = 10) => new JSUndoManager({limit, debug: false, bindHotKeys: false})

describe('JSUndoManager.execute', () => {
    it('records the command and runs it', () => {
        const m = manager()
        let value = 0
        m.execute({redo: () => { value = 1 }, undo: () => { value = 0 }})
        expect(value).toBe(1)
        expect(m.getSize()).toBe(1)
        m.undo()
        expect(value).toBe(0)
        m.redo()
        expect(value).toBe(1)
    })
})

describe('JSUndoManager change listeners', () => {
    it('reports every change to the stack, with what happened', () => {
        const m = manager(2)
        const seen: JSUndoManagerChangeEvent['action'][] = []
        const off = m.addChangeListener(e => seen.push(e.action))
        const cmd = () => ({redo: () => {}, undo: () => {}})
        m.record(cmd())
        m.undo()
        m.redo()
        m.replaceLast(cmd())
        m.setLimit(3)
        m.enabled = false
        m.enabled = true
        m.reset()
        expect(seen).toEqual(['record', 'undo', 'redo', 'replace', 'limit', 'enabled', 'enabled', 'reset'])
        off()
        m.record(cmd())
        expect(seen.length).toBe(8)
    })

    it('does not report what did not happen', () => {
        const m = manager()
        const seen: string[] = []
        m.addChangeListener(e => seen.push(e.action))
        m.undo() // nothing to undo
        m.redo() // nothing to redo
        m.enabled = true // unchanged
        expect(seen).toEqual([])
    })

    it('passes the manager and the command', () => {
        const m = manager()
        const cmd = {redo: () => {}, undo: () => {}, label: 'Move'}
        let event: JSUndoManagerChangeEvent | undefined
        m.addChangeListener(e => { event = e })
        m.record(cmd)
        expect(event?.manager).toBe(m)
        expect(event?.command).toBe(cmd)
    })

    it('keeps notifying the others when one listener throws', () => {
        const m = manager()
        let called = false
        m.addChangeListener(() => { throw new Error('boom') })
        m.addChangeListener(() => { called = true })
        m.record({redo: () => {}, undo: () => {}})
        expect(called).toBe(true)
    })
})

describe('JSUndoManager labels', () => {
    it('reads a label from a command, plain or preset', () => {
        const m = manager()
        m.presets.setValue = c => ({redo: () => {}, undo: () => {}, label: (c as any).label})
        m.record({redo: () => {}, undo: () => {}, label: 'Extrude'})
        m.record({type: 'setValue', label: 'Set Color'})
        m.record({redo: () => {}, undo: () => {}})
        expect(m.stack.map(c => m.labelOf(c))).toEqual(['Extrude', 'Set Color', undefined])
    })
})

describe('JSUndoManager hot keys', () => {
    const root = () => {
        const listeners = new Set<(e: any) => void>()
        return {
            listeners,
            addEventListener: (_t: string, l: any) => listeners.add(l),
            removeEventListener: (_t: string, l: any) => listeners.delete(l),
            key: (init: Record<string, unknown>) => {
                const e = {code: 'KeyZ', ctrlKey: true, metaKey: false, shiftKey: false, defaultPrevented: false, target: {tagName: 'DIV'}, preventDefault() { e.defaultPrevented = true }, ...init}
                listeners.forEach(l => l(e))
                return e
            },
        }
    }
    const withStep = (r: ReturnType<typeof root>) => {
        const m = new JSUndoManager({limit: 10, debug: false, bindHotKeys: true, hotKeyRoot: r})
        const state = {value: 0}
        m.execute({redo: () => { state.value = 1 }, undo: () => { state.value = 0 }})
        return {m, state}
    }

    it('Ctrl+Z undoes and Ctrl+Shift+Z redoes, and prevents the default', () => {
        const r = root()
        const {state} = withStep(r)
        expect(r.key({}).defaultPrevented).toBe(true)
        expect(state.value).toBe(0)
        r.key({shiftKey: true})
        expect(state.value).toBe(1)
    })

    it('leaves keys typed in a text field or an editable element to it', () => {
        const r = root()
        const {state} = withStep(r)
        for (const target of [{tagName: 'INPUT'}, {tagName: 'TEXTAREA'}, {tagName: 'SELECT'}, {tagName: 'DIV', isContentEditable: true}]) {
            const e = r.key({target})
            expect(e.defaultPrevented).toBe(false)
            expect(state.value).toBe(1)
        }
    })

    it('looks at the original target inside a shadow root', () => {
        const r = root()
        const {state} = withStep(r)
        const e = r.key({target: {tagName: 'MATH-FIELD'}, composedPath: () => [{tagName: 'TEXTAREA'}, {tagName: 'MATH-FIELD'}]})
        expect(e.defaultPrevented).toBe(false)
        expect(state.value).toBe(1)
    })

    it('leaves the key to the page when there is nothing to undo or redo', () => {
        const r = root()
        const {state} = withStep(r)
        expect(r.key({shiftKey: true}).defaultPrevented).toBe(false) // nothing to redo
        r.key({})
        expect(state.value).toBe(0)
        expect(r.key({}).defaultPrevented).toBe(false) // nothing left to undo
    })

    it('can be unbound and bound again at any time, keeping the stack', () => {
        const r = root()
        const {m, state} = withStep(r)
        expect(m.hotKeysBound).toBe(true)
        m.bindHotKeys() // again: still one listener
        expect(r.listeners.size).toBe(1)
        m.unbindHotKeys()
        expect(m.hotKeysBound).toBe(false)
        r.key({})
        expect(state.value).toBe(1)
        expect(m.getSize()).toBe(1)
        m.bindHotKeys()
        r.key({})
        expect(state.value).toBe(0)
    })
})
