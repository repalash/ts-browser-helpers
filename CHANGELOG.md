# Changelog

## 0.23.0

### Features

- **JSUndoManager:** change listeners, `addChangeListener(listener)` (it returns a function that removes it) and `removeChangeListener`. A listener is told after each change: a step recorded (also by `execute`, after the command ran), undone, redone or replaced, the stack reset, the limit changed, or the manager enabled or disabled (`JSUndoManagerChangeEvent`: `action`, `manager`, `command`). Nothing is told when nothing changed. An undo history list or the enabled state of a menu listens here instead of reading `stack` and `sp`.
- **JSUndoManager:** a `label` on a command (`Move`, `Extrude`) for an undo history, and `labelOf(command)`, which also reads the label of a preset command.
- **JSUndoManager hot keys:** `unbindHotKeys()` and `hotKeysBound`, at any time and without clearing the stack; `bindHotKeys()` again does nothing. `shouldHandleKeyEvent(e)` (can be overridden) leaves a key typed in a text field or an editable element to it, also inside an open shadow root; a focused checkbox, radio button, range, color input or button does not stop the keys. The keys follow the letter printed on the key (on a QWERTZ keyboard, Ctrl + the key labelled Z undoes; before, it redid), and its place when it types no Latin letter. Cmd+Z and Cmd+Shift+Z on a Mac; Ctrl+Z, Ctrl+Shift+Z and Ctrl+Y elsewhere; a key with Alt (AltGr on Windows types letters) or the other modifier is left alone. With a step to undo or redo, the key's default (the browser's own undo) is prevented; with none, the key is left to the page.

### Changes

- **htmlDialogWrapper:** the alert, prompt, confirm and choose dialogs are modal `<dialog>` elements, opened with `showModal()`, not fixed `div`s. While one is open, the page behind it is inert: a click, the focus and Tab stay in the dialog, and an app can check `dialog:modal` to keep its own key shortcuts from acting behind it (threepipe's `viewer.actions` does). The page behind is dimmed (`::backdrop`).
  - A close by the browser (Escape that the dialog did not take, the back gesture on Android, a second Escape that Chrome does not let a page stop) does what the dialog's Escape does: the alert resolves, the confirm resolves `false`, the prompt `null`, the choose `null`. A prompt without a Cancel button stays open. Before, such a close could leave the promise waiting.
  - A browser without `showModal` (before Safari 15.4) shows the dialog as a fixed element, as before.
- **htmlDialogWrapper design:** the colours of a Figma-like UI: a blue main button (`#0d99ff`), grey second buttons and a grey field without a border, a white card or `#2c2c2c` in the dark mode (was a black main button and outlined second buttons). A dark mode that follows the system (`prefers-color-scheme`), and CSS variables for an app's own theme: `--dialog-bg`, `--dialog-fg`, `--dialog-muted`, `--dialog-border`, `--dialog-primary`, `--dialog-primary-fg`, `--dialog-secondary` (the second buttons and the field), `--dialog-hover`, `--dialog-ring`, `--dialog-link`, `--dialog-backdrop`, `--dialog-radius`, `--dialog-color-scheme` (`light` or `dark`: the scroll bar, the caret and the autofill of the field) (set them on `:root` or `body`; the defaults lose to any app rule). Compact sizes, as in Figma: 16 px padding, 32 px buttons, 13 px text and a 14 px title, up to 380 px wide (was 20 px padding, 36 px buttons, 512 px). A short fade and scale on open (none with `prefers-reduced-motion`). On a phone: the buttons in a column, the main one on top; on a touch screen the buttons and the field are 44 px high; the dialog keeps clear of the notch and the home bar (`safe-area-inset`), and a long message scrolls inside it. Long words wrap. The focus ring shows for the keyboard (`:focus-visible`). The dialogs have `role="alertdialog"`, with the title as the name and the message as the description.

### Fixes

- **JSUndoManager:** `execute()` recorded `undefined` instead of the command.
- **JSUndoManager:** an option that is not given keeps its default; `new JSUndoManager({})` had no limit, and undo stopped working after the first step.
- **recordUndoCommand:** an edit after an undo is a new step and clears what could be redone; it was merged into the step at the pointer, so the undone steps could still be redone on top of it.
- **htmlDialogWrapper:** a message without a colon (like `alert('The file is saved')`) showed twice, as the title and as the text; it is the title now. A colon of a link (`https://`) does not start the text.
- **htmlDialogWrapper:** the default value of `prompt` is escaped; a `"` in it cut the value in the field.
- **htmlDialogWrapper:** links in a message have the link colour; the CSS value was not valid.
- **htmlDialogWrapper:** in `choose`, Enter on a focused button presses that button; before, it always pressed the main one.
- `npm test` also runs the unit tests (`test:unit`, vitest).

## 0.22.0

### Features

- **DialogWrapper:** Add `toast` method: a short message that goes away by itself (like "Link copied" or the error of an action). It does not wait for the person and takes no focus.
  - New `IDialogToastOptions` (`kind`, `duration`, `container`) and `DialogToastKind` (`'info' | 'warn' | 'error'`).
  - `IDialogWrapper.toast` is optional, so existing implementations stay valid.
  - `windowDialogWrapper.toast` writes to the console (`console.log`, `warn` or `error` by kind).
  - `htmlDialogWrapper.toast` shows a small dark chip at the top centre of the page, or of `container` (like the container of a canvas). A warning has an amber dot, an error a red dot and `role="alert"`. It goes after 4 s (an error after 8 s; `duration: 0` keeps it), or on a click. At most 3 show in a container; a new one takes out the oldest. The CSS variables `--dialog-toast-top`, `--dialog-toast-bg`, `--dialog-toast-shadow` and `--dialog-toast-z` change its place and look.

## 0.21.0

### Features

- **DialogWrapper:** Add `choose` method — a multi-button dialog that resolves with the selected option's `id` or `null` on dismiss.
  - New `IDialogChooseOption` interface (`id`, `text`, `primary?`).
  - `IDialogWrapper.choose` is optional to remain backward-compatible with existing implementations.
  - `windowDialogWrapper.choose` provides a numbered-prompt fallback via `window.prompt`.
  - `htmlDialogWrapper.choose` renders styled buttons; the `primary` option gets `dialog-ok` styling and is bound to Enter. Escape dismisses with `null`.

### Fixes

- Type declarations: relative imports in `dist/*.d.ts` now end in `.js` (or `/index.js`), so the types resolve under TypeScript `moduleResolution: node16`/`nodenext`. Before, re-exports such as `./types` were unresolved there (for example `Class` became `any`).

### Styles

- `.dialog-footer` now uses `flex-wrap: wrap` and `row-gap: 8px` (in the `>=40rem` media query) to handle dialogs with many buttons.
