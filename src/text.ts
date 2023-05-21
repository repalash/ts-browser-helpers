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
 * Replace a string in a text, optionally prepending, appending, replacing all occurrences, and/or calling a callback if the string is not found
 * @param source - The source text
 * @param str - The string to replace
 * @param newStr - The replacement string
 * @param replaceAll - Replace all occurrences
 * @param prepend - Prepend the replacement string
 * @param append - Append the replacement string
 * @param notFoundCallback - Callback to call if the string is not found
 */
export function safeReplaceString(source: string, str: string, newStr: string, {
    replaceAll = false,
    prepend = false,
    append = false,
    notFoundCallback = () => {},
} = {}) {
    if (notFoundCallback) {
        if (!source.includes(str)) {
            notFoundCallback()
            return source
        }
    }
    let s = newStr
    if (prepend) {
        s = newStr + str
    } else if (append) {
        s = str + newStr
    }
    return replaceAll ? source.replaceAll(str, s) : source.replace(str, s)
}

/**
 * Find the longest common prefix in an array of strings
 * https://stackoverflow.com/questions/68702774/longest-common-prefix-in-javascript
 * @param words
 */
export function longestCommonPrefix(words: string[]): string {
    words.sort() // shortest string will be first and the longest last
    return (
        words[0].split('') // converts shortest word to an array of chars
            .map((char, idx) => words[words.length - 1][idx] === char ? char : '\0') // replaces non-matching chars with NULL char
            .join('') // converts back to a string
            .split('\0') // splits the string by NULL characters
            .at(0) // returns the first part
        || ''
    )
}
