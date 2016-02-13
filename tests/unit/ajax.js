'use strict';

var DomUtil = require('../dom-util');


var expectedDOM = '<div class="selectivity-results-container">'
    + '<div class="selectivity-result-item highlight" data-item-id="1">Amsterdam</div>'
    + '<div class="selectivity-result-item" data-item-id="2">Antwerp</div>'
    + '<div class="selectivity-result-item" data-item-id="3">Athens</div>'
+ '</div>';



exports.testResponseAsArray = DomUtil.createDomTest(
    ['ajax', 'single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            ajax: {
                url: true,  // non null value to bypass test
                transport: function(settings) {
                    var xhrResponse = [
                        { id: 1, text: 'Amsterdam' },
                        { id: 2, text: 'Antwerp' },
                        { id: 3, text: 'Athens' }
                    ];

                    settings.success(xhrResponse);
                },
                results: function(data) {
                    return { results: data, more: false };
                }
            }
        });

        $input.click();

        test.equal($('.selectivity-results-container')[0].outerHTML, expectedDOM);
    }
);


exports.testResponseAsObject = DomUtil.createDomTest(
    ['ajax', 'single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            ajax: {
                url: true,
                transport: function(settings) {
                    var xhrResponse = {
                        'items': [
                            { 'id': 1, 'text': 'Amsterdam' },
                            { 'id': 2, 'text': 'Antwerp' },
                            { 'id': 3, 'text': 'Athens' }
                        ]
                    };

                    settings.success(xhrResponse);
                },
                results: function(data) {
                    return { results: data.items, more: false };
                }
            }
        });

        $input.click();

        test.equal($('.selectivity-results-container')[0].outerHTML, expectedDOM);

    }
);


exports.testResponseAsNestedObject = DomUtil.createDomTest(
    ['ajax', 'single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            ajax: {
                url: true,
                transport: function(settings) {
                    var xhrResponse = {
                        'items': {
                            'one': {
                                'id': 1,
                                'text': 'Amsterdam'
                            },
                            'two': {
                                'id': 2,
                                'text': 'Antwerp'
                            },
                            'three': {
                                'id': 3,
                                'text': 'Athens'
                            }
                        }
                    };

                    settings.success(xhrResponse);
                },
                results: function(data) {
                    return { results: data.items, more: false };
                }
            }
        });

        $input.click();

        test.equal($('.selectivity-results-container')[0].outerHTML, expectedDOM);
    }
);