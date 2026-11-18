import {htmlDialogWrapper} from 'ts-browser-helpers'
import {renderTab, TabDef} from './lib/demo'
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
