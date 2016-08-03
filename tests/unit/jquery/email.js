'use strict';

var TestUtil = require('../../test-util');

TestUtil.createJQueryTest(
    'jquery/email: test value on enter',
    ['inputs/email', 'templates'],
    function(test, $input) {
        $input.selectivity({ inputType: 'Email' });

        $input.find('.selectivity-multiple-input').val('test@gmail.com');
        TestUtil.simulateEvent('.selectivity-multiple-input', 'keyup', { keyCode: 13 });

        test.deepEqual($input.selectivity('value'), ['test@gmail.com']);
    }
);

TestUtil.createJQueryTest(
    'jquery/email: test value after space and enter',
    ['inputs/email', 'templates'],
    function(test, $input) {
        $input.selectivity({ inputType: 'Email' });

        var $multipleInput = $input.find('.selectivity-multiple-input');
        $multipleInput.val('test@gmail.com ');
        TestUtil.simulateEvent('.selectivity-multiple-input', 'keyup', { keyCode: 32 });

        test.equal($multipleInput.val(), '');
        test.deepEqual($input.selectivity('value'), ['test@gmail.com']);

        $multipleInput.val('test2@gmail.com');
        TestUtil.simulateEvent('.selectivity-multiple-input', 'keyup', { keyCode: 13 });

        test.deepEqual($input.selectivity('value'), ['test@gmail.com', 'test2@gmail.com']);
    }
);
