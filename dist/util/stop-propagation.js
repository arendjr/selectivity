'use strict';

/**
 * Stops event propagation.
 *
 * @param event The event to stop from propagating.
 */
module.exports = function(event) {

    event.stopPropagation();
};
