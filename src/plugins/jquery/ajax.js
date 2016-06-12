'use strict';

var $ = require('jquery');

var Selectivity = require('../../selectivity');

/**
 * Option listener that implements a convenience query function for performing AJAX requests.
 */
Selectivity.OptionListeners.unshift(function(selectivity, options) {

    var ajax = options.ajax;
    if (ajax && ajax.url && !ajax.fetch) {
        ajax.fetch = function(url, init) {
            var deferred = new $.Deferred();
            $.ajax(url, {
                cache: (init.cache !== 'no-cache'),
                headers: init.headers || null,
                method: init.method || 'GET',
                xhrFields: (init.credentials === 'include' ? { withCredentials: true } : null)
            }).then(function(data) {
                deferred.resolve({ results: $.map(data), more: false });
            }, function(jqXHR, textStatus, errorThrown) {
                deferred.reject(new Error('AJAX request returned: ' + textStatus +
                                          (errorThrown ? ', ' + errorThrown : '')));
            });
            return deferred.promise();
        };
    }
});
