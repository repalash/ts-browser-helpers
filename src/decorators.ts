import {AnyFunction} from "./types";
import {Serialization} from './serialization'
import {objectHasOwn} from './object'
import {FnCaller} from './fnCaller'

/**
 * Decorator that redefines a property with getter and setter, and calls a function when the property is changed.
 * Parameters passed to the function are the property key and the new value.
 * @note - Does not work with "target": "esnext" in tsconfig.json
 * @note - Requires "experimentalDecorators": true in tsconfig.json
 * @todo add example.
 * @param fnKey - use: `<MyClass>.prototype.<myFunction>` or define an arrow function: `(key, value, oldValue, target) => {}`.
 * @param paramType -
 * if param, the function is called with 4 parameters: `key, value, oldValue, target`, default for {@link onChange}
 * if object, the function is called with an object parameter: `{key, value, oldValue, target}`, default for {@link onChange3}
 * if void then no params are passed. {@link onChange2}
 * Default: false.
 *
 * @category Decorators
 */
export function onChange<TTarget = any>(
    fnKey: string |
        ((key: string, value: any, oldValue: any, target: TTarget)=>void) // target is this
        //| ((obj:{key: string, value: any, oldValue: any, target: TTarget})=>void)
    , paramType: 'param'|'object'|'void' = 'param'): PropertyDecorator {
    if (!fnKey) throw new Error('onChange: fnKey is undefined, make sure the function exists or provide a string')
    return (targetPrototype: any, propertyKey: string|symbol, descriptor?: TypedPropertyDescriptor<any>) => {
        const prop = {
            get() {
                return this[`_oc_${propertyKey as string}`]
            },
            set(newVal: any) {
                const oldVal = this[`_oc_${propertyKey as string}`]
                if (oldVal === newVal) return
                this[`_oc_${propertyKey as string}`] = newVal
                const params = paramType === 'param' ? [propertyKey, newVal, oldVal, this] : paramType === 'object' ? [{key: propertyKey, value: newVal, oldValue: oldVal, target: this}] : []
                if (typeof fnKey === 'string') this[fnKey]?.call(this, ...params)
                else if (typeof fnKey === 'function') FnCaller.callFunction(fnKey, this, params)
            },
        } as any
        // babel(in react-scripts) - https://github.com/babel/babel/blob/909ed3473968c2ccd75f89e17c37ef4771cc3ff8/packages/babel-helpers/src/helpers/applyDecoratedDescriptor.ts#L11
        if (descriptor) {
            if (objectHasOwn(descriptor, 'value')) delete descriptor.value
            if (objectHasOwn(descriptor, 'writable')) delete descriptor.writable
            if (objectHasOwn(descriptor, 'initializer')) delete (descriptor as any).initializer
            return Object.assign(descriptor, prop)
        }
        Object.defineProperty(targetPrototype, propertyKey, prop)
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
 * Similar to {@link onChange}, but accepts any function and paramType defaults to 'object'. The function is called with an object parameter: `{key, value, oldValue, target}`.
 * @param fnKey
 * @param paramType
 */
export function onChange3<TTarget = any>(
    fnKey: string|((obj:{key: string, value: any, oldValue: any, target: TTarget})=>void),
    paramType: 'object'|'void' = 'object'): PropertyDecorator {
    if (!fnKey) throw new Error('onChange: fnKey is undefined, make sure the function exists or provide a string')
    return onChange<TTarget>(fnKey as any, paramType)
}

/**
 * Similar to onChange but dispatches an event instead of calling a function.
 * Requires `dispatchEvent` to be defined on the target.
 * @param eventName - The name of the event to dispatch. Default: '`key`-changed'
 */
export function onChangeDispatchEvent(eventName?: string): PropertyDecorator {
    return onChange((key, value, oldValue, target) => {
        if(!target.dispatchEvent) throw new Error('onChangeDispatchEvent: target does not have dispatchEvent')
        target.dispatchEvent({type: eventName || `${key}-changed`, detail: {key, value, oldValue}})
    }, 'param')
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
            // noinspection JSUnusedGlobalSymbols
            readonly serializableClassId = id
            // static DataInConstructor = false // if constructor is equivalent to fromJSON, see LUTCubeTextureWrapper.
        }
        Serialization.SerializableClasses.set(id, constructor)
        return constructor
    }
}
