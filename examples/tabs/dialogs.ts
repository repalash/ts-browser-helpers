import {htmlDialogWrapper, windowDialogWrapper} from 'ts-browser-helpers'
import {defineTab} from '../lib/demo'
import source from './dialogs.ts?raw'

export default defineTab({
    id: 'dialogs',
    title: 'Dialogs and toasts',
    intro: 'Dialogs that return a promise, and toasts. <code>htmlDialogWrapper</code> draws them in the page; <code>windowDialogWrapper</code> uses the browser\'s own. Both have the same interface, <code>IDialogWrapper</code>, so an app can switch between them.',
    source,
    setup(tab) {
        tab.note('A message like <code>"Title: more text"</code> shows the part before the first colon as the title and the rest under it. A message without a colon is all title.')

        tab.demo('alert', 'Alert', 'One button. The promise resolves when the dialog closes (OK, Enter or Escape).', ({button, log}) => {
            // #region alert
            button('Show alert', async() => {
                await htmlDialogWrapper.alert('Saved: Your changes are stored in this browser.')
                log('The alert closed')
            })
            // #endregion
        })

        tab.demo('prompt', 'Prompt', 'A text field with a default value. Resolves with the text, or <code>null</code> on Cancel or Escape.', ({button, log}) => {
            // #region prompt
            button('Rename', async() => {
                const name = await htmlDialogWrapper.prompt('Rename: Enter a new name for the file', 'Untitled.txt')
                log(name === null ? 'Cancelled' : `New name: ${name}`)
            })
            button('Prompt without Cancel', async() => {
                // the third argument (cancel = false) leaves out Cancel: the dialog stays until OK
                const code = await htmlDialogWrapper.prompt('Code: Enter the code from the email', '', false)
                log(`Code: ${code}`)
            })
            // #endregion
        })

        tab.demo('confirm', 'Confirm', 'Yes or No. Resolves with <code>true</code> or <code>false</code>; Escape is No.', ({button, log}) => {
            // #region confirm
            button('Delete file', async() => {
                const yes = await htmlDialogWrapper.confirm('Delete the file: "notes.txt" will be deleted. You cannot undo this.')
                log(yes ? 'Deleted' : 'Kept the file')
            })
            // #endregion
        })

        tab.demo('choose', 'Choose', 'Several buttons. Resolves with the <code>id</code> of the one clicked, or <code>null</code> on Escape. The <code>primary</code> option is the default for Enter.', ({button, log}) => {
            // #region choose
            button('Close document', async() => {
                const answer = await htmlDialogWrapper.choose!('Save changes?: Your changes will be lost if you do not save them.', [
                    {id: 'cancel', text: 'Cancel'},
                    {id: 'discard', text: 'Don\'t save'},
                    {id: 'save', text: 'Save', primary: true},
                ])
                log(`Answer: ${answer}`)
            })
            // #endregion
        })

        tab.demo('toast', 'Toast', 'A short message that goes away by itself (after 4 s, an error after 8 s) or on a click. It takes no focus. At most 3 show at a time.', ({button, row, log}) => {
            // #region toast
            const toast = htmlDialogWrapper.toast!
            button('Info', () => toast('Link copied'))
            button('Warning', () => toast('The file is large: it may take a while', {kind: 'warn'}))
            button('Error', () => toast('Could not save the file', {kind: 'error'}))
            row()
            button('With an action', () => toast('Upload failed', {
                kind: 'error',
                action: {label: 'Retry', onClick: () => log('Retry clicked')},
                // not shown: an app that wraps toast() can read these to change the message or add an action
                source: 'UploadPanel',
                error: new Error('Network error'),
            }))
            button('Stays until clicked', () => toast('Click to close this message', {duration: 0}))
            // #endregion
        })

        tab.demo('toast-container', 'Toast in an element', 'With <code>container</code>, the toasts show at the top of that element, like the box of a canvas, instead of the page.', ({button, stage}) => {
            // #region toast-container
            const box = stage('toast-box')
            button('Toast in the box', () => {
                htmlDialogWrapper.toast!('Rendered in 12 ms', {container: box})
            })
            // #endregion
        })

        tab.demo('theme', 'Theme with CSS variables', 'The dialogs and toasts read CSS variables, set on <code>:root</code> or <code>body</code>: <code>--dialog-bg</code>, <code>--dialog-fg</code>, <code>--dialog-muted</code>, <code>--dialog-border</code>, <code>--dialog-primary</code>, <code>--dialog-primary-fg</code>, <code>--dialog-secondary</code>, <code>--dialog-hover</code>, <code>--dialog-ring</code>, <code>--dialog-link</code>, <code>--dialog-backdrop</code>, <code>--dialog-radius</code>, <code>--dialog-color-scheme</code>, and for the toasts <code>--dialog-toast-top</code>, <code>--dialog-toast-bg</code>, <code>--dialog-toast-shadow</code>, <code>--dialog-toast-z</code>, <code>--dialog-toast-action</code>. The defaults follow the light or dark mode of the system.', ({button, log}) => {
            // #region theme
            const theme: Record<string, string> = {
                '--dialog-primary': '#16a34a',
                '--dialog-ring': '#16a34a',
                '--dialog-radius': '2px',
                '--dialog-toast-bg': '#14532d',
                '--dialog-toast-action': '#86efac',
            }
            button('Confirm in green', async() => {
                for (const [k, v] of Object.entries(theme)) document.body.style.setProperty(k, v)
                const yes = await htmlDialogWrapper.confirm('Publish: Make the page public?')
                htmlDialogWrapper.toast!(yes ? 'Published' : 'Not published', {
                    action: {label: 'Undo', onClick: () => log('Undo clicked')},
                })
                log(`Answer: ${yes}`)
            })
            button('Reset the theme', () => {
                for (const k of Object.keys(theme)) document.body.style.removeProperty(k)
                log('Back to the default colours')
            })
            // #endregion
        })

        tab.demo('window', 'The browser\'s dialogs', '<code>windowDialogWrapper</code> has the same interface on top of <code>window.alert</code>, <code>confirm</code> and <code>prompt</code>. <code>choose</code> becomes a numbered prompt, and the browser has no toast: it logs to the console. These block the page while open.', ({button, row, log}) => {
            // #region window
            const dialogs = windowDialogWrapper
            button('Alert', async() => {
                await dialogs.alert('Saved')
                log('The alert closed')
            })
            button('Confirm', async() => log(`Answer: ${await dialogs.confirm('Delete the file?')}`))
            button('Prompt', async() => log(`Name: ${await dialogs.prompt('New name', 'Untitled.txt')}`))
            row()
            button('Choose', async() => {
                const answer = await dialogs.choose!('Save changes?', [
                    {id: 'discard', text: 'Don\'t save'},
                    {id: 'save', text: 'Save', primary: true},
                ])
                log(`Answer: ${answer}`)
            })
            button('Toast (console)', () => {
                dialogs.toast!('Link copied') // console.log; a warning or an error uses console.warn or console.error
                log('Logged "Link copied" to the console')
            })
            // #endregion
        })
    },
})
