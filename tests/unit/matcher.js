'use strict';

var DomUtil = require('../dom-util');

exports.testBasic = DomUtil.createDomTest(
    [],
    function(test, $input) {
        var Select3 = $input.select3;

        test.deepEqual(
            Select3.matcher({ id: 1, text: 'Amsterdam' }, 'am'),
            { id: 1, text: 'Amsterdam' }
        );
        test.deepEqual(
            Select3.matcher({ id: 1, text: 'Amsterdam' }, 'sterdam'),
            { id: 1, text: 'Amsterdam' }
        );

        test.deepEqual(
            Select3.matcher({ id: 45, text: 'Rotterdam' }, 'am'),
            { id: 45, text: 'Rotterdam' }
        );
        test.deepEqual(Select3.matcher({ id: 45, text: 'Rotterdam' }, 'sterdam'), null);

        test.deepEqual(Select3.matcher({ id: 29, text: 'Łódź' }, 'łódź'), { id: 29, text: 'Łódź' });
        test.deepEqual(Select3.matcher({ id: 29, text: 'Łódź' }, 'lodz'), null);
    }
);

exports.testDiacritics = DomUtil.createDomTest(
    ['diacritics'],
    function(test, $input) {
        var Select3 = $input.select3;

        test.deepEqual(
            Select3.matcher({ id: 1, text: 'Amsterdam' }, 'am'),
            { id: 1, text: 'Amsterdam' }
        );
        test.deepEqual(
            Select3.matcher({ id: 1, text: 'Amsterdam' }, 'sterdam'),
            { id: 1, text: 'Amsterdam' }
        );

        test.deepEqual(
            Select3.matcher({ id: 45, text: 'Rotterdam' }, 'am'),
            { id: 45, text: 'Rotterdam' }
        );
        test.deepEqual(Select3.matcher({ id: 45, text: 'Rotterdam' }, 'sterdam'), null);

        test.deepEqual(Select3.matcher({ id: 29, text: 'Łódź' }, 'lodz'), { id: 29, text: 'Łódź' });
    }
);
