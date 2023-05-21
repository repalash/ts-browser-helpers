// from three.js
/**
 * Converts a single color channel from the sRGB color space to linear.
 * @param c - The color channel to be converted.
 * @category Color
 */
export function SRGBToLinear( c: number ): number {
    return ( c < 0.04045 ) ? c * 0.0773993808 : Math.pow( c * 0.9478672986 + 0.0521327014, 2.4 );
}

/**
 * Converts a single color channel from the linear color space to sRGB.
 * @param c - The color channel to be converted.
 * @category Color
 */
export function LinearToSRGB( c: number): number {
    return ( c < 0.0031308 ) ? c * 12.92 : 1.055 * ( Math.pow( c, 0.41666 ) ) - 0.055;
}

/**
 * Creates an image data url from a color string.
 * @param color - color string (css compatible color)
 * @param width - width of the image (default: 1)
 * @param height - height of the image (default: 1)
 * @return {string} - data url
 */
export function colorToDataUrl(color: string, width = 1, height = 1){
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#' + color
    ctx.fillRect(0, 0, width, height)
    const url = canvas.toDataURL()
    canvas.remove()
    return url
}
