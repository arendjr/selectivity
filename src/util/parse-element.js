'use strict';

/**
 * Parses an HTML string and returns the resulting DOM element.
 *
 * @param html HTML representation of the element to parse.
 */
module.exports = function(html) {

    var div = document.createElement('div');
    div.innerHTML = html;
    return div.firstChild;
};
