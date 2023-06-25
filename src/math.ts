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
