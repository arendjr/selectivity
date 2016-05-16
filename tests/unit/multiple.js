'use strict';

var TestUtil = require('../test-util');

TestUtil.createDomTest(
    'multiple: test clear',
    ['multiple', 'templates'],
    function(test, $input) {
        $input.selectivity({
            data: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' }
            ],
            items: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' },
                { id: 3, text: 'Athens' }
            ],
            multiple: true
        });

        $input.selectivity('clear');

        test.deepEqual($input.selectivity('data'), []);

        test.deepEqual($input.selectivity('value'), []);
    }
);

TestUtil.createDomTest(
    'multiple: test click after search',
    ['multiple', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            items: ['Amsterdam', 'Antwerp', 'Athens'],
            multiple: true
        });

        $input.find('.selectivity-multiple-input').click().val('amster').trigger('keyup');
        $('.selectivity-result-item[data-item-id="Amsterdam"]').click();

        test.deepEqual($input.selectivity('value'), ['Amsterdam']);
        test.equal($input.find('.selectivity-multiple-input').val(), '');
    }
);

TestUtil.createDomTest(
    'multiple: test filter selected items',
    ['multiple', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            items: ['Amsterdam', 'Antwerp', 'Athens'],
            multiple: true,
            value: ['Amsterdam', 'Athens']
        });

        $input.click();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 1);
        test.equal($('.selectivity-result-item').text(), 'Antwerp');

        $input.selectivity('close');
        $input.selectivity('value', ['Athens']);
        $input.selectivity('open');

        test.equal($('.selectivity-result-item').length, 2);
        test.equal($('.selectivity-result-item').first().text(), 'Amsterdam');
        test.equal($('.selectivity-result-item').last().text(), 'Antwerp');
    }
);

TestUtil.createDomTest(
    'multiple: test initial data',
    ['multiple', 'templates'],
    function(test, $input) {
        $input.selectivity({
            data: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' }
            ],
            items: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' },
                { id: 3, text: 'Athens' }
            ],
            multiple: true
        });

        test.deepEqual($input.selectivity('data'), [
            { id: 1, text: 'Amsterdam' },
            { id: 2, text: 'Antwerp' }
        ]);

        test.deepEqual($input.selectivity('value'), [1, 2]);
    }
);

TestUtil.createDomTest(
    'multiple: test initial value',
    ['multiple', 'templates'],
    function(test, $input) {
        $input.selectivity({
            items: ['Amsterdam', 'Antwerp', 'Athens'],
            multiple: true,
            value: ['Amsterdam', 'Antwerp']
        });

        test.deepEqual($input.selectivity('data'), [
            { id: 'Amsterdam', text: 'Amsterdam' },
            { id: 'Antwerp', text: 'Antwerp' }
        ]);

        test.deepEqual($input.selectivity('value'), ['Amsterdam', 'Antwerp']);
    }
);

TestUtil.createDomTest(
    'multiple: test nested data',
    ['multiple', 'templates'],
    function(test, $input) {
        $input.selectivity({
            data: [
                { id: 54, text: 'Vienna' },
                { id: 2, text: 'Antwerp' }
            ],
            items: [{
                text: 'Austria',
                children: [
                    { id: 54, text: 'Vienna' }
                ]
            }, {
                text: 'Belgium',
                children: [
                    { id: 2, text: 'Antwerp' },
                    { id: 9, text: 'Brussels' }
                ]
            }, {
                text: 'Bulgaria',
                children: [
                    { id: 48, text: 'Sofia' }
                ]
            }],
            multiple: true
        });

        test.deepEqual($input.selectivity('data'), [
            { id: 54, text: 'Vienna' },
            { id: 2, text: 'Antwerp' }
        ]);

        test.deepEqual($input.selectivity('value'), [54, 2]);
    }
);

TestUtil.createDomTest(
    'multiple: test without data',
    ['multiple', 'templates'],
    function(test, $input) {
        $input.selectivity({
            items: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' },
                { id: 3, text: 'Athens' }
            ],
            multiple: true
        });

        test.deepEqual($input.selectivity('data'), []);

        test.deepEqual($input.selectivity('value'), []);
    }
);

