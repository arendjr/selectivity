'use strict';

var TestUtil = require('../test-util');

TestUtil.createDomTest(
    'single: test clear',
    ['single', 'templates'],
    function(test, $input) {
        $input.selectivity({
            data: { id: 1, text: 'Amsterdam' },
            items: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' },
                { id: 3, text: 'Athens' }
            ]
        });

        $input.selectivity('clear');

        test.deepEqual($input.selectivity('data'), null);

        test.deepEqual($input.selectivity('value'), null);
    }
);

TestUtil.createDomTest(
    'single: test don\'t open after clear',
    ['single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            allowClear: true,
            data: { id: 1, text: 'Amsterdam' },
            items: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' },
                { id: 3, text: 'Athens' }
            ]
        });

        test.equal($input.selectivity('value'), 1);

        $input.find('.selectivity-single-selected-item-remove').click();

        test.equal($input.selectivity('data'), null);
        test.equal($input.selectivity('value'), null);

        test.equal($('.selectivity-dropdown').length, 0);
    }
);

TestUtil.createDomTest(
    'single: test initial data',
    ['single', 'templates'],
    function(test, $input) {
        $input.selectivity({
            data: { id: 1, text: 'Amsterdam' },
            items: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' },
                { id: 3, text: 'Athens' }
            ]
        });

        test.deepEqual($input.selectivity('data'), { id: 1, text: 'Amsterdam' });

        test.deepEqual($input.selectivity('value'), 1);
    }
);

TestUtil.createDomTest(
    'single: test initial value',
    ['single', 'templates'],
    function(test, $input) {
        $input.selectivity({
            items: ['Amsterdam', 'Antwerp', 'Athens'],
            value: 'Amsterdam'
        });

        test.deepEqual($input.selectivity('data'), { id: 'Amsterdam', text: 'Amsterdam' });

        test.deepEqual($input.selectivity('value'), 'Amsterdam');
    }
);

TestUtil.createDomTest(
    'single: test nested data',
    ['single', 'templates'],
    function(test, $input) {
        $input.selectivity({
            data: { id: 2, text: 'Antwerp' },
            items: [{
                text: 'Austria',
                children: [
                    { id: 54, text: 'Vienna' }
                ]
            }, {
                text: 'Belgium',
                children: [
                    { id: 2, text: 'Antwerp' },
                    { id: 9, text: 'Brussels' }
                ]
            }, {
                text: 'Bulgaria',
                children: [
                    { id: 48, text: 'Sofia' }
                ]
            }]
        });

        test.deepEqual($input.selectivity('data'), { id: 2, text: 'Antwerp' });

        test.deepEqual($input.selectivity('value'), 2);
    }
);

TestUtil.createDomTest(
    'single: test nested value',
    ['single', 'templates'],
    function(test, $input) {
        $input.selectivity({
            value: 2,
            items: [{
                text: 'Austria',
                children: [
                    { id: 54, text: 'Vienna' }
                ]
            }, {
                text: 'Belgium',
                children: [
                    { id: 2, text: 'Antwerp' },
                    { id: 9, text: 'Brussels' }
                ]
            }, {
                text: 'Bulgaria',
                children: [
                    { id: 48, text: 'Sofia' }
                ]
            }]
        });

        test.deepEqual($input.selectivity('data'), { id: 2, text: 'Antwerp' });

        test.deepEqual($input.selectivity('value'), 2);
    }
);

TestUtil.createDomTest(
    'single: test without data',
    ['single', 'templates'],
    function(test, $input) {
        $input.selectivity({
            items: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' },
                { id: 3, text: 'Athens' }
            ]
        });

        test.deepEqual($input.selectivity('data'), null);

        test.deepEqual($input.selectivity('value'), null);
    }
);

TestUtil.createDomTest(
    'single: test without search input',
    ['single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            items: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' },
                { id: 3, text: 'Athens' }
            ],
            showSearchInputInDropdown: false
        });

        test.equal($input.selectivity('val'), null);

        $input.selectivity('open');

        var $dropdown = $('.selectivity-dropdown');
        test.equal($dropdown.length, 1);
        test.equal($dropdown.find('.selectivity-result-item').length, 3);
        test.equal($dropdown.find('.selectivity-result-item').eq(0).text(), 'Amsterdam');

        $dropdown.find('.selectivity-result-item').eq(0).click();

        test.equal($input.selectivity('val'), 1);
    }
);

