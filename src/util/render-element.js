'use strict';

/**
 * Renders an HTML string and returns the resulting DOM element.
 *
 * @param html HTML representing the element to render.
 */
module.exports = function(html) {

    var div = document.createElement('div');
    div.innerHTML = html;
    return div.firstChild;
};
