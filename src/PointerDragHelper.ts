import {SimpleEventDispatcher} from "./EventDispatcher";
import {now} from "./time";
import {IDisposable} from "./types";

/**
 * A helper class to handle pointer events and dispatch drag events: `drag`, `dragStart` and `dragEnd` with NDC coordinates and time.
 *
 * To use, create an object of the class, set `element` with the HTML element(like canvas) and add event listeners to drag events.
 *
 * The coordinates are relative to the element: -1 at its left (bottom) edge, 1 at its right (top) edge. A drag starts with
 * the primary button (or a touch or pen) and captures the pointer, so it goes on outside the element and over its children,
 * until the pointer is released or cancelled. `drag` has the `pointer` now, the `drag` since the start and the `delta`
 * since the last event.
 *
 * @example
 * ```ts
 * const pointerDragHelper = new PointerDragHelper()
 * pointerDragHelper.element = canvas
 * pointerDragHelper.addEventListener('dragStart', (e) => {
 *    console.log('dragStart', e.pointer)
 *    // {x: -0.5, y: 0.5, time: 123456789}
 *    // x and y are NDC coordinates, time is the time when the event is fired.
 *    // x and y are in the range of [-1, 1].
 *    // x is left to right, y is bottom to top.
 *    // time is in milliseconds.
 * })
 * pointerDragHelper.addEventListener('drag', (e) => {
 *   console.log('drag', e.pointer)
 *   // {x: -0.5, y: 0.5, time: 123456789}
 * })
 * pointerDragHelper.addEventListener('dragEnd', (e) => {
 *  console.log('dragEnd', e.pointer)
 *  // {x: -0.5, y: 0.5, time: 123456789}
 * })
 * ```
 */
export class PointerDragHelper extends SimpleEventDispatcher<'dragStart' | 'drag' | 'dragEnd'> implements IDisposable{
    private _pointerDown?: {x: number, y: number, time: number}
    private _pointer?: {x: number, y: number, time: number}
    private _pointerUp?: {x: number, y: number, time: number}
    /** The pointer of the drag: other pointers (a second finger) are left alone */
    private _pointerId?: number

    get element(): HTMLElement | undefined {
        return this._element
    }

    set element(value: HTMLElement | undefined) {
        if (this._element === value) return
        if (this._element) this._removeElement()
        this._element = value
        if (this._element) this._addElement()
    }

    private _element?: HTMLElement

    private _removeElement() {
        // a drag in progress: the old element lets go of its pointer, so later events reach what is under it
        if (this._pointerId !== undefined && this._element?.hasPointerCapture?.(this._pointerId)) this._element.releasePointerCapture(this._pointerId)
        this._element?.removeEventListener('pointerdown', this._onPointerDown)
        this._element?.removeEventListener('pointermove', this._onPointerMove)
        this._element?.removeEventListener('pointerup', this._onPointerUp)
        this._element?.removeEventListener('pointercancel', this._onPointerUp)
        this._element?.removeEventListener('lostpointercapture', this._onPointerUp)
        this._pointerDown = undefined
        this._pointer = undefined
        this._pointerId = undefined
    }

    private _addElement() {
        this._element?.addEventListener('pointerdown', this._onPointerDown)
        this._element?.addEventListener('pointermove', this._onPointerMove)
        this._element?.addEventListener('pointerup', this._onPointerUp)
        this._element?.addEventListener('pointercancel', this._onPointerUp)
        this._element?.addEventListener('lostpointercapture', this._onPointerUp)
    }

    /** The NDC coordinates of an event in the element: -1 to 1 from its left to right, and from its bottom to top */
    private _ndc(e: PointerEvent) {
        const rect = this._element!.getBoundingClientRect()
        return {
            x: (e.clientX - rect.left) / (rect.width || 1) * 2 - 1,
            y: -((e.clientY - rect.top) / (rect.height || 1)) * 2 + 1,
        }
    }

    private _onPointerDown = (e: PointerEvent) => {
        if (e.button !== 0) return
        if (!this._element || this._pointerDown) return // one drag at a time
        this._pointerUp = undefined
        const {x, y} = this._ndc(e)
        const time = now()
        this._pointerId = e.pointerId
        // the moves and the release come to the element also outside it, and over its children
        try {
            this._element.setPointerCapture(e.pointerId)
        } catch { /* a pointer that is already gone */ }
        this._pointerDown = {x, y, time}
        this._pointer = this._pointerDown
        this.dispatchEvent({type: 'dragStart', pointer: this._pointerDown})
    }
    private _onPointerMove = (e: PointerEvent) => {
        if (!this._pointerDown || !this._pointer || e.pointerId !== this._pointerId) return
        if (!this._element) return
        const {x, y} = this._ndc(e)
        const time = now()
        const last = this._pointer
        this._pointer = {x, y, time}
        this.dispatchEvent({
            type: 'drag', pointer: this._pointer,
            drag: {x: x - this._pointerDown.x, y: y - this._pointerDown.y, time: time - this._pointerDown.time},
            delta: {x: x - last.x, y: y - last.y, time: time - last.time},
        })

        if (e.buttons % 2 === 0) this._onPointerUp(e)
    }
    private _onPointerUp = (e: PointerEvent) => {
        // up, cancel or a lost capture of the drag's pointer ends it (their button is not always 0)
        if (!this._pointerDown || e.pointerId !== this._pointerId) return
        const element = this._element // a dragEnd listener may dispose the helper or change its element
        if (!element) return
        const {x, y} = this._ndc(e)
        const time = now()
        this._pointerUp = {x: x, y: y, time}
        this.dispatchEvent({
            type: 'dragEnd', pointer: this._pointerUp,
            drag: {
                x: this._pointerUp.x - this._pointerDown.x,
                y: this._pointerUp.y - this._pointerDown.y,
                time: this._pointerUp.time - this._pointerDown.time,
            },
        })
        this._pointerDown = undefined
        this._pointer = undefined
        this._pointerId = undefined
        if (element.hasPointerCapture?.(e.pointerId)) element.releasePointerCapture(e.pointerId)
    }

    dispose() {
        this.element = undefined
    }
}
