'use strict';

var DomUtil = require('../dom-util');

exports.testInitializationSingle = DomUtil.createDomTest(
    ['single', 'templates', 'traditional'],
    { indexResource: 'testcase-traditional.html' },
    function(test, $input, $) {
        $input.selectivity();

        test.deepEqual($input.selectivity('data'), { id: 3, text: 'Three' });

        test.equal($input.selectivity('value'), 3);

        test.equal($('#selectivity-input').selectivity('value'), 3);

        test.equal($input.find('select[name="my_select"] option[selected]').length, 1);
    }
);

exports.testInitializationMultiple = DomUtil.createDomTest(
    ['multiple', 'templates', 'traditional'],
    { indexResource: 'testcase-traditional-multiple.html' },
    function(test, $input, $) {
        $input.selectivity();

        test.deepEqual($input.selectivity('data'), [
            { id: 3, text: 'Three' },
            { id: 4, text: 'Four' }
        ]);

        test.deepEqual($input.selectivity('value'), [3, 4]);

        test.deepEqual($('#selectivity-input').selectivity('value'), [3, 4]);

        test.equal($input.find('select[name="my_select"] option[selected]').length, 2);
    }
);
