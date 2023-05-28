/**
 * Access property in an object using a string path. Similar to lodash.get
 * @param access - path to access
 * @param tar - target object
 * @param throwOnInvalid - throw error if invalid access or property is undefined. Default is false
 *
 * @example
 * ```js
 * const obj = {a: {b: {c: 1}}}
 * const c = deepAccessObject(['a', 'b', 'c'], obj)
 * console.log(c) // 1
 * ```
 *
 * @category JS Object
 */
export function deepAccessObject(access: string | string[], tar: any, throwOnInvalid = false): any {
    if (typeof access === 'string') access = access.split('.')
    while (access.length > 0) {
        if (!tar) return
        const p = access.splice(0, 1)[0] as string
        if (p.length < 1) continue
        if (p in tar) {
            tar = tar[p]
        } else {
            // console.error('invalid access, check', p, tar)
            if(throwOnInvalid)
                throw new Error('invalid access, check ' + p + ' in ' + tar)
            else return undefined
            // return tar
        }
    }
    return tar
}


/**
 * Find the key of an object with a given value.
 * @param object - object to search
 * @param value - value to search for
 *
 * @category JS Object
 */
export function getKeyByValue(object: Record<string, any>, value: any): string|undefined {
    return Object.keys(object).find(key => object[key] === value)
}

/**
 * Check if an object has a property. Same as {@link Object.hasOwn} or {@link Object.hasOwnProperty}
 * @param o
 * @param v
 */
export function objectHasOwn(o: object, v: PropertyKey): boolean {
    return Object.hasOwn ? Object.hasOwn(o, v) : o.hasOwnProperty(v)
}
