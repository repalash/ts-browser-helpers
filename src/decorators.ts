import {AnyFunction} from "./types";

/**
 * Decorator that redefines a property with getter and setter, and calls a function when the property is changed.
 * @todo add example.
 * @param fnKey - use: \<MyClass\>.prototype.\<myFunction\>
 * @category Decorators
 */
export function onChange(fnKey: string|AnyFunction): PropertyDecorator {
    if (!fnKey) throw new Error('onChange: fnKey is undefined, make sure the function exists or provide a string')
    return (targetPrototype: any, propertyKey: string|symbol) => {
        let temp: any = targetPrototype[propertyKey]
        Object.defineProperty(targetPrototype, propertyKey, {
            get() {
                return temp
            },
            set(newVal: any) {
                if (temp === newVal) return
                temp = newVal
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
