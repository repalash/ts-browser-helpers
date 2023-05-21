import {AnyOptions, ValOrFunc} from "./types";

/**
 * Get property descriptor from object or its prototype chain
 * @param obj
 * @param prop
 *
 * @category JS Object
 */
export function getPropertyDescriptor<T>(obj: T, prop: keyof T) : PropertyDescriptor | undefined {
    let desc
    do {
        desc = Object.getOwnPropertyDescriptor(obj, prop)
    } while (!desc && (obj = Object.getPrototypeOf(obj)))
    return desc
}

/**
 * Check if property is writable in object or its prototype chain
 * @param object - object to check
 * @param prop - property to check
 * @param allowWritable - allow writable properties without setter
 * @param allowAny - allow any property (even if it doesn't exist)
 *
 * @category JS Object
 */
export function isPropertyWritable<T>(object: T, prop: keyof T, allowWritable = true, allowAny = false) {
    const desc = getPropertyDescriptor(object, prop)
    return !!desc?.set
        || allowWritable && desc?.writable !== false && desc?.get === undefined
        || allowAny && !desc
}

/**
 * Set value only if setter exists
 * @param object - object to set
 * @param prop - property to set
 * @param value - value to set
 * @param allowWritable - allow writable properties without setter
 * @param allowAny - allow any property (even if it doesn't exist)
 *
 * @category JS Object
 */
export function safeSetProperty<T, K extends keyof T>(object: T | undefined | null, prop: K, value: NonNullable<T>[K], allowWritable = true, allowAny = false): boolean {
    // check type?
    if (object && isPropertyWritable(object, prop, allowWritable, allowAny)) {
        object[prop] = value
        return true
    }
    return false
}

/**
 * Get value, but if it is a function, call it with args
 * @param s - value or function
 * @param args - arguments to pass to function
 *
 * @category JS Object
 */
export function getOrCall<T>(s: ValOrFunc<T | undefined>, ...args: any[]): T|undefined {
    if (typeof s === 'function') s = (s as ((...a:any[])=>T|undefined))(...args)
    return s
}

/**
 * Copy properties from source to dest. Similar to Object.assign, but only copies properties that exist in source, dest and propList.
 * @param source - source object
 * @param dest - destination object
 * @param propList - list of properties to copy
 *
 * @category JS Object
 */
export function copyProps<T = AnyOptions>(source: Record<keyof T, any>, dest: T, propList: (keyof T)[]): T {
    for (const str of propList) {
        const s = source[str]
        if (s !== undefined) safeSetProperty(dest, str, s, true)
        // if (s !== undefined) dest[str] = s
    }
    return dest
}
