/**
 * Primitive value compatible object interface.
 *
 * @category Primitive
 */
export interface PrimitiveValObject {
    clone(): this
    equals(other: this|any): boolean
    copy(other: this|any): void|this|any

    // these can be set if the object does not want to use the default implementation (like Texture, Object3D)
    _ui_isPrimitive?: boolean
    // disable clone.
    _ui_primitiveClone?: false
    // disable copy
    _ui_primitiveCopy?: false
    // disable equals
    _ui_primitiveEquals?: false
}
/**
 * Primitive value type. It can be a string, number, boolean, null, an object that implements the PrimitiveValObject interface, or an array of primitive values.
 *
 * note that arbitrary objects are not allowed, only arrays
 *
 * @category Primitive
 */
export type PrimitiveVal = string | number | boolean | null | PrimitiveValObject | PrimitiveVal[]

/**
 * Clones a primitive value or an object that implements the PrimitiveValObject interface.
 * @param a The primitive value to clone.
 * @returns A clone of the primitive value or the original value if it is not a primitive.
 * @category Primitive
 */
export function clonePrimitive<T extends PrimitiveVal>(a: T): T {
    if (a === null || typeof a !== 'object') return a
    if (Array.isArray(a)) return a.map(clonePrimitive) as T
    if (!a._ui_isPrimitive && typeof a.clone === 'function' && a._ui_primitiveClone !== false) return a.clone() as T
    return a
}

/**
 * Checks if two primitive values are equal.
 *
 * @param a
 * @param b
 * @return true if the values are equal, false otherwise.
 * @category Primitive
 */
export function equalsPrimitive<T extends PrimitiveVal>(a: T, b: T): boolean {
    if (a === null || typeof a !== 'object') return a === b
    if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((v, i)=>equalsPrimitive(v, b[i]))
    if (!a._ui_isPrimitive && typeof a.equals === 'function' && a._ui_primitiveEquals !== false) return !!a.equals(b)
    // direct equality check in case of objects
    return a === b
}

/**
 * Copies a primitive value or an object that implements the PrimitiveValObject interface.
 * If the target is an array, it will copy the values from the source array to the target array.
 * If the target is an object that implements the PrimitiveValObject interface, it will call the copy method on the target.
 * If the target is not an array or an object that implements the PrimitiveValObject interface, it will return a clone of the source value.
 *
 * @param a The target primitive value to copy to.
 * @param b The source primitive value to copy from.
 * @return The target primitive value after copying the source value to it, or a clone of the source value if the target is not an array or an object that implements the PrimitiveValObject interface.
 * @category Primitive
 */
export function copyPrimitive<T extends PrimitiveVal>(a: T, b: T) {
    if (b === null || typeof b !== 'object') return b
    else if (Array.isArray(b)) {
        // const a = target[key]
        if (a && Array.isArray(a)) {
            if (a.length < b.length) {
                for (let i = 0; i < a.length; i++) a[i] = copyPrimitive(a[i], b[i])
                for (let i = a.length; i < b.length; i++) a.push(clonePrimitive(b[i]))
            } else {
                for (let i = 0; i < b.length; i++) a[i] = copyPrimitive(a[i], b[i])
                a.length = b.length
            }
            return a
        } else return clonePrimitive(b)
    } else if (!b._ui_isPrimitive && typeof b.copy === 'function' && b._ui_primitiveCopy !== false) {
        // const a = target[key]
        if (a && typeof a === 'object' && !Array.isArray(a) && !a._ui_isPrimitive && typeof a.copy === 'function' && a._ui_primitiveCopy !== false) {
            a.copy(b)
            return a
        } else return clonePrimitive(b)
    } else return b
}
