# Changelog

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
