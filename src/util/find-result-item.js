'use strict';

/**
 * Returns a result item with a given item ID.
 *
 * @param resultItems Array of DOM elements representing result items.
 * @param itemId ID of the item to return.
 *
 * @param DOM element of the result item with the given item ID, or null if not found.
 */
module.exports = function(resultItems, itemId) {

    for (var i = 0, length = resultItems.length; i < length; i++) {
        var resultItem = resultItems[i];
        var resultId = resultItem.getAttribute('data-item-id');
        if ((typeof itemId === 'number' ? parseInt(resultId, 10) : resultId) === itemId) {
            return resultItem;
        }
    }
    return null;
};
