/**
 * Type for any function
 */
export type AnyFunction = (...args: any[]) => any

/**
 * Type for any object
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
 *
 */
export type Class<T> = new (...args: any[]) => T

/**
 * Partial record type with all keys optional
 * @example
 * ```ts
 * type T = PartialRecord<'a' | 'b', number>
 * // T = {a?: number, b?: number}
 * ```
 */
export type PartialRecord<K extends keyof any, T> = {
    [P in K]?: T;
}

/**
 * Partial pick type with all keys optional
 */
export type PartialPick<T, K extends keyof T> = Partial<T> & Pick<T, K>

/**
 * Extract keys from object that are strings
 */
export type StringKeyOf<T extends any> = Extract<keyof T, string>

/**
 * FoF - Short for `Function of` - a generic type for function
 */
export type Fof<TReturn extends any = void, TArgs extends any[] = []> = (...args: TArgs) => TReturn

/**
 * Type for a value of type T or a function that returns a value of type T
 */
export type ValOrFunc<T, TArgs extends any[] = any[]> = T | Fof<T, TArgs>

/**
 * Type for a value of type T or an array of values of type T
 */
export type ValOrArr<T> = T | T[]

/**
 * Type for a value of type `T|undefined` or an array of values of type `T|undefined`
 */
export type ValOrArrOp<T> = ValOrArr<T | undefined>

/**
 * Disposable interface for objects that can be disposed. Has a single method `dispose`
 */
export interface IDisposable {
    dispose(): void;
}

/**
 * Interface for objects that can be serialized to JSON, with to and from JSON methods
 */
export interface IJSONSerializable<T=any, TM=any> {
    toJSON(meta?: TM): T;
    fromJSON(data: T, meta?: TM): this|null|Promise<this|null>;
}

