import {escapeHtml} from 'ts-browser-helpers'
import {extractRegion, type TabDef} from './demo'

/** One example, as the search sees it: read from the tab's source, so no example has to run */
export interface SearchEntry {
    tab: TabDef
    id: string
    title: string
    /** The description as plain text (it is HTML in the source) */
    description: string
    code: string
}

/** `tab.demo('id', 'Title', 'Description', ...)` in a tab's source; the strings are single-quoted */
const DEMO_CALL = /tab\.demo\(\s*'((?:[^'\\]|\\.)*)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*,\s*'((?:[^'\\]|\\.)*)'/g

const unescape = (s: string) => s.replace(/\\(.)/g, '$1')

function plainText(html: string) {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent ?? ''
}

/** Every example of every tab */
export function buildIndex(tabs: TabDef[]): SearchEntry[] {
    const entries: SearchEntry[] = []
    for (const tab of tabs) {
        for (const m of tab.source.matchAll(DEMO_CALL)) {
            const id = unescape(m[1])
            entries.push({tab, id, title: unescape(m[2]), description: plainText(unescape(m[3])), code: extractRegion(tab.source, id)})
        }
        // a call this pattern doesn't read (another quote style) would be missing from the results
        const calls = tab.source.split('tab.demo(').length - 1
        if (calls !== entries.filter(e => e.tab === tab).length) console.warn(`examples search: read ${entries.filter(e => e.tab === tab).length} of ${calls} examples in the tab ${tab.id}`)
    }
    return entries
}

export function termsOf(query: string) {
    return query.toLowerCase().split(/\s+/).filter(Boolean)
}

/**
 * The examples that have every word of the query in their title, tab name, description or code, best first: a word in
 * the title counts most, then the tab name, the description, the code.
 */
export function search(index: SearchEntry[], query: string) {
    const terms = termsOf(query)
    if (!terms.length) return []
    const results: {entry: SearchEntry, score: number}[] = []
    for (const entry of index) {
        const title = entry.title.toLowerCase(), tab = entry.tab.title.toLowerCase()
        const description = entry.description.toLowerCase(), code = entry.code.toLowerCase()
        let score = 0
        let all = true
        for (const term of terms) {
            const s = (title.includes(term) ? 10 : 0) + (tab.includes(term) ? 4 : 0) + (description.includes(term) ? 3 : 0) + (code.includes(term) ? 1 : 0)
            if (!s) {
                all = false
                break
            }
            score += s
        }
        if (all) results.push({entry, score})
    }
    return results.sort((a, b) => b.score - a.score)
}

/** The text as HTML, with each word of the query in a `<mark>` */
export function highlight(text: string, terms: string[]) {
    if (!terms.length) return escapeHtml(text)
    const pattern = new RegExp('(' + terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'gi')
    return text.split(pattern).map((part, i) => i % 2 ? `<mark>${escapeHtml(part)}</mark>` : escapeHtml(part)).join('')
}

/** The first line of the code with a word of the query, for a result that matched only in its code */
export function codeLine(code: string, terms: string[]) {
    return code.split('\n').map(l => l.trim()).find(l => terms.some(t => l.toLowerCase().includes(t)))
}
