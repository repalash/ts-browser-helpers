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
