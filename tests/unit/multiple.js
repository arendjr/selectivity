'use strict';

var DomUtil = require('../dom-util');

exports.testChangeEvent = DomUtil.createDomTest(
    ['multiple', 'dropdown', 'keyboard', 'templates'],
    function(test, $input, $) {
        var numChangeEvents = 0;

        $input.select3({
            items: ['Amsterdam', 'Antwerp', 'Athens'],
            multiple: true
        }).on('change', function(event) {
            numChangeEvents++;

            test.deepEqual(event.added, { id: 'Amsterdam', text: 'Amsterdam' });
            test.deepEqual(event.value, ['Amsterdam']);
        });

        $input.find('.select3-multiple-input').val('Amsterdam')
                                              .trigger('keyup')
                                              .trigger('change')
                                              .trigger(new $.Event('keyup', { keyCode: 13 }));

        test.deepEqual($input.select3('value'), ['Amsterdam']);

        test.equal(numChangeEvents, 1);
    }
);

exports.testClear = DomUtil.createDomTest(
    ['multiple', 'templates'],
    function(test, $input) {
        $input.select3({
            data: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' }
            ],
            items: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' },
                { id: 3, text: 'Athens' }
            ],
            multiple: true
        });

        $input.select3('clear');

        test.deepEqual($input.select3('data'), []);

        test.deepEqual($input.select3('value'), []);
    }
);

exports.testClickAfterSearch = DomUtil.createDomTest(
    ['multiple', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.select3({
            items: ['Amsterdam', 'Antwerp', 'Athens'],
            multiple: true
        });

        $input.find('.select3-multiple-input').click().val('amster').trigger('keyup');
        $('.select3-result-item[data-item-id="Amsterdam"]').click();

        test.deepEqual($input.select3('value'), ['Amsterdam']);
        test.equal($input.find('.select3-multiple-input').val(), '');
    }
);

exports.testInitialData = DomUtil.createDomTest(
    ['multiple', 'templates'],
    function(test, $input) {
        $input.select3({
            data: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' }
            ],
            items: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' },
                { id: 3, text: 'Athens' }
            ],
            multiple: true
        });

        test.deepEqual($input.select3('data'), [
            { id: 1, text: 'Amsterdam' },
            { id: 2, text: 'Antwerp' }
        ]);

        test.deepEqual($input.select3('value'), [1, 2]);
    }
);

exports.testInitialValue = DomUtil.createDomTest(
    ['multiple', 'templates'],
    function(test, $input) {
        $input.select3({
            items: ['Amsterdam', 'Antwerp', 'Athens'],
            multiple: true,
            value: ['Amsterdam', 'Antwerp']
        });

        test.deepEqual($input.select3('data'), [
            { id: 'Amsterdam', text: 'Amsterdam' },
            { id: 'Antwerp', text: 'Antwerp' }
        ]);

        test.deepEqual($input.select3('value'), ['Amsterdam', 'Antwerp']);
    }
);

exports.testNestedData = DomUtil.createDomTest(
    ['multiple', 'templates'],
    function(test, $input) {
        $input.select3({
            data: [
                { id: 54, text: 'Vienna' },
                { id: 2, text: 'Antwerp' }
            ],
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
            ],
            multiple: true
        });

        test.deepEqual($input.select3('data'), [
            { id: 54, text: 'Vienna' },
            { id: 2, text: 'Antwerp' }
        ]);

        test.deepEqual($input.select3('value'), [54, 2]);
    }
);

exports.testNoData = DomUtil.createDomTest(
    ['multiple', 'templates'],
    function(test, $input) {
        $input.select3({
            items: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' },
                { id: 3, text: 'Athens' }
            ],
            multiple: true
        });

        test.deepEqual($input.select3('data'), []);

        test.deepEqual($input.select3('value'), []);
    }
);

exports.testSetValue = DomUtil.createDomTest(
    ['multiple', 'templates'],
    function(test, $input) {
        $input.select3({
            items: ['Amsterdam', 'Antwerp', 'Athens'],
            multiple: true,
            value: ['Amsterdam']
        });

        test.deepEqual($input.select3('value'), ['Amsterdam']);

        $input.select3('value', ['Antwerp', 'Athens']);

        test.deepEqual($input.select3('data'), [
            { id: 'Antwerp', text: 'Antwerp' },
            { id: 'Athens', text: 'Athens' }
        ]);

        test.deepEqual($input.select3('value'), ['Antwerp', 'Athens']);
    }
);

exports.testSetValueWithInitSelection = DomUtil.createDomTest(
    ['multiple', 'templates'],
    function(test, $input) {
        $input.select3({
            initSelection: function(value, callback) {
                var cities = {
                    1: 'Amsterdam',
                    2: 'Antwerp',
                    3: 'Athens'
                };
                callback(value.map(function(id) { return { id: id, text: cities[id] }; }));
            },
            multiple: true,
            value: [1]
        });

        test.deepEqual($input.select3('data'), [{ id: 1, text: 'Amsterdam' }]);

        test.deepEqual($input.select3('value'), [1]);

        $input.select3('value', [2, 3]);

        test.deepEqual($input.select3('data'), [
            { id: 2, text: 'Antwerp' },
            { id: 3, text: 'Athens' }
        ]);

        test.deepEqual($input.select3('value'), [2, 3]);
    }
);

exports.testSetValueWithoutItems = DomUtil.createDomTest(
    ['multiple', 'templates'],
    function(test, $input) {
        $input.select3({
            multiple: true,
            value: ['Amsterdam']
        });

        test.deepEqual($input.select3('value'), ['Amsterdam']);

        $input.select3('value', ['Antwerp', 'Athens']);

        test.deepEqual($input.select3('data'), [
            { id: 'Antwerp', text: 'Antwerp' },
            { id: 'Athens', text: 'Athens' }
        ]);

        test.deepEqual($input.select3('value'), ['Antwerp', 'Athens']);
    }
);
