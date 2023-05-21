import {replaceAll} from './text'

/**
 * A template literal tag that does nothing. Useful for syntax highlighting of GLSL code.
 *
 * @example
 * ```js
 * const vertexShader = glsl`
 *    void main() {}
 * `
 * ```
 * @category Template Literals
 */
export const glsl = (strings: any, ...rest: any[]) => String.raw({raw: strings} as TemplateStringsArray, ...rest)

/**
 * A template literal tag that does nothing. Useful for syntax highlighting of CSS code.
 *
 * @example
 * ```js
 * const vertexShader = css`
 *    .my-class {
 *        color: red;
 *    }
 * `
 * ```
 * @category Template Literals
 */
export const css = (strings: any, ...rest: any[]) => String.raw({raw: strings} as TemplateStringsArray, ...rest)

/**
 * A template literal tag that does nothing. Useful for syntax highlighting of HTML code.
 *
 * @example
 * ```js
 * const vertexShader = html`
 *    <div class="my-class">
 *        <p>Some text</p>
 *    </div>
 * `
 * ```
 * @category Template Literals
 */
export const html = (strings: any, ...rest: any[]) => String.raw({raw: strings} as TemplateStringsArray, ...rest)

/**
 * Converts an SVG string to data url. This is useful for creating images from SVGs, or using SVGs in CSS.
 * To use put in template string: `url(${svgUrl\`<svg>...</svg>\`})`
 * @param strings - template strings
 * @param rest - template values
 *
 * @example
 * ```ts
 * const url = svgUrl\`
 *  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"> ... </svg>
 * \`
 * console.log(url) // data:image/svg+xml;charset=UTF-8,...
 * ```
 *
 * @category Template Literals
 */
export const svgUrl = (strings: any, ...rest: any[]) => {
    let encoded = String.raw({raw: strings} as TemplateStringsArray, ...rest)
    encoded = replaceAll(encoded, '%', '%25')
    encoded = replaceAll(encoded, '> <', '><') // normalise spaces elements
    encoded = replaceAll(encoded, '; }', ';}') // normalise spaces css
    encoded = replaceAll(encoded, '<', '%3c')
    encoded = replaceAll(encoded, '>', '%3e')
    encoded = replaceAll(encoded, '"', '\'')
    encoded = replaceAll(encoded, '#', '%23') // needed for ie and firefox
    encoded = replaceAll(encoded, '{', '%7b')
    encoded = replaceAll(encoded, '}', '%7d')
    encoded = replaceAll(encoded, '|', '%7c')
    encoded = replaceAll(encoded, '^', '%5e')
    encoded = replaceAll(encoded, '`', '%60')
    encoded = replaceAll(encoded, '@', '%40')
    encoded = replaceAll(encoded, '&', '&amp;')
    encoded = replaceAll(encoded, '\n', '%0A')

    return 'data:image/svg+xml;charset=UTF-8,' + encoded
}
