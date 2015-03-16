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

function query(options) {
    var limit = 10;
    var results = (options.term ? items.filter(function(item) {
        return item.indexOf(options.term) > -1;
    }) : items);
    options.callback({
        results: results.slice(options.offset, options.offset + limit),
        more: results.length > options.offset + limit
    });
}

exports.testLoadMore = DomUtil.createDomTest(
    ['single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({ query: query });

        test.equal($('.selectivity-dropdown').length, 0);
        test.equal($('.selectivity-result-item').length, 0);
        test.equal($('.selectivity-load-more').length, 0);

        $input.click();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 10);
        test.equal($('.selectivity-load-more').length, 1);

        test.equal($('.selectivity-result-item').first().text(), 'Amsterdam');
        test.equal($('.selectivity-result-item').last().text(), 'Bucharest');

        $('.selectivity-load-more').click();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 20);
        test.equal($('.selectivity-load-more').length, 1);

        $('.selectivity-load-more').click();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 25);
        test.equal($('.selectivity-load-more').length, 0);

        test.equal($('.selectivity-result-item').first().text(), 'Amsterdam');
        test.equal($('.selectivity-result-item').last().text(), 'Helsinki');
    }
);

exports.testSearch = DomUtil.createDomTest(
    ['single', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({ query: query });

        $input.click();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 10);
        test.equal($('.selectivity-load-more').length, 1);

        $('.selectivity-search-input').val('am').keyup();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 3);
        test.equal($('.selectivity-load-more').length, 0);

        $('.selectivity-search-input').val('').keyup();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 10);
        test.equal($('.selectivity-load-more').length, 1);
    }

);
