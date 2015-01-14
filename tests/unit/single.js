'use strict';

var DomUtil = require('../dom-util');

exports.testDontOpenAfterClear = DomUtil.createDomTest(
    ['single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.select3({
            allowClear: true,
            data: { id: 1, text: 'Amsterdam' },
            items: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' },
                { id: 3, text: 'Athens' }
            ]
        });

        test.equal($input.select3('value'), 1);

        $input.find('.select3-single-selected-item-remove').click();

        test.equal($input.select3('data'), null);
        test.equal($input.select3('value'), null);

        test.equal($('.select3-dropdown').length, 0);
    }
);

exports.testInitialData = DomUtil.createDomTest(
    ['single', 'templates'],
    function(test, $input) {
        $input.select3({
            data: { id: 1, text: 'Amsterdam' },
            items: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' },
                { id: 3, text: 'Athens' }
            ]
        });

        test.deepEqual($input.select3('data'), { id: 1, text: 'Amsterdam' });

        test.deepEqual($input.select3('value'), 1);
    }
);

exports.testInitialValue = DomUtil.createDomTest(
    ['single', 'templates'],
    function(test, $input) {
        $input.select3({
            items: ['Amsterdam', 'Antwerp', 'Athens'],
            value: 'Amsterdam'
        });

        test.deepEqual($input.select3('data'), { id: 'Amsterdam', text: 'Amsterdam' });

        test.deepEqual($input.select3('value'), 'Amsterdam');
    }
);

exports.testNestedData = DomUtil.createDomTest(
    ['single', 'templates'],
    function(test, $input) {
        $input.select3({
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

        test.deepEqual($input.select3('data'), { id: 2, text: 'Antwerp' });

        test.deepEqual($input.select3('value'), 2);
    }
);

exports.testNestedValue = DomUtil.createDomTest(
    ['single', 'templates'],
    function(test, $input) {
        $input.select3({
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

        test.deepEqual($input.select3('data'), { id: 2, text: 'Antwerp' });

        test.deepEqual($input.select3('value'), 2);
    }
);

exports.testNoData = DomUtil.createDomTest(
    ['single', 'templates'],
    function(test, $input) {
        $input.select3({
            items: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' },
                { id: 3, text: 'Athens' }
            ]
        });

        test.deepEqual($input.select3('data'), null);

        test.deepEqual($input.select3('value'), null);
    }
);

exports.testSelectNestedItemByKeyboard = DomUtil.createDomTest(
    ['single', 'dropdown', 'keyboard', 'templates'],
    function(test, $input, $) {
        $input.select3({
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
        $('.select3-search-input').val('belg')
                                  .trigger('keyup')
                                  .trigger(new $.Event('keyup', { keyCode: 13 }));

        test.deepEqual($input.select3('value'), 2);
    }
);

exports.testSetValue = DomUtil.createDomTest(
    ['single', 'templates'],
    function(test, $input) {
        $input.select3({
            items: [ 'Amsterdam', 'Antwerp', 'Athens' ],
            value: 'Amsterdam'
        });

        test.deepEqual($input.select3('value'), 'Amsterdam');

        $input.select3('value', 'Antwerp');

        test.deepEqual($input.select3('data'), { id: 'Antwerp', text: 'Antwerp' });

        test.deepEqual($input.select3('value'), 'Antwerp');
    }
);

exports.testSetValueWithInitSelection = DomUtil.createDomTest(
    ['single', 'templates'],
    function(test, $input) {
        $input.select3({
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

        test.deepEqual($input.select3('data'), { id: 1, text: 'Amsterdam' });

        test.deepEqual($input.select3('value'), 1);

        $input.select3('value', 2);

        test.deepEqual($input.select3('data'), { id: 2, text: 'Antwerp' });

        test.deepEqual($input.select3('value'), 2);
    }
);

exports.testSetValueWithoutItems = DomUtil.createDomTest(
    ['single', 'templates'],
    function(test, $input) {
        $input.select3({
            value: 'Amsterdam'
        });

        test.deepEqual($input.select3('value'), 'Amsterdam');

        $input.select3('value', 'Antwerp');

        test.deepEqual($input.select3('data'), { id: 'Antwerp', text: 'Antwerp' });

        test.deepEqual($input.select3('value'), 'Antwerp');
    }
);
