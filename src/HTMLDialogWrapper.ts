import {IDialogWrapper} from './DialogWrapper'
import cssTemplate from './HTMLDialogWrapper.css?inline'

let styleElement: HTMLStyleElement | null = null
const alertTemplate = (props: {
    title?: string
    message: string
    ok?: string
})=>`
<div class="dialog-content">
    ${props.title ? `<div class="dialog-title">${props.title}</div>` : ''}
    <div class="dialog-message">${props.message}</div>
</div>
<div class="dialog-footer">
    ${props.ok && `<button class="dialog-button dialog-ok">${props.ok}</button>` || ''}
</div>
`
const confirmTemplate = (props: {
    title?: string
    message: string
    ok?: string
    cancel?: string
})=>`
<div class="dialog-content">
    ${props.title ? `<div class="dialog-title">${props.title}</div>` : ''}
    <div class="dialog-message">${props.message}</div>
</div>
<div class="dialog-footer">
    ${props.cancel && `<button class="dialog-button dialog-cancel">${props.cancel}</button>` || ''}
    ${props.ok && `<button class="dialog-button dialog-ok">${props.ok}</button>` || ''}
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
    ${props.title ? `<div class="dialog-title">${props.title}</div>` : ''}
    <div class="dialog-message">${props.message}</div>
    <input class="dialog-input" type="text" value="${props.defaultValue ?? ''}" style="margin-top:0.5rem;"/>
</div>
<div class="dialog-footer">
    ${props.cancel && `<button class="dialog-button dialog-cancel">${props.cancel}</button>` || ''}
    ${props.ok && `<button class="dialog-button dialog-ok">${props.ok}</button>` || ''}
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

/**
 * A custom dialog wrapper that uses HTML elements to create alert, prompt, and confirm dialogs inspired by radix/shadcn style. Provides API similar to the browser's built-in dialog methods, with better UI and more options.
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
}
