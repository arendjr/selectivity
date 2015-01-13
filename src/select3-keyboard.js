'use strict';

var Select3 = require('./select3-base');

var KEY_DOWN_ARROW = 40;
var KEY_ENTER = 13;
var KEY_ESCAPE = 27;
var KEY_UP_ARROW = 38;

/**
 * Search input listener providing keyboard support for navigating the dropdown.
 */
function listener(select3, $input) {

    function keyHeld(event) {

        var dropdown = select3.dropdown;
        if (dropdown) {
            if (event.keyCode === KEY_DOWN_ARROW) {
                dropdown.highlightNext();
            } else if (event.keyCode === KEY_UP_ARROW) {
                dropdown.highlightPrevious();
            }
        }
    }

    function keyReleased(event) {

        function open() {
            if (select3.options.showDropdown !== false) {
                select3.open();
            }
        }

        var dropdown = select3.dropdown;
        if (event.keyCode === KEY_ENTER && !event.ctrlKey) {
            if (dropdown) {
                dropdown.selectHighlight();
            } else if (select3.options.showDropdown !== false) {
                open();
            }

            event.preventDefault();
        } else if (event.keyCode === KEY_ESCAPE) {
            select3.close();

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

Select3.SearchInputListeners.push(listener);
