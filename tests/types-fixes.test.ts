import {describe, expect, test} from 'vitest'
import {arrayBufferToBase64, base64ToArrayBuffer} from '../src/arrayBuffer'
import {JSUndoManager} from '../src/JSUndoManager'

describe('arrayBufferToBase64', () => {
    test('works in Node (no window), and takes an ArrayBuffer or a view of part of one', () => {
        const bytes = new Uint8Array([72, 105, 33, 0, 255])
        expect(arrayBufferToBase64(bytes.buffer)).toBe('SGkhAP8=')
        expect(arrayBufferToBase64(bytes)).toBe('SGkhAP8=')
        expect(arrayBufferToBase64(bytes.subarray(1, 3))).toBe(arrayBufferToBase64(new Uint8Array([105, 33]))) // only the view's bytes
        expect(new Uint8Array(base64ToArrayBuffer('SGkhAP8='))).toEqual(bytes)
    })
})

describe('JSUndoManager options', () => {
    test('every option is optional, with its default', () => {
        const um = new JSUndoManager({limit: 3})
        expect(um.options.limit).toBe(3)
        expect(um.options.debug).toBe(false)
        expect(new JSUndoManager().options.limit).toBe(500)
        um.dispose()
    })
})
