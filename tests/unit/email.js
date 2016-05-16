'use strict';

var TestUtil = require('../test-util');

TestUtil.createDomTest(
    'email: test value on enter',
    ['email', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            inputType: 'Email'
        });

        $input.find('.selectivity-multiple-input').val('test@gmail.com')
                                                  .trigger($.Event('keyup', { keyCode: 13 }));

        test.deepEqual($input.selectivity('value'), ['test@gmail.com']);
    }
);

TestUtil.createDomTest(
    'email: test value after space and enter',
    ['email', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            inputType: 'Email'
        });

        var $multipleInput = $input.find('.selectivity-multiple-input');
        $multipleInput.val('test@gmail.com ').trigger($.Event('keyup', { keyCode: 32 }));

        test.equal($multipleInput.val(), '');
        test.deepEqual($input.selectivity('value'), ['test@gmail.com']);

        $multipleInput.val('test2@gmail.com').trigger($.Event('keyup', { keyCode: 13 }));

        test.deepEqual($input.selectivity('value'), ['test@gmail.com', 'test2@gmail.com']);
    }
);
