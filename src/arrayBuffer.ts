/**
 * Convert an ArrayBuffer to Base64 string
 * @param buffer - ArrayBuffer to convert
 * @category ArrayBuffer
 */
export function arrayBufferToBase64(buffer: ArrayBuffer) {
    if (!window) {
        console.warn('window is required')
        return ''
    }
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[ i ])
    }
    return window.btoa(binary)
}

/**
 * Convert a Base64 string to ArrayBuffer
 * @param base64 - Base64 string to convert
 * @category ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string) {
    if (!window) {
        console.warn('window is required')
        return new Uint8Array(0)
    }
    const binaryString = window.atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
}

// if (!ArrayBuffer.prototype.slice)
//     ArrayBuffer.prototype.slice = function(start, end) {
//         const that = new Uint8Array(this)
//         if (end == undefined) end = that.length
//         const result = new ArrayBuffer(end - start)
//         const resultArray = new Uint8Array(result)
//         for (let i = 0; i < resultArray.length; i++)
//             resultArray[i] = that[i + start]
//         return result
//     }

/**
 * Mapping of typed array constructors by name
 * @category ArrayBuffer
 */
export const TYPED_ARRAYS = {
    Int8Array: Int8Array,
    Uint8Array: Uint8Array,
    Uint8ClampedArray: Uint8ClampedArray,
    Int16Array: Int16Array,
    Uint16Array: Uint16Array,
    Int32Array: Int32Array,
    Uint32Array: Uint32Array,
    Float32Array: Float32Array,
    Float64Array: Float64Array,
}

/**
 * Create a typed array from an ArrayBuffer by name
 * @param type - Name of the typed array constructor
 * @param buffer - ArrayBuffer to use
 * @category ArrayBuffer
 */
export function getTypedArray(type: keyof typeof TYPED_ARRAYS, buffer: ArrayBuffer) {
    return new TYPED_ARRAYS[ type ](buffer)
}
