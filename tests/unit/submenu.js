'use strict';

var DomUtil = require('../dom-util');

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

exports.testSelectItemAfterOpeningSubmenu = DomUtil.createDomTest(
    ['single', 'dropdown', 'submenu', 'templates'],
    { async: true },
    function(test, $input, $) {
        $input.selectivity({ items: items });

        $input.click();

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

            test.done();
        }, 150);
    }
);

exports.testSelectItemInSubmenu = DomUtil.createDomTest(
    ['single', 'dropdown', 'submenu', 'templates'],
    function(test, $input, $) {
        $input.selectivity({ items: items });

        $input.click();

        test.equal($('.selectivity-dropdown').length, 1);

        $('.selectivity-result-item[data-item-id="3"]').mouseover();

        test.equal($('.selectivity-dropdown').length, 2);

        $('.selectivity-result-item[data-item-id="3-1"]').click();

        test.equal($('.selectivity-dropdown').length, 0);

        test.deepEqual($input.selectivity('data'), { id: '3-1', text: 'Third Item' });
        test.equal($input.selectivity('value'), '3-1');
    }
);

exports.testSetValue = DomUtil.createDomTest(
    ['single', 'dropdown', 'submenu', 'templates'],
    function(test, $input) {
        $input.selectivity({ items: items });

        $input.selectivity('value', '3-1');

        test.deepEqual($input.selectivity('data'), { id: '3-1', text: 'Third Item' });
        test.equal($input.selectivity('value'), '3-1');
    }
);
