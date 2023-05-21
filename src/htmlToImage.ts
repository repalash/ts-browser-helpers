import {ImageCanvasOptions} from "./image";
import {svgToCanvas, svgToPng} from "./svg";
import {blobToDataURL} from "./browser";
import {svgUrl} from './template-literals'

const defaultDownloader = async(url: string) => blobToDataURL(await (await fetch(url)).blob())

/**
 * Find all URLs in svg, download them and replace with the URL in svg with the downloaded data URLs.
 * @param str - string
 * @param downloader - function to download the URLs in svg and return the data URL
 *
 * @category HTML To Image
 */
export async function embedUrlRefs(str: string, downloader: (p: string) => Promise<string> = defaultDownloader) {
    const urls = str.match(/(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)/g)
    if (urls) {
        for (const url of urls) {
            const dataUrl = await downloader(url)
            str = str.replace(url, dataUrl)
        }
    }
    return str
}

/**
 * Embeds an HTML string into a svg tag and converts to svg string or svg as data url
 * @param html - HTML string
 * @param style - CSS string
 * @param width - width of the svg
 * @param height - height of the svg
 * @param toDataUrl - if true, returns a data url, otherwise returns the svg string
 * @returns svg string or svg as data url
 *
 * @category HTML To Image
 */
export function htmlToSvg(html: string, style: string, {width, height}: {width: number, height: number}, toDataUrl = true): string {
    const s = `
<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
    ${style}
    </style>
    <foreignObject x="0" y="0" width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="height: 100%; width: 100%; position: absolute: top:0; left:0">
            ${html}
        </div>
    </foreignObject>
</svg>
    `
    return toDataUrl ? svgUrl(s) : s
}

/**
 * Renders an HTML string to a canvas. This is done by first embedding HTML into a svg and then rendering the svg to a canvas.
 * @param html - HTML string
 * @param style - CSS string
 * @param options - options for rendering the canvas
 * @returns HTML canvas element
 *
 * @category HTML To Image
 */
export async function htmlToCanvas(html: string, style: string, options: ImageCanvasOptions): Promise<HTMLCanvasElement> {
    const svg = htmlToSvg(html, style, options)
    return await svgToCanvas(svg, options)
}

/**
 * Renders an HTML string to a png. This is done by first embedding HTML into a svg and then rendering the svg to a png.
 * @param html
 * @param style
 * @param options
 * @returns png as data url
 *
 * @category HTML To Image
 */
export async function htmlToPng(html: string, style: string, options: ImageCanvasOptions): Promise<string> {
    const svg = htmlToSvg(html, style, options)
    return await svgToPng(svg, options)
}
