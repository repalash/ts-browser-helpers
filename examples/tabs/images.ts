import {
    canvasFlipY,
    colorToDataUrl,
    createImage,
    htmlToCanvas,
    htmlToPng,
    htmlToSvg,
    imageToCanvas,
    isWebpExportSupported,
    LinearToSRGB,
    makeColorSvg,
    makeColorSvgCircle,
    makeTextSvg,
    SRGBToLinear,
    svgToPng,
    svgUrl,
} from 'ts-browser-helpers'
import {defineTab} from '../lib/demo'
import source from './images.ts?raw'

export default defineTab({
    id: 'images',
    title: 'Images and SVG',
    intro: 'Render HTML and SVG to images, make small SVG icons and colour images, copy and flip images on a canvas, and convert colours between sRGB and linear.',
    source,
    setup(tab) {
        tab.demo('html-to-image', 'htmlToSvg, htmlToPng, htmlToCanvas', 'Puts HTML and CSS in an SVG <code>&lt;foreignObject&gt;</code>, then draws that to a PNG or a canvas. The HTML can only use inline styles and the CSS given, not the page\'s, and no outside images or fonts.', ({textarea, button, stage, log}) => {
            // #region html-to-image
            const markup = textarea('HTML', '<div class="card"><h1>Hello</h1><p>Rendered from HTML</p></div>', 2)
            const style = textarea('CSS', '.card { font: 14px sans-serif; padding: 12px; background: #fde68a; border-radius: 8px; }\nh1 { margin: 0; font-size: 20px; }', 2)
            const out = stage()
            const size = {width: 240, height: 100}
            button('htmlToSvg', () => {
                const svg = htmlToSvg(markup.value, style.value, size, false) // false: the SVG text, not a data URL
                log(svg.trim().slice(0, 200) + '...')
            })
            button('htmlToPng', async() => {
                const png = await htmlToPng(markup.value, style.value, size)
                const img = new Image()
                img.src = png
                out.replaceChildren(img)
                log(`PNG data URL, ${png.length} characters`)
            }, {primary: true})
            button('htmlToCanvas (2x)', async() => {
                const canvas = await htmlToCanvas(markup.value, style.value, {...size, scale: 2, backgroundColor: 'white'})
                canvas.style.width = size.width + 'px'
                out.replaceChildren(canvas)
                log(`Canvas ${canvas.width}x${canvas.height}`)
            })
            // #endregion
        })

        tab.demo('svg-icons', 'makeTextSvg, makeColorSvg, makeColorSvgCircle', 'Data URLs of small SVGs: a line of white text, and a 16 px square or circle of a colour. The colour is hex without the <code>#</code>.', ({input, button, stage}) => {
            // #region svg-icons
            const color = input('Colour (hex, no #)', 'e11d48')
            const text = input('Text', 'v0.24.0')
            const out = stage()
            const img = (src: string, cls = '') => Object.assign(new Image(), {src, className: cls})
            button('Make', () => {
                const chip = document.createElement('span')
                chip.className = 'dark-chip'
                chip.append(img(makeTextSvg(text.value)))
                chip.firstElementChild!.setAttribute('height', '24')
                out.replaceChildren(img(makeColorSvg(color.value)), img(makeColorSvgCircle(color.value)), chip)
            })
            // #endregion
        })

        tab.demo('svg-to-png', 'svgToPng', 'Draws an SVG data URL to a canvas of the size given, and returns a PNG data URL.', ({button, stage, log}) => {
            // #region svg-to-png
            const out = stage()
            button('Convert', async() => {
                const svg = svgUrl`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
                    <rect width="10" height="10" fill="#0a6fd6"/><path d="M2 5l2 2 4-4" stroke="white" fill="none"/>
                </svg>`
                const png = await svgToPng(svg, {width: 64, height: 64})
                out.replaceChildren(Object.assign(new Image(), {src: png}))
                log(png.slice(0, 40) + '...')
            })
            // #endregion
        })

        tab.demo('canvas', 'imageToCanvas and canvasFlipY', '<code>imageToCanvas</code> draws an image into a new canvas of a size, with an optional background and scale. <code>canvasFlipY</code> returns a new canvas, upside down: for pixels read from WebGL.', ({button, stage}) => {
            // #region canvas
            const out = stage()
            button('Draw and flip', async() => {
                const image = await createImage(svgUrl`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                    <path d="M32 6 L58 58 H6 Z" fill="#e11d48"/>
                </svg>`)
                const canvas = imageToCanvas(image, {width: 64, height: 64, backgroundColor: '#fde68a'})
                const flipped = canvasFlipY(canvas)
                out.replaceChildren(canvas, flipped)
            })
            // #endregion
        })

        tab.demo('color', 'colorToDataUrl and isWebpExportSupported', '<code>colorToDataUrl</code> makes a PNG of one colour (hex without the <code>#</code>, as for the SVG icons). <code>isWebpExportSupported</code> tells if <code>canvas.toDataURL(\'image/webp\')</code> makes a WebP.', ({input, button, stage, log}) => {
            // #region color
            const color = input('Colour (hex, no #)', '7c3aed')
            const out = stage()
            button('Make', () => {
                const url = colorToDataUrl(color.value, 48, 48)
                const img = Object.assign(new Image(), {src: url, className: 'swatch'})
                out.replaceChildren(img)
                log(url.slice(0, 48) + '...')
            })
            button('WebP export?', () => log(`isWebpExportSupported(): ${isWebpExportSupported()}`))
            // #endregion
        })

        tab.demo('srgb', 'SRGBToLinear and LinearToSRGB', 'Convert one colour channel (0 to 1) between sRGB, as in CSS, and linear light, as used for lighting maths. The two swatches use the same number, once as sRGB and once as linear.', ({input, stage, log, clear}) => {
            // #region srgb
            const value = input('sRGB value', '', 'range')
            Object.assign(value, {min: '0', max: '1', step: '0.01', value: '0.5'}) // the value after its range
            const out = stage()
            const a = document.createElement('div'), b = document.createElement('div')
            a.className = b.className = 'swatch'
            out.append(a, b)
            const update = () => {
                const srgb = Number(value.value)
                const linear = SRGBToLinear(srgb)
                const grey = (v: number) => `rgb(${[v, v, v].map(c => Math.round(c * 255)).join(',')})`
                a.style.background = grey(srgb)
                b.style.background = grey(linear)
                clear()
                log(`SRGBToLinear(${srgb}) = ${linear.toFixed(4)}, back: LinearToSRGB(${linear.toFixed(4)}) = ${LinearToSRGB(linear).toFixed(4)}`)
            }
            value.oninput = update
            update()
            // #endregion
        })
    },
})
