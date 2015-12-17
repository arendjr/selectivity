'use strict';

var DomUtil = require('../dom-util');

var items = [
    'Amsterdam',
    'Antwerp',
    'Athens',
    'Barcelona',
    'Berlin',
    'Birmingham',
    'Bradford',
    'Bremen',
    'Brussels',
    'Bucharest',
    'Budapest',
    'Cologne',
    'Copenhagen',
    'Dortmund',
    'Dresden',
    'Dublin',
    'Düsseldorf',
    'Essen',
    'Frankfurt',
    'Genoa',
    'Glasgow',
    'Gothenburg',
    'Hamburg',
    'Hannover',
    'Helsinki'
];

function query() {
    var timeout = 30;
    return function(options) {
        var limit = 10;
        var results = (options.term ? items.filter(function(item) {
            return item.indexOf(options.term) > -1;
        }) : items);

        timeout -= 10;
        setTimeout(function() {
            options.callback({
                results: results.slice(options.offset, options.offset + limit),
                more: results.length > options.offset + limit
            });
        }, timeout);
    };
}

exports.testAsync = DomUtil.createDomTest(
    ['async', 'single', 'dropdown', 'templates'],
    { async: true },
    function(test, $input, $) {
        $input.selectivity({ query: query() });

        $input.click();
        $input.selectivity('search', 'am');
        $input.selectivity('search', 'dam');

        setTimeout(function() {
            test.equal($('.selectivity-result-item').length, 1);
            test.equal($('.selectivity-result-item').text(), 'Amsterdam');
        }, 5);

        setTimeout(function() {
            test.equal($('.selectivity-result-item').length, 1);

            test.done();
        }, 25);
    }

);
exports.testWithoutAsync = DomUtil.createDomTest(
    ['single', 'dropdown', 'templates'],
    { async: true },
    function(test, $input, $) {
        $input.selectivity({ query: query() });

        $input.click();
        $input.selectivity('search', 'am');
        $input.selectivity('search', 'dam');

        setTimeout(function() {
            test.equal($('.selectivity-result-item').length, 1);
            test.equal($('.selectivity-result-item').text(), 'Amsterdam');
        }, 5);

        setTimeout(function() {
            test.equal($('.selectivity-result-item').length, 10);

            test.done();
        }, 25);
    }

);