TestUtil.createDomTest(
    'single: test set value',
    ['single', 'templates'],
    function(test, $input) {
        $input.selectivity({
            items: [ 'Amsterdam', 'Antwerp', 'Athens' ],
            value: 'Amsterdam'
        });

        test.deepEqual($input.selectivity('value'), 'Amsterdam');

        $input.selectivity('value', 'Antwerp');

        test.deepEqual($input.selectivity('data'), { id: 'Antwerp', text: 'Antwerp' });

        test.deepEqual($input.selectivity('value'), 'Antwerp');
    }
);

TestUtil.createDomTest(
    'single: test set value with init selection',
    ['single', 'templates'],
    function(test, $input) {
        $input.selectivity({
            initSelection: function(value, callback) {
                var cities = {
                    1: 'Amsterdam',
                    2: 'Antwerp',
                    3: 'Athens'
                };
                callback({ id: value, text: cities[value] });
            },
            value: 1
        });

        test.deepEqual($input.selectivity('data'), { id: 1, text: 'Amsterdam' });

        test.deepEqual($input.selectivity('value'), 1);

        $input.selectivity('value', 2);

        test.deepEqual($input.selectivity('data'), { id: 2, text: 'Antwerp' });

        test.deepEqual($input.selectivity('value'), 2);
    }
);

TestUtil.createDomTest(
    'single: test set value without items',
    ['single', 'templates'],
    function(test, $input) {
        $input.selectivity({
            value: 'Amsterdam'
        });

        test.deepEqual($input.selectivity('value'), 'Amsterdam');

        $input.selectivity('value', 'Antwerp');

        test.deepEqual($input.selectivity('data'), { id: 'Antwerp', text: 'Antwerp' });

        test.deepEqual($input.selectivity('value'), 'Antwerp');
    }
);

TestUtil.createDomTest(
    'single: test mouse over',
    ['single', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            value: 'Amsterdam'
        });

        $('.selectivity-single-select').trigger('mouseover');

        test.ok($input.hasClass('hover'));

        $input.trigger('mouseleave');

        test.equal($input.hasClass('hover'), false);
    }
);

TestUtil.createDomTest(
    'single: test click and mouse over',
    ['single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            value: 'Amsterdam'
        });

        $('.selectivity-single-select').click();

        test.equal($input.attr('class'), 'open');

        $('.selectivity-single-select').trigger('mouseover');

        test.equal($input.attr('class'),'open hover');

        $input.selectivity('close');

        test.equal($input.attr('class'), 'hover');
    }
);

TestUtil.createDomTest(
    'single: test blur event after opening single select',
    ['single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            value: 'Amsterdam',
            showSearchInputInDropdown: false
        });

        $('.selectivity-single-select').click();

        test.ok($input.hasClass('open'));

        $input.trigger('blur');

        test.equal($('#selectivity-input').hasClass('open'), false);
    }
);

TestUtil.createDomTest(
    'single: test don\'t close when hovering while blur event occurs',
    ['single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            value: 'Amsterdam',
            showSearchInputInDropdown: false
        });

        $('.selectivity-single-select').click();

        $('.selectivity-single-select').trigger('mouseover');

        $input.trigger('blur');

        test.equal($input.hasClass('open'), true);
    }
);

TestUtil.createDomTest(
    'single: test default tab index',
    ['single', 'dropdown', 'templates'],
    function(test, $input) {
        $input.selectivity({
            value: 'Amsterdam',
            showSearchInputInDropdown: false
        });

        test.equal($input.attr('tabindex'), '0');
    }
);

TestUtil.createDomTest(
    'single: test tab index option',
    ['single', 'dropdown', 'templates'],
    function(test, $input) {
        $input.selectivity({
            value: 'Amsterdam',
            showSearchInputInDropdown: false,
            tabindex: 2
        });

        test.equal($input.attr('tabindex'), '2');
    }
);
