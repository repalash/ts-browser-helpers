import {IDialogChooseOption, IDialogToastOptions, IDialogWrapper} from './DialogWrapper'
import cssTemplate from './HTMLDialogWrapper.css?inline'
import {escapeHtml} from "./text";

let styleElement: HTMLStyleElement | null = null
let dialogCount = 0

// Utility to auto-link URLs in text
function linkify(text: string) {
    // Simple URL regex
    const urlRegex = /((https?:\/\/|www\.)[^\s<]+)/g;
    return text.replace(urlRegex, (url) => {
        let href = url;
        if (!href.startsWith('http')) href = 'https://' + href;
        // Use a span for the visible text to apply ellipsis
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="dialog-link"><span class="dialog-link-text">${escapeHtml(url)}</span></a>`;
    });
}

// Render message with line breaks and links, safely
function renderMessage(message: string) {
    // Escape HTML, then linkify, then replace line breaks
    const escaped = escapeHtml(message);
    const linked = linkify(escaped);
    return linked.replace(/\n/g, '<br>');
}

function titleMessage(props: { title?: string; message: string; ok?: string }) {
    return `
${props.title ? `<div class="dialog-title">${renderMessage(props.title)}</div>` : ''}
${props.message ? `<div class="dialog-message">${renderMessage(props.message)}</div>` : ''}
`;
}

const alertTemplate = (props: {
    title?: string
    message: string
    ok?: string
})=>`
<div class="dialog-content">
${titleMessage(props)}
</div>
<div class="dialog-footer">
    ${props.ok && `<button class="dialog-button dialog-ok">${escapeHtml(props.ok)}</button>` || ''}
</div>
`
const confirmTemplate = (props: {
    title?: string
    message: string
    ok?: string
    cancel?: string
})=>`
<div class="dialog-content">
${titleMessage(props)}
</div>
<div class="dialog-footer">
    ${props.cancel && `<button class="dialog-button dialog-cancel">${escapeHtml(props.cancel)}</button>` || ''}
    ${props.ok && `<button class="dialog-button dialog-ok">${escapeHtml(props.ok)}</button>` || ''}
</div>
`

const promptTemplate = (props: {
    title?: string
    message: string
    ok?: string
    cancel?: string
    defaultValue?: string
})=>`
<div class="dialog-content">
    ${titleMessage(props)}
    <input class="dialog-input" type="text" value="${escapeHtml(props.defaultValue ?? '')}"/>
</div>
<div class="dialog-footer">
    ${props.cancel && `<button class="dialog-button dialog-cancel">${escapeHtml(props.cancel)}</button>` || ''}
    ${props.ok && `<button class="dialog-button dialog-ok">${escapeHtml(props.ok)}</button>` || ''}
</div>
`

const chooseTemplate = (props: {
    title?: string
    message: string
    options: IDialogChooseOption[]
}) => `
<div class="dialog-content">
${titleMessage(props)}
</div>
<div class="dialog-footer">
    ${props.options.map((o, i) => `
        <button class="dialog-button${o.primary ? ' dialog-ok' : ''}" data-i="${i}">
            ${escapeHtml(o.text)}
        </button>
    `).join('')}
</div>
`

function setupStyle() {
    if (styleElement) return
    styleElement = document.createElement('style')
    styleElement.textContent = cssTemplate
    document.head.appendChild(styleElement)
}

/**
 * Makes the dialog and opens it as a modal `<dialog>` (`showModal`): the page behind it is inert, so it takes no focus
 * and no click until the dialog closes. A key can still reach the page (the body, when it has the focus), so an app with
 * key shortcuts checks `dialog:modal`. A browser without `showModal` shows it as a fixed element, without that.
 */
function createDialogElement<T extends {title?: string, message: string}>(template: (props: T) => string, {message, ...props}: Omit<T, 'title'>) {
    setupStyle()
    const dialog = document.createElement('dialog')
    // "Title: message"; a message without a colon is the title only, and a colon of a link (https://) is not a title
    const colon = message.search(/:(?!\/\/)/)
    const title = colon > 0 ? message.slice(0, colon).trim() : message
    message = colon > 0 ? message.slice(colon + 1).trim() : ''
    // @ts-expect-error unk
    dialog.innerHTML = template({...props, message, title})
    dialog.classList.add('dialog-container')
    // an answer is needed: the screen reader reads the title and the message when it opens
    const id = 'dialog-' + ++dialogCount
    dialog.setAttribute('role', 'alertdialog')
    dialog.querySelector('.dialog-title')?.setAttribute('id', id + '-title')
    dialog.querySelector('.dialog-message')?.setAttribute('id', id + '-message')
    dialog.setAttribute('aria-labelledby', id + '-title')
    if (message) dialog.setAttribute('aria-describedby', id + '-message')
    document.body.appendChild(dialog)
    if (typeof dialog.showModal === 'function') dialog.showModal()
    return dialog
}

/**
 * A close of the dialog by the browser: Escape when no key listener of the dialog took it, the back gesture on Android,
 * or a second Escape that Chrome does not let a page stop. The dialog then does what its own Escape does (`cancel`).
 */
function onBrowserClose(dialog: HTMLDialogElement, cancel: () => void) {
    dialog.addEventListener('cancel', (event) => {
        event.preventDefault()
        cancel()
    })
    // still on the page: the browser closed it, not the dialog (it removes itself)
    dialog.addEventListener('close', () => dialog.isConnected && cancel())
}

/** The most toasts in a container at a time; a new one takes out the oldest */
const MAX_TOASTS = 3
/** The element of the toasts of each container */
const toastHosts = new WeakMap<HTMLElement, HTMLDivElement>()
/** The function that removes each toast (and stops its timer) */
const toastRemovers = new WeakMap<Element, () => void>()

function toastHost(container: HTMLElement) {
    let host = toastHosts.get(container)
    if (!host || !host.isConnected) {
        host = document.createElement('div')
        host.className = 'dialog-toasts'
        // fixed on the page, at the top of the element in another one
        if (container !== document.body) host.classList.add('dialog-toasts-in')
        host.setAttribute('aria-live', 'polite')
        container.appendChild(host)
        toastHosts.set(container, host)
    }
    return host
}

function showToast(message: string, {kind = 'info', duration, container = document.body, action}: IDialogToastOptions = {}) {
    setupStyle()
    const host = toastHost(container)
    const toast = document.createElement('div')
    toast.className = 'dialog-toast dialog-toast-' + kind
    const text = document.createElement('span')
    text.textContent = message
    toast.appendChild(text)
    if (kind === 'error') toast.setAttribute('role', 'alert')
    let timer = 0
    const remove = () => {
        window.clearTimeout(timer)
        toast.remove()
    }
    // how long it stays: longer with an action, to reach the button; paused while the pointer is on it or it has the
    // focus (WCAG 2.2.1), and going on with the time it had left
    let left = duration ?? (action ? 8000 : 4000) + (kind === 'error' ? (action ? 2000 : 4000) : 0)
    let since = 0
    const start = () => {
        if (left <= 0 || timer) return
        since = performance.now()
        timer = window.setTimeout(remove, left)
    }
    const pause = () => {
        if (!timer) return
        window.clearTimeout(timer)
        timer = 0
        left = Math.max(1000, left - (performance.now() - since))
    }
    if (action) {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'dialog-toast-action'
        button.textContent = action.label
        button.addEventListener('click', (e) => {
            e.stopPropagation() // the toast's own click only closes it
            remove()
            action.onClick()
        })
        toast.appendChild(button)
    }
    toast.addEventListener('click', remove)
    if (left > 0) {
        // hover and focus each hold the timer; it goes on only when neither does (a focused button under a pointer
        // that leaves keeps it paused)
        let hovered = false, focused = false
        const update = () => hovered || focused ? pause() : start()
        toast.addEventListener('pointerenter', () => { hovered = true; update() })
        toast.addEventListener('pointerleave', () => { hovered = false; update() })
        toast.addEventListener('focusin', () => { focused = true; update() })
        toast.addEventListener('focusout', (e) => {
            focused = toast.contains(e.relatedTarget as Node | null) // focus moving inside the toast keeps it
            update()
        })
    }
    toastRemovers.set(toast, remove)
    if (action) toast.dataset.action = ''
    host.appendChild(toast)
    start()
    // not a click: it would reach the click listeners of the page. The oldest toast without an action goes first, so a
    // newer message doesn't take away a button someone may still want
    while (host.children.length > MAX_TOASTS) {
        const children = Array.from(host.children)
        const old = children.find(c => !(c as HTMLElement).hasAttribute('data-action')) ?? children[0]
        const removeOld = toastRemovers.get(old)
        if (removeOld) removeOld()
        else old.remove()
    }
}

/**
 * A custom dialog wrapper that uses HTML elements to create alert, prompt, confirm and choose dialogs, and toasts, inspired by radix/shadcn style. Provides API similar to the browser's built-in dialog methods, with better UI and more options.
 * The dialogs are modal `<dialog>` elements (`showModal`): while one is open, the page behind it is dimmed and inert (no
 * focus or clicks there), and the keyboard focus stays in the dialog; an app with key shortcuts checks `dialog:modal`. The toasts are not dialogs: they take no focus.
 * @category Browser
 */
export const htmlDialogWrapper: IDialogWrapper = {
    alert: async(message?: string) => {
        const dialog = createDialogElement(alertTemplate, {message: message || 'Alert', ok: 'Okay'})

        return new Promise<void>((resolve) => {
            const okButton = dialog.querySelector('.dialog-ok') as HTMLButtonElement | null
            const keydown = (event: KeyboardEvent) => {
                if (event.key === 'Enter' || event.key === 'Escape') {
                    event.preventDefault()
                    okButton?.click()
                }
            }
            const remove = () => {
                window.removeEventListener('keydown', keydown)
                dialog.remove()
            }
            window.addEventListener('keydown', keydown)
            okButton?.addEventListener('click', () => {
                remove()
                resolve()
            })
            onBrowserClose(dialog, () => {
                remove()
                resolve()
            })
            okButton?.focus()
        })
    },
    prompt: async(message?: string, _default?: string, cancel = true) => {
        const dialog = createDialogElement(promptTemplate, {
            message: message || 'Enter some text',
            ok: 'OK',
            cancel: cancel ? 'Cancel' : undefined,
            defaultValue: _default,
        })

        return new Promise<string|null>((resolve) => {
            const okButton = dialog.querySelector('.dialog-ok') as HTMLButtonElement | null
            const cancelButton = dialog.querySelector('.dialog-cancel') as HTMLButtonElement | null
            const input = dialog.querySelector('.dialog-input')! as HTMLInputElement

            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault()
                    okButton?.click()
                }
            })
            const keydown = (event: KeyboardEvent) => {
                if (event.key === 'Escape' && cancelButton) {
                    event.preventDefault()
                    cancelButton?.click()
                }
            }
            const remove = () => {
                window.removeEventListener('keydown', keydown)
                dialog.remove()
            }
            window.addEventListener('keydown', keydown)
            // without a Cancel button the prompt stays open until OK
            onBrowserClose(dialog, () => cancelButton ? cancelButton.click() : !dialog.open && dialog.showModal())
            okButton?.addEventListener('click', () => {
                const value = input.value
                remove()
                resolve(value)
            })
            cancelButton?.addEventListener('click', () => {
                remove()
                resolve(null)
            })
            input?.focus()
            input?.select()
        })
    },
    confirm: async(message?: string) => {
        const dialog = createDialogElement(confirmTemplate, {message: message || 'Are you sure?', ok: 'Yes', cancel: 'No'})

        return new Promise<boolean>((resolve) => {
            const okButton = dialog.querySelector('.dialog-ok') as HTMLButtonElement | null
            const cancelButton = dialog.querySelector('.dialog-cancel') as HTMLButtonElement | null

            const keydown = (event: KeyboardEvent) => {
                if (event.key === 'Escape' && cancelButton) {
                    event.preventDefault()
                    cancelButton.click()
                }
            }
            const remove = () => {
                window.removeEventListener('keydown', keydown)
                dialog.remove()
            }
            window.addEventListener('keydown', keydown)
            onBrowserClose(dialog, () => {
                remove()
                resolve(false)
            })
            okButton?.addEventListener('click', () => {
                remove()
                resolve(true)
            })
            cancelButton?.addEventListener('click', () => {
                remove()
                resolve(false)
            })
            cancelButton?.focus()
        })
    },
    confirmSync: (message?: string) => window.confirm(message),
    choose: async(message?: string, options?: IDialogChooseOption[]) => {
        const opts = options ?? []
        if (!opts.length) return null
        const dialog = createDialogElement(chooseTemplate, {
            message: message || 'Choose an option',
            options: opts,
        })

        return new Promise<string | null>((resolve) => {
            const buttons = Array.from(
                dialog.querySelectorAll<HTMLButtonElement>('.dialog-button')
            )
            const primaryIdx = Math.max(0, opts.findIndex(o => o.primary))
            const keydown = (event: KeyboardEvent) => {
                // Enter on a button presses that button (the browser does it); elsewhere it presses the main one
                if (event.key === 'Enter' && !buttons.includes(event.target as HTMLButtonElement)) {
                    event.preventDefault()
                    buttons[primaryIdx]?.click()
                } else if (event.key === 'Escape') {
                    event.preventDefault()
                    remove()
                    resolve(null)
                }
            }
            const remove = () => {
                window.removeEventListener('keydown', keydown)
                dialog.remove()
            }
            window.addEventListener('keydown', keydown)
            onBrowserClose(dialog, () => {
                remove()
                resolve(null)
            })
            buttons.forEach((b, i) => b.addEventListener('click', () => {
                remove()
                resolve(opts[i].id)
            }))
            buttons[primaryIdx]?.focus()
        })
    },
    toast: showToast,
}
