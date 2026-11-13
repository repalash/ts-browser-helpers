# Changelog

## 0.23.0

### Changes

- **htmlDialogWrapper:** the alert, prompt, confirm and choose dialogs are modal `<dialog>` elements, opened with `showModal()`, not fixed `div`s. While one is open, the page behind it is inert: a click, the focus and Tab stay in the dialog, and an app can check `dialog:modal` to keep its own key shortcuts from acting behind it (threepipe's `viewer.actions` does). The page behind is dimmed (`::backdrop`, `rgba(0, 0, 0, 0.2)`); the dialog keeps its place and look.
  - A close by the browser (Escape that the dialog did not take, the back gesture on Android, a second Escape that Chrome does not let a page stop) does what the dialog's Escape does: the alert resolves, the confirm resolves `false`, the prompt `null`, the choose `null`. A prompt without a Cancel button stays open. Before, such a close could leave the promise waiting.
  - A browser without `showModal` (before Safari 15.4) shows the dialog as a fixed element, as before.

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
