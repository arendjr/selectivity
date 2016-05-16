'use strict';

var TestUtil = require('../test-util');

TestUtil.createDomTest(
    'events: test change event',
    ['single', 'templates'],
    function(test, $input) {
        var changeEvent = null;

        $input.selectivity({
            data: { id: 1, text: 'Amsterdam' },
            items: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' },
                { id: 3, text: 'Athens' }
            ]
        }).on('change', function(event) {
            changeEvent = event;
        });

        $input.selectivity('data', { id: 2, text: 'Antwerp' });

        test.equal(changeEvent.value, 2);
    }
);

TestUtil.createDomTest(
    'events: test suppress change event',
    ['single', 'templates'],
    function(test, $input) {
        var changeEvent = null;

        $input.selectivity({
            data: { id: 1, text: 'Amsterdam' },
            items: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' },
                { id: 3, text: 'Athens' }
            ]
        }).on('change', function(event) {
            changeEvent = event;
        });

        $input.selectivity('data', { id: 2, text: 'Antwerp' }, { triggerChange: false });

        test.equal(changeEvent, null);
    }
);
