import {JSUndoManager, recordUndoCommand, setValueUndoCommand, type SetValueUndoCommand} from 'ts-browser-helpers'
import {defineTab} from '../lib/demo'
import source from './undo.ts?raw'

export default defineTab({
    id: 'undo',
    title: 'Undo',
    intro: '<code>JSUndoManager</code> keeps a stack of steps to undo and redo, with labels, change listeners and hot keys. <code>setValueUndoCommand</code> and <code>recordUndoCommand</code> turn value edits into steps and merge a continuous edit, like a slider drag, into one.',
    source,
    setup(tab) {
        tab.demo('list', 'An editable list', 'Each add or remove is a step with a label. The history lists the steps; the highlighted one is the last done. With the hot keys on, <kbd>Ctrl</kbd>+<kbd>Z</kbd> undoes and <kbd>Ctrl</kbd>+<kbd>Y</kbd> or <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> redoes (<kbd>Cmd</kbd> on a Mac) while the example is on screen, but not in the text field: it keeps its own undo.', ({root, input, button, checkbox, row}) => {
            // #region list
            const items: string[] = ['Milk', 'Bread']
            const um = new JSUndoManager({limit: 50, debug: false, bindHotKeys: false, hotKeyRoot: document})

            const text = input('Item', 'Eggs')
            button('Add', () => {
                const item = text.value.trim()
                if (!item) return
                um.execute({
                    label: `Add "${item}"`,
                    redo: () => items.push(item),
                    undo: () => items.pop(),
                })
                text.value = ''
            }, {primary: true})
            row()
            const undoBtn = button('Undo', () => um.undo())
            const redoBtn = button('Redo', () => um.redo())
            const keys = checkbox('Hot keys', true)
            // the keys act only while the list is on screen (not on another tab of this page)
            let visible = false
            const bindKeys = () => visible && keys.checked ? um.bindHotKeys() : um.unbindHotKeys()
            keys.onchange = bindKeys
            new IntersectionObserver(([e]) => { visible = e.isIntersecting; bindKeys() }).observe(root)

            const list = document.createElement('ul')
            list.className = 'list'
            const history = document.createElement('ol')
            history.className = 'history'
            root.append(list, history)

            const remove = (index: number) => {
                const item = items[index]
                um.execute({
                    label: `Remove "${item}"`,
                    redo: () => items.splice(index, 1),
                    undo: () => items.splice(index, 0, item),
                })
            }

            const render = () => {
                list.replaceChildren(...items.map((item, i) => {
                    const li = document.createElement('li')
                    li.textContent = item
                    const x = document.createElement('button')
                    x.className = 'btn btn-quiet btn-small'
                    x.textContent = 'Remove'
                    x.onclick = () => remove(i)
                    li.append(x)
                    return li
                }))
                history.replaceChildren(...um.stack.map((step, i) => {
                    const li = document.createElement('li')
                    li.textContent = `${i + 1}. ${um.labelOf(step)}`
                    li.className = i === um.sp ? 'current' : i < um.sp ? 'done' : ''
                    return li
                }))
                undoBtn.disabled = !um.canUndo()
                redoBtn.disabled = !um.canRedo()
            }
            // record, undo, redo, replace, reset, limit and enabled all come here
            um.addChangeListener(render)
            render()
            // #endregion
        })

        tab.demo('values', 'Merged value edits', 'Drag the slider: <code>setValueUndoCommand</code> sets the value and records one step for the whole drag (<code>last: false</code> while it moves, <code>last: true</code> on release). The colour uses <code>recordUndoCommand</code> directly: picks within 2 s of each other merge into one step. A preset of the manager turns the recorded commands into undo and redo.', ({input, button, row, stage, log}) => {
            // #region values
            const shape = {size: 48, color: '#0a6fd6'}
            const um = new JSUndoManager({limit: 50, debug: false, bindHotKeys: false})

            // a recorded command is data ({type, lastVal, val, binding, ...}); the preset of its type makes its undo and redo
            um.presets.set = (c) => {
                const s = c as SetValueUndoCommand
                const [target, key] = s.binding!
                return {
                    label: `Set ${String(key)} to ${s.val}`,
                    undo: () => { target[key] = s.lastVal; draw() },
                    redo: () => { target[key] = s.val; draw() },
                }
            }

            const size = input('Size', '', 'range')
            Object.assign(size, {min: '16', max: '120', value: String(shape.size)}) // the value after its range
            const setSize = (last: boolean) => {
                // binding, value, props, uid (the steps of one uid merge), command type, track undo, merge time, save binding
                setValueUndoCommand(um, [shape, 'size'], Number(size.value), {last}, 'size', 'set', true, 2000, true)
                draw()
            }
            size.oninput = () => setSize(false)
            size.onchange = () => setSize(true)

            const color = input('Colour', shape.color, 'color')
            color.oninput = () => {
                const command: SetValueUndoCommand = {
                    type: 'set', uid: 'color', binding: [shape, 'color'],
                    lastVal: shape.color, val: color.value, final: false, props: {}, time: Date.now(),
                }
                shape.color = color.value
                recordUndoCommand(um, command, 'set')
                draw()
            }

            row()
            button('Undo', () => um.undo())
            button('Redo', () => um.redo())
            const box = document.createElement('div')
            box.className = 'size-box'
            stage().append(box)

            function draw() {
                box.style.width = box.style.height = shape.size + 'px'
                box.style.background = shape.color
                size.value = String(shape.size)
                color.value = shape.color
            }
            um.addChangeListener(e => log(`${e.action}: ${um.labelOf(e.command) ?? ''} (${um.getSize()} steps)`))
            draw()
            // #endregion
        })
    },
})
