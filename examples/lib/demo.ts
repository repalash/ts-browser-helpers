import {htmlDialogWrapper} from 'ts-browser-helpers'
import indexSource from '../../src/index.ts?raw'
import {highlight, usedNames} from './highlight'

/**
 * What an example gets to build its controls and print its results. The examples on the page show these names without
 * an import: they are helpers of the page, not of the library.
 */
export interface DemoContext {
    /** The live area of the example; the controls go in rows in it */
    root: HTMLElement
    /** A button in the current row. An error thrown or rejected in `onClick` is printed in the output. */
    button(label: string, onClick: (button: HTMLButtonElement) => unknown, options?: {primary?: boolean}): HTMLButtonElement
    /** A labelled text field in the current row (or another input `type`) */
    input(label: string, value?: string, type?: string): HTMLInputElement
    /** A labelled text area on its own row */
    textarea(label: string, value?: string, rows?: number): HTMLTextAreaElement
    /** A labelled checkbox in the current row */
    checkbox(label: string, checked?: boolean): HTMLInputElement
    /** A labelled select in the current row */
    select(label: string, options: string[], value?: string): HTMLSelectElement
    /** Starts a new row for the next controls */
    row(): HTMLElement
    /** A box on its own row for a picture, a canvas or a moving thing */
    stage(className?: string): HTMLDivElement
    /** Adds a line to the output under the controls. A string prints as it is, anything else as JSON. */
    log(...values: unknown[]): void
    /** Empties the output */
    clear(): void
}

export type DemoFn = (ctx: DemoContext) => void | Promise<void>

export interface TabContext {
    /** An example: a card with its title, a short description, the live area and the code of its region in the source */
    demo(id: string, title: string, description: string, fn: DemoFn): void
    /** A short note in the tab (HTML) */
    note(html: string): void
}

export interface TabDef {
    id: string
    title: string
    /** One line under the tab title (HTML) */
    intro: string
    /** The raw source of the tab's module (`./x.ts?raw`), where each example's code is between `// #region <id>` and `// #endregion` */
    source: string
    setup(tab: TabContext): void
}

export function defineTab(def: TabDef): TabDef {
    return def
}

/** All names exported by the library (values and types), from src/index.ts; `true` for a type */
const libExports = (() => {
    const map = new Map<string, boolean>()
    for (const m of indexSource.matchAll(/export\s+(type\s+)?\{([^}]*)\}/g)) {
        const allTypes = !!m[1]
        for (let part of m[2].split(',')) {
            part = part.trim()
            if (!part) continue
            const isType = allTypes || part.startsWith('type ')
            const name = part.replace(/^type\s+/, '').split(/\s+as\s+/).pop()!.trim()
            map.set(name, isType)
        }
    }
    return map
})()

/** The import line of the names of the library that the code uses */
export function importLine(code: string) {
    const names = usedNames(code).filter(n => libExports.has(n))
    if (!names.length) return ''
    const list = names.map(n => libExports.get(n) ? 'type ' + n : n).join(', ')
    return `import {${list}} from 'ts-browser-helpers'`
}

/** The code between `// #region id` and `// #endregion` in the source, without its common indent */
export function extractRegion(source: string, id: string): string {
    const lines = source.split('\n')
    const start = lines.findIndex(l => l.trim() === '// #region ' + id)
    if (start < 0) throw new Error(`examples: no "// #region ${id}" in the source of the tab`)
    const end = lines.findIndex((l, i) => i > start && l.trim() === '// #endregion')
    if (end < 0) throw new Error(`examples: no "// #endregion" after "// #region ${id}"`)
    const body = lines.slice(start + 1, end)
    const indent = Math.min(...body.filter(l => l.trim()).map(l => l.length - l.trimStart().length))
    return body.map(l => l.slice(indent)).join('\n').trim()
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
    const e = document.createElement(tag)
    if (className) e.className = className
    if (text !== undefined) e.textContent = text
    return e
}

function format(v: unknown): string {
    if (typeof v === 'string') return v
    if (v === undefined) return 'undefined'
    if (typeof v === 'function') return `[function ${v.name || 'anonymous'}]`
    if (ArrayBuffer.isView(v) && !(v instanceof DataView)) return `${v.constructor.name}(${(v as any).length}) [${Array.from(v as any).join(', ')}]`
    try {
        return JSON.stringify(v, (_k, x) => typeof x === 'number' && !isFinite(x) ? String(x) : x, 2) ?? String(v)
    } catch {
        return String(v)
    }
}

let fieldCount = 0

