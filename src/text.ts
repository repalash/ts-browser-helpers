/**
 * Convert a string to title case
 * @param str - The string to convert
 *
 * @category Text
 */
export function toTitleCase(str: string) {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        }
    )
}

/**
 * Convert a string to camel case
 * @param str - The string to convert
 *
 * @category Text
 */
export function toCamelCase(str: string) {
    return str.replace(
        /([-_][a-z])/ig,
        ($1) => {
            return $1.toUpperCase()
                .replace('-', '')
                .replace('_', '')
        }
    )
}

/**
 * Parse a file extension from a path
 * @param path - The path to parse
 * @returns file extension without the dot (e.g. 'png')
 *
 * @category Text
 */
export function parseFileExtension(path: string): string {
    if (!path || path === '' || path.match(/__MACOSX\/.*\._/)) return '' // todo: proper hidden files checks
    path = path.replace(/\?.*$/, '') // remove query string

    const basename = path.split(/[\\/]/).pop() ?? '',
        pos = basename.lastIndexOf('.')
    if (basename === '' || pos < 1)
        return ''
    return basename.slice(pos + 1)
}

/**
 * Get the filename from a path, similar to PHP's basename()
 * @param url
 *
 * @category Text
 */
export function getFilenameFromPath(url: string) {
    return url.substring(url.lastIndexOf('/') + 1)
}

/**
 * Escape a string for use in a regular expression
 * @param str
 *
 * @category Text
 */
export function escapeRegExp(str: string) {
    return str.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1')
}

/**
 * Replace all occurrences of a string in another string
 * @param str - The string to search
 * @param find - The string to replace
 * @param replace - The replacement string
 *
 * @category Text
 */
export function replaceAll(str: string, find: string, replace: string) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace)
}

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


// /**
//  * String.prototype.replaceAll() polyfill
//  * https://gomakethings.com/how-to-replace-a-section-of-a-string-with-another-one-with-vanilla-js/
//  * @author Chris Ferdinandi
//  * @license MIT
//  */
// if (!String.prototype.replaceAll) {
//     String.prototype.replaceAll = function(str, newStr) {
//
//         // If a regex pattern
//         if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
//             return this.replace(str, newStr as any)
//         }
//
//         // If a string
//         return this.replace(new RegExp(str, 'g'), newStr as any)
//
//     }
// }
