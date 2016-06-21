'use strict';

/**
 * Returns the keyCode value of the given event.
 */
module.exports = function(event) {

    return event.which || event.keyCode || 0;
};
