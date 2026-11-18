import {
    blobToDataURL,
    downloadBlob,
    downloadFile,
    getFileHandle,
    getNewFileHandle,
    mobileAndTabletCheck,
    readFile,
    uploadFile,
    verifyPermission,
    writeFile,
} from 'ts-browser-helpers'
import {defineTab} from '../lib/demo'
import source from './files.ts?raw'

export default defineTab({
    id: 'files',
    title: 'Files and browser',
    intro: 'Download a blob or a file, pick files to upload, read a blob as a data URL, open and save files on disk with the File System Access API, and check for a phone or tablet.',
    source,
    setup(tab) {
        tab.note('The File System Access pickers (<code>showOpenFilePicker</code>, <code>showSaveFilePicker</code>) work in Chromium browsers (Chrome, Edge) on a normal page, not in a sandboxed frame. Other browsers have no picker; the example says so.')

        tab.demo('download', 'downloadBlob and downloadFile', '<code>downloadBlob(blob, name)</code> saves a blob as a file with a name. <code>downloadFile(file)</code> does it for a <code>File</code>, with its own name by default.', ({textarea, button, log}) => {
            // #region download
            const text = textarea('Text', 'Hello from ts-browser-helpers.\n')
            button('Download as hello.txt', () => {
                downloadBlob(new Blob([text.value], {type: 'text/plain'}), 'hello.txt')
                log('Started the download of hello.txt')
            })
            button('Download a File (JSON)', () => {
                const file = new File([JSON.stringify({text: text.value}, null, 2)], 'note.json', {type: 'application/json'})
                downloadFile(file)
                log(`Started the download of ${file.name}`)
            })
            // #endregion
        })

        tab.demo('upload', 'uploadFile and blobToDataURL', '<code>uploadFile(multiple, directory, accept)</code> opens the file picker and resolves with the files picked. <code>blobToDataURL</code> reads a blob or a file as a data URL.', ({button, checkbox, stage, log}) => {
            // #region upload
            const multiple = checkbox('Multiple', false)
            const imagesOnly = checkbox('Images only', true)
            const out = stage()
            button('Pick files', async() => {
                const files = await uploadFile(multiple.checked, false, imagesOnly.checked ? 'image/*' : undefined)
                for (const file of files) {
                    log(`${file.name}: ${file.size} bytes, ${file.type || 'unknown type'}`)
                    const url = await blobToDataURL(file)
                    if (file.type.startsWith('image/')) out.append(Object.assign(new Image(), {src: url, height: 64}))
                    else log(url.slice(0, 64) + '...')
                }
            }, {primary: true})
            // #endregion
        })

        tab.demo('fs-api', 'File System Access: open, edit, save', '<code>getFileHandle</code> opens the picker for a file to open, <code>getNewFileHandle</code> for a new text file. <code>readFile</code> reads its text, <code>verifyPermission</code> asks to write to it, and <code>writeFile</code> saves to the same file on disk.', ({textarea, button, log}) => {
            // #region fs-api
            const text = textarea('Content', '', 4)
            let handle: FileSystemFileHandle | undefined

            // a closed picker rejects with an AbortError
            const run = (fn: () => Promise<void>) => async() => {
                try {
                    await fn()
                } catch (e) {
                    if ((e as Error)?.name === 'AbortError') log('Cancelled')
                    else throw e
                }
            }
            const buttons = [
                button('Open', run(async() => {
                    handle = await getFileHandle()
                    text.value = await readFile(await handle.getFile())
                    log(`Opened ${handle.name}`)
                })),
                button('Save', run(async() => {
                    handle ??= await getNewFileHandle()
                    if (!await verifyPermission(handle, true)) return log('No permission to write')
                    await writeFile(handle, text.value)
                    log(`Saved ${handle.name}`)
                })),
                button('Save as', run(async() => {
                    handle = await getNewFileHandle()
                    await writeFile(handle, text.value)
                    log(`Saved ${handle.name}`)
                })),
            ]
            if (!('showOpenFilePicker' in window)) {
                buttons.forEach(b => b.disabled = true)
                log('This browser has no File System Access pickers.')
            }
            // #endregion
        })

        tab.demo('mobile', 'mobileAndTabletCheck', 'Tells from the user agent if the browser runs on a phone or a tablet.', ({button, log}) => {
            // #region mobile
            button('Check', () => log(`mobileAndTabletCheck(): ${mobileAndTabletCheck()}`))
            // #endregion
        })
    },
})
