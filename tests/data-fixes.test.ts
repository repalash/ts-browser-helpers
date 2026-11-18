import {describe, expect, test} from 'vitest'
import {Serialization} from '../src/serialization'
import {deepAccessObject} from '../src/object'
import {longestCommonPrefix} from '../src/text'

describe('Serialization', () => {
    test('NaN is saved as "NaN" and loads back as NaN, as Infinity does', () => {
        const saved = JSON.parse(JSON.stringify(Serialization.Serialize({a: NaN, b: Infinity, c: 2})))
        expect(saved).toEqual({a: 'NaN', b: 'Infinity', c: 2})
        const obj = {a: 1, b: 1, c: 1}
        Serialization.Deserialize(saved, obj)
        expect(obj.a).toBeNaN()
        expect(obj.b).toBe(Infinity)
        expect(obj.c).toBe(2)
    })

    test('an array loaded into a longer array is the saved array: the extra items go', () => {
        const obj = {items: ['Milk', 'Bread']}
        Serialization.Deserialize({items: ['Tickets']}, obj)
        expect(obj.items).toEqual(['Tickets'])
        const same = obj.items
        Serialization.Deserialize({items: ['a', 'b', 'c']}, obj)
        expect(obj.items).toBe(same) // the same array, filled in place
        expect(obj.items).toEqual(['a', 'b', 'c'])
    })
})

describe('deepAccessObject', () => {
    test('a path given as an array is not changed', () => {
        const path = ['a', 'b']
        expect(deepAccessObject(path, {a: {b: 3}})).toBe(3)
        expect(path).toEqual(['a', 'b'])
        expect(deepAccessObject(path, {a: {b: 4}})).toBe(4) // the same path again
    })
})

describe('longestCommonPrefix', () => {
    test('keeps the order of the caller\'s array', () => {
        const words = ['interview', 'internet', 'interval']
        expect(longestCommonPrefix(words)).toBe('inter')
        expect(words).toEqual(['interview', 'internet', 'interval'])
    })
    test('an empty list has an empty prefix', () => {
        expect(longestCommonPrefix([])).toBe('')
    })
})
