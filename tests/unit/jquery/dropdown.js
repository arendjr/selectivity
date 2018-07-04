'use strict';

var TestUtil = require('../../test-util');

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
    var results = options.term
        ? items.filter(function(item) {
              return item.indexOf(options.term) > -1;
          })
        : items;
    options.callback({
        results: results.slice(options.offset, options.offset + limit),
        more: results.length > options.offset + limit
    });
}

TestUtil.createJQueryTest(
    'jquery/dropdown: test disabled items',
    ['inputs/single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            query: function(options) {
                options.callback({
                    results: items.map(function(item, index) {
                        return {
                            id: item,
                            text: item,
                            disabled: index % 2 === 0
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

        test.equal(
            $('.selectivity-result-item')
                .first()
                .text(),
            'Amsterdam'
        );
        test.equal(
            $('.selectivity-result-item')
                .last()
                .text(),
            'Helsinki'
        );

        test.equal($('.selectivity-result-item[data-item-id="Amsterdam"].disabled').length, 1);
        test.equal($('.selectivity-result-item[data-item-id="Antwerp"]:not(.disabled)').length, 1);
        test.equal($('.selectivity-result-item[data-item-id="Athens"].disabled').length, 1);
        test.equal(
            $('.selectivity-result-item[data-item-id="Barcelona"]:not(.disabled)').length,
            1
        );

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

TestUtil.createJQueryTest(
    'jquery/dropdown: test disabled items with submenu',
    ['inputs/single', 'plugins/submenu', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            query: function(options) {
                options.callback({
                    results: items.map(function(item, index) {
                        return {
                            id: item,
                            text: item,
                            disabled: index % 2 === 0
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

        test.equal(
            $('.selectivity-result-item')
                .first()
                .text(),
            'Amsterdam'
        );
        test.equal(
            $('.selectivity-result-item')
                .last()
                .text(),
            'Helsinki'
        );

        test.equal($('.selectivity-result-item[data-item-id="Amsterdam"].disabled').length, 1);
        test.equal($('.selectivity-result-item[data-item-id="Antwerp"]:not(.disabled)').length, 1);
        test.equal($('.selectivity-result-item[data-item-id="Athens"].disabled').length, 1);
        test.equal(
            $('.selectivity-result-item[data-item-id="Barcelona"]:not(.disabled)').length,
            1
        );

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

TestUtil.createJQueryTest(
    'jquery/dropdown: test initial highlights',
    ['inputs/single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            items: ['Amsterdam', 'Antwerp', 'Athens']
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

TestUtil.createJQueryTest(
    'jquery/dropdown: test initial highlights',
    ['inputs/multiple', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            multiple: true,
            items: ['Amsterdam', 'Antwerp', 'Athens']
        });

        test.deepEqual($input.selectivity('val'), []);

        $input.click();

        // 3 results
        test.equal($('.selectivity-result-item').length, 3);
        // first item should be highlighted when there is no selection yet
        test.equal($('.selectivity-result-item.highlight').length, 1);
        // first item should be highlighted when there is no selection yet
        test.equal($('.selectivity-result-item.highlight').text(), 'Amsterdam');

        $('.selectivity-result-item[data-item-id="Amsterdam"]').click();

        test.deepEqual($input.selectivity('val'), ['Amsterdam']);

        $input.click();

        // selected items should not be rendered in dropdown
        test.equal($('.selectivity-result-item').length, 2);
        test.equal($('.selectivity-result-item.highlight').length, 1);
        // the first (unselected) result should be highlighted
        test.equal($('.selectivity-result-item.highlight').text(), 'Antwerp');
    }
);

TestUtil.createJQueryTest(
    'jquery/dropdown: test load more with single input',
    ['inputs/single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({ query: query });

        test.equal($('.selectivity-dropdown').length, 0);
        test.equal($('.selectivity-result-item').length, 0);
        test.equal($('.selectivity-load-more').length, 0);

        $input.find('.selectivity-single-select').click();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 10);
        test.equal($('.selectivity-load-more').length, 1);

        test.equal(
            $('.selectivity-result-item')
                .first()
                .text(),
            'Amsterdam'
        );
        test.equal(
            $('.selectivity-result-item')
                .last()
                .text(),
            'Bucharest'
        );

        $('.selectivity-load-more').click();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 20);
        test.equal($('.selectivity-load-more').length, 1);

        $('.selectivity-load-more').click();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 25);
        test.equal($('.selectivity-load-more').length, 0);

        test.equal(
            $('.selectivity-result-item')
                .first()
                .text(),
            'Amsterdam'
        );
        test.equal(
            $('.selectivity-result-item')
                .last()
                .text(),
            'Helsinki'
        );
    }
);

TestUtil.createJQueryTest(
    'jquery/dropdown: test load more with multiple input',
    ['inputs/multiple', 'dropdown', 'templates'],
    function(test, $input, $) {
        var offset = null;
        var term = null;

        function query(queryOptions) {
            offset = queryOptions.offset;
            term = queryOptions.term;

            queryOptions.callback({
                results: ['Amsterdam', 'Antwerp', 'Athens'],
                more: true
            });
        }

        $input.selectivity({ multiple: true, query: query });

        TestUtil.simulateEvent($input[0], 'click');

        test.equal($('.selectivity-dropdown').length, 1, "Dropdown should've opened");
        test.equal(
            $('.selectivity-result-item').length,
            3,
            'Three result items should be displayed'
        );
        test.equal($('.selectivity-load-more').length, 1, 'The load more option should be present');
        test.equal(offset, 0, 'The specified offset should be 0');
        test.equal(term, '', 'The specified search term should be the empty string');

        TestUtil.simulateEvent('.selectivity-load-more', 'click');

        test.equal($('.selectivity-result-item').length, 6, 'Six result items should be displayed');
        test.equal(
            $('.selectivity-load-more').length,
            1,
            'The load more option should still be present'
        );
        test.equal(offset, 3, 'The specified offset should be 3');
        test.equal(term, '', 'The specified search term should still be the empty string');

        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="Amsterdam"]', 'click');

        test.equal($('.selectivity-dropdown').length, 0, "Dropdown should've closed");

        TestUtil.simulateEvent($input[0], 'click');

        test.equal($('.selectivity-dropdown').length, 1, "Dropdown should've opened again");
        test.equal(
            $('.selectivity-result-item').length,
            2,
            'Two result items should be displayed (Amsterdam is now filtered)'
        );
        test.equal(
            $('.selectivity-load-more').length,
            1,
            'The load more option should be present again'
        );
        test.equal(offset, 0, 'The specified offset should be 0');
        test.equal(term, '', 'The specified search term should be the empty string');

        TestUtil.simulateEvent('.selectivity-load-more', 'click');

        test.equal(
            $('.selectivity-result-item').length,
            4,
            'Four result items should be displayed'
        );
        test.equal(
            $('.selectivity-load-more').length,
            1,
            'The load more option should still be present again'
        );
        test.equal(offset, 3, 'The specified offset should be 3 again');
        test.equal(term, '', 'The specified search term should still be the empty string');
    }
);

TestUtil.createJQueryTest(
    'jquery/dropdown: test search',
    ['inputs/single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({ query: query });

        $input.find('.selectivity-single-select').click();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 10);
        test.equal($('.selectivity-load-more').length, 1);

        $('.selectivity-search-input').val('am');
        TestUtil.simulateEvent('.selectivity-search-input', 'keyup');

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 3);
        test.equal($('.selectivity-load-more').length, 0);

        $('.selectivity-search-input').val('');
        TestUtil.simulateEvent('.selectivity-search-input', 'keyup');

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 10);
        test.equal($('.selectivity-load-more').length, 1);
    }
);
