CHANGELOG
=========

## 2.1.0

- Implemented `disabled` property on items. When an item is disabled it cannot
  be selected and by default is rendered with grey text.
- PR #63: Fix problem with `closeOnSelect` behavior.
- PR #80: Added CSS classes for `hover` and `open` states.
- Fix #66: Respect `removeOnly` option when set after initialization.
- Fix #67: Pass `queryOptions` to `url` function in AJAX module.
- Fix #75: Make sure Enter key doesn't submit forms.
- Fix #93: Make the rerenderSelection() method public and document that
  `triggerChange: false` doesn't automatically update the UI.
- Fixed issue where the cursor position was constantly reset when using a
  tokenizer.
- Miscellaneous smaller fixes and styling tweaks.

## 2.0.0
