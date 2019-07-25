import debounce from "lodash/debounce";

import Locale from "../locale";
import Selectivity from "../selectivity";
import { has } from "../util/object";

function addUrlParam(url, key, value) {
    return `${url + (url.indexOf("?") > -1 ? "&" : "?") + key}=${encodeURIComponent(value)}`;
}

function pick(object, keys) {
    const result = {};
    keys.forEach(function(key) {
        if (object[key] !== undefined) {
            result[key] = object[key];
        }
    });
    return result;
}

function doFetch(ajax, queryOptions) {
    const fetch = ajax.fetch || window.fetch;
    const term = queryOptions.term;

    let url = typeof ajax.url === "function" ? ajax.url(queryOptions) : ajax.url;
    if (ajax.params) {
        const params = ajax.params(term, queryOptions.offset || 0);
        for (const key in params) {
            if (has(params, key)) {
                url = addUrlParam(url, key, params[key]);
            }
        }
    }

    const init = pick(ajax, [
        "body",
        "cache",
        "credentials",
        "headers",
        "integrity",
        "method",
        "mode",
        "redirect",
        "referrer",
        "referrerPolicy",
    ]);

    fetch(url, init, queryOptions)
        .then(function(response) {
            if (response.ok) {
                return response.json();
            } else if (Array.isArray(response) || response.results) {
                return response;
            } else {
                throw new Error("Unexpected AJAX response");
            }
        })
        .then(function(response) {
            if (Array.isArray(response)) {
                queryOptions.callback({ results: response, more: false });
            } else {
                queryOptions.callback({ results: response.results, more: !!response.more });
            }
        })
        .catch(function(error) {
            const formatError = ajax.formatError || Locale.ajaxError;
            queryOptions.error(formatError(term, error), { escape: false });
        });
}

/**
 * Option listener that implements a convenience query function for performing AJAX requests.
 */
Selectivity.OptionListeners.unshift(function(selectivity, options) {
    const ajax = options.ajax;
    if (ajax && ajax.url) {
        const fetch = ajax.quietMillis ? debounce(doFetch, ajax.quietMillis) : doFetch;

        options.query = function(queryOptions) {
            const numCharsNeeded = ajax.minimumInputLength - queryOptions.term.length;
            if (numCharsNeeded > 0) {
                queryOptions.error(Locale.needMoreCharacters(numCharsNeeded));
                return;
            }

            fetch(ajax, queryOptions);
        };
    }
});
