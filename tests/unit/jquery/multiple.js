'use strict';

var TestUtil = require('../../test-util');

TestUtil.createJQueryTest(
    'jquery/multiple: test clear',
    ['input-types/multiple', 'templates'],
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
    ['input-types/multiple', 'dropdown', 'templates'],
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

TestUtil.createJQueryTest(
    'jquery/multiple: test filter selected items',
    ['input-types/multiple', 'dropdown', 'templates'],
    { async: true },
    function(test, $input, $) {
        test.plan(6);

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

        setTimeout(function() {
            $input.selectivity('value', ['Athens']);
            $input.selectivity('open');

            test.equal($('.selectivity-result-item').length, 2);
            test.equal($('.selectivity-result-item').first().text(), 'Amsterdam');
            test.equal($('.selectivity-result-item').last().text(), 'Antwerp');
            test.end();
        }, 10);
    }
);

TestUtil.createJQueryTest(
    'jquery/multiple: test initial data',
    ['input-types/multiple', 'templates'],
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
    ['input-types/multiple', 'templates'],
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
    ['input-types/multiple', 'templates'],
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
    ['input-types/multiple', 'templates'],
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
    ['input-types/multiple', 'templates'],
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
    ['input-types/multiple', 'templates'],
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
    ['input-types/multiple', 'templates'],
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
    ['input-types/multiple', 'templates'],
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
    ['input-types/multiple', 'templates'],
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
    ['input-types/multiple', 'dropdown', 'templates'],
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
    ['input-types/multiple', 'dropdown', 'templates'],
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

