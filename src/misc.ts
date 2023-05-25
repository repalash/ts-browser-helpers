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
