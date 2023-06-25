import {AnyFunction} from "./types";
import {Serialization} from './serialization'

/**
 * Decorator that redefines a property with getter and setter, and calls a function when the property is changed.
 * Parameters passed to the function are the property key and the new value.
 * @note - Does not work with "target": "esnext" in tsconfig.json
 * @note - Requires "experimentalDecorators": true in tsconfig.json
 * @todo add example.
 * @param fnKey - use: `<MyClass>.prototype.<myFunction>` or define an arrow function: `(key, value, oldValue) => {}`.
 * @param paramType -
 * if param, the function is called with 3 parameters: `key, value, oldValue`, default for {@link onChange}
 * if object, the function is called with an object parameter: `{key, value, oldValue}`, default for {@link onChange3}
 * if void then no params are passed. {@link onChange2}
 * Default: false.
 *
 * @category Decorators
 */
export function onChange(
    fnKey: string |
        ((key: string, value: any, oldValue: any)=>void)
        //| ((obj:{key: string, value: any, oldValue: any})=>void)
    , paramType: 'param'|'object'|'void' = 'param'): PropertyDecorator {
    if (!fnKey) throw new Error('onChange: fnKey is undefined, make sure the function exists or provide a string')
    return (targetPrototype: any, propertyKey: string|symbol) => {
        Object.defineProperty(targetPrototype, propertyKey, {
            get() {
                return this[`_oc_${propertyKey as string}`]
            },
            set(newVal: any) {
                const oldVal = this[`_oc_${propertyKey as string}`]
                if (oldVal === newVal) return
                this[`_oc_${propertyKey as string}`] = newVal
                const params = paramType === 'param' ? [propertyKey, newVal, oldVal] : paramType === 'object' ? [{key: propertyKey, value: newVal, oldValue: oldVal}] : ''
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
                        else (<AnyFunction>fnKey)(...params as any)
                    }
                }
            },
        })
    }
}

/**
 * Similar to {@link onChange}, but accepts any function and paramType defaults to 'void'. The function is called with no parameters. if 'void'
 * @param fnKey
 * @param paramType
 */
export function onChange2(
    fnKey: string|AnyFunction,
    paramType: 'param'|'object'|'void' = 'void'): PropertyDecorator {
    if (!fnKey) throw new Error('onChange: fnKey is undefined, make sure the function exists or provide a string')
    return onChange(fnKey, paramType)
}

/**
 * Similar to {@link onChange}, but accepts any function and paramType defaults to 'object'. The function is called with an object parameter: `{key, value, oldValue}`.
 * @param fnKey
 * @param paramType
 */
export function onChange3(
    fnKey: string|((obj:{key: string, value: any, oldValue: any})=>void),
    paramType: 'object'|'void' = 'object'): PropertyDecorator {
    if (!fnKey) throw new Error('onChange: fnKey is undefined, make sure the function exists or provide a string')
    return onChange(fnKey as any, paramType)
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
