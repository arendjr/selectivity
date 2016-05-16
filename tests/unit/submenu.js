'use strict';

var TestUtil = require('../test-util');

var items = [
    { id: '1', text: 'First Item' },
    { id: '2', text: 'Second Item' },
    { id: '3', text: 'First Submenu', submenu: { items: [
        { id: '3-1', text: 'Third Item' },
        { id: '3-2', text: 'Fourth Item' }
    ] } },
    { id: '4', text: 'Second Submenu', submenu: { items: [
        { id: '4-1', text: 'Fifth Item' },
        { id: '4-2', text: 'Sixth Item' }
    ] } }
];

TestUtil.createDomTest(
    'submenu: test search input in submenu in multiple select input',
    ['multiple', 'dropdown', 'submenu', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            items: [{
                id: 1,
                text: 'First Item',
                submenu: {
                    items: [{
                        id: 2,
                        text: 'First subitem'
                    }, {
                        id: 3,
                        text: 'Second subitem'
                    }],
                    showSearchInput: true
                }
            }],
            multiple: true
        });

        $input.click();

        $('.selectivity-result-item[data-item-id="1"]').mouseover();

        test.equal($('.selectivity-dropdown').length, 2);

        $('.selectivity-result-item[data-item-id="2"]').click();

        test.equal($('.selectivity-dropdown').length, 0);
        test.deepEqual($input.selectivity('value'), [2]);
    }
);

TestUtil.createDomTest(
    'submenu: test search in submenu in single select input',
    ['single', 'dropdown', 'submenu', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            items: [{
                id: 1,
                text: 'First Item',
                submenu: {
                    items: [{
                        id: 2,
                        text: 'irst subitem'
                    }, {
                        id: 3,
                        text: 'Second subitem'
                    }],
                    showSearchInput: true
                }
            }]
        });

        $input.click();
        test.equal($('.selectivity-result-item').length, 3);

        $('.selectivity-result-item[data-item-id="1"]').mouseover();

        test.equal($('.selectivity-dropdown').length, 2);
        test.equal($('.selectivity-result-item').length, 3);

        $('.selectivity-search-input').val('Second').trigger('keyup');

        test.equal($('.selectivity-dropdown').length, 2);
        test.equal($('.selectivity-result-item').length, 2);

        $('.selectivity-search-input').val('').trigger('keyup');

        test.equal($('.selectivity-dropdown').length, 2);
        test.equal($('.selectivity-result-item').length, 3);
    }
);

TestUtil.createDomTest(
    'submenu: test select item after opening submenu',
    ['single', 'dropdown', 'submenu', 'templates'],
    { async: true },
    function(test, $input, $) {
        $input.selectivity({ items: items });

        $input.find('.selectivity-single-select').click();

        test.equal($('.selectivity-dropdown').length, 1);

        $('.selectivity-result-item[data-item-id="3"]').mouseover();

        test.equal($('.selectivity-dropdown').length, 2);

        $('.selectivity-result-item[data-item-id="2"]').mouseover();

        setTimeout(function() {
            test.equal($('.selectivity-dropdown').length, 1);

            $('.selectivity-result-item[data-item-id="2"]').click();

            test.equal($('.selectivity-dropdown').length, 0);

            test.deepEqual($input.selectivity('data'), { id: '2', text: 'Second Item' });
            test.equal($input.selectivity('value'), '2');

            test.end();
        }, 150);
    }
);

TestUtil.createDomTest(
    'submenu: test select item in submenu',
    ['single', 'dropdown', 'submenu', 'templates'],
    function(test, $input, $) {
        $input.selectivity({ items: items });

        $input.find('.selectivity-single-select').click();

        test.equal($('.selectivity-dropdown').length, 1);

        $('.selectivity-result-item[data-item-id="3"]').mouseover();

        test.equal($('.selectivity-dropdown').length, 2);

        $('.selectivity-result-item[data-item-id="3-1"]').click();

        test.equal($('.selectivity-dropdown').length, 0);

        test.deepEqual($input.selectivity('data'), { id: '3-1', text: 'Third Item' });
        test.equal($input.selectivity('value'), '3-1');
    }
);

TestUtil.createDomTest(
    'submenu: test set value',
    ['single', 'dropdown', 'submenu', 'templates'],
    function(test, $input) {
        $input.selectivity({ items: items });

        $input.selectivity('value', '3-1');

        test.deepEqual($input.selectivity('data'), { id: '3-1', text: 'Third Item' });
        test.equal($input.selectivity('value'), '3-1');
    }
);
