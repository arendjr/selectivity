'use strict';

var DomUtil = require('../../test-util');

DomUtil.createJQueryTest(
    'jquery/traditional: test initialization of single select input',
    ['input-types/single', 'plugins/traditional', 'templates'],
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

DomUtil.createJQueryTest(
    'jquery/traditional: test initialization of single select input with custom query',
    ['input-types/single', 'plugins/traditional', 'templates'],
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

DomUtil.createJQueryTest(
    'jquery/traditional: test initialization of single select input with empty value',
    ['input-types/single', 'plugins/traditional', 'templates'],
    { indexResource: 'testcase-traditional-empty-value.html' },
    function(test, $input) {
        $input.selectivity();

        test.deepEqual($input.selectivity('data'), { id: '', text: 'Select one' });

        test.equal($input.selectivity('value'), '');
    }
);

DomUtil.createJQueryTest(
    'jquery/traditional: test initialization of multiple select input',
    ['input-types/multiple', 'plugins/traditional', 'templates'],
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

DomUtil.createJQueryTest(
    'jquery/traditional: test change events of single select input',
    ['input-types/single', 'plugins/traditional', 'templates'],
    { indexResource: 'testcase-traditional.html' },
    function(test, $input, $) {
        var changeEvents = 0;
        $input.selectivity({
            query: function() {}
        });

        $input.on('change', function() {
            changeEvents++;
        });

        $('.selectivity-single-select').trigger({
            type: 'selectivity-selected',
            item: { id: '1', text: 'foo bar' }
        });

        test.equal(changeEvents, 1);
        test.equal($input.val(), '1');
    }
);

DomUtil.createJQueryTest(
    'jquery/traditional: test change events of multiple select input',
    ['input-types/multiple', 'plugins/traditional', 'templates'],
    { indexResource: 'testcase-traditional-multiple.html' },
    function(test, $input, $) {
        var changeEvents = 0;
        $input.selectivity({
            query: function() {}
        });

        $input.on('change', function() {
            changeEvents++;
        });

        $('.selectivity-multiple-input-container').trigger({
            type: 'selectivity-selected',
            item: { id: '1', text: 'foo bar' }
        });

        test.equal(changeEvents, 1);
        test.deepEqual($input.val(), ['1', '3', '4']);

        $('.selectivity-multiple-input-container').trigger({
            type: 'selectivity-selected',
            item: { id: '2', text: 'foo bar' }
        });

        test.equal(changeEvents, 2);
        test.deepEqual($input.val(), ['1', '2', '3', '4']);
    }
);
