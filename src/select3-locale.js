'use strict';

var escape = require('./escape');
var Select3 = require('./select3-base');

/**
 * Localizable elements of the Select3 Templates.
 *
 * Be aware that these strings are added straight to the HTML output of the templates, so any
 * non-safe strings should be escaped.
 */
Select3.Locale = {

    loading: 'Loading...',
    loadMore: 'Load more...',
    noResults: 'No results found',
    noResultsForTerm: function(term) { return 'No results for <b>' + escape(term) + '</b>'; }

};
