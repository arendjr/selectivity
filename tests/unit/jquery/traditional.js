'use strict';

var TestUtil = require('../../test-util');

TestUtil.createJQueryTest(
    'jquery/traditional: test initialization of single select input',
    ['inputs/single', 'plugins/jquery/traditional', 'templates'],
    { indexResource: 'testcase-traditional.html' },
    function(test, $input, $) {
        $input.selectivity();

        test.deepEqual($input.selectivity('data'), { id: '3', text: 'Three' });

        test.equal($input.selectivity('value'), '3');

        test.equal($('#selectivity-input').selectivity('value'), '3');

        var $options = $('select[name="my_select"] option[selected]');
        test.equal($options.length, 1);
        test.equal($options.first().val(), '3');

        test.equal($('div.selectivity-input')[0].id, 's9y_selectivity-input');
    }
);

TestUtil.createJQueryTest(
    'jquery/traditional: test initialization of single select input with custom query',
    ['inputs/single', 'plugins/jquery/traditional', 'templates'],
    { indexResource: 'testcase-traditional.html' },
    function(test, $input) {
        $input.selectivity({
            query: function() {}
        });

        test.deepEqual($input.selectivity('data'), { id: '3', text: 'Three' });

        test.equal($input.selectivity('value'), '3');

        test.equal($input[0].selectivity.items, null);
    }
);

TestUtil.createJQueryTest(
    'jquery/traditional: test initialization of single select input with empty value',
    ['inputs/single', 'plugins/jquery/traditional', 'templates'],
    { indexResource: 'testcase-traditional-empty-value.html' },
    function(test, $input) {
        $input.selectivity();

        test.deepEqual($input.selectivity('data'), { id: '', text: 'Select one' });

        test.equal($input.selectivity('value'), '');
    }
);

TestUtil.createJQueryTest(
    'jquery/traditional: test initialization of multiple select input',
    ['inputs/multiple', 'plugins/jquery/traditional', 'templates'],
    { indexResource: 'testcase-traditional-multiple.html' },
    function(test, $input, $) {
        $input.selectivity();

        test.deepEqual($input.selectivity('data'), [
            { id: '3', text: 'Three' },
            { id: '4', text: 'Four' }
        ]);

        test.deepEqual($input.selectivity('value'), ['3', '4']);

        test.deepEqual($('#selectivity-input').selectivity('value'), ['3', '4']);

        var $options = $('select[name="my_select"] option[selected]');
        test.equal($options.length, 2);
        test.equal($options.first().val(), '3');
        test.equal($options.last().val(), '4');

        test.equal($('div.selectivity-input')[0].id, 's9y_selectivity-input');
    }
);

TestUtil.createJQueryTest(
    'jquery/traditional: test change events of single select input',
    ['inputs/single', 'plugins/jquery/traditional', 'templates'],
    { indexResource: 'testcase-traditional.html' },
    function(test, $input) {
        test.plan(6);

        var $originalInput = $input;

        var changeEvents = 0;
        var originalChangeEvents = 0;

        $input = $input.selectivity({
            query: function() {}
        });

        $input.on('change', function(event) {
            test.equal(event.value, '1');
            changeEvents++;
        });

        $originalInput.on('change', function(event) {
            test.equal(event.value, '1');
            originalChangeEvents++;
        });

        TestUtil.simulateEvent($input[0], 'selectivity-selected', {
            item: { id: '1', text: 'foo bar' }
        });

        test.equal(changeEvents, 1);
        test.equal(originalChangeEvents, 1);
        test.equal($originalInput.val(), '1');
        test.equal($input.selectivity('value'), '1');
    }
);

TestUtil.createJQueryTest(
    'jquery/traditional: test change events of multiple select input',
    ['inputs/multiple', 'plugins/jquery/traditional', 'templates'],
    { indexResource: 'testcase-traditional-multiple.html' },
    function(test, $input) {
        test.plan(15);

        var $originalInput = $input;

        var changeEvents = 0;
        var originalChangeEvents = 0;

        $input = $input.selectivity({
            query: function() {}
        });

        $input.on('change', function(event) {
            if (changeEvents === 0) {
                test.deepEqual(event.value, ['3', '4', '1']);
                test.deepEqual(event.added, { id: '1', text: 'foo bar' });
            } else {
                test.deepEqual(event.value, ['3', '4', '1', '2']);
                test.deepEqual(event.added, { id: '2', text: 'foo bar' });
            }
            changeEvents++;
        });

        $originalInput.on('change', function(event) {
            if (changeEvents === 0) {
                test.deepEqual(event.value, ['3', '4', '1']);
                test.deepEqual(event.added, { id: '1', text: 'foo bar' });
            } else {
                test.deepEqual(event.value, ['3', '4', '1', '2']);
                test.deepEqual(event.added, { id: '2', text: 'foo bar' });
            }
            originalChangeEvents++;
        });

        TestUtil.simulateEvent($input[0], 'selectivity-selected', {
            item: { id: '1', text: 'foo bar' }
        });

        test.equal(changeEvents, 1);
        test.equal(originalChangeEvents, 1);
        test.deepEqual($originalInput.val(), ['1', '3', '4']);

        TestUtil.simulateEvent($input[0], 'selectivity-selected', {
            item: { id: '2', text: 'foo bar' }
        });

        test.equal(changeEvents, 2);
        test.equal(originalChangeEvents, 2);
        test.deepEqual($originalInput.val(), ['1', '2', '3', '4']);
        test.deepEqual($input.selectivity('value'), ['3', '4', '1', '2']);
    }
);

TestUtil.createJQueryTest(
    'jquery/traditional: test placeholder with multiple select input',
    ['inputs/multiple', 'plugins/jquery/traditional', 'templates'],
    { indexResource: 'testcase-traditional-multiple-placeholder.html' },
    function(test, $input, $) {
        $input.selectivity();

        test.deepEqual($input.selectivity('data'), []);
        test.equal($('select[name="my_select"] option[selected]').length, 0);
        test.equal($('.multiple-selected-item').length, 0);

        var input = $('.selectivity-multiple-input')[0];
        test.equal(input.value, '');
        test.equal(input.getAttribute('placeholder'), 'Select one or more');
    }
);
