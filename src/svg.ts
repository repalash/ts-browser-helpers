import {ImageCanvasOptions, imageToCanvas} from "./image";
import {createImage} from "./dom";
import {replaceAll} from "./text";

/**
 * Converts an SVG string to data url. This is useful for creating images from SVGs, or using SVGs in CSS.
 * To use put in template string: `url(${svgUrl\`<svg>...</svg>\`})`
 * @param strings - template strings
 * @param rest - template values
 *
 * @example
 * ```ts
 * const url = svgUrl\`
 *  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"> ... </svg>
 * \`
 * console.log(url) // data:image/svg+xml;charset=UTF-8,...
 * ```
 *
 * @category Template Literals
 */
export const svgUrl = (strings: any, ...rest: any[]) => {
    let encoded = String.raw({raw: strings} as TemplateStringsArray, ...rest)
    encoded = replaceAll(encoded, '%', '%25')
    encoded = replaceAll(encoded, '> <', '><') // normalise spaces elements
    encoded = replaceAll(encoded, '; }', ';}') // normalise spaces css
    encoded = replaceAll(encoded, '<', '%3c')
    encoded = replaceAll(encoded, '>', '%3e')
    encoded = replaceAll(encoded, '"', '\'')
    encoded = replaceAll(encoded, '#', '%23') // needed for ie and firefox
    encoded = replaceAll(encoded, '{', '%7b')
    encoded = replaceAll(encoded, '}', '%7d')
    encoded = replaceAll(encoded, '|', '%7c')
    encoded = replaceAll(encoded, '^', '%5e')
    encoded = replaceAll(encoded, '`', '%60')
    encoded = replaceAll(encoded, '@', '%40')
    encoded = replaceAll(encoded, '&', '&amp;')
    encoded = replaceAll(encoded, '\n', '%0A')

    return 'data:image/svg+xml;charset=UTF-8,' + encoded
}

/**
 * Returns a data url for a 16x16 svg rectangle with the given color.
 * @param c - color
 *
 * @category SVGs
 */
export const makeColorSvg = (c: string): string => {
    return `data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='16' height='16' fill='%23${c}'/%3E%3C/svg%3E%0A`
}
/**
 * Returns a data url for a 16x16 svg circle with the given color.
 * @param c - color
 *
 * @category SVGs
 */
export const makeColorSvgCircle = (c: string): string => {
    return `data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='8' cy='8' r='7' fill='%23${c}'/%3E%3C/svg%3E%0A`
}

/**
 * Returns a data url for a svg with the given text.
 * @param text
 *
 * @category SVGs
 */
export const makeTextSvg = (text: string): string => {
    return `data:image/svg+xml,%3Csvg viewBox='0 0 80 14' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext style='font: 8px "Roboto Mono", "Source Code Pro", Menlo, Courier, monospace; fill: white;' x='9' y='9'%3E${text}%3C/text%3E%3C/svg%3E%0A`
}

/**
 * Renders an SVG to a canvas.
 * @param svgDataUrl - data url of the svg. Can be created with {@link svgUrl}
 * @param options - options
 *
 * @category SVGs
 */
export const svgToCanvas = async(svgDataUrl: string, options: ImageCanvasOptions): Promise<HTMLCanvasElement> => {
    const image = await createImage(svgDataUrl)
    return imageToCanvas(image, options)
}

/**
 * Renders an SVG to a png data url.
 * @param svgDataUrl - data url of the svg. Can be created with {@link svgUrl}
 * @param options - options
 *
 * @category SVGs
 */
export const svgToPng = async(svgDataUrl: string, options: ImageCanvasOptions): Promise<string> => {
    return await svgToCanvas(svgDataUrl, options).then(canvas => canvas.toDataURL('image/png'))
}
