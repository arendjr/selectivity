'use strict';

var Selectivity = require('../selectivity');
var findResultItem = require('../util/find-result-item');

var KEY_BACKSPACE = 8;
var KEY_DOWN_ARROW = 40;
var KEY_ENTER = 13;
var KEY_ESCAPE = 27;
var KEY_TAB = 9;
var KEY_UP_ARROW = 38;

/**
 * Search input listener providing keyboard support for navigating the dropdown.
 */
function listener(selectivity, input) {

    var keydownCanceled = false;
    var closeSubmenu = null;

    /**
     * Moves a dropdown's highlight to the next or previous result item.
     *
     * @param delta Either 1 to move to the next item, or -1 to move to the previous item.
     */
    function moveHighlight(dropdown, delta) {

        var results = dropdown.results;
        if (!results.length) {
            return;
        }

        var resultItems = dropdown.el.querySelectorAll('.selectivity-result-item');

        function scrollToHighlight() {
            var el;
            if (dropdown.highlightedResult) {
                el = findResultItem(resultItems, dropdown.highlightedResult.id);
            } else if (dropdown.loadMoreHighlighted) {
                el = dropdown.$('.selectivity-load-more');
            }

            if (el) {
                el.scrollIntoView(delta < 0);
            }
        }

        if (dropdown.submenu) {
            moveHighlight(dropdown.submenu, delta);
            return;
        }

        var defaultIndex = (delta > 0 ? 0 : resultItems.length - 1);
        var index = defaultIndex;
        var highlightedResult = dropdown.highlightedResult;
        if (highlightedResult) {
            var highlightedResultItem = findResultItem(resultItems, highlightedResult.id);
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

        var resultItem = resultItems[index];
        var result = Selectivity.findNestedById(results, selectivity.getRelatedItemId(resultItem));
        if (result) {
            dropdown.highlight(result, { delay: !!result.submenu });
            scrollToHighlight();
        }
    }

    function keyHeld(event) {

        var dropdown = selectivity.dropdown;
        if (dropdown) {
            if (event.keyCode === KEY_BACKSPACE) {
                if (!input.value) {
                    if (dropdown.submenu) {
                        var submenu = dropdown.submenu;
                        while (submenu.submenu) {
                            submenu = submenu.submenu;
                        }
                        closeSubmenu = submenu;
                    }

                    event.preventDefault();
                    keydownCanceled = true;
                }
            } else if (event.keyCode === KEY_DOWN_ARROW) {
                moveHighlight(dropdown, 1);
            } else if (event.keyCode === KEY_UP_ARROW) {
                moveHighlight(dropdown, -1);
            } else if (event.keyCode === KEY_TAB) {
                setTimeout(function() {
                    selectivity.close();
                }, 1);
            } else if (event.keyCode === KEY_ENTER) {
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

        var dropdown = selectivity.dropdown;
        if (keydownCanceled) {
            event.preventDefault();
            keydownCanceled = false;

            if (closeSubmenu) {
                closeSubmenu.close();
                selectivity.focus();
                closeSubmenu = null;
            }
        } else if (event.keyCode === KEY_BACKSPACE) {
            if (!dropdown && selectivity.options.allowClear) {
                selectivity.clear();
            }
        } else if (event.keyCode === KEY_ENTER && !event.ctrlKey) {
            if (dropdown) {
                dropdown.selectHighlight();
            } else if (selectivity.options.showDropdown !== false) {
                open();
            }

            event.preventDefault();
        } else if (event.keyCode === KEY_ESCAPE) {
            selectivity.close();

            event.preventDefault();
        } else if (event.keyCode === KEY_DOWN_ARROW || event.keyCode === KEY_UP_ARROW) {
            // handled in keyHeld() because the response feels faster and it works with repeated
            // events if the user holds the key for a longer period
            // still, we issue an open() call here in case the dropdown was not yet open...
            open();

            event.preventDefault();
        } else {
            open();
        }
    }

    input.addEventListener('keydown', keyHeld);
    input.addEventListener('keyup', keyReleased);
}

Selectivity.SearchInputListeners.push(listener);
