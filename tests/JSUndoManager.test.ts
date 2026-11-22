import {afterEach, describe, expect, it, vi} from 'vitest'
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

    it('tells the listeners after the command ran', () => {
        const m = manager()
        const state = {value: 0}
        let seen: unknown[] = []
        m.addChangeListener(e => { seen = [e.action, state.value] })
        m.execute({redo: () => { state.value = 1 }, undo: () => { state.value = 0 }})
        expect(seen).toEqual(['record', 1])
    })
})

describe('JSUndoManager options', () => {
    it('keeps the default limit when none is given', () => {
        const m = new JSUndoManager({debug: false})
        expect(m.limit).toBe(500)
        m.record({redo: () => {}, undo: () => {}})
        expect(m.canUndo()).toBe(true)
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
        m.setLimit(10) // unchanged
        expect(seen).toEqual([])
    })

    it('dispose removes the listeners, so a disposed manager keeps no UI alive', () => {
        const m = manager()
        const seen: string[] = []
        m.addChangeListener(e => seen.push(e.action))
        m.dispose()
        m.record({redo: () => {}, undo: () => {}})
        expect(seen).toEqual(['reset'])
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
                const e = {key: 'z', code: 'KeyZ', ctrlKey: true, altKey: false, metaKey: false, shiftKey: false, defaultPrevented: false, target: {tagName: 'DIV'}, preventDefault() { e.defaultPrevented = true }, ...init}
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

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('follows the letter on the key: Ctrl+Z on a QWERTZ keyboard undoes, Ctrl+Y redoes', () => {
        const r = root()
        const {state} = withStep(r)
        // the key labelled Y on QWERTZ is at the place of Z (KeyZ): it redoes, it does not undo
        expect(r.key({key: 'y', code: 'KeyZ'}).defaultPrevented).toBe(false)
        r.key({key: 'z', code: 'KeyY'})
        expect(state.value).toBe(0)
        r.key({key: 'y', code: 'KeyZ'})
        expect(state.value).toBe(1)
    })

    it('uses the place of the key when it types no Latin letter (Cyrillic)', () => {
        const r = root()
        const {state} = withStep(r)
        r.key({key: 'я', code: 'KeyZ'})
        expect(state.value).toBe(0)
    })

    it('leaves a key with Alt (AltGr on Windows types letters) to the page', () => {
        const r = root()
        const {state} = withStep(r)
        expect(r.key({key: 'ż', altKey: true}).defaultPrevented).toBe(false)
        expect(r.key({key: 'z', altKey: true}).defaultPrevented).toBe(false)
        expect(state.value).toBe(1)
    })

    it('uses Cmd on a Mac and Ctrl elsewhere', () => {
        const r = root()
        const {state} = withStep(r)
        expect(r.key({ctrlKey: false, metaKey: true}).defaultPrevented).toBe(false) // the Windows key elsewhere
        vi.stubGlobal('navigator', {platform: 'MacIntel', userAgent: 'Macintosh'})
        expect(r.key({}).defaultPrevented).toBe(false) // Ctrl+Z on a Mac
        r.key({ctrlKey: false, metaKey: true})
        expect(state.value).toBe(0)
        r.key({ctrlKey: false, metaKey: true, shiftKey: true, key: 'Z'})
        expect(state.value).toBe(1)
    })

    it('a focused checkbox, range or button does not block the keys; a text input does', () => {
        const r = root()
        const {state} = withStep(r)
        expect(r.key({target: {tagName: 'INPUT', type: 'text'}}).defaultPrevented).toBe(false)
        expect(state.value).toBe(1)
        r.key({target: {tagName: 'INPUT', type: 'checkbox'}})
        expect(state.value).toBe(0)
        r.key({target: {tagName: 'INPUT', type: 'range'}, shiftKey: true})
        expect(state.value).toBe(1)
        r.key({target: {tagName: 'BUTTON'}})
        expect(state.value).toBe(0)
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

describe('JSUndoManager preset commands', () => {
    const counter = () => {
        const m = manager()
        const target = {value: 0}
        m.presets.add = (c: any) => ({undo: () => { c.target.value -= c.by }, redo: () => { c.target.value += c.by }})
        return {m, target}
    }

    it('records a command whose type has a preset', () => {
        const {m, target} = counter()
        m.execute({type: 'add', target, by: 2} as any)
        expect(target.value).toBe(2)
        m.undo()
        expect(target.value).toBe(0)
    })

    it('throws on a type with no preset when recording, naming the type, and records nothing', () => {
        const {m, target} = counter()
        expect(() => m.record({type: 'missing', target} as any)).toThrow(/"missing"/)
        expect(() => m.execute({type: 'missing', target} as any)).toThrow(/"missing"/)
        expect(m.getSize()).toBe(0)
        m.record({type: 'add', target, by: 1} as any)
        expect(() => m.replaceLast({type: 'missing', target} as any)).toThrow(/"missing"/)
        expect((m.peek() as any).type).toBe('add')
    })

    it('a step whose preset was removed after recording: undo and redo throw and the pointer stays', () => {
        const {m, target} = counter()
        m.execute({type: 'add', target, by: 1} as any)
        m.execute({type: 'add', target, by: 10} as any)
        const add = m.presets.add
        delete m.presets.add
        expect(() => m.undo()).toThrow(/"add"/)
        expect(m.getSize()).toBe(2)
        expect(m.canRedo()).toBe(false)
        m.presets.add = add
        m.undo()
        expect(target.value).toBe(1) // the step that failed is the one undone now
        delete m.presets.add
        expect(() => m.redo()).toThrow(/"add"/)
        expect(m.canRedo()).toBe(true)
        m.presets.add = add
        m.redo()
        expect(target.value).toBe(11)
    })
})

describe('JSUndoManager steps that throw', () => {
    it('an undo that throws leaves the step done; a redo that throws leaves it undone', () => {
        const m = manager()
        let fail = true
        const changes: string[] = []
        m.addChangeListener(e => changes.push(e.action))
        m.record({undo: () => { if (fail) throw new Error('undo failed') }, redo: () => { if (fail) throw new Error('redo failed') }})
        expect(() => m.undo()).toThrow('undo failed')
        expect(m.canUndo()).toBe(true)
        expect(m.canRedo()).toBe(false)
        fail = false
        m.undo()
        fail = true
        expect(() => m.redo()).toThrow('redo failed')
        expect(m.canRedo()).toBe(true)
        expect(changes).toEqual(['record', 'undo']) // nothing is told for the failed ones
    })
})
