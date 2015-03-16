'use strict';

var $ = require('jquery');

var debounce = require('./lodash/debounce');

var Selectivity = require('./selectivity-base');

require('./selectivity-locale');

/**
 * Option listener that implements a convenience query function for performing AJAX requests.
 */
Selectivity.OptionListeners.unshift(function(selectivity, options) {

    var ajax = options.ajax;
    if (ajax && ajax.url) {
        var formatError = ajax.formatError || Selectivity.Locale.ajaxError;
        var minimumInputLength = ajax.minimumInputLength || 0;
        var params = ajax.params;
        var processItem = ajax.processItem || function(item) { return item; };
        var quietMillis = ajax.quietMillis || 0;
        var resultsCb = ajax.results || function(data) { return { results: data, more: false }; };
        var transport = ajax.transport || $.ajax;

        if (quietMillis) {
            transport = debounce(transport, quietMillis);
        }

        options.query = function(queryOptions) {
            var offset = queryOptions.offset;
            var term = queryOptions.term;
            if (term.length < minimumInputLength) {
                queryOptions.error(
                    Selectivity.Locale.needMoreCharacters(minimumInputLength - term.length)
                );
            } else {
                selectivity.dropdown.showLoading();

                var url = (ajax.url instanceof Function ? ajax.url() : ajax.url);
                if (params) {
                    url += (url.indexOf('?') > -1 ? '&' : '?') + $.param(params(term, offset));
                }

                var success = ajax.success;
                var error = ajax.error;

                transport($.extend({}, ajax, {
                    url: url,
                    success: function(data, textStatus, jqXHR) {
                        if (success) {
                            success(data, textStatus, jqXHR);
                        }

                        var results = resultsCb(data, offset);
                        results.results = results.results.map(processItem);
                        queryOptions.callback(results);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        if (error) {
                            error(jqXHR, textStatus, errorThrown);
                        }

                        queryOptions.error(
                            formatError(term, jqXHR, textStatus, errorThrown),
                            { escape: false }
                        );
                    }
                }));
            }
        };
    }
});
