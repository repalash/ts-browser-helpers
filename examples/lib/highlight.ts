import {escapeHtml} from 'ts-browser-helpers'

export type TokenType = 'comment' | 'string' | 'number' | 'keyword' | 'ident' | 'decorator' | 'punct' | 'space'

export interface Token {
    type: TokenType
    text: string
}

const KEYWORDS = new Set([
    'abstract', 'as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'default', 'delete', 'do',
    'else', 'export', 'extends', 'false', 'finally', 'for', 'from', 'function', 'get', 'if', 'implements', 'import', 'in',
    'instanceof', 'interface', 'let', 'new', 'null', 'of', 'private', 'protected', 'public', 'readonly', 'return', 'set',
    'static', 'super', 'switch', 'this', 'throw', 'true', 'try', 'type', 'typeof', 'undefined', 'var', 'void', 'while',
])

/**
 * A small tokenizer for the TypeScript of the examples: comments, strings (template strings as one string), numbers,
 * keywords and names. Enough to colour the code and to find the names it uses; not a parser.
 */
export function tokenize(src: string): Token[] {
    const tokens: Token[] = []
    let i = 0
    const push = (type: TokenType, end: number) => {
        tokens.push({type, text: src.slice(i, end)})
        i = end
    }
    while (i < src.length) {
        const c = src[i]
        const next = src[i + 1]
        if (c === '/' && next === '/') {
            const end = src.indexOf('\n', i)
            push('comment', end < 0 ? src.length : end)
        } else if (c === '/' && next === '*') {
            const end = src.indexOf('*/', i + 2)
            push('comment', end < 0 ? src.length : end + 2)
        } else if (c === '"' || c === '\'' || c === '`') {
            let j = i + 1
            let depth = 0 // ${ } of a template string
            while (j < src.length) {
                const d = src[j]
                if (d === '\\') j += 2
                else if (c === '`' && d === '$' && src[j + 1] === '{') { depth++; j += 2 }
                else if (depth > 0 && d === '}') { depth--; j++ }
                else if (d === c && depth === 0) { j++; break }
                else if (d === '\n' && c !== '`') break
                else j++
            }
            push('string', j)
        } else if (/\s/.test(c)) {
            let j = i + 1
            while (j < src.length && /\s/.test(src[j])) j++
            push('space', j)
        } else if (/[0-9]/.test(c)) {
            const m = /^(0x[0-9a-f]+|0b[01]+|[0-9][0-9_]*(\.[0-9]+)?(e[+-]?[0-9]+)?)/i.exec(src.slice(i))
            push('number', i + (m ? m[0].length : 1))
        } else if (c === '@' && /[A-Za-z_$]/.test(next ?? '')) {
            const m = /^@[A-Za-z_$][\w$]*/.exec(src.slice(i))!
            push('decorator', i + m[0].length)
        } else if (/[A-Za-z_$]/.test(c)) {
            const m = /^[A-Za-z_$][\w$]*/.exec(src.slice(i))!
            push(KEYWORDS.has(m[0]) ? 'keyword' : 'ident', i + m[0].length)
        } else {
            push('punct', i + 1)
        }
    }
    return tokens
}

/** The code as HTML, with a span of a class `tok-<type>` around the comments, strings, numbers, keywords and decorators */
export function highlight(src: string): string {
    return tokenize(src).map(t => {
        const text = escapeHtml(t.text)
        return t.type === 'ident' || t.type === 'punct' || t.type === 'space' ? text : `<span class="tok-${t.type}">${text}</span>`
    }).join('')
}

/** The code inside each `${ }` of a template string (with its backticks) */
function templateExpressions(template: string): string[] {
    const exprs: string[] = []
    for (let i = 1; i < template.length - 1; i++) {
        if (template[i] === '\\') { i++; continue }
        if (template[i] !== '$' || template[i + 1] !== '{') continue
        let depth = 1, j = i + 2
        for (; j < template.length && depth > 0; j++) {
            if (template[j] === '{') depth++
            else if (template[j] === '}') depth--
        }
        exprs.push(template.slice(i + 2, j - 1))
        i = j - 1
    }
    return exprs
}

/**
 * The names the code uses as names (not as `.property`, not as a key `{name: ...}`, not inside strings or comments), in
 * order, without repeats. Decorators count without their `@`.
 */
export function usedNames(src: string): string[] {
    const names: string[] = []
    const tokens = tokenize(src).filter(t => t.type !== 'space' && t.type !== 'comment')
    const isPunct = (t: Token | undefined, text: string) => t?.type === 'punct' && t.text === text
    tokens.forEach((t, i) => {
        // the ${ } of a template string are code too
        if (t.type === 'string' && t.text[0] === '`') {
            for (const expr of templateExpressions(t.text)) {
                for (const n of usedNames(expr)) if (!names.includes(n)) names.push(n)
            }
        }
        const prev = tokens[i - 1], next = tokens[i + 1]
        let name = ''
        if (t.type === 'decorator') name = t.text.slice(1)
        else if (t.type === 'ident' && !isPunct(prev, '.')) {
            const isKey = isPunct(next, ':') && (isPunct(prev, '{') || isPunct(prev, ','))
            if (!isKey) name = t.text
        }
        if (name && !names.includes(name)) names.push(name)
    })
    return names
}
