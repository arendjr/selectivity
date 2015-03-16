'use strict';

var DomUtil = require('../dom-util');

exports.testClear = DomUtil.createDomTest(
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

exports.testDontOpenAfterClear = DomUtil.createDomTest(
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

exports.testInitialData = DomUtil.createDomTest(
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

exports.testInitialValue = DomUtil.createDomTest(
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

exports.testNestedData = DomUtil.createDomTest(
    ['single', 'templates'],
    function(test, $input) {
        $input.selectivity({
            data: { id: 2, text: 'Antwerp' },
            items: [
                {
                    text: 'Austria',
                    children: [
                        { id: 54, text: 'Vienna' }
                     ]
                },
                {
                    text: 'Belgium',
                    children: [
                        { id: 2, text: 'Antwerp' },
                        { id: 9, text: 'Brussels' }
                    ]
                },
                {
                    text: 'Bulgaria',
                    children: [
                        { id: 48, text: 'Sofia' }
                    ]
                }
            ]
        });

        test.deepEqual($input.selectivity('data'), { id: 2, text: 'Antwerp' });

        test.deepEqual($input.selectivity('value'), 2);
    }
);

exports.testNestedValue = DomUtil.createDomTest(
    ['single', 'templates'],
    function(test, $input) {
        $input.selectivity({
            value: 2,
            items: [
                {
                    text: 'Austria',
                    children: [
                        { id: 54, text: 'Vienna' }
                     ]
                },
                {
                    text: 'Belgium',
                    children: [
                        { id: 2, text: 'Antwerp' },
                        { id: 9, text: 'Brussels' }
                    ]
                },
                {
                    text: 'Bulgaria',
                    children: [
                        { id: 48, text: 'Sofia' }
                    ]
                }
            ]
        });

        test.deepEqual($input.selectivity('data'), { id: 2, text: 'Antwerp' });

        test.deepEqual($input.selectivity('value'), 2);
    }
);

exports.testNoData = DomUtil.createDomTest(
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

exports.testNoSearchInput = DomUtil.createDomTest(
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

exports.testSelectNestedItemByKeyboard = DomUtil.createDomTest(
    ['single', 'dropdown', 'keyboard', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            items: [
                {
                    text: 'Austria',
                    children: [
                        { id: 54, text: 'Vienna' }
                     ]
                },
                {
                    text: 'Belgium',
                    children: [
                        { id: 2, text: 'Antwerp' },
                        { id: 9, text: 'Brussels' }
                    ]
                },
                {
                    text: 'Bulgaria',
                    children: [
                        { id: 48, text: 'Sofia' }
                    ]
                }
            ]
        });

        $input.click();
        $('.selectivity-search-input').val('belg')
                                      .trigger('keyup')
                                      .trigger(new $.Event('keyup', { keyCode: 13 }));

        test.deepEqual($input.selectivity('value'), 2);
    }
);

exports.testSetValue = DomUtil.createDomTest(
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

exports.testSetValueWithInitSelection = DomUtil.createDomTest(
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

exports.testSetValueWithoutItems = DomUtil.createDomTest(
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
