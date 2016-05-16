'use strict';

var TestUtil = require('../test-util');

var expectedDOM = (
    '<div class="selectivity-results-container">' +
        '<div class="selectivity-result-item highlight" data-item-id="1">Amsterdam</div>' +
        '<div class="selectivity-result-item" data-item-id="2">Antwerp</div>' +
        '<div class="selectivity-result-item" data-item-id="3">Athens</div>' +
    '</div>'
);

TestUtil.createDomTest(
    'ajax: test response as array',
    ['ajax', 'single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            ajax: {
                url: true,  // non-null value to bypass test
                transport: function(settings) {
                    settings.success([
                        { id: 1, text: 'Amsterdam' },
                        { id: 2, text: 'Antwerp' },
                        { id: 3, text: 'Athens' }
                    ]);
                },
                results: function(data) {
                    return { results: data, more: false };
                }
            }
        });

        $input.click();

        test.equal($('.selectivity-results-container').prop('outerHTML'), expectedDOM);
    }
);

TestUtil.createDomTest(
    'ajax: test response as object',
    ['ajax', 'single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            ajax: {
                url: true,
                transport: function(settings) {
                    settings.success({
                        'items': [
                            { 'id': 1, 'text': 'Amsterdam' },
                            { 'id': 2, 'text': 'Antwerp' },
                            { 'id': 3, 'text': 'Athens' }
                        ]
                    });
                },
                results: function(data) {
                    return { results: data.items, more: false };
                }
            }
        });

        $input.click();

        test.equal($('.selectivity-results-container').prop('outerHTML'), expectedDOM);
    }
);

TestUtil.createDomTest(
    'ajax: test response as nested object',
    ['ajax', 'single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            ajax: {
                url: true,
                transport: function(settings) {
                    settings.success({
                        'items': {
                            'one': { 'id': 1, 'text': 'Amsterdam' },
                            'two': { 'id': 2, 'text': 'Antwerp' },
                            'three': { 'id': 3, 'text': 'Athens' }
                        }
                    });
                },
                results: function(data) {
                    return { results: data.items, more: false };
                }
            }
        });

        $input.click();

        test.equal($('.selectivity-results-container').prop('outerHTML'), expectedDOM);
    }
);
