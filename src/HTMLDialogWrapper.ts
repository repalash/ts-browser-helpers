import {IDialogChooseOption, IDialogToastOptions, IDialogWrapper} from './DialogWrapper'
import cssTemplate from './HTMLDialogWrapper.css?inline'
import {escapeHtml} from "./text";

let styleElement: HTMLStyleElement | null = null

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
${props.title ? `<div class="dialog-title">${escapeHtml(props.title)}</div>` : ''}
<div class="dialog-message">${renderMessage(props.message)}</div>
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
    <input class="dialog-input" type="text" value="${props.defaultValue ?? ''}" style="margin-top:0.5rem;"/>
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

function createDialogElement<T extends {title?: string, message: string}>(template: (props: T) => string, {message, ...props}: Omit<T, 'title'>) {
    setupStyle()
    const dialog = document.createElement('div')
    const title = message?.split(':')[0]
    if (title && message) message = message.replace(title + ':', '').trim()
    // @ts-expect-error unk
    dialog.innerHTML = template({...props, message, title})
    dialog.classList.add('dialog-container')
    document.body.appendChild(dialog)
    return dialog
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

function showToast(message: string, {kind = 'info', duration, container = document.body}: IDialogToastOptions = {}) {
    setupStyle()
    const host = toastHost(container)
    const toast = document.createElement('div')
    toast.className = 'dialog-toast dialog-toast-' + kind
    toast.textContent = message
    if (kind === 'error') toast.setAttribute('role', 'alert')
    let timer = 0
    const remove = () => {
        window.clearTimeout(timer)
        toast.remove()
    }
    toast.addEventListener('click', remove)
    toastRemovers.set(toast, remove)
    host.appendChild(toast)
    const time = duration ?? 4000 * (kind === 'error' ? 2 : 1)
    if (time > 0) timer = window.setTimeout(remove, time)
    // not a click: it would reach the click listeners of the page
    while (host.children.length > MAX_TOASTS) {
        const old = host.firstElementChild!
        const removeOld = toastRemovers.get(old)
        if (removeOld) removeOld()
        else old.remove()
    }
}

/**
 * A custom dialog wrapper that uses HTML elements to create alert, prompt, confirm and choose dialogs, and toasts, inspired by radix/shadcn style. Provides API similar to the browser's built-in dialog methods, with better UI and more options.
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
                document.body.removeChild(dialog)
            }
            window.addEventListener('keydown', keydown)
            okButton?.addEventListener('click', () => {
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
                document.body.removeChild(dialog)
            }
            window.addEventListener('keydown', keydown)
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
                document.body.removeChild(dialog)
            }
            window.addEventListener('keydown', keydown)
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
                if (event.key === 'Enter') {
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
                document.body.removeChild(dialog)
            }
            window.addEventListener('keydown', keydown)
            buttons.forEach((b, i) => b.addEventListener('click', () => {
                remove()
                resolve(opts[i].id)
            }))
            buttons[primaryIdx]?.focus()
        })
    },
    toast: showToast,
}
