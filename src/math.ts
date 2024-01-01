/**
 * Returns the number which is larger in absolute value.
 * @param a
 * @param b
 *
 * @category Maths
 */
export function absMax(a: number, b: number): number {
    return Math.abs(a) > Math.abs(b) ? a : b
}

/**
 * Updates the bit at the given position to the given value.
 * @param number - the number to update
 * @param bitPosition - the bit position to update from the least significant bit (0) to most significant bit (31)
 * @param bitValue - 0 or 1
 */
export function updateBit(number: number, bitPosition: number, bitValue: number): number {
    const bitValueNormalized = bitValue ? 1 : 0
    const clearMask = ~(1 << bitPosition)
    return (number & clearMask) | (bitValueNormalized << bitPosition)
}

/**
 * Clears the bit at the given position.
 * @param number - the number to update
 * @param bitPosition - the bit position to update from the least significant bit (0) to most significant bit (31)
 */
export function clearBit(number: number, bitPosition: number): number {
    const clearMask = ~(1 << bitPosition)
    return number & clearMask
}

/**
 * Generate a UUID v4
 * https://stackoverflow.com/a/53723395/2229899
 */
export function uuidV4(){
    const ho = (n: number, p: number) => n.toString(16).padStart(p, '0'); /// Return the hexadecimal text representation of number `n`, padded with zeroes to be of length `p`
    const data = crypto.getRandomValues(new Uint8Array(16)); /// Fill the buffer with random data
    data[6] = (data[6] & 0xf) | 0x40; /// Patch the 6th byte to reflect a version 4 UUID
    data[8] = (data[8] & 0x3f) | 0x80; /// Patch the 8th byte to reflect a variant 1 UUID (version 4 UUIDs are)
    const view = new DataView(data.buffer); /// Create a view backed by the 16-byte buffer
    return `${ho(view.getUint32(0), 8)}-${ho(view.getUint16(4), 4)}-${ho(view.getUint16(6), 4)}-${ho(view.getUint16(8), 4)}-${ho(view.getUint32(10), 8)}${ho(view.getUint16(14), 4)}`; /// Compile the canonical textual form from the array data
}
