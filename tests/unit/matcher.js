'use strict';

var DomUtil = require('../dom-util');

exports.testBasic = DomUtil.createDomTest(
    [],
    function(test, $input) {
        var Selectivity = $input.selectivity;

        test.deepEqual(
            Selectivity.matcher({ id: 1, text: 'Amsterdam' }, 'am'),
            { id: 1, text: 'Amsterdam' }
        );
        test.deepEqual(
            Selectivity.matcher({ id: 1, text: 'Amsterdam' }, 'sterdam'),
            { id: 1, text: 'Amsterdam' }
        );

        test.deepEqual(
            Selectivity.matcher({ id: 45, text: 'Rotterdam' }, 'am'),
            { id: 45, text: 'Rotterdam' }
        );
        test.deepEqual(Selectivity.matcher({ id: 45, text: 'Rotterdam' }, 'sterdam'), null);

        test.deepEqual(Selectivity.matcher({ id: 29, text: 'Łódź' }, 'łódź'),
                                           { id: 29, text: 'Łódź' });
        test.deepEqual(Selectivity.matcher({ id: 29, text: 'Łódź' }, 'lodz'), null);
    }
);

exports.testDiacritics = DomUtil.createDomTest(
    ['diacritics'],
    function(test, $input) {
        var Selectivity = $input.selectivity;

        test.deepEqual(
            Selectivity.matcher({ id: 1, text: 'Amsterdam' }, 'am'),
            { id: 1, text: 'Amsterdam' }
        );
        test.deepEqual(
            Selectivity.matcher({ id: 1, text: 'Amsterdam' }, 'sterdam'),
            { id: 1, text: 'Amsterdam' }
        );

        test.deepEqual(
            Selectivity.matcher({ id: 45, text: 'Rotterdam' }, 'am'),
            { id: 45, text: 'Rotterdam' }
        );
        test.deepEqual(Selectivity.matcher({ id: 45, text: 'Rotterdam' }, 'sterdam'), null);

        test.deepEqual(Selectivity.matcher({ id: 29, text: 'Łódź' }, 'lodz'),
                                           { id: 29, text: 'Łódź' });
    }
);
