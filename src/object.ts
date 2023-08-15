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

/**
 * Execute a function on each property of an object and return the result as a new object
 * This allows in place modification of the object.
 * To create a new object, set inPlace to false, or use {@link objectMap2} to modify the keys as well
 * Similar to {@link Array.map} but for objects.
 * @param obj - object
 * @param fn - function to execute on each property
 * @param inPlace - if true, the original object is modified. Default is true
 */
export function objectMap<T extends string|number|symbol, V>(obj: Record<T, V>, fn: (val: V, key: T)=>V, inPlace = true): Record<T, V> {
    const result: any = inPlace ? obj : {}
    const keys = Object.keys(obj) as T[]
    for (const key of keys) result[key] = fn(obj[key], key)
    return result
}

/**
 * Shorthand for `Object.fromEntries(Object.entries(obj).map(fn))`
 * Similar to {@link objectMap} but uses {@link Object.fromEntries} to create the new object, so keys can also be changed.
 * @param obj
 * @param fn
 */
export function objectMap2<T extends string|number|symbol, V = any>(obj: Record<T, V>, fn: ([key, val]: [T, V])=>[T, V]): Record<T, V> {
    return Object.fromEntries((Object.entries(obj) as [T, V][]).map((v: [T, V])=>fn(v))) as Record<T, V>
}

