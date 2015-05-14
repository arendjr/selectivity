'use strict';

var Selectivity = require('./selectivity-base');

var KEY_BACKSPACE = 8;
var KEY_DOWN_ARROW = 40;
var KEY_ENTER = 13;
var KEY_ESCAPE = 27;
var KEY_TAB = 9;
var KEY_UP_ARROW = 38;

/**
 * Search input listener providing keyboard support for navigating the dropdown.
 */
function listener(selectivity, $input) {

    var keydownCanceled = false;
    var closeSubmenu = null;

    /**
     * Moves a dropdown's highlight to the next or previous result item.
     *
     * @param delta Either 1 to move to the next item, or -1 to move to the previous item.
     */
    function moveHighlight(dropdown, delta) {

        function findElementIndex($elements, selector) {
            for (var i = 0, length = $elements.length; i < length; i++) {
                if ($elements.eq(i).is(selector)) {
                    return i;
                }
            }
            return -1;
        }

        function scrollToHighlight() {
            var $el;
            if (dropdown.highlightedResult) {
                var quotedId = Selectivity.quoteCssAttr(dropdown.highlightedResult.id);
                $el = dropdown.$('.selectivity-result-item[data-item-id=' + quotedId + ']');
            } else if (dropdown.loadMoreHighlighted) {
                $el = dropdown.$('.selectivity-load-more');
            } else {
                return; // no highlight to scroll to
            }

            var position = $el.position();
            if (!position) {
                return;
            }

            var top = position.top;
            var elHeight = $el.height();
            var resultsHeight = dropdown.$results.height();
            if (top < 0 || top > resultsHeight - elHeight) {
                top += dropdown.$results.scrollTop();
                dropdown.$results.scrollTop(delta < 0 ? top : top - resultsHeight + elHeight);
            }
        }

        if (dropdown.submenu) {
            moveHighlight(dropdown.submenu, delta);
            return;
        }

        var results = dropdown.results;
        if (results.length) {
            var $results = dropdown.$('.selectivity-result-item');
            var defaultIndex = (delta > 0 ? 0 : $results.length - 1);
            var index = defaultIndex;
            var highlightedResult = dropdown.highlightedResult;
            if (highlightedResult) {
                var quotedId = Selectivity.quoteCssAttr(highlightedResult.id);
                index = findElementIndex($results, '[data-item-id=' + quotedId + ']') + delta;
                if (delta > 0 ? index >= $results.length : index < 0) {
                    if (dropdown.hasMore) {
                        dropdown.highlightLoadMore();
                        scrollToHighlight();
                        return;
                    } else {
                        index = defaultIndex;
                    }
                }
            }

            var result = Selectivity.findNestedById(results,
                                                    selectivity._getItemId($results[index]));
            if (result) {
                dropdown.highlight(result, { delay: !!result.submenu });
                scrollToHighlight();
            }
        }
    }

    function keyHeld(event) {

        var dropdown = selectivity.dropdown;
        if (dropdown) {
            if (event.keyCode === KEY_BACKSPACE) {
                if (!$input.val()) {
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
                    selectivity.close({ keepFocus: false });
                }, 1);
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

    $input.on('keydown', keyHeld).on('keyup', keyReleased);
}

Selectivity.SearchInputListeners.push(listener);
