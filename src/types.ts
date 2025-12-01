/**
 * Type for any function
 *
 * @category Type
 */
export type AnyFunction = (...args: any[]) => any

/**
 * Type for any object
 *
 * @category Type
 */
export type AnyOptions = Record<string, any>

/**
 * Generic type for class.
 * @example
 * ```ts
 * interface A {
 *    a: number
 * }
 * class B implements A {
 *  a = 1
 * }
 *
 * // Store class in variable
 * const c: Class<A> = B
 * console.log(typeof c === Class<B>) // true
 *
 * // Passing class to function
 * function f(p: Class<A>) {
 *     console.log(p)
 * }
 * f(B) // ok
 * ```
 *
 * @category Type
 */
export type Class<T> = new (...args: any[]) => T

/**
 * Partial record type with all keys optional
 * @example
 * ```ts
 * type T = PartialRecord<'a' | 'b', number>
 * // T = {a?: number, b?: number}
 * ```
 *
 * @category Type
 */
export type PartialRecord<K extends keyof any, T> = {
    [P in K]?: T;
}

/**
 * Partial pick type with all keys optional
 *
 * @category Type
 */
export type PartialPick<T, K extends keyof T> = Partial<T> & Pick<T, K>

/**
 * Extract keys from object that are strings
 *
 * @category Type
 */
export type StringKeyOf<T extends any> = Extract<keyof T, string>

/**
 * FoF - Short for `Function of` - a generic type for function
 *
 * @category Type
 */
export type Fof<TReturn extends any = void, TArgs extends any[] = []> = (...args: TArgs) => TReturn

/**
 * Type for a value of type T or a function that returns a value of type T
 *
 * @category Type
 */
export type ValOrFunc<T, TArgs extends any[] = any[]> = T | Fof<T, TArgs>

/**
 * Type for a value of type T|undefined or a function that returns a value of type T|undefined
 *
 * @category Type
 */
export type ValOrFuncOp<T, TArgs extends any[] = any[]> = T | Fof<T | undefined, TArgs> | undefined

/**
 * Type for a value of type T or an array of values of type T
 *
 * @category Type
 */
export type ValOrArr<T> = T | T[]

/**
 * Type for a value of type `T|undefined` or an array of values of type `T|undefined`
 *
 * @category Type
 */
export type ValOrArrOp<T> = ValOrArr<T | undefined>

/**
 * Disposable interface for objects that can be disposed. Has a single method `dispose`
 *
 * @category Type
 */
export interface IDisposable {
    dispose(): void;
}

/**
 * Interface for objects that can be serialized to JSON, with to and from JSON methods
 *
 * @category Type
 */
export interface IJSONSerializable<T=any, TM=any> {
    toJSON(meta?: TM, _internal?: boolean): T;
    fromJSON(data: T, meta?: TM, _internal?: boolean): this|null|Promise<this|null>;
}

