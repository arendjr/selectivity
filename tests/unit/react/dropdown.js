'use strict';

var _ = require('lodash');

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
    var results = (options.term ? items.filter(function(item) {
        return item.indexOf(options.term) > -1;
    }) : items);
    options.callback({
        results: results.slice(options.offset, options.offset + limit),
        more: results.length > options.offset + limit
    });
}

function queryDisabledItems(options) {
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

TestUtil.createReactTest(
    'react/dropdown: test disabled items',
    ['inputs/single', 'dropdown', 'templates'],
    { query: queryDisabledItems },
    function(SelectivityReact, test, ref, container, $) {
        test.equal($('.selectivity-dropdown').length, 0);

        TestUtil.simulateEvent(container.firstChild, 'click');

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 25);
        test.equal($('.selectivity-load-more').length, 0);

        test.equal(_.first($('.selectivity-result-item')).textContent, 'Amsterdam');
        test.equal(_.last($('.selectivity-result-item')).textContent, 'Helsinki');

        test.equal($('.selectivity-result-item[data-item-id="Amsterdam"].disabled').length, 1);
        test.equal($('.selectivity-result-item[data-item-id="Antwerp"]:not(.disabled)').length, 1);
        test.equal($('.selectivity-result-item[data-item-id="Athens"].disabled').length, 1);
        test.equal($('.selectivity-result-item[data-item-id="Barcelona"]:not(.disabled)').length,
                   1);

        // disabled item should not be selectable
        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="Amsterdam"]', 'click');

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal(ref.getValue(), null);

        // enabled item should be, of course
        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="Antwerp"]', 'click');

        test.equal($('.selectivity-dropdown').length, 0);
        test.equal(ref.getValue(), 'Antwerp');
    }
);

TestUtil.createReactTest(
    'react/dropdown: test disabled items with submenu',
    ['inputs/single', 'plugins/submenu', 'dropdown', 'templates'],
    { query: queryDisabledItems },
    function(SelectivityReact, test, ref, container, $) {
        test.equal($('.selectivity-dropdown').length, 0);

        TestUtil.simulateEvent(container.firstChild, 'click');

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 25);
        test.equal($('.selectivity-load-more').length, 0);

        test.equal(_.first($('.selectivity-result-item')).textContent, 'Amsterdam');
        test.equal(_.last($('.selectivity-result-item')).textContent, 'Helsinki');

        test.equal($('.selectivity-result-item[data-item-id="Amsterdam"].disabled').length, 1);
        test.equal($('.selectivity-result-item[data-item-id="Antwerp"]:not(.disabled)').length, 1);
        test.equal($('.selectivity-result-item[data-item-id="Athens"].disabled').length, 1);
        test.equal($('.selectivity-result-item[data-item-id="Barcelona"]:not(.disabled)').length,
                   1);

        // disabled item should not be selectable
        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="Amsterdam"]', 'click');

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal(ref.getValue(), null);

        // enabled item should be, of course
        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="Antwerp"]', 'click');

        test.equal($('.selectivity-dropdown').length, 0);
        test.equal(ref.getValue(), 'Antwerp');
    }
);

TestUtil.createReactTest(
    'react/dropdown: test initial highlights',
    ['inputs/single', 'dropdown', 'templates'],
    { items: ['Amsterdam', 'Antwerp', 'Athens'] },
    function(SelectivityReact, test, ref, container, $) {
        test.equal(ref.getValue(), null);

        TestUtil.simulateEvent(container.firstChild, 'click');

        // first item should be highlighted when there is no selection yet
        test.equal($('.selectivity-result-item.highlight').length, 1);
        test.equal($('.selectivity-result-item.highlight')[0].textContent, 'Amsterdam');

        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="Athens"]', 'click');

        test.equal(ref.getValue(), 'Athens');

        TestUtil.simulateEvent(container.firstChild, 'click');

        // selected item should be highlighted once there is a selection
        test.equal($('.selectivity-result-item.highlight').length, 1);
        test.equal($('.selectivity-result-item.highlight')[0].textContent, 'Athens');
    }
);

TestUtil.createReactTest(
    'react/dropdown: test multiple input initial highlights',
    ['inputs/multiple', 'dropdown', 'templates'],
    { multiple: true, items: ['Amsterdam', 'Antwerp', 'Athens'] },
    function(SelectivityReact, test, ref, container, $) {
        test.deepEqual(ref.getValue(), []);

        TestUtil.simulateEvent(container.firstChild, 'click');

        // 3 results
        test.equal($('.selectivity-result-item').length, 3);
        // first item should be highlighted when there is no selection yet
        test.equal($('.selectivity-result-item.highlight').length, 1);
        test.equal($('.selectivity-result-item.highlight')[0].textContent, 'Amsterdam');

        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="Amsterdam"]', 'click');

        test.deepEqual(ref.getValue(), ['Amsterdam']);

        TestUtil.simulateEvent(container.firstChild, 'click');

        // selected items should not be rendered in dropdown
        test.equal($('.selectivity-result-item').length, 2);
        test.equal($('.selectivity-result-item.highlight').length, 1);
        // first (unselected) result should be highlighted
        test.equal($('.selectivity-result-item.highlight')[0].textContent, 'Antwerp');
    }
);


TestUtil.createReactTest(
    'react/dropdown: test load more',
    ['inputs/single', 'dropdown', 'templates'],
    { query: query },
    function(SelectivityReact, test, ref, container, $) {
        test.equal($('.selectivity-dropdown').length, 0);
        test.equal($('.selectivity-result-item').length, 0);
        test.equal($('.selectivity-load-more').length, 0);

        TestUtil.simulateEvent(container.firstChild, 'click');

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 10);
        test.equal($('.selectivity-load-more').length, 1);

        test.equal(_.first($('.selectivity-result-item')).textContent, 'Amsterdam');
        test.equal(_.last($('.selectivity-result-item')).textContent, 'Bucharest');

        TestUtil.simulateEvent('.selectivity-load-more', 'click');

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 20);
        test.equal($('.selectivity-load-more').length, 1);

        TestUtil.simulateEvent('.selectivity-load-more', 'click');

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 25);
        test.equal($('.selectivity-load-more').length, 0);

        test.equal(_.first($('.selectivity-result-item')).textContent, 'Amsterdam');
        test.equal(_.last($('.selectivity-result-item')).textContent, 'Helsinki');
    }
);

TestUtil.createReactTest(
    'react/dropdown: test search',
    ['inputs/single', 'dropdown', 'templates'],
    { query: query },
    function(SelectivityReact, test, ref, container, $) {
        TestUtil.simulateEvent(container.firstChild, 'click');

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 10);
        test.equal($('.selectivity-load-more').length, 1);

        $('.selectivity-search-input')[0].value = 'am';
        TestUtil.simulateEvent('.selectivity-search-input', 'keyup');

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 3);
        test.equal($('.selectivity-load-more').length, 0);

        $('.selectivity-search-input')[0].value = '';
        TestUtil.simulateEvent('.selectivity-search-input', 'keyup');

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 10);
        test.equal($('.selectivity-load-more').length, 1);
    }
);
