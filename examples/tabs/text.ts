import {
    absMax,
    clearBit,
    escapeHtml,
    getFilenameFromPath,
    getUrlQueryParam,
    longestCommonPrefix,
    now,
    parseFileExtension,
    pathJoin,
    replaceAll,
    setUrlQueryParam,
    timeout,
    toCamelCase,
    toTitleCase,
    updateBit,
    uuidV4,
} from 'ts-browser-helpers'
import {defineTab} from '../lib/demo'
import source from './text.ts?raw'

export default defineTab({
    id: 'text',
    title: 'Text, math, time, URL',
    intro: 'Small functions for strings, numbers and bits, waiting, and the query of the page URL.',
    source,
    setup(tab) {
        tab.demo('case', 'toTitleCase, toCamelCase, escapeHtml', 'Type a text and see each function\'s result.', ({input, log, clear}) => {
            // #region case
            const text = input('Text', 'hello big-world_of <b>"helpers"</b>')
            const update = () => {
                clear()
                log(`toTitleCase:  ${toTitleCase(text.value)}`)
                log(`toCamelCase:  ${toCamelCase(text.value)}`)
                log(`escapeHtml:   ${escapeHtml(text.value)}`)
            }
            text.oninput = update
            update()
            // #endregion
        })

        tab.demo('paths', 'parseFileExtension and getFilenameFromPath', 'The extension without the dot (a query string is ignored, a hidden file like <code>.env</code> has none), and the part after the last <code>/</code>.', ({input, log, clear}) => {
            // #region paths
            const path = input('Path or URL', 'https://example.com/models/chair.v2.glb?raw=1')
            const update = () => {
                clear()
                log(`parseFileExtension:  "${parseFileExtension(path.value)}"`)
                log(`getFilenameFromPath: "${getFilenameFromPath(path.value)}"`)
            }
            path.oninput = update
            update()
            // #endregion
        })

        tab.demo('replace', 'replaceAll', 'Replaces each copy of a string. The text to find is plain text, not a regular expression, so <code>.</code> or <code>*</code> mean themselves.', ({input, button, log}) => {
            // #region replace
            const text = input('Text', 'a.b.c (a*b)')
            const find = input('Find', '.')
            const replace = input('Replace with', ' / ')
            button('Replace', () => log(replaceAll(text.value, find.value, replace.value)))
            // #endregion
        })

        tab.demo('prefix', 'longestCommonPrefix', 'The longest start that all the strings share, one per line.', ({textarea, button, log}) => {
            // #region prefix
            const lines = textarea('Strings', 'textures/wood_color.jpg\ntextures/wood_normal.jpg\ntextures/wood_rough.jpg', 3)
            button('Find', () => {
                const words = lines.value.split('\n').filter(Boolean)
                log(`"${longestCommonPrefix([...words])}"`) // a copy: it sorts the array it gets
            })
            // #endregion
        })

        tab.demo('uuid', 'uuidV4', 'A random UUID (version 4), from <code>crypto.getRandomValues</code>.', ({button, log}) => {
            // #region uuid
            button('New UUID', () => log(uuidV4()))
            // #endregion
        })

        tab.demo('math', 'absMax, updateBit, clearBit', '<code>absMax</code> returns the number that is larger without its sign. <code>updateBit</code> sets a bit to 0 or 1, <code>clearBit</code> sets it to 0; bit 0 is the lowest.', ({root, input, button, log}) => {
            // #region math
            const a = input('a', '-7', 'number')
            const b = input('b', '5', 'number')
            button('absMax(a, b)', () => log(`absMax(${a.value}, ${b.value}) = ${absMax(Number(a.value), Number(b.value))}`))

            let flags = 0b00000101
            const bits = document.createElement('div')
            bits.className = 'bits'
            root.append(bits)
            const render = () => {
                bits.replaceChildren(...[7, 6, 5, 4, 3, 2, 1, 0].map(i => {
                    const label = document.createElement('label')
                    const box = Object.assign(document.createElement('input'), {type: 'checkbox', checked: !!(flags & (1 << i))})
                    box.onchange = () => {
                        flags = updateBit(flags, i, box.checked ? 1 : 0)
                        log(`updateBit(.., ${i}, ${box.checked ? 1 : 0}) -> ${flags} (0b${flags.toString(2).padStart(8, '0')})`)
                    }
                    label.append(box, String(i))
                    return label
                }))
            }
            render()
            const clearAll = document.createElement('button')
            clearAll.className = 'btn'
            clearAll.textContent = 'clearBit on each bit'
            clearAll.onclick = () => {
                for (let i = 0; i < 8; i++) flags = clearBit(flags, i)
                render()
                log(`flags = ${flags}`)
            }
            bits.after(clearAll)
            // #endregion
        })

        tab.demo('time', 'timeout and now', '<code>timeout(ms)</code> is a <code>setTimeout</code> you can <code>await</code>. <code>now()</code> is <code>performance.now()</code> where it exists, else <code>Date.now()</code>, in milliseconds.', ({input, button, log}) => {
            // #region time
            const ms = input('Wait (ms)', '500', 'number')
            button('Wait', async(b) => {
                b.disabled = true
                const start = now()
                await timeout(Number(ms.value))
                log(`Waited ${(now() - start).toFixed(1)} ms`)
                b.disabled = false
            })
            // #endregion
        })

        tab.demo('url', 'getUrlQueryParam, setUrlQueryParam, pathJoin', 'Read and set a query parameter of this page\'s URL. Setting one uses <code>history.replaceState</code> (no reload) unless <code>reload</code> is true; <code>null</code> removes it. <code>pathJoin</code> joins parts with a separator.', ({input, button, row, log}) => {
            // #region url
            const name = input('Parameter', 'color')
            const value = input('Value', 'teal')
            button('Get', () => log(`getUrlQueryParam("${name.value}") = ${JSON.stringify(getUrlQueryParam(name.value))}`))
            button('Set', () => {
                setUrlQueryParam(name.value, value.value)
                log(`URL: ${location.href}`)
            })
            button('Remove', () => {
                setUrlQueryParam(name.value, null)
                log(`URL: ${location.href}`)
            })
            row()
            button('pathJoin', () => log(pathJoin(['assets', 'models', 'chair.glb']), '|', pathJoin(['C:', 'Users', 'me'], '\\')))
            // #endregion
        })
    },
})
