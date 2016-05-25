'use strict';

/**
 * Returns the CSS selector for selecting a specific item by ID.
 *
 * @param className Generic CSS class to identify items.
 * @param id ID of the item to select.
 */
module.exports = function(className, id) {

    var quotedId = '"' + ('' + id).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    return '.' + className + '[data-item-id=' + quotedId + ']';
};
