'use strict';

var DomUtil = require('../dom-util');

exports.testInitializationSingle = DomUtil.createDomTest(
    ['single', 'templates', 'traditional'],
    { indexResource: 'testcase-traditional.html' },
    function(test, $input, $) {
        $input.select3();

        test.deepEqual($input.select3('data'), { id: 3, text: 'Three' });

        test.equal($input.select3('value'), 3);

        test.equal($('#select3-input').select3('value'), 3);
    }
);

exports.testInitializationMultiple = DomUtil.createDomTest(
    ['multiple', 'templates', 'traditional'],
    { indexResource: 'testcase-traditional-multiple.html' },
    function(test, $input, $) {
        $input.select3();

        test.deepEqual($input.select3('data'), [{ id: 3, text: 'Three' }, { id: 4, text: 'Four' }]);

        test.deepEqual($input.select3('value'), [3, 4]);

        test.deepEqual($('#select3-input').select3('value'), [3, 4]);
    }
);
