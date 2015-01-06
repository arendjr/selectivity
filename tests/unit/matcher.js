'use strict';

var DomUtil = require('../dom-util');

exports.testBasic = DomUtil.createDomTest(
    [],
    function(test, $input) {
        var Select3 = $input.select3;

        test.equal(Select3.matcher('am', 'Amsterdam'), true);
        test.equal(Select3.matcher('sterdam', 'Amsterdam'), true);

        test.equal(Select3.matcher('am', 'Rotterdam'), true);
        test.equal(Select3.matcher('sterdam', 'Rotterdam'), false);

        test.equal(Select3.matcher('łódź', 'Łódź'), true);
        test.equal(Select3.matcher('lodz', 'Łódź'), false);
    }
);

exports.testDiacritics = DomUtil.createDomTest(
    ['diacritics'],
    function(test, $input) {
        var Select3 = $input.select3;

        test.equal(Select3.matcher('am', 'Amsterdam'), true);
        test.equal(Select3.matcher('sterdam', 'Amsterdam'), true);

        test.equal(Select3.matcher('am', 'Rotterdam'), true);
        test.equal(Select3.matcher('sterdam', 'Rotterdam'), false);

        test.equal(Select3.matcher('lodz', 'Łódź'), true);
    }
);
