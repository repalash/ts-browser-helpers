import {describe, expect, test} from 'vitest'
import {cssColor} from '../src/color'
import {makeColorSvg, makeColorSvgCircle, makeTextSvg} from '../src/svg'

describe('cssColor', () => {
    test('a hex colour without # gets one; other CSS colours stay', () => {
        expect(cssColor('ff8800')).toBe('#ff8800')
        expect(cssColor('f80')).toBe('#f80')
        expect(cssColor('ff880080')).toBe('#ff880080')
        expect(cssColor('#ff8800')).toBe('#ff8800')
        expect(cssColor('red')).toBe('red')
        expect(cssColor('rgb(255 136 0)')).toBe('rgb(255 136 0)')
    })
})

const svgOf = (url: string) => decodeURIComponent(url.slice('data:image/svg+xml,'.length))

describe('color svgs', () => {
    test('take a hex without # (as before), a hex with # and any CSS colour', () => {
        expect(svgOf(makeColorSvg('ff8800'))).toContain(`fill='#ff8800'`)
        expect(svgOf(makeColorSvg('#ff8800'))).toContain(`fill='#ff8800'`)
        expect(svgOf(makeColorSvgCircle('rgb(255, 136, 0)'))).toContain(`fill='rgb(255, 136, 0)'`)
        expect(svgOf(makeColorSvgCircle('red'))).toContain(`fill='red'`)
    })
    test('a # in the url is encoded (a raw # would end the data url)', () => {
        expect(makeColorSvg('#ff8800')).not.toContain('#')
    })
})

describe('makeTextSvg', () => {
    test('escapes and encodes the text', () => {
        const url = makeTextSvg('a < b & #1')
        expect(url).not.toContain('#')
        expect(svgOf(url)).toContain('a &lt; b &amp; #1')
    })
})
