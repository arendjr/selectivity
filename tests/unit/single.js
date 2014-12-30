'use strict';

var DomUtil = require('../dom-util');

exports.testInitialData = DomUtil.createDomTest(
    ['base', 'single', 'templates'],
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
    ['base', 'single', 'templates'],
    function(test, $input) {
        $input.select3({ items: [ 'Amsterdam', 'Antwerp', 'Athens' ], value: 'Amsterdam' });

        test.deepEqual($input.select3('data'), { id: 'Amsterdam', text: 'Amsterdam' });

        test.deepEqual($input.select3('value'), 'Amsterdam');
    }
);

exports.testNoData = DomUtil.createDomTest(
    ['base', 'single', 'templates'],
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

