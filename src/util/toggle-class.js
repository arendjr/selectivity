'use strict';

/**
 * Toggles a CSS class on an element.
 *
 * @param el The element on which to toggle the CSS class.
 * @param className The CSS class to toggle.
 * @param force If true, the class is added. If false, the class is removed.
 */
module.exports = function(el, className, force) {

    if (el) {
        el.classList[force ? 'add' : 'remove'](className);
    }
};