function makeContext(live: HTMLElement, output: HTMLElement): DemoContext {
    let row: HTMLElement | null = null
    const currentRow = () => row ?? ctx.row()
    const labelled = (label: string, control: HTMLElement, wide = false) => {
        const id = 'f' + ++fieldCount
        control.id = id
        const wrap = el('div', 'field' + (wide ? ' field-wide' : ''))
        const l = el('label', '', label)
        l.htmlFor = id
        wrap.append(l, control)
        return wrap
    }
    const print = (cls: string, text: string) => {
        output.hidden = false
        const line = el('div', cls, text)
        output.appendChild(line)
        while (output.childElementCount > 40) output.firstElementChild!.remove()
        output.scrollTop = output.scrollHeight
    }
    const ctx: DemoContext = {
        root: live,
        row() {
            row = el('div', 'controls')
            live.appendChild(row)
            return row
        },
        button(label, onClick, options) {
            const b = el('button', 'btn' + (options?.primary ? ' btn-primary' : ''), label)
            b.type = 'button'
            b.addEventListener('click', async() => {
                try {
                    await onClick(b)
                } catch (e) {
                    print('out-error', 'Error: ' + ((e as Error)?.message ?? String(e)))
                    console.error(e)
                }
            })
            currentRow().appendChild(b)
            return b
        },
        input(label, value = '', type = 'text') {
            const i = el('input', 'text-input')
            i.type = type
            i.value = value
            currentRow().appendChild(labelled(label, i, type === 'text'))
            return i
        },
        textarea(label, value = '', rows = 3) {
            const t = el('textarea', 'text-input')
            t.rows = rows
            t.value = value
            t.spellcheck = false
            ctx.row().appendChild(labelled(label, t, true))
            row = null
            return t
        },
        checkbox(label, checked = false) {
            const i = el('input')
            i.type = 'checkbox'
            i.checked = checked
            const id = 'f' + ++fieldCount
            i.id = id
            const wrap = el('label', 'check')
            wrap.htmlFor = id
            wrap.append(i, document.createTextNode(label))
            currentRow().appendChild(wrap)
            return i
        },
        select(label, options, value) {
            const s = el('select', 'text-input')
            for (const o of options) s.appendChild(new Option(o, o))
            if (value !== undefined) s.value = value
            currentRow().appendChild(labelled(label, s))
            return s
        },
        stage(className) {
            const s = el('div', 'stage' + (className ? ' ' + className : ''))
            live.appendChild(s)
            row = null
            return s
        },
        log(...values) {
            print('out-line', values.map(format).join(' '))
        },
        clear() {
            output.textContent = ''
            output.hidden = true
        },
    }
    return ctx
}

async function copyText(text: string) {
    try {
        await navigator.clipboard.writeText(text)
        htmlDialogWrapper.toast?.('Copied')
    } catch {
        htmlDialogWrapper.toast?.('Could not copy: the page has no clipboard access', {kind: 'warn'})
    }
}

/** A code block with a Copy button */
export function codeBlock(code: string, label = 'Code') {
    const wrap = el('div', 'code')
    const bar = el('div', 'code-bar')
    bar.append(el('span', 'code-label', label))
    const copy = el('button', 'btn btn-quiet btn-small', 'Copy')
    copy.type = 'button'
    copy.addEventListener('click', () => copyText(code))
    bar.append(copy)
    const pre = el('pre')
    const c = el('code')
    c.innerHTML = highlight(code)
    pre.appendChild(c)
    wrap.append(bar, pre)
    return wrap
}

/** Makes the content of a tab: its title, intro and examples */
export function renderTab(def: TabDef, container: HTMLElement) {
    const head = el('div', 'tab-head')
    const h = el('h2', '', def.title)
    const intro = el('p', 'intro')
    intro.innerHTML = def.intro
    head.append(h, intro)
    container.appendChild(head)

    const tab: TabContext = {
        note(html) {
            const n = el('p', 'note')
            n.innerHTML = html
            container.appendChild(n)
        },
        demo(id, title, description, fn) {
            const card = el('section', 'demo')
            card.id = def.id + '-' + id
            card.setAttribute('aria-labelledby', card.id + '-title')
            const info = el('div', 'demo-info')
            const t = el('h3', '', title)
            t.id = card.id + '-title'
            const d = el('p', 'demo-desc')
            d.innerHTML = description
            info.append(t, d)

            const live = el('div', 'demo-live')
            const output = el('div', 'out')
            output.setAttribute('aria-live', 'polite')
            output.hidden = true
            const body = el('div', 'demo-body')
            const left = el('div', 'demo-left')
            left.append(live, output)

            const code = extractRegion(def.source, id)
            const imports = importLine(code)
            body.append(left, codeBlock(imports ? imports + '\n\n' + code : code))
            card.append(info, body)
            container.appendChild(card)

            const ctx = makeContext(live, output)
            Promise.resolve().then(() => fn(ctx)).catch(e => {
                ctx.log('Error: ' + ((e as Error)?.message ?? String(e)))
                console.error(e)
            })
        },
    }
    def.setup(tab)
}
