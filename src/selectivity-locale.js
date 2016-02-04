'use strict';

var Selectivity = require('./selectivity-base');

/**
 * Localizable elements of the Selectivity Templates.
 *
 * Be aware that these strings are added straight to the HTML output of the templates, so any
 * non-safe strings should be escaped.
 */
Selectivity.Locale = {

    ajaxError: 'Failed to fetch results for %s',
    loading: 'Loading...',
    loadMore: 'Load more...',
    needMoreCharacters: 'Enter %s more characters to search',
    noResults: 'No results found',
    noResultsForTerm: 'No results for %s'

};
