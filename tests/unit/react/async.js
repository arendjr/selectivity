'use strict';

var TestUtil = require('../../test-util');

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
        var results = options.term
            ? items.filter(function(item) {
                  return item.indexOf(options.term) > -1;
              })
            : items;

        timeout -= 10;
        setTimeout(function() {
            options.callback({
                results: results.slice(options.offset, options.offset + limit),
                more: results.length > options.offset + limit
            });
        }, timeout);
    };
}

TestUtil.createReactTest(
    'react/async: test with async',
    ['inputs/single', 'plugins/async', 'dropdown', 'templates'],
    { async: true, query: query() },
    function(SelectivityReact, test, ref, container, $) {
        test.plan(3);

        TestUtil.simulateEvent(container.firstChild, 'click');
        ref.selectivity.search('am');
        ref.selectivity.search('dam');

        setTimeout(function() {
            test.equal($('.selectivity-result-item').length, 1);
            test.equal($('.selectivity-result-item')[0].textContent, 'Amsterdam');
        }, 5);

        setTimeout(function() {
            test.equal($('.selectivity-result-item').length, 1);

            test.end();
        }, 25);
    }
);

TestUtil.createReactTest(
    'react/async: test without async',
    ['inputs/single', 'dropdown', 'templates'],
    { async: true, query: query() },
    function(SelectivityReact, test, ref, container, $) {
        test.plan(3);

        TestUtil.simulateEvent(container.firstChild, 'click');
        ref.selectivity.search('am');
        ref.selectivity.search('dam');

        setTimeout(function() {
            test.equal($('.selectivity-result-item').length, 1);
            test.equal($('.selectivity-result-item')[0].textContent, 'Amsterdam');
        }, 5);

        setTimeout(function() {
            // without async there would be more results
            test.equal($('.selectivity-result-item').length, 10);

            test.end();
        }, 25);
    }
);
