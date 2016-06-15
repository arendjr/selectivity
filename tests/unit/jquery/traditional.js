'use strict';

var TestUtil = require('../../test-util');

TestUtil.createJQueryTest(
    'jquery/traditional: test initialization of single select input',
    ['input-types/single', 'plugins/jquery/traditional', 'templates'],
    { indexResource: 'testcase-traditional.html' },
    function(test, $input, $) {
        $input.selectivity();

        test.deepEqual($input.selectivity('data'), { id: '3', text: 'Three' });

        test.equal($input.selectivity('value'), '3');

        test.equal($('#selectivity-input').selectivity('value'), '3');

        var $options = $('select[name="my_select"] option[selected]');
        test.equal($options.length, 1);
        test.equal($options.first().val(), '3');
    }
);

TestUtil.createJQueryTest(
    'jquery/traditional: test initialization of single select input with custom query',
    ['input-types/single', 'plugins/jquery/traditional', 'templates'],
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
    ['input-types/single', 'plugins/jquery/traditional', 'templates'],
    { indexResource: 'testcase-traditional-empty-value.html' },
    function(test, $input) {
        $input.selectivity();

        test.deepEqual($input.selectivity('data'), { id: '', text: 'Select one' });

        test.equal($input.selectivity('value'), '');
    }
);

TestUtil.createJQueryTest(
    'jquery/traditional: test initialization of multiple select input',
    ['input-types/multiple', 'plugins/jquery/traditional', 'templates'],
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
    }
);

TestUtil.createJQueryTest(
    'jquery/traditional: test change events of single select input',
    ['input-types/single', 'plugins/jquery/traditional', 'templates'],
    { indexResource: 'testcase-traditional.html' },
    function(test, $input) {
        var changeEvents = 0;
        $input.selectivity({
            query: function() {}
        });

        $input.on('change', function() {
            changeEvents++;
        });

        TestUtil.simulateEvent('.selectivity-single-select', 'selectivity-selected', {
            item: { id: '1', text: 'foo bar' }
        });

        test.equal(changeEvents, 1);
        test.equal($input.val(), '1');
    }
);

TestUtil.createJQueryTest(
    'jquery/traditional: test change events of multiple select input',
    ['input-types/multiple', 'plugins/jquery/traditional', 'templates'],
    { indexResource: 'testcase-traditional-multiple.html' },
    function(test, $input) {
        var changeEvents = 0;
        $input.selectivity({
            query: function() {}
        });

        $input.on('change', function() {
            changeEvents++;
        });

        TestUtil.simulateEvent('.selectivity-multiple-input-container', 'selectivity-selected', {
            item: { id: '1', text: 'foo bar' }
        });

        test.equal(changeEvents, 1);
        test.deepEqual($input.val(), ['1', '3', '4']);

        TestUtil.simulateEvent('.selectivity-multiple-input-container', 'selectivity-selected', {
            item: { id: '2', text: 'foo bar' }
        });

        test.equal(changeEvents, 2);
        test.deepEqual($input.val(), ['1', '2', '3', '4']);
    }
);
