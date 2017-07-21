'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

var TestUtil = require('../../test-util');

var items = [
    { id: '1', text: 'First Item' },
    { id: '2', text: 'Second Item' },
    {
        id: '3',
        text: 'First Submenu',
        submenu: {
            items: [{ id: '3-1', text: 'Third Item' }, { id: '3-2', text: 'Fourth Item' }]
        }
    },
    {
        id: '4',
        text: 'Second Submenu',
        submenu: {
            items: [{ id: '4-1', text: 'Fifth Item' }, { id: '4-2', text: 'Sixth Item' }]
        }
    }
];

TestUtil.createReactTest(
    'react/submenu: test search input in submenu in multiple select input',
    ['inputs/multiple', 'plugins/submenu', 'dropdown', 'templates'],
    {
        items: [
            {
                id: 1,
                text: 'First Item',
                submenu: {
                    items: [
                        {
                            id: 2,
                            text: 'First subitem'
                        },
                        {
                            id: 3,
                            text: 'Second subitem'
                        }
                    ],
                    showSearchInput: true
                }
            }
        ],
        multiple: true
    },
    function(SelectivityReact, test, ref, container, $) {
        test.equal($('.selectivity-dropdown').length, 0);
        test.deepEqual(ref.getValue(), []);

        TestUtil.simulateEvent(container.firstChild, 'click');

        test.equal($('.selectivity-dropdown').length, 2);

        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="2"]', 'click');

        test.equal($('.selectivity-dropdown').length, 0);
        test.deepEqual(ref.getValue(), [2]);
    }
);

TestUtil.createReactTest(
    'react/submenu: test search in submenu in single select input',
    ['inputs/single', 'plugins/submenu', 'dropdown', 'templates'],
    {
        items: [
            {
                id: 1,
                text: 'First Item',
                submenu: {
                    items: [
                        {
                            id: 2,
                            text: 'First subitem'
                        },
                        {
                            id: 3,
                            text: 'Second subitem'
                        }
                    ],
                    showSearchInput: true
                }
            }
        ]
    },
    function(SelectivityReact, test, ref, container, $) {
        TestUtil.simulateEvent(container.firstChild, 'click');
        test.equal(
            $('.selectivity-result-item').length,
            3,
            'After opening 3 result items are expected'
        );

        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="1"]', 'mouseenter');

        test.equal($('.selectivity-dropdown').length, 2, 'There should be 2 dropdowns open');
        test.equal($('.selectivity-result-item').length, 3, 'With a total of 3 result items');

        $('.selectivity-search-input')[1].value = 'Second';
        TestUtil.simulateEvent($('.selectivity-search-input')[1], 'keyup');

        test.equal(
            $('.selectivity-dropdown').length,
            2,
            'After searching for "Second" still 2 dropdowns should be open'
        );
        test.equal($('.selectivity-result-item').length, 2, 'But now only 2 result items remain');

        $('.selectivity-search-input')[1].value = '';
        TestUtil.simulateEvent($('.selectivity-search-input')[1], 'keyup');

        test.equal(
            $('.selectivity-dropdown').length,
            2,
            'After clearing the search we still have 2 dropdowns'
        );
        test.equal(
            $('.selectivity-result-item').length,
            3,
            'And all 3 result items are displayed again'
        );
    }
);

TestUtil.createReactTest(
    'react/submenu: test select item after opening submenu',
    ['inputs/single', 'plugins/submenu', 'dropdown', 'templates'],
    { async: true, items: items },
    function(SelectivityReact, test, ref, container, $) {
        test.plan(7);

        test.equal(ref.getValue(), null);

        TestUtil.simulateEvent('.selectivity-single-select', 'click');

        test.equal($('.selectivity-dropdown').length, 1);

        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="3"]', 'mouseenter');

        test.equal($('.selectivity-dropdown').length, 2);

        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="2"]', 'mouseenter');

        setTimeout(function() {
            test.equal($('.selectivity-dropdown').length, 1);

            TestUtil.simulateEvent('.selectivity-result-item[data-item-id="2"]', 'click');

            test.equal($('.selectivity-dropdown').length, 0);

            test.deepEqual(ref.getData(), { id: '2', text: 'Second Item' });
            test.equal(ref.getValue(), '2');

            test.end();
        }, 150);
    }
);

TestUtil.createReactTest(
    'react/submenu: test select item in submenu',
    ['inputs/single', 'plugins/submenu', 'dropdown', 'templates'],
    { items: items },
    function(SelectivityReact, test, ref, container, $) {
        TestUtil.simulateEvent('.selectivity-single-select', 'click');

        test.equal($('.selectivity-dropdown').length, 1);

        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="3"]', 'mouseenter');

        test.equal($('.selectivity-dropdown').length, 2);

        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="3-1"]', 'click');

        test.equal($('.selectivity-dropdown').length, 0);

        test.deepEqual(ref.getData(), { id: '3-1', text: 'Third Item' });
        test.equal(ref.getValue(), '3-1');
    }
);

TestUtil.createReactTest(
    'react/submenu: test set value',
    ['inputs/single', 'plugins/submenu', 'dropdown', 'templates'],
    { async: true, items: items },
    function(SelectivityReact, test, ref, container) {
        test.plan(3);

        test.equal(ref.getValue(), null);

        ReactDOM.render(
            React.createElement(SelectivityReact, { items: items, value: '3-1' }),
            container,
            function() {
                test.deepEqual(ref.getData(), { id: '3-1', text: 'Third Item' });
                test.equal(ref.getValue(), '3-1');
                test.end();
            }
        );
    }
);
