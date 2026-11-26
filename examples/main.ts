import {htmlDialogWrapper} from 'ts-browser-helpers'
import {renderTab, TabDef} from './lib/demo'
import {buildIndex, codeLine, highlight, search, termsOf} from './lib/search'
import dialogs from './tabs/dialogs'
import undo from './tabs/undo'
import events from './tabs/events'
import pointer from './tabs/pointer'
import dom from './tabs/dom'
import images from './tabs/images'
import files from './tabs/files'
import data from './tabs/data'
import text from './tabs/text'

const tabs: TabDef[] = [dialogs, undo, events, pointer, dom, images, files, data, text]

const nav = document.getElementById('tabs')!
const main = document.getElementById('main')!
const links = new Map<string, HTMLAnchorElement>()
const panels = new Map<string, HTMLElement>()

for (const tab of tabs) {
    const a = document.createElement('a')
    a.href = '#' + tab.id
    a.textContent = tab.title
    a.className = 'tab'
    a.id = 'tab-' + tab.id
    nav.appendChild(a)
    links.set(tab.id, a)
}

/** The tab of the hash: `#dialogs`, or `#dialogs-alert` for one example in it */
function tabOfHash() {
    const hash = decodeURIComponent(location.hash.slice(1))
    return tabs.find(t => hash === t.id || hash.startsWith(t.id + '-')) ?? tabs[0]
}

function show() {
    if (searchInput.value.trim()) clearSearch() // a link to an example or a tab ends the search
    const tab = tabOfHash()
    // a tab is made the first time it shows, so the examples of the other tabs do not run (or animate) before
    let panel = panels.get(tab.id)
    if (!panel) {
        panel = document.createElement('div')
        panel.className = 'panel'
        panel.id = 'panel-' + tab.id
        panel.setAttribute('aria-labelledby', 'tab-' + tab.id)
        main.appendChild(panel)
        panels.set(tab.id, panel)
        renderTab(tab, panel)
    }
    for (const [id, p] of panels) p.hidden = id !== tab.id
    for (const [id, a] of links) {
        if (id === tab.id) a.setAttribute('aria-current', 'page')
        else a.removeAttribute('aria-current')
    }
    links.get(tab.id)!.scrollIntoView({block: 'nearest', inline: 'nearest'})
    document.title = `${tab.title} - ts-browser-helpers examples`
    // a link to one example scrolls to it
    const target = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null
    if (target && target !== panel && panel.contains(target)) target.scrollIntoView()
}

// search: every example of every tab, read from the tabs' sources (no example runs until its tab opens)
const searchInput = document.getElementById('search') as HTMLInputElement
const results = document.createElement('div')
results.className = 'search-results'
results.hidden = true
results.setAttribute('aria-live', 'polite')
main.appendChild(results)
const index = buildIndex(tabs)

function clearSearch() {
    searchInput.value = ''
    results.hidden = true
    results.replaceChildren()
}

function renderResults() {
    const query = searchInput.value.trim()
    if (!query) {
        clearSearch()
        show()
        return
    }
    const terms = termsOf(query)
    const found = search(index, query)
    for (const p of panels.values()) p.hidden = true
    for (const a of links.values()) a.removeAttribute('aria-current')
    results.hidden = false
    const head = document.createElement('p')
    head.className = 'search-count'
    head.textContent = found.length ? `${found.length} example${found.length === 1 ? '' : 's'} for "${query}"` : `No example for "${query}". Try a function name, like toast or timeout.`
    const list = document.createElement('ol')
    list.className = 'search-list'
    for (const {entry} of found) {
        const li = document.createElement('li')
        const a = document.createElement('a')
        a.href = `#${entry.tab.id}-${entry.id}`
        a.className = 'search-result'
        const line = codeLine(entry.code, terms)
        const inText = terms.every(t => (entry.title + ' ' + entry.description + ' ' + entry.tab.title).toLowerCase().includes(t))
        a.innerHTML = `<span class="search-title">${highlight(entry.title, terms)}</span><span class="search-tab">${highlight(entry.tab.title, terms)}</span>` +
            `<span class="search-desc">${highlight(entry.description, terms)}</span>` + (!inText && line ? `<code class="search-code">${highlight(line, terms)}</code>` : '')
        li.appendChild(a)
        list.appendChild(li)
    }
    results.replaceChildren(head, list)
    document.title = `Search: ${query} - ts-browser-helpers examples`
}

// a result for the example the hash already names: no hashchange, so open it here
function openResult(href: string) {
    if (href === decodeURIComponent(location.hash) || href === location.hash) show()
    else location.hash = href
}
results.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('.search-result')
    if (!a) return
    e.preventDefault()
    openResult(a.getAttribute('href')!)
})
// the tab the hash already names, clicked during a search: no hashchange, so leave the search here
nav.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a.tab')
    if (!a || !searchInput.value.trim() || a.getAttribute('href') !== location.hash) return
    e.preventDefault()
    show()
})
searchInput.addEventListener('input', renderResults)
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        clearSearch()
        show()
        searchInput.blur()
    } else if (e.key === 'Enter') {
        const first = results.querySelector<HTMLAnchorElement>('.search-result')
        if (first) openResult(first.getAttribute('href')!)
    }
})
// "/" focuses the search, unless a field (or an example's own keys) has the focus
document.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || t.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return
    e.preventDefault()
    searchInput.focus()
    searchInput.select()
})

window.addEventListener('hashchange', show)
show()

document.getElementById('copy-install')!.addEventListener('click', async() => {
    const cmd = document.getElementById('install-cmd')!.textContent!
    try {
        await navigator.clipboard.writeText(cmd)
        htmlDialogWrapper.toast?.('Copied: ' + cmd)
    } catch {
        htmlDialogWrapper.toast?.('Could not copy: the page has no clipboard access', {kind: 'warn'})
    }
})
