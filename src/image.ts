/**
 * Convert an image {@link ImageBitmap} or {@link CanvasImageSource} to a base64 data url.
 * @param bitmap - image to convert
 * @param maxWidth - maximum width of the image (default: 8192). Images larger than this will be scaled down. This is because strings can get too long.
 * @param detachBitmap - detach the bitmap after conversion (default: false). This will free up bitmap memory if you don't need it anymore.
 *
 * See also {@link imageUrlToImageData}
 *
 * @category Images
 */
export function imageBitmapToBase64(bitmap: ImageBitmap | CanvasImageSource, maxWidth = 8192, detachBitmap = false): string {
    if (!bitmap.width || !bitmap.height) return ''

    // create a canvas
    const canvas = document.createElement('canvas')
    // resize it to the size of our ImageBitmap
    canvas.width = Math.min(maxWidth, bitmap.width as number)
    canvas.height = Math.floor(1.0 + canvas.width * (bitmap.height as number) / (bitmap.width as number))

    // try to get a bitmaprenderer context if same size
    const isBitmap = bitmap instanceof ImageBitmap
    const ctx = isBitmap && detachBitmap && Math.abs(canvas.width - bitmap.width) < 0.5 ? canvas.getContext('bitmaprenderer') : undefined
    if (ctx) {
        // transfer the ImageBitmap to it
        ctx.transferFromImageBitmap(bitmap as ImageBitmap) // less memory but it will detach the bitmap
    } else {
        // in case someone supports createImageBitmap only
        // twice in memory...
        canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    }
    // get it back as a Blob
    const url = canvas.toDataURL('image/png')
    canvas.remove()
    if (isBitmap && detachBitmap) {
        bitmap.close()
    }
    return url
}

/**
 * Downloads/parse the image from an url/data url and draw to an {@link ImageData} object.
 * @param url - url or data url of the image
 * @returns ImageData object
 *
 * See also {@link imageBitmapToBase64}
 *
 * @category Images
 */
export async function imageUrlToImageData(url: string): Promise<ImageData> {
    return new Promise<ImageData>((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => {
            const canvas = document.createElement('canvas')
            canvas.width = image.width
            canvas.height = image.height
            const context = canvas.getContext('2d')
            if (!context) {
                reject(new Error('Could not get 2d context'))
                return
            }
            context.drawImage(image, 0, 0, canvas.width, canvas.height)
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
            resolve(imageData)
            // how do i return this?
            canvas.remove()
            image.remove()
        }, false)
        image.addEventListener('error', (e) => {
            image.remove()
            reject(e)
        }, false)
        image.src = url
    })
}

/**
 * Options for {@link imageToCanvas}.
 */
export interface ImageCanvasOptions{
    width: number,
    height: number,
    backgroundColor?: string,
    scale?: number,
}

/**
 * Converts an HTML image to a canvas. This creates a new canvas element and draws the image on it.
 * @param image - image to convert
 * @param backgroundColor - background color of the canvas
 * @param scale - scale of the canvas
 * @param width - width of the canvas
 * @param height - height of the canvas
 * @returns a new canvas element
 *
 * @category Images
 */
export function imageToCanvas(image: HTMLImageElement, {
    backgroundColor = '',
    scale = 1,
    width = 512,
    height = 512,
}: ImageCanvasOptions) {

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    const ratio = scale

    const canvasWidth = width
    const canvasHeight = height

    canvas.width = canvasWidth * ratio
    canvas.height = canvasHeight * ratio

    canvas.style.width = `${canvasWidth}`
    canvas.style.height = `${canvasHeight}`

    if (backgroundColor?.length > 0) {
        context.fillStyle = backgroundColor
        context.fillRect(0, 0, canvas.width, canvas.height)
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    return canvas
}

/**
 * Converts an {@link ImageData} to a canvas. This creates a new canvas element and draws the image data on it.
 * Image Data can be created from image pixels like from gl.readPixels
 * This can be used to convert a WebGL texture/render target to a canvas/data url.
 * Note: if the output is flipped, use {@link canvasFlipY} after this, like `canvasFlipY(imageDataToCanvas(imageData))`
 * @param data - image data to convert
 */
export function imageDataToCanvas(data: ImageData){
    const canvas = document.createElement('canvas')
    canvas.width = data.width
    canvas.height = data.height
    const context = canvas.getContext('2d')!
    context.putImageData(data, 0, 0)
    return canvas
}


/**
 * Check if the browser supports exporting to webp, with the canvas.toDataURL('image/webp') method.
 */
export function isWebpExportSupported() {
    const elem = document.createElement('canvas')

    if (elem.getContext && elem.getContext('2d')) {
        // was able or not to get WebP representation
        return elem.toDataURL('image/webp').startsWith('data:image/webp')
    } else {
        // very old browser like IE 8, canvas not supported
        return false
    }
}

/**
 * Returns a new canvas with the image/canvas-content flipped vertically.
 * Useful for putImageData(as it does not respect scale and translate) and WebGL textures, which are flipped vertically.
 * @param canvas
 */
export function canvasFlipY(canvas: Exclude<CanvasImageSource,SVGImageElement>): HTMLCanvasElement {
    const newCanvas = document.createElement('canvas')
    newCanvas.width = canvas.width
    newCanvas.height = canvas.height
    const ctx = newCanvas.getContext('2d')
    if (!ctx) throw new Error('Unable to get 2d context')
    ctx.translate(0, canvas.height)
    ctx.scale(1, -1)
    ctx.drawImage(canvas, 0, 0)
    return newCanvas
}
