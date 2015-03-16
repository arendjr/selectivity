'use strict';

var DomUtil = require('../dom-util');

exports.testValueOnEnter = DomUtil.createDomTest(
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

exports.testValueAfterSpaceAndEnter = DomUtil.createDomTest(
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
