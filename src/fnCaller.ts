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
        // all this is required because of minification, there fn.name is mangled. To test, minify and mangle with webpack
        if (!FnCaller.methodMap.has(obj)) FnCaller.methodMap.set(obj, new WeakMap<Function, boolean>());
        const methods = FnCaller.methodMap.get(obj)!;
        if (!methods.has(fn)) {
            let p = obj
            while(p){
                const descp = Object.values(Object.getOwnPropertyDescriptors(p)) as PropertyDescriptor[];
                // we need to loop over descriptors and we cannot access the value to check because that will call any getters for no reason
                for(let desc of descp){
                    if (desc.value !== fn) continue;
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
