import {SimpleEventDispatcher} from "./EventDispatcher";
import {now} from "./time";
import {IDisposable} from "./types";

/**
 * A helper class to handle pointer events and dispatch drag events: `drag`, `dragStart` and `dragEnd` with NDC coordinates and time.
 *
 * To use, create an object of the class, set `element` with the HTML element(like canvas) and add event listeners to drag events.
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
        this._element?.removeEventListener('pointerdown', this._onPointerDown)
        this._element?.removeEventListener('pointermove', this._onPointerMove)
        this._element?.removeEventListener('pointerup', this._onPointerUp)
        this._element?.removeEventListener('pointercancel', this._onPointerUp)
        this._element?.removeEventListener('pointerout', this._onPointerUp)
    }

    private _addElement() {
        this._element?.addEventListener('pointerdown', this._onPointerDown)
        this._element?.addEventListener('pointermove', this._onPointerMove)
        this._element?.addEventListener('pointerup', this._onPointerUp)
        this._element?.addEventListener('pointercancel', this._onPointerUp)
        this._element?.addEventListener('pointerout', this._onPointerUp)
    }

    private _onPointerDown = (e: PointerEvent) => {
        if (e.button !== 0) return
        if (!this._element) return
        this._pointerUp = undefined
        const x = e.clientX / this._element!.clientWidth * 2 - 1
        const y = -(e.clientY / this._element!.clientHeight) * 2 + 1
        const time = now()
        this._pointerDown = {x, y, time}
        this._pointer = this._pointerDown
        this.dispatchEvent({type: 'dragStart', pointer: this._pointerDown})
    }
    private _onPointerMove = (e: PointerEvent) => {
        if (!this._pointerDown || !this._pointer) return
        if (!this._element) return
        const x = e.clientX / this._element!.clientWidth * 2 - 1
        const y = -(e.clientY / this._element!.clientHeight) * 2 + 1
        const time = now()
        this.dispatchEvent({
            type: 'drag', pointer: this._pointer,
            drag: {x: x - this._pointerDown.x, y: y - this._pointerDown.y, time: time - this._pointerDown.time},
            delta: {x: x - this._pointer.x, y: y - this._pointer.y, time: time - this._pointer.time},
        })
        this._pointer = {x: x, y: y, time: now()}

        if (e.buttons % 2 === 0) this._onPointerUp(e)
    }
    private _onPointerUp = (e: PointerEvent) => {
        if (e.button !== 0) return
        if (!this._pointerDown) return
        if (!this._element) return
        const x = e.clientX / this._element!.clientWidth * 2 - 1
        const y = -(e.clientY / this._element!.clientHeight) * 2 + 1
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
    }

    dispose() {
        this.element = undefined
    }
}
