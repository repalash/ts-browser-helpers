import {ImageCanvasOptions, imageToCanvas} from "./image";
import {createImage} from "./dom";

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
