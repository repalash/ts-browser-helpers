# Changelog

## 0.23.0

### Features

- **JSUndoManager:** change listeners, `addChangeListener(listener)` (it returns a function that removes it) and `removeChangeListener`. A listener is told after each change: a step recorded (also by `execute`, after the command ran), undone, redone or replaced, the stack reset, the limit changed, or the manager enabled or disabled (`JSUndoManagerChangeEvent`: `action`, `manager`, `command`). Nothing is told when nothing changed. An undo history list or the enabled state of a menu listens here instead of reading `stack` and `sp`.
- **JSUndoManager:** a `label` on a command (`Move`, `Extrude`) for an undo history, and `labelOf(command)`, which also reads the label of a preset command.
- **JSUndoManager hot keys:** `unbindHotKeys()` and `hotKeysBound`, at any time and without clearing the stack; `bindHotKeys()` again does nothing. `shouldHandleKeyEvent(e)` (can be overridden) leaves a key typed in a text field or an editable element to it, also inside an open shadow root; a focused checkbox, radio button, range, color input or button does not stop the keys. The keys follow the letter printed on the key (on a QWERTZ keyboard, Ctrl + the key labelled Z undoes; before, it redid), and its place when it types no Latin letter. Cmd+Z and Cmd+Shift+Z on a Mac; Ctrl+Z, Ctrl+Shift+Z and Ctrl+Y elsewhere; a key with Alt (AltGr on Windows types letters) or the other modifier is left alone. With a step to undo or redo, the key's default (the browser's own undo) is prevented; with none, the key is left to the page.

### Fixes

- **JSUndoManager:** `execute()` recorded `undefined` instead of the command.
- **JSUndoManager:** an option that is not given keeps its default; `new JSUndoManager({})` had no limit, and undo stopped working after the first step.
- **recordUndoCommand:** an edit after an undo is a new step and clears what could be redone; it was merged into the step at the pointer, so the undone steps could still be redone on top of it.
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
