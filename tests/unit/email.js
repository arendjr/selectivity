'use strict';

var DomUtil = require('../dom-util');

exports.testValueOnEnter = DomUtil.createDomTest(
    ['email', 'templates'],
    function(test, $input, $) {
        $input.select3({
            inputType: 'Email'
        });

        $input.find('.select3-multiple-input').val('test@gmail.com')
                                              .trigger($.Event('keyup', { keyCode: 13 }));

        test.deepEqual($input.select3('value'), ['test@gmail.com']);
    }
);

exports.testValueAfterSpaceAndEnter = DomUtil.createDomTest(
    ['email', 'templates'],
    function(test, $input, $) {
        $input.select3({
            inputType: 'Email'
        });

        var $multipleInput = $input.find('.select3-multiple-input');
        $multipleInput.val('test@gmail.com ').trigger($.Event('keyup', { keyCode: 32 }));

        test.equal($multipleInput.val(), '');
        test.deepEqual($input.select3('value'), ['test@gmail.com']);

        $multipleInput.val('test2@gmail.com').trigger($.Event('keyup', { keyCode: 13 }));

        test.deepEqual($input.select3('value'), ['test@gmail.com', 'test2@gmail.com']);
    }
);
