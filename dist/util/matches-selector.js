'use strict';

/**
 * Returns whether the given element matches the given selector.
 */
module.exports = function(el, selector) {

    var method = el.matches || el.webkitMatchesSelector ||
                 el.mozMatchesSelector || el.msMatchesSelector;
    return method.call(el, selector);
};
