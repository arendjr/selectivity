'use strict';

/**
 * Quotes a string so it can be used in a CSS attribute selector. It adds double quotes to the
 * string and escapes all occurrences of the quote character inside the string.
 *
 * @param string The string to quote.
 *
 * @return The quoted string.
 */
module.exports = function(string) {

    return '"' + ('' + string).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
};
