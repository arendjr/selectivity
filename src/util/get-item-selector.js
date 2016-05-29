'use strict';

/**
 * Returns the CSS selector for selecting a specific item by ID.
 *
 * @param selector Generic CSS selector to identify items.
 * @param id ID of the item to select.
 */
module.exports = function(selector, id) {

    var quotedId = '"' + ('' + id).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    return selector + '[data-item-id=' + quotedId + ']';
};
