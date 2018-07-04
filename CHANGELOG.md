# CHANGELOG

## 3.1.0

-   Add `data` property to `change` events.
-   Don't crash when some, but not all, result items have children (#227, thanks to @watsab).
-   Trim template results to avoid runtime errors (#210, thanks to @darekzak).
-   Fix clear button if item text is too long (#211, thanks to @dmarchuk).
-   React: Don't use `componentWillReceiveProps()` for forward compatibility with React 17.

## 3.0.6

-   Fix updating event listeners after initial render in React API.
-   Rerender single-value inputs when their enabled state changes.

## 3.0.5

-   Fix issue where dropdown is hard to close on Firefox (#194, thanks to @dmarchuk).
-   Filter selected children from results (#201, thanks to @ne0guille).
-   Move submenu up if otherwise it would fall below the fold of the page.

## 3.0.4

-   Improved compatibility with React 15.5 (no more deprecation warnings).
-   Improved HTML5 validation support (#188, thanks to @r4z3c).
-   Fix #180: Existing selection highlighted by default on multi-value search results (thanks to
    @ahamid).
-   Fix #177: Don't close dropdown when clicking scrollbar (thanks to @JEkedorff).

## 3.0.3

-   Fix issue when a single-value Selectivity input is reset to null throught the React API.

## 3.0.2

-   Fix #161: React API: Value should be re-set when the items change.

## 3.0.1

-   Fix #156: Don't crash when unsubscribing from non-subscribed event listener.
-   Don't rely on `react-dom-server` in React templates plugin to avoid issues with React 15.4.
-   Fix #158: Expose Selectivity object as `$.Selectivity` in jQuery builds.
-   Yarn compatibility: Get rid of peerDependencies.

## 3.0.0

-   Made jQuery dependency fully optional.
    -   As a result, all callbacks that received jQuery containers as argument(s) now receive plain
        DOM nodes instead.
-   Added optional React API.
-   Fix #128: Added NPM package.
-   Added options:
    -   `shouldOpenSubmenu()` - Callback that determines whether a submenu should be opened.
    -   `selectable` - Allows to make items unselectable without having to disable them. This is
        mainly useful for items that trigger submenus.
-   Removed Bower and Component support.
-   Moved option validation into its own plugin.
-   Introduced the `"selectivity-change"` event. It's exactly the same as the `"change"` event
    (which is still supported as well) from version 2, but with the added benefit it cannot be
    confused with `"change"` events that bubble from internal `<input>` elements. The React API's
    `onChange` property uses the new event.
-   Rewrote the AJAX plugin:
    -   It now relies on the `fetch()` method for performing AJAX requests. This method is only
        available on modern browsers, so you'll need a polyfill if you want to use this with old
        browsers, unless you're using a jQuery build in which case the `jquery/ajax` plugin can
        provide a shim based on `$.ajax()` (requires jQuery 3.0 or higher).
    -   Please check the documentation for the new options that can be passed.
-   Renamed the option `suppressMouseWheelSelector` to just `suppressWheelSelector`.
-   Renamed the `Selectivity.InputTypes` map to `Selectivity.Inputs`.
-   Removed dist directory from the repository.
-   Improved submenu positioning by automatically opening them on the left-hand side if there's
    insufficient space on the right side.
-   Improve searching behavior with multiple submenus open.
-   Fix #107: Remove the dropdown after timeout to fix "hover" behavior.
-   Fix #136: Update original `<select>` element on "change" instead of "selectivity-selected".
-   Fix: When a Selectivity instance is clicked but its dropdown should not open, at least it should
    be focused.
-   Fix #144: Properly handle dynamically changing readOnly option.
-   Fix #145: Make sure size detection works outside the DOM (thanks to @Rkokie). Also the
    ".selectivity-width-detector" element is no longer needed.
-   Fix #146: Selectivity created from `<select>` element now uses "s9y\_" prefix for its ID (thanks
    to @dr-itz).
-   Fix: Provide correct offset in pagination when results are filtered.

## 2.1.0

-   Implemented `disabled` property on items. When an item is disabled it cannot be selected and by
    default is rendered with grey text.
-   PR #63: Fix problem with `closeOnSelect` behavior.
-   PR #80: Added CSS classes for `hover` and `open` states.
-   Fix #66: Respect `removeOnly` option when set after initialization.
-   Fix #67: Pass `queryOptions` to `url` function in AJAX module.
-   Fix #75: Make sure Enter key doesn't submit forms.
-   Fix #93: Make the rerenderSelection() method public and document that `triggerChange: false`
    doesn't automatically update the UI.
-   Fixed issue where the cursor position was constantly reset when using a tokenizer.
-   Miscellaneous smaller fixes and styling tweaks.

## 2.0.0
