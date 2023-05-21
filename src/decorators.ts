import {AnyFunction} from "./types";
import {Serialization} from './serialization'

/**
 * Decorator that redefines a property with getter and setter, and calls a function when the property is changed.
 * Parameters passed to the function are the property key and the new value.
 * @note - Does not work with "target": "esnext" in tsconfig.json
 * @note - Requires "experimentalDecorators": true in tsconfig.json
 * @todo add example.
 * @param fnKey - use: `<MyClass>.prototype.<myFunction>` or define an arrow function: `(key, value) => {}`.
 * @category Decorators
 */
export function onChange(fnKey: string|AnyFunction): PropertyDecorator {
    if (!fnKey) throw new Error('onChange: fnKey is undefined, make sure the function exists or provide a string')
    return (targetPrototype: any, propertyKey: string|symbol) => {
        Object.defineProperty(targetPrototype, propertyKey, {
            get() {
                return this[`_oc_${propertyKey as string}`]
            },
            set(newVal: any) {
                if (this[`_oc_${propertyKey as string}`] === newVal) return
                this[`_oc_${propertyKey as string}`] = newVal
                const params = [propertyKey, newVal]
                if (typeof fnKey === 'string') this[fnKey]?.call(this, ...params)
                else if (typeof fnKey === 'function') {
                    let called = false // to get functions in the prototype chain
                    if (fnKey.name) {
                        let p: any = this as any
                        while (p) {
                            if (p[fnKey.name] === fnKey) {
                                fnKey.call(this, ...params)
                                called = true
                                break
                            }
                            p = Object.getPrototypeOf(p)
                        }
                    }
                    if (!called) {
                        if (fnKey.name && this[fnKey.name].name === `bound ${fnKey.name}`) this[fnKey.name](...params)
                        else fnKey(...params)
                    }
                }
            },
        })
    }
}

/**
 * Decorator to mark a class property as serializable using the {@link Serialization} class.
 * @note - Requires "experimentalDecorators": true in tsconfig.json
 * @param key - The key to use when serializing the property. If not provided, the property name is used (for this make sure the property name is not mangled during minification).
 * @category Decorators
 */
export function serialize(key?: string): PropertyDecorator {
    return (targetPrototype: any, propertyKey: string|symbol) => {
        const type = targetPrototype.constructor
        if (type === Object) throw new Error('All properties in an object are serialized by default')
        if (!Serialization.TypeMap.has(type)) Serialization.TypeMap.set(type, [])

        Serialization.TypeMap.get(type)!.push([key || propertyKey as string, propertyKey as string])
    }
}

/**
 * Decorator to mark a class as serializable using the {@link Serialization} class.
 * @note - Requires "experimentalDecorators": true in tsconfig.json
 * @param id - The id to use when serializing the class. This is used to identify the class when deserializing. Class names can be mangled during minification, so it is required to provide an id.
 */
export function serializable(id: string) {
    return <T extends new (...args: any[]) => any>(constructor: T) =>{
        constructor = class extends constructor {
            readonly serializableClassId = id
            // static DataInConstructor = false // if constructor is equivalent to fromJSON, see LUTCubeTextureWrapper.
        }
        Serialization.SerializableClasses.set(id, constructor)
        return constructor
    }
}
