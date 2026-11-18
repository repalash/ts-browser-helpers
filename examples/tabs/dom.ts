import {
    createCanvasElement,
    createDiv,
    createImage,
    createStyles,
    css,
    glsl,
    html,
    prettyScrollbar,
    setInnerHTMLWithScripts,
    svgUrl,
    timeout,
} from 'ts-browser-helpers'
import {defineTab} from '../lib/demo'
import source from './dom.ts?raw'

export default defineTab({
    id: 'dom',
    title: 'DOM and styles',
    intro: 'Short ways to make elements, styles and images, template tags for CSS, HTML, GLSL and SVG, and a way to set HTML that runs its scripts.',
    source,
    setup(tab) {
        tab.demo('create-div', 'createDiv', 'Makes an element (a <code>div</code>, or another <code>elementTag</code>) with HTML, an id and classes. <code>addToBody: false</code> leaves it out of the page, to add it where you want.', ({button, stage, log}) => {
            // #region create-div
            const out = stage()
            let n = 0
            button('Add a div', () => {
                const div = createDiv({innerHTML: `Item <b>${++n}</b>`, classList: ['dark-chip'], addToBody: false})
                div.style.color = 'white'
                out.append(div)
                log(div.outerHTML)
            })
            button('Add a button', () => {
                const b = createDiv({innerHTML: 'A button', elementTag: 'button', classList: ['btn'], addToBody: false})
                b.onclick = () => log('Clicked the made button')
                out.append(b)
            })
            // #endregion
        })

        tab.demo('create-styles', 'createStyles and css', 'Adds a <code>&lt;style&gt;</code> with the CSS to the head (or another element) and returns it, so you can remove it later. The <code>css</code> tag only marks the string for an editor\'s syntax colours.', ({button, stage, log}) => {
            // #region create-styles
            const box = stage()
            box.innerHTML = '<span class="demo-styled">Styled by a style element</span>'
            let style: HTMLStyleElement | undefined
            button('Add the style', () => {
                style?.remove()
                style = createStyles(css`
                    .demo-styled { padding: 4px 8px; border: 2px solid #16a34a; border-radius: 6px; color: #16a34a; }
                `)
                log(`Added <style> to ${style.parentElement?.tagName.toLowerCase()}`)
            })
            button('Remove it', () => {
                style?.remove()
                style = undefined
                log('Removed the style')
            })
            // #endregion
        })

        tab.demo('create-image', 'createImage and svgUrl', '<code>createImage(url)</code> loads an image and resolves when it is ready. <code>svgUrl</code> turns SVG markup into a data URL for an image or for CSS.', ({button, stage, log}) => {
            // #region create-image
            const out = stage()
            button('Load an SVG image', async() => {
                const hue = Math.round(Math.random() * 360)
                const url = svgUrl`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="hsl(${hue}, 70%, 50%)"/>
                </svg>`
                const img = await createImage(url)
                out.append(img)
                log(`Loaded ${img.naturalWidth}x${img.naturalHeight}: ${url.slice(0, 60)}...`)
            })
            // #endregion
        })

        tab.demo('canvas', 'createCanvasElement', 'A <code>&lt;canvas&gt;</code> with <code>display: block</code>.', ({button, stage}) => {
            // #region canvas
            const out = stage()
            button('Draw', () => {
                const canvas = createCanvasElement()
                canvas.width = 160
                canvas.height = 64
                const ctx = canvas.getContext('2d')!
                for (let i = 0; i < 8; i++) {
                    ctx.fillStyle = `hsl(${i * 45}, 65%, 55%)`
                    ctx.fillRect(i * 20, 64 - (i + 1) * 8, 18, (i + 1) * 8)
                }
                out.replaceChildren(canvas)
            })
            // #endregion
        })

        tab.demo('scrollbar', 'prettyScrollbar', 'Adds a style for thin, quiet scroll bars (WebKit and Chromium) to the page, and returns it. Try the boxes before and after.', ({button, stage, log}) => {
            // #region scrollbar
            const out = stage()
            out.innerHTML = '<div class="scroll-box"><div>' + 'Scroll me sideways and down. '.repeat(12) + '</div></div>'
            let style: HTMLStyleElement | undefined
            button('Use pretty scroll bars', () => {
                style ??= prettyScrollbar()
                log('Added the scroll bar style to the page')
            })
            button('Remove', () => {
                style?.remove()
                style = undefined
                log('Removed it')
            })
            // #endregion
        })

        tab.demo('tags', 'Template tags', '<code>css</code>, <code>html</code> and <code>glsl</code> return the same string as a template string without a tag, with the values put in. They are there for the syntax colours of an editor.', ({button, log}) => {
            // #region tags
            button('Run', () => {
                const color = 'teal'
                log(css`.title { color: ${color}; }`)
                log(html`<p class="title">Hello</p>`)
                log(glsl`void main() { gl_FragColor = vec4(1.0); }`)
                log(`Same as without a tag: ${html`<b>${color}</b>\n` === `<b>${color}</b>\n`}`)
            })
            // #endregion
        })

        tab.demo('inner-html', 'setInnerHTMLWithScripts', 'Sets the HTML of an element. Scripts added with <code>innerHTML</code> do not run; this function makes each <code>&lt;script&gt;</code> again so it runs, and resolves after them.', ({button, stage, log}) => {
            // #region inner-html
            const out = stage()
            button('Set HTML with a script', async() => {
                const markup = html`
                    <p id="from-html">Set by HTML.</p>
                    <script>document.getElementById('from-html').textContent += ' The script ran.'</script>
                `
                const done = setInnerHTMLWithScripts(out, markup).then(() => 'resolved')
                const result = await Promise.race([done, timeout(1000).then(() => 'did not resolve within 1 s')])
                log(`${result}; the text is now: "${out.querySelector('#from-html')?.textContent}"`)
            })
            // #endregion
        })
    },
})
