import {AnyFunction} from './types'

/**
 * calls fn.call(obj) or fn() appropriately
 *
 * @category JS Object
 */
export class FnCaller {
    private static methodMap = new WeakMap<object, WeakMap<Function, boolean>>();

    static callFunction(fn: AnyFunction, obj?: Record<string|symbol, any>, params: any[] = []) {
        if (!obj) return fn(...params)
        if (fn.name && obj[fn.name] === fn) return fn.call(obj, ...params)
        // all this is required because of minification, there fn.name is mangled.
        if (!FnCaller.methodMap.has(obj)) FnCaller.methodMap.set(obj, new WeakMap<Function, boolean>());
        const methods = FnCaller.methodMap.get(obj)!;
        if (!methods.has(fn)) {
            let p = obj
            while(p){
                for(let desc of Object.getOwnPropertyNames(p)){
                    if (p[desc] !== fn) continue
                    methods.set(fn, true);
                    return fn.call(obj, ...params);
                }
                p = Object.getPrototypeOf(p);
            }
            methods.set(fn, false);
        }
        return methods.get(fn) ? fn.call(obj, ...params) : fn(...params);
    }
}
