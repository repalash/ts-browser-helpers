# Changelog

## 0.21.0

### Features

- **DialogWrapper:** Add `choose` method — a multi-button dialog that resolves with the selected option's `id` or `null` on dismiss.
  - New `IDialogChooseOption` interface (`id`, `text`, `primary?`).
  - `IDialogWrapper.choose` is optional to remain backward-compatible with existing implementations.
  - `windowDialogWrapper.choose` provides a numbered-prompt fallback via `window.prompt`.
  - `htmlDialogWrapper.choose` renders styled buttons; the `primary` option gets `dialog-ok` styling and is bound to Enter. Escape dismisses with `null`.

### Styles

- `.dialog-footer` now uses `flex-wrap: wrap` and `row-gap: 8px` (in the `>=40rem` media query) to handle dialogs with many buttons.
