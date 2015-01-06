'use strict';

var DomUtil = require('../dom-util');

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
            items: [ 'Amsterdam', 'Antwerp', 'Athens' ],
            value: 'Amsterdam'
        });

        test.deepEqual($input.select3('data'), { id: 'Amsterdam', text: 'Amsterdam' });

        test.deepEqual($input.select3('value'), 'Amsterdam');
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