TestUtil.createDomTest(
    'multiple: test remove-only',
    ['multiple', 'templates'],
    function(test, $input) {
        $input.selectivity({
            items: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' },
                { id: 3, text: 'Athens' }
            ],
            multiple: true
        }).selectivity('setOptions', {
            removeOnly: true
        });

        test.equal($input.find('input').length, 0);
    }
);

TestUtil.createDomTest(
    'multiple: test set value',
    ['multiple', 'templates'],
    function(test, $input) {
        $input.selectivity({
            items: ['Amsterdam', 'Antwerp', 'Athens'],
            multiple: true,
            value: ['Amsterdam']
        });

        test.deepEqual($input.selectivity('value'), ['Amsterdam']);

        $input.selectivity('value', ['Antwerp', 'Athens']);

        test.deepEqual($input.selectivity('data'), [
            { id: 'Antwerp', text: 'Antwerp' },
            { id: 'Athens', text: 'Athens' }
        ]);

        test.deepEqual($input.selectivity('value'), ['Antwerp', 'Athens']);
    }
);

TestUtil.createDomTest(
    'multiple: test set value with init selection',
    ['multiple', 'templates'],
    function(test, $input) {
        $input.selectivity({
            initSelection: function(value, callback) {
                var cities = {
                    1: 'Amsterdam',
                    2: 'Antwerp',
                    3: 'Athens'
                };
                callback(value.map(function(id) { return { id: id, text: cities[id] }; }));
            },
            multiple: true,
            value: [1]
        });

        test.deepEqual($input.selectivity('data'), [{ id: 1, text: 'Amsterdam' }]);

        test.deepEqual($input.selectivity('value'), [1]);

        $input.selectivity('value', [2, 3]);

        test.deepEqual($input.selectivity('data'), [
            { id: 2, text: 'Antwerp' },
            { id: 3, text: 'Athens' }
        ]);

        test.deepEqual($input.selectivity('value'), [2, 3]);
    }
);

TestUtil.createDomTest(
    'multiple: test set value without items',
    ['multiple', 'templates'],
    function(test, $input) {
        $input.selectivity({
            multiple: true,
            value: ['Amsterdam']
        });

        test.deepEqual($input.selectivity('value'), ['Amsterdam']);

        $input.selectivity('value', ['Antwerp', 'Athens']);

        test.deepEqual($input.selectivity('data'), [
            { id: 'Antwerp', text: 'Antwerp' },
            { id: 'Athens', text: 'Athens' }
        ]);

        test.deepEqual($input.selectivity('value'), ['Antwerp', 'Athens']);
    }
);

TestUtil.createDomTest(
    'multiple: test mouse over',
    ['multiple', 'templates'],
    function(test, $input, $)
    {
        $input.selectivity({
            multiple: true,
            value: ['Amsterdam']
        });

        $('.selectivity-multiple-input').trigger('mouseover');

        test.ok($input.hasClass('hover'));

        $('.selectivity-multiple-input').trigger('mouseleave');

        test.equal($input.hasClass('hover'), false);
    }
);

TestUtil.createDomTest(
    'multiple: test click and mouse over',
    ['multiple', 'dropdown', 'templates'],
    function(test, $input, $)
    {
        $input.selectivity({
            multiple: true,
            value: ['Amsterdam']
        });

        $('.selectivity-multiple-input-container').click();

        test.equal($input.attr('class'), 'open');

        $('.selectivity-multiple-input').trigger('mouseover');

        test.equal($input.attr('class'), 'open hover');
        $input.selectivity('close');

        test.equal($input.attr('class'), 'hover');
    }
);

TestUtil.createDomTest(
    'multiple: test blur event after opening',
    ['multiple', 'dropdown', 'templates'],
    function(test, $input, $)
    {
        $input.selectivity({
            multiple: true,
            value: ['Amsterdam']
        });

        $('.selectivity-multiple-input-container').click();

        test.ok($input.hasClass('open'));

        $input.trigger('blur');

        test.equal($input.hasClass('open'), false);
    }
);

