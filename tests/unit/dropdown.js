'use strict';

var TestUtil = require('../test-util');

var items = [
    'Amsterdam',
    'Antwerp',
    'Athens',
    'Barcelona',
    'Berlin',
    'Birmingham',
    'Bradford',
    'Bremen',
    'Brussels',
    'Bucharest',
    'Budapest',
    'Cologne',
    'Copenhagen',
    'Dortmund',
    'Dresden',
    'Dublin',
    'Düsseldorf',
    'Essen',
    'Frankfurt',
    'Genoa',
    'Glasgow',
    'Gothenburg',
    'Hamburg',
    'Hannover',
    'Helsinki'
];

function query(options) {
    var limit = 10;
    var results = (options.term ? items.filter(function(item) {
        return item.indexOf(options.term) > -1;
    }) : items);
    options.callback({
        results: results.slice(options.offset, options.offset + limit),
        more: results.length > options.offset + limit
    });
}

TestUtil.createDomTest(
    'dropdown: test disabled items',
    ['single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            query: function(options) {
                options.callback({
                    results: items.map(function(item, index) {
                        return {
                            id: item,
                            text: item,
                            disabled: (index % 2 === 0)
                        };
                    }),
                    more: false
                });
            }
        });

        test.equal($('.selectivity-dropdown').length, 0);

        $input.click();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 25);
        test.equal($('.selectivity-load-more').length, 0);

        test.equal($('.selectivity-result-item').first().text(), 'Amsterdam');
        test.equal($('.selectivity-result-item').last().text(), 'Helsinki');

        test.equal($('.selectivity-result-item[data-item-id="Amsterdam"].disabled').length, 1);
        test.equal($('.selectivity-result-item[data-item-id="Antwerp"]:not(.disabled)').length, 1);
        test.equal($('.selectivity-result-item[data-item-id="Athens"].disabled').length, 1);
        test.equal($('.selectivity-result-item[data-item-id="Barcelona"]:not(.disabled)').length,
                   1);

        // disabled item should not be selectable
        $('.selectivity-result-item[data-item-id="Amsterdam"]').click();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($input.selectivity('val'), null);

        // enabled item should be, of course
        $('.selectivity-result-item[data-item-id="Antwerp"]').click();

        test.equal($('.selectivity-dropdown').length, 0);
        test.equal($input.selectivity('val'), 'Antwerp');
    }
);

TestUtil.createDomTest(
    'dropdown: test disabled items with submenu',
    ['single', 'dropdown', 'submenu', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            query: function(options) {
                options.callback({
                    results: items.map(function(item, index) {
                        return {
                            id: item,
                            text: item,
                            disabled: (index % 2 === 0)
                        };
                    }),
                    more: false
                });
            }
        });

        test.equal($('.selectivity-dropdown').length, 0);

        $input.click();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 25);
        test.equal($('.selectivity-load-more').length, 0);

        test.equal($('.selectivity-result-item').first().text(), 'Amsterdam');
        test.equal($('.selectivity-result-item').last().text(), 'Helsinki');

        test.equal($('.selectivity-result-item[data-item-id="Amsterdam"].disabled').length, 1);
        test.equal($('.selectivity-result-item[data-item-id="Antwerp"]:not(.disabled)').length, 1);
        test.equal($('.selectivity-result-item[data-item-id="Athens"].disabled').length, 1);
        test.equal($('.selectivity-result-item[data-item-id="Barcelona"]:not(.disabled)').length,
                   1);

        // disabled item should not be selectable
        $('.selectivity-result-item[data-item-id="Amsterdam"]').click();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($input.selectivity('val'), null);

        // enabled item should be, of course
        $('.selectivity-result-item[data-item-id="Antwerp"]').click();

        test.equal($('.selectivity-dropdown').length, 0);
        test.equal($input.selectivity('val'), 'Antwerp');
    }
);

TestUtil.createDomTest(
    'dropdown: test initial highlights',
    ['single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            items: [ 'Amsterdam', 'Antwerp', 'Athens' ]
        });

        test.equal($input.selectivity('val'), null);

        $input.click();

        // first item should be highlighted when there is no selection yet
        test.equal($('.selectivity-result-item.highlight').text(), 'Amsterdam');

        $('.selectivity-result-item[data-item-id="Athens"]').click();

        test.equal($input.selectivity('val'), 'Athens');

        $input.click();

        // selected item should be highlighted once there is a selection
        test.equal($('.selectivity-result-item.highlight').text(), 'Athens');
    }
);

TestUtil.createDomTest(
    'dropdown: test load more',
    ['single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({ query: query });

        test.equal($('.selectivity-dropdown').length, 0);
        test.equal($('.selectivity-result-item').length, 0);
        test.equal($('.selectivity-load-more').length, 0);

        $input.find('.selectivity-single-select').click();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 10);
        test.equal($('.selectivity-load-more').length, 1);

        test.equal($('.selectivity-result-item').first().text(), 'Amsterdam');
        test.equal($('.selectivity-result-item').last().text(), 'Bucharest');

        $('.selectivity-load-more').click();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 20);
        test.equal($('.selectivity-load-more').length, 1);

        $('.selectivity-load-more').click();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 25);
        test.equal($('.selectivity-load-more').length, 0);

        test.equal($('.selectivity-result-item').first().text(), 'Amsterdam');
        test.equal($('.selectivity-result-item').last().text(), 'Helsinki');
    }
);

TestUtil.createDomTest(
    'dropdown: test search',
    ['single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({ query: query });

        $input.find('.selectivity-single-select').click();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 10);
        test.equal($('.selectivity-load-more').length, 1);

        $('.selectivity-search-input').val('am').keyup();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 3);
        test.equal($('.selectivity-load-more').length, 0);

        $('.selectivity-search-input').val('').keyup();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 10);
        test.equal($('.selectivity-load-more').length, 1);
    }
);
