'use strict';

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

TestUtil.createJQueryTest(
    'jquery/submenu: test search input in submenu in multiple select input',
    ['inputs/multiple', 'plugins/submenu', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            items: [
                {
                    id: 1,
                    text: 'First Item',
                    submenu: {
                        items: [
                            { id: 2, text: 'First subitem' },
                            { id: 3, text: 'Second subitem' }
                        ],
                        showSearchInput: true
                    }
                }
            ],
            multiple: true
        });

        test.equal($('.selectivity-dropdown').length, 0);

        TestUtil.simulateEvent($input[0], 'click');

        test.equal($('.selectivity-dropdown').length, 1);

        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="1"]', 'mouseenter');

        test.equal($('.selectivity-dropdown').length, 2);

        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="2"]', 'click');

        test.equal($('.selectivity-dropdown').length, 0);
        test.deepEqual($input.selectivity('value'), [2]);
    }
);

TestUtil.createJQueryTest(
    'jquery/submenu: test search in submenu in single select input',
    ['inputs/single', 'plugins/submenu', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            items: [
                {
                    id: 1,
                    text: 'First Item',
                    submenu: {
                        items: [
                            { id: 2, text: 'First subitem' },
                            { id: 3, text: 'Second subitem' }
                        ],
                        showSearchInput: true
                    }
                }
            ]
        });

        TestUtil.simulateEvent($input[0], 'click');
        test.equal($('.selectivity-result-item').length, 3);

        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="1"]', 'mouseenter');

        test.equal($('.selectivity-dropdown').length, 2);
        test.equal($('.selectivity-result-item').length, 3);

        $('.selectivity-search-input').val('Second');
        TestUtil.simulateEvent('.selectivity-search-input', 'keyup');

        test.equal($('.selectivity-dropdown').length, 2);
        test.equal($('.selectivity-result-item').length, 2);

        $('.selectivity-search-input').val('');
        TestUtil.simulateEvent('.selectivity-search-input', 'keyup');

        test.equal($('.selectivity-dropdown').length, 2);
        test.equal($('.selectivity-result-item').length, 3);
    }
);

TestUtil.createJQueryTest(
    'jquery/submenu: test select item after opening submenu',
    ['inputs/single', 'plugins/submenu', 'dropdown', 'templates'],
    { async: true },
    function(test, $input, $) {
        $input.selectivity({ items: items });

        TestUtil.simulateEvent('.selectivity-single-select', 'click');

        test.equal($('.selectivity-dropdown').length, 1);

        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="3"]', 'mouseenter');

        test.equal($('.selectivity-dropdown').length, 2);

        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="2"]', 'mouseenter');

        setTimeout(function() {
            test.equal($('.selectivity-dropdown').length, 1);

            TestUtil.simulateEvent('.selectivity-result-item[data-item-id="2"]', 'click');

            test.equal($('.selectivity-dropdown').length, 0);

            test.deepEqual($input.selectivity('data'), { id: '2', text: 'Second Item' });
            test.equal($input.selectivity('value'), '2');

            test.end();
        }, 150);
    }
);

TestUtil.createJQueryTest(
    'jquery/submenu: test select item in submenu',
    ['inputs/single', 'plugins/submenu', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({ items: items });

        TestUtil.simulateEvent('.selectivity-single-select', 'click');

        test.equal($('.selectivity-dropdown').length, 1);

        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="3"]', 'mouseenter');

        test.equal($('.selectivity-dropdown').length, 2);

        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="3-1"]', 'click');

        test.equal($('.selectivity-dropdown').length, 0);

        test.deepEqual($input.selectivity('data'), { id: '3-1', text: 'Third Item' });
        test.equal($input.selectivity('value'), '3-1');
    }
);

TestUtil.createJQueryTest(
    'jquery/submenu: test set value',
    ['inputs/single', 'plugins/submenu', 'dropdown', 'templates'],
    function(test, $input) {
        $input.selectivity({ items: items });

        $input.selectivity('value', '3-1');

        test.deepEqual($input.selectivity('data'), { id: '3-1', text: 'Third Item' });
        test.equal($input.selectivity('value'), '3-1');
    }
);
