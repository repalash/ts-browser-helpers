import {AnyFunction} from './types'

/**
 * Returns true if the array includes all the elements of the sub array
 * @param arr
 * @param subArr
 */
export function includesAll(arr: any[], subArr: IterableIterator<any>) {
    for (const sub of subArr) {
        if (!arr.includes(sub)) return false
    }
    return true
}

/**
 * like Array.prototype.findIndex but from the end
 * @param arr
 * @param predicate
 */
export function findLastIndex<T>(arr: T[], predicate: (v: T)=>boolean){
    for (let i = arr.length-1; i >= 0; i--) {
        if (predicate(arr[i])) return i
    }
    return -1
}

/**
 * Call f1 before calling f2
 * Sample usage
 * ```
 * const logRender = ()=>console.log('render')
 * obj.render = wrapThisFunction(logRender, obj.beforeRender)
 * // now calling obj.beforeRender(), will log 'render' and then call obj.beforeRender()
 * ```
 * @param f1
 * @param f2
 */
export function wrapThisFunction<T extends AnyFunction, T2>(f1: ()=>void, f2?: T): T {
    return function(this: T2, ...args: Parameters<T>) {
        f1()
        return f2 && f2.call(this, ...args)
    } as T
}

/**
 * Call f1 with the same params as f2 before calling f2
 * Sample usage
 * ```
 * const logRender = ()=>console.log('render')
 * obj.render = wrapThisFunction(logRender, obj.beforeRender)
 * // now calling obj.beforeRender(), will log 'render' and then call obj.beforeRender()
 * ```
 * @param f1
 * @param f2
 */
export function wrapThisFunction2<T extends AnyFunction, T2>(f1: T, f2?: T): T {
    return function(this: T2, ...args: Parameters<T>) {
        f1(...args)
        return f2 && f2.call(this, ...args)
    } as T
}
