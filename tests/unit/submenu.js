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
        $input.select3({ items: items });

        $input.click();

        test.equal($('.select3-dropdown').length, 1);

        $('.select3-result-item[data-item-id="3"]').mouseover();

        test.equal($('.select3-dropdown').length, 2);

        $('.select3-result-item[data-item-id="2"]').mouseover();

        setTimeout(function() {
            test.equal($('.select3-dropdown').length, 1);

            $('.select3-result-item[data-item-id="2"]').click();

            test.equal($('.select3-dropdown').length, 0);

            test.deepEqual($input.select3('data'), { id: '2', text: 'Second Item' });
            test.equal($input.select3('value'), '2');

            test.done();
        }, 150);
    }
);

exports.testSelectItemInSubmenu = DomUtil.createDomTest(
    ['single', 'dropdown', 'submenu', 'templates'],
    function(test, $input, $) {
        $input.select3({ items: items });

        $input.click();

        test.equal($('.select3-dropdown').length, 1);

        $('.select3-result-item[data-item-id="3"]').mouseover();

        test.equal($('.select3-dropdown').length, 2);

        $('.select3-result-item[data-item-id="3-1"]').click();

        test.equal($('.select3-dropdown').length, 0);

        test.deepEqual($input.select3('data'), { id: '3-1', text: 'Third Item' });
        test.equal($input.select3('value'), '3-1');
    }
);

exports.testSetValue = DomUtil.createDomTest(
    ['single', 'dropdown', 'submenu', 'templates'],
    function(test, $input) {
        $input.select3({ items: items });

        $input.select3('value', '3-1');

        test.deepEqual($input.select3('data'), { id: '3-1', text: 'Third Item' });
        test.equal($input.select3('value'), '3-1');
    }
);
