'use strict';

var DomUtil = require('../dom-util');

exports.testInitialData = DomUtil.createDomTest(
    ['base', 'multiple', 'templates'],
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
            implementation: require('../../src/select3-multiple')
        });

        test.deepEqual($input.select3('data'), [
            { id: 1, text: 'Amsterdam' },
            { id: 2, text: 'Antwerp' }
        ]);

        test.deepEqual($input.select3('value'), [1, 2]);
    }
);

exports.testInitialValue = DomUtil.createDomTest(
    ['base', 'multiple', 'templates'],
    function(test, $input) {
        $input.select3({
            items: [ 'Amsterdam', 'Antwerp', 'Athens' ],
            implementation: require('../../src/select3-multiple'),
            value: ['Amsterdam', 'Antwerp']
        });

        test.deepEqual($input.select3('data'), [
            { id: 'Amsterdam', text: 'Amsterdam' },
            { id: 'Antwerp', text: 'Antwerp' }
        ]);

        test.deepEqual($input.select3('value'), ['Amsterdam', 'Antwerp']);
    }
);

exports.testNoData = DomUtil.createDomTest(
    ['base', 'multiple', 'templates'],
    function(test, $input) {
        $input.select3({
            items: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' },
                { id: 3, text: 'Athens' }
            ],
            implementation: require('../../src/select3-multiple')
        });

        test.deepEqual($input.select3('data'), []);

        test.deepEqual($input.select3('value'), []);
    }
);

exports.testSetValue = DomUtil.createDomTest(
    ['base', 'multiple', 'templates'],
    function(test, $input) {
        $input.select3({
            items: [ 'Amsterdam', 'Antwerp', 'Athens' ],
            implementation: require('../../src/select3-multiple'),
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
    ['base', 'multiple', 'templates'],
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
            implementation: require('../../src/select3-multiple'),
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
    ['base', 'multiple', 'templates'],
    function(test, $input) {
        $input.select3({
            implementation: require('../../src/select3-multiple'),
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
