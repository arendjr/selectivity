'use strict';

var _ = require('lodash')

var Selectivity = require('./selectivity-base');

/**
 * Localizable elements of the Selectivity Templates.
 *
 * Be aware that these strings are added straight to the HTML output of the templates, so any
 * non-safe strings should be escaped.
 */
Selectivity.Locale = {

    ajaxError: function(term) { return 'Failed to fetch results for <b>' + _.escape(term) + '</b>'; },
    loading: 'Loading...',
    loadMore: 'Load more...',
    needMoreCharacters: function(numCharacters) {
        return 'Enter ' + numCharacters + ' more characters to search';
    },
    noResults: 'No results found',
    noResultsForTerm: function(term) { return 'No results for <b>' + _.escape(term) + '</b>'; }

};
