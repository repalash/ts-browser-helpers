import {Damper, now, PointerDragHelper} from 'ts-browser-helpers'
import {defineTab} from '../lib/demo'
import source from './pointer.ts?raw'

export default defineTab({
    id: 'pointer',
    title: 'Pointer and motion',
    intro: '<code>PointerDragHelper</code> turns pointer events into <code>dragStart</code>, <code>drag</code> and <code>dragEnd</code> events. <code>Damper</code> moves a value smoothly toward a goal, like a camera that eases into place.',
    source,
    setup(tab) {
        tab.demo('drag', 'Drag a box', 'The helper reports the pointer in normalised coordinates of its element (-1 to 1, y up), with the change since the last event (<code>delta</code>) and since the start (<code>drag</code>). Here the element is the box, and the box moves by <code>delta</code>.', ({stage, log}) => {
            // #region drag
            const area = stage('drag-area')
            const box = document.createElement('div')
            box.className = 'drag-box'
            box.textContent = 'Drag me'
            area.append(box)
            let x = 16, y = 16
            const place = () => { box.style.transform = `translate(${x}px, ${y}px)` }
            place()

            const helper = new PointerDragHelper()
            helper.element = box
            // keep the pointer events on the box when the pointer leaves it in a fast move
            box.addEventListener('pointerdown', (e) => box.setPointerCapture(e.pointerId))

            helper.addEventListener('dragStart', () => box.classList.add('dragging'))
            helper.addEventListener('drag', (e) => {
                // delta is in units of half the element's size, and y goes up
                x += e.delta.x * box.clientWidth / 2
                y -= e.delta.y * box.clientHeight / 2
                x = Math.max(0, Math.min(area.clientWidth - box.offsetWidth, x))
                y = Math.max(0, Math.min(area.clientHeight - box.offsetHeight, y))
                place()
            })
            helper.addEventListener('dragEnd', (e) => {
                box.classList.remove('dragging')
                log(`dragEnd after ${Math.round(e.drag.time)} ms, box at ${Math.round(x)}, ${Math.round(y)}`)
            })
            // helper.dispose() removes the listeners from the element
            // #endregion
        })

        tab.demo('damper', 'Follow the pointer with a Damper', 'Move the pointer over the box (or tap it). The dot follows with a critically damped motion: no overshoot. One <code>Damper</code> per number, here x and y. A longer decay time makes it slower.', ({stage, input, log}) => {
            // #region damper
            const area = stage('follow-area')
            const dot = document.createElement('div')
            dot.className = 'follow-dot'
            const target = document.createElement('div')
            target.className = 'follow-target'
            area.append(target, dot)

            const decay = input('Decay time (ms)', '', 'range')
            Object.assign(decay, {min: '10', max: '400', value: '80'}) // the value after its range
            const dampX = new Damper(80), dampY = new Damper(80)
            decay.oninput = () => {
                dampX.setDecayTime(Number(decay.value))
                dampY.setDecayTime(Number(decay.value))
            }

            let x = 40, y = 40, goalX = x, goalY = y
            let last = now(), running = false
            const frame = () => {
                const t = now()
                const dt = t - last
                last = t
                // the last argument is the rough size of the value, for when it counts as settled
                x = dampX.update(x, goalX, dt, area.clientWidth)
                y = dampY.update(y, goalY, dt, area.clientHeight)
                dot.style.transform = `translate(${x}px, ${y}px)`
                // it returns the goal exactly once it has settled: stop until the next move
                if (x === goalX && y === goalY) {
                    running = false
                    log(`settled at ${Math.round(x)}, ${Math.round(y)}`)
                } else requestAnimationFrame(frame)
            }
            area.addEventListener('pointermove', (e) => {
                const r = area.getBoundingClientRect()
                goalX = e.clientX - r.left
                goalY = e.clientY - r.top
                target.style.transform = `translate(${goalX}px, ${goalY}px)`
                if (!running) {
                    running = true
                    last = now()
                    requestAnimationFrame(frame)
                }
            })
            dot.style.transform = target.style.transform = `translate(${x}px, ${y}px)`
            // #endregion
        })
    },
})
