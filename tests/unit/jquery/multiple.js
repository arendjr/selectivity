'use strict';

var TestUtil = require('../../test-util');

TestUtil.createJQueryTest(
    'jquery/multiple: test clear',
    ['inputs/multiple', 'templates'],
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

TestUtil.createJQueryTest(
    'jquery/multiple: test click after search',
    ['inputs/multiple', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            items: ['Amsterdam', 'Antwerp', 'Athens'],
            multiple: true
        });

        $input.find('.selectivity-multiple-input').click().val('amster');
        $('.selectivity-result-item[data-item-id="Amsterdam"]').click();

        test.deepEqual($input.selectivity('value'), ['Amsterdam']);
        test.equal($input.find('.selectivity-multiple-input').val(), '');
    }
);

TestUtil.createJQueryTest(
    'jquery/multiple: test filter selected items (1)',
    ['inputs/multiple', 'dropdown', 'templates'],
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
    }
);

TestUtil.createJQueryTest(
    'jquery/multiple: test filter selected items (2)',
    ['inputs/multiple', 'dropdown', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            items: ['Amsterdam', 'Antwerp', 'Athens'],
            multiple: true,
            value: ['Athens']
        });

        $input.click();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 2);
        test.equal($('.selectivity-result-item').first().text(), 'Amsterdam');
        test.equal($('.selectivity-result-item').last().text(), 'Antwerp');
    }
);

TestUtil.createJQueryTest(
    'jquery/multiple: test initial data',
    ['inputs/multiple', 'templates'],
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

TestUtil.createJQueryTest(
    'jquery/multiple: test initial value',
    ['inputs/multiple', 'templates'],
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

TestUtil.createJQueryTest(
    'jquery/multiple: test nested data',
    ['inputs/multiple', 'templates'],
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

TestUtil.createJQueryTest(
    'jquery/multiple: test without data',
    ['inputs/multiple', 'templates'],
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

TestUtil.createJQueryTest(
    'jquery/multiple: test remove-only',
    ['inputs/multiple', 'templates'],
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

TestUtil.createJQueryTest(
    'jquery/multiple: test set value',
    ['inputs/multiple', 'templates'],
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

TestUtil.createJQueryTest(
    'jquery/multiple: test set value with init selection',
    ['inputs/multiple', 'templates'],
    function(test, $input) {
        $input.selectivity({
            initSelection: function(value, callback) {
                var cities = {
                    1: 'Amsterdam',
                    2: 'Antwerp',
                    3: 'Athens'
                };
                callback(value.map(function(id) {
                    return { id: id, text: cities[id] };
                }));
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

TestUtil.createJQueryTest(
    'jquery/multiple: test set value without items',
    ['inputs/multiple', 'templates'],
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

TestUtil.createJQueryTest(
    'jquery/multiple: test mouse over',
    ['inputs/multiple', 'templates'],
    function(test, $input) {
        $input.selectivity({
            multiple: true,
            value: ['Amsterdam']
        });

        TestUtil.simulateEvent('.selectivity-multiple-input', 'mouseenter');

        test.ok($input.hasClass('hover'));

        TestUtil.simulateEvent('.selectivity-multiple-input', 'mouseleave');

        test.equal($input.hasClass('hover'), false);
    }
);

TestUtil.createJQueryTest(
    'jquery/multiple: test click and mouse over',
    ['inputs/multiple', 'dropdown', 'templates'],
    { async: true },
    function(test, $input, $) {
        test.plan(3);

        $input.selectivity({
            multiple: true,
            value: ['Amsterdam']
        });

        $('.selectivity-multiple-input-container').click();

        test.equal($input.attr('class'), 'open');

        TestUtil.simulateEvent('.selectivity-multiple-input', 'mouseenter');

        test.equal($input.attr('class'), 'open hover');
        $input.selectivity('close');

        setTimeout(function() {
            test.equal($input.attr('class'), 'hover');
            test.end();
        }, 10);
    }
);

TestUtil.createJQueryTest(
    'jquery/multiple: test blur event after opening',
    ['inputs/multiple', 'dropdown', 'templates'],
    { async: true },
    function(test, $input, $) {
        test.plan(2);

        $input.selectivity({
            multiple: true,
            value: ['Amsterdam']
        });

        $('.selectivity-multiple-input-container').click();

        test.ok($input.hasClass('open'));

        TestUtil.simulateEvent($input[0], 'blur');

        setTimeout(function() {
            test.equal($input.hasClass('open'), false);
            test.end();
        }, 200);
    }
);

TestUtil.createJQueryTest(
    'jquery/multiple: test highlighting a selected item',
    ['inputs/multiple', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            multiple: true,
            value: ['Amsterdam', 'Antwerp']
        });

        test.equal($('.selectivity-multiple-selected-item').length, 2);
        test.equal($('.selectivity-multiple-selected-item.highlighted').length, 0);

        TestUtil.simulateEvent(
            '.selectivity-multiple-selected-item[data-item-id="Amsterdam"]',
            'click'
        );

        test.equal($('.selectivity-multiple-selected-item').length, 2);
        test.equal($('.selectivity-multiple-selected-item.highlighted').length, 1);
        test.equal(
            $('.selectivity-multiple-selected-item[data-item-id="Amsterdam"].highlighted').length,
            1
        );
    }
);

TestUtil.createJQueryTest(
    'jquery/multiple: test read-only input',
    ['inputs/multiple', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            multiple: true,
            value: ['Amsterdam', 'Antwerp']
        });

        test.equal($('.selectivity-multiple-selected-item').length, 2);
        test.equal($('.selectivity-multiple-selected-item-remove').length, 2);

        $input.selectivity('setOptions', { readOnly: true });

        test.equal($('.selectivity-multiple-selected-item').length, 2);
        test.equal($('.selectivity-multiple-selected-item-remove').length, 0);

        $input.selectivity('setOptions', { readOnly: false });

        test.equal($('.selectivity-multiple-selected-item').length, 2);
        test.equal($('.selectivity-multiple-selected-item-remove').length, 2);
    }
);

TestUtil.createJQueryTest(
    'jquery/multiple: test input size',
    ['inputs/multiple', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            items: ['Amsterdam', 'Antwerp', 'Athens'],
            multiple: true,
            placeholder: 'Select a city'
        });

        test.equal($('.selectivity-multiple-input').attr('size'), '15');

        $input.selectivity('value', ['Amsterdam']);

        test.equal($('.selectivity-multiple-input').attr('size'), '2');

        $('.selectivity-multiple-input').val('antw');
        TestUtil.simulateEvent('.selectivity-multiple-input', 'keyup');

        test.equal($('.selectivity-multiple-input').attr('size'), '6');
    }
);
