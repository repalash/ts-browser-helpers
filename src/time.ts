/**
 * Returns a promise that resolves after the given duration. Basically a setTimeout that returns a promise.
 * @param duration - in ms
 *
 * @category Time
 */
export async function timeout(duration: number) {
    return new Promise(resolve => setTimeout(resolve, Math.max(0, duration)))
}

/**
 * Returns the current time in milliseconds. If performance.now() is available, it is used, otherwise Date.now() is used.
 *
 * @category Time
 */
export function now(): number { // in milliseconds
    return (typeof performance === 'undefined' ? Date : performance).now() // see threejs  #10732
}
