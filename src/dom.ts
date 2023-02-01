/**
 * Creates a HTML canvas element.
 * @category DOM
 */
export function createCanvasElement(): HTMLCanvasElement {
    const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas') as HTMLCanvasElement
    canvas.style.display = 'block'
    return canvas
}

/**
 * Creates a HTML div element.
 * @param innerHTML - HTML string to add to the div
 * @param id - id of the div
 * @param classList - list of classes to add to the div
 * @param addToBody - add the div to the body
 * @param elementTag - tag of the element to create (default: div)
 *
 * @category DOM
 */
export function createDiv<T extends keyof HTMLElementTagNameMap = 'div'>({innerHTML = '', id, classList, addToBody = true, elementTag = <T>'div'}: Partial<InnerHTML> & {id?: string, classList?: string[], addToBody?:boolean, elementTag?: T}): HTMLElementTagNameMap[T] {
    const elem = document.createElement(elementTag)
    if (id) elem.id = id
    elem.innerHTML = innerHTML
    if (classList) elem.classList.add(...classList)
    if (addToBody) document.body.appendChild(elem)
    return elem
}

/**
 * Creates a HTML image element from a url.
 * @param url - url of the image
 *
 * @category DOM
 */
export async function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.crossOrigin = 'anonymous'
        img.decoding = 'sync'
        img.src = url
    })
}

/**
 * Creates a HTML style element with the given styles.
 * @param styles - CSS string
 * @param root - root element to add the style to (default: head)
 *
 * @category DOM
 */
export function createStyles(styles: string, root: Element|undefined = document.head) {
    const styleSheet = document.createElement('style')
    styleSheet.type = 'text/css'
    styleSheet.innerText = styles
    root?.appendChild(styleSheet)
    return styleSheet
}

/**
 * Creates a HTML script element from a url.
 * @param url - url of the script
 * @param root - root element to add the script to (default: head)
 *
 * @category DOM
 */
export async function createScriptFromURL(url: string, root = document.head): Promise<HTMLScriptElement> {
    return new Promise<HTMLScriptElement>((resolve, reject) => {
        const s = document.createElement('script')

        s.setAttribute('src', url)
        s.addEventListener('load', ()=>resolve(s))
        s.addEventListener('error', reject)

        root.appendChild(s)
    })
}

