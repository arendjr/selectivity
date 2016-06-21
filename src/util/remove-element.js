'use strict';

/**
 * Removes a DOM element.
 *
 * @param el The element to remove.
 */
module.exports = function(el) {

    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
};
