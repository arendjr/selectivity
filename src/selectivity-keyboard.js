'use strict';

var Selectivity = require('./selectivity-base');

var KEY_DOWN_ARROW = 40;
var KEY_ENTER = 13;
var KEY_ESCAPE = 27;
var KEY_UP_ARROW = 38;

/**
 * Search input listener providing keyboard support for navigating the dropdown.
 */
function listener(selectivity, $input) {

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
            var el;
            if (dropdown.highlightedResult) {
                var quotedId = Selectivity.quoteCssAttr(dropdown.highlightedResult.id);
                el = dropdown.$('.selectivity-result-item[data-item-id=' + quotedId + ']')[0];
            } else if (dropdown.loadMoreHighlighted) {
                el = dropdown.$('.selectivity-load-more')[0];
            } else {
                return; // no highlight to scroll to
            }

            var rect = el.getBoundingClientRect(),
                containerRect = dropdown.$results[0].getBoundingClientRect();

            if (rect.top < containerRect.top || rect.bottom > containerRect.bottom) {
                el.scrollIntoView(delta < 0);
            }
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
                                                dropdown.selectivity._getItemId($results[index]));
            if (result) {
                dropdown.highlight(result);
                scrollToHighlight();
            }
        }
    }

    function keyHeld(event) {

        var dropdown = selectivity.dropdown;
        if (dropdown) {
            if (event.keyCode === KEY_DOWN_ARROW) {
                moveHighlight(dropdown, 1);
            } else if (event.keyCode === KEY_UP_ARROW) {
                moveHighlight(dropdown, -1);
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
        if (event.keyCode === KEY_ENTER && !event.ctrlKey) {
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
