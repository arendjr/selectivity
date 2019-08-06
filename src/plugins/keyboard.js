import Selectivity from "../selectivity";
import findResultItem from "../util/find-result-item";
import getKeyCode from "../util/get-key-code";

const KEY_BACKSPACE = 8;
const KEY_DOWN_ARROW = 40;
const KEY_ENTER = 13;
const KEY_ESCAPE = 27;
const KEY_TAB = 9;
const KEY_UP_ARROW = 38;

/**
 * Search input listener providing keyboard support for navigating the dropdown.
 */
function listener(selectivity, input) {
    let keydownCanceled = false;
    let closeSubmenu = null;

    /**
     * Moves a dropdown's highlight to the next or previous result item.
     *
     * @param delta Either 1 to move to the next item, or -1 to move to the previous item.
     */
    function moveHighlight(dropdown, delta) {
        const results = dropdown.results;
        if (!results.length) {
            return;
        }

        const resultItems = [].slice.call(dropdown.el.querySelectorAll(".selectivity-result-item"));

        function scrollToHighlight() {
            let el;
            if (dropdown.highlightedResult) {
                el = findResultItem(resultItems, dropdown.highlightedResult.id);
            } else if (dropdown.loadMoreHighlighted) {
                el = dropdown.$(".selectivity-load-more");
            }

            if (el && el.scrollIntoView) {
                el.scrollIntoView(delta < 0);
            }
        }

        if (dropdown.submenu) {
            moveHighlight(dropdown.submenu, delta);
            return;
        }

        const defaultIndex = delta > 0 ? 0 : resultItems.length - 1;
        let index = defaultIndex;
        const highlightedResult = dropdown.highlightedResult;
        if (highlightedResult) {
            const highlightedResultItem = findResultItem(resultItems, highlightedResult.id);
            index = resultItems.indexOf(highlightedResultItem) + delta;
            if (delta > 0 ? index >= resultItems.length : index < 0) {
                if (dropdown.hasMore) {
                    dropdown.highlightLoadMore();
                    scrollToHighlight();
                    return;
                } else {
                    index = defaultIndex;
                }
            }
        }

        const resultItem = resultItems[index];
        const result = Selectivity.findNestedById(
            results,
            selectivity.getRelatedItemId(resultItem),
        );
        if (result) {
            dropdown.highlight(result, { delay: !!result.submenu });
            scrollToHighlight();
        }
    }

    function keyHeld(event) {
        const dropdown = selectivity.dropdown;
        if (dropdown) {
            const keyCode = getKeyCode(event);
            if (keyCode === KEY_BACKSPACE) {
                if (!input.value) {
                    if (dropdown.submenu) {
                        let submenu = dropdown.submenu;
                        while (submenu.submenu) {
                            submenu = submenu.submenu;
                        }
                        closeSubmenu = submenu;
                    }

                    event.preventDefault();
                    keydownCanceled = true;
                }
            } else if (keyCode === KEY_DOWN_ARROW) {
                moveHighlight(dropdown, 1);
            } else if (keyCode === KEY_UP_ARROW) {
                moveHighlight(dropdown, -1);
            } else if (keyCode === KEY_TAB) {
                setTimeout(function() {
                    selectivity.close();
                }, 1);
            } else if (keyCode === KEY_ENTER) {
                event.preventDefault(); // don't submit forms on keydown
            }
        }
    }

    function keyReleased(event) {
        function open() {
            if (selectivity.options.showDropdown !== false) {
                selectivity.open();
            }
        }

        const dropdown = selectivity.dropdown;
        const keyCode = getKeyCode(event);
        if (keydownCanceled) {
            event.preventDefault();
            keydownCanceled = false;

            if (closeSubmenu) {
                closeSubmenu.close();
                selectivity.focus();
                closeSubmenu = null;
            }
        } else if (keyCode === KEY_BACKSPACE) {
            if (!dropdown && selectivity.options.allowClear) {
                selectivity.clear();
            }
        } else if (keyCode === KEY_ENTER && !event.ctrlKey) {
            if (dropdown) {
                dropdown.selectHighlight();
            } else if (selectivity.options.showDropdown !== false) {
                open();
            }

            event.preventDefault();
        } else if (keyCode === KEY_ESCAPE) {
            selectivity.close();

            event.preventDefault();
        } else if (keyCode === KEY_DOWN_ARROW || keyCode === KEY_UP_ARROW) {
            // handled in keyHeld() because the response feels faster and it works with repeated
            // events if the user holds the key for a longer period
            // still, we issue an open() call here in case the dropdown was not yet open...
            open();

            event.preventDefault();
        } else {
            open();
        }
    }

    input.addEventListener("keydown", keyHeld);
    input.addEventListener("keyup", keyReleased);
}

Selectivity.InputListeners.push(listener);
