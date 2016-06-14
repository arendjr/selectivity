'use strict';

var escape = require('lodash/escape');

var Selectivity = require('./selectivity');

/**
 * Localizable elements of the Selectivity Templates.
 *
 * Be aware that these strings are added straight to the HTML output of the templates, so any
 * non-safe strings should be escaped.
 */
module.exports = Selectivity.Locale = {

    loading: 'Loading...',
    loadMore: 'Load more...',
    noResults: 'No results found',

    ajaxError: function(term) {
        if (term) {
            return 'Failed to fetch results for <b>' + escape(term) + '</b>';
        } else {
            return 'Failed to fetch results';
        }
    },

    needMoreCharacters: function(numCharacters) {
        return 'Enter ' + numCharacters + ' more characters to search';
    },

    noResultsForTerm: function(term) {
        return 'No results for <b>' + escape(term) + '</b>';
    }

};
