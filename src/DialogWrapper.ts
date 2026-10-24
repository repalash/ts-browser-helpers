export interface IDialogChooseOption {
    id: string
    text: string
    primary?: boolean
}

/**
 * A simple interface for dialog wrappers that can be used to abstract away the browser's built-in dialog methods or custom implementations.
 * @category Browser
 */
export interface IDialogWrapper {
    alert: (message?: string) => Promise<void>
    prompt: (message?: string, _default?: string, cancel?: boolean) => Promise<string | null>
    confirm: (message?: string) => Promise<boolean>
    confirmSync: (message?: string) => boolean
    /**
     * Multi-button dialog. Resolves with the clicked option's `id`, or `null`
     * if the user dismisses it with Escape. The first option flagged
     * `primary: true` (or the first option, when none is flagged) is the
     * default action and is bound to Enter. Optional, so existing
     * implementations of this interface stay valid.
     */
    choose?: (message?: string, options?: IDialogChooseOption[]) => Promise<string | null>
}

/**
 * A dialog wrapper that uses the browser's built-in `window.alert`, `window.prompt`, and `window.confirm` methods.
 * @category Browser
 */
export const windowDialogWrapper: IDialogWrapper = {
    alert: async(message?: string) => window.alert(message),
    prompt: async(message?: string, _default?: string, _?: boolean) => window.prompt(message, _default),
    confirm: async(message?: string) => window.confirm(message),
    confirmSync: (message?: string) => window.confirm(message),
    choose: async(message, options) => {
        if (!options?.length) return null
        const list = options.map((o, i) => `${i + 1}. ${o.text}`).join('\n')
        const ans = window.prompt(`${message ?? ''}\n\n${list}\n\nEnter number:`, '1')
        if (ans === null) return null
        const idx = parseInt(ans.trim(), 10) - 1
        return options[idx]?.id ?? null
    },
}
