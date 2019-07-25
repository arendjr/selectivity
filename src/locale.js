import escape from "lodash/escape";

import Selectivity from "./selectivity";

/**
 * Localizable elements of the Selectivity Templates.
 *
 * Be aware that these strings are added straight to the HTML output of the templates, so any
 * non-safe strings should be escaped.
 */
export default Selectivity.Locale = {
    loading: "Loading...",
    loadMore: "Load more...",
    noResults: "No results found",

    ajaxError(term) {
        if (term) {
            return `Failed to fetch results for <b>${escape(term)}</b>`;
        } else {
            return "Failed to fetch results";
        }
    },

    needMoreCharacters(numCharacters) {
        return `Enter ${numCharacters} more characters to search`;
    },

    noResultsForTerm(term) {
        return `No results for <b>${escape(term)}</b>`;
    },
};
