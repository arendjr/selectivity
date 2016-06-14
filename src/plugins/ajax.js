'use strict';

var debounce = require('lodash/debounce');

var Selectivity = require('../selectivity');
var Locale = require('../locale');

function addUrlParam(url, key, value) {
    return url + (url.indexOf('?') > -1 ? '&' : '?') + key + '=' + encodeURIComponent(value);
}

/**
 * Option listener that implements a convenience query function for performing AJAX requests.
 */
Selectivity.OptionListeners.unshift(function(selectivity, options) {

    var ajax = options.ajax;
    if (ajax && ajax.url) {
        options.query = function(queryOptions) {
            var term = queryOptions.term;

            var numCharsNeeded = ajax.minimumInputLength - term.length;
            if (numCharsNeeded) {
                queryOptions.error(Locale.needMoreCharacters(numCharsNeeded));
                return;
            }

            var fetch = ajax.fetch || window.fetch;
            if (ajax.quietMillis) {
                fetch = debounce(fetch, ajax.quietMillis);
            }

            var url = (ajax.url instanceof Function ? ajax.url(queryOptions) : ajax.url);
            if (ajax.params) {
                var params = ajax.params(term, queryOptions.offset || 0);
                for (var key in params) {
                    if (params.hasOwnProperty(key)) {
                        url = addUrlParam(url, key, params[key]);
                    }
                }
            }

            fetch(url, ajax)
                .then(function(response) {
                    if (response.ok) {
                        return response.json();
                    } else if (Array.isArray(response) || response.results) {
                        return response;
                    } else {
                        throw new Error('Unexpected AJAX response');
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
                    var formatError = ajax.formatError || Locale.ajaxError;
                    queryOptions.error(formatError(term, error), { escape: false });
                });
        };
    }
});
