'use strict';

var TestUtil = require('../../test-util');

TestUtil.createReactTest(
    'react/keyboard: test select nested item',
    ['inputs/single', 'plugins/keyboard', 'dropdown', 'templates'],
    {
        items: [
            {
                text: 'Austria',
                children: [{ id: 54, text: 'Vienna' }]
            },
            {
                text: 'Belgium',
                children: [{ id: 2, text: 'Antwerp' }, { id: 9, text: 'Brussels' }]
            },
            {
                text: 'Bulgaria',
                children: [{ id: 48, text: 'Sofia' }]
            }
        ]
    },
    function(SelectivityReact, test, ref, container, $) {
        TestUtil.simulateEvent('.selectivity-single-select', 'click');
        $('.selectivity-search-input')[0].value = 'belg';
        TestUtil.simulateEvent('.selectivity-search-input', 'keyup');
        TestUtil.simulateEvent('.selectivity-search-input', 'keyup', { keyCode: 13 });

        test.deepEqual(ref.getValue(), 2);
    }
);

var changeEvents = [];
function onChange(event) {
    changeEvents.push(event);
}

TestUtil.createReactTest(
    'react/keyboard: test change event after enter',
    ['inputs/multiple', 'plugins/keyboard', 'dropdown', 'templates'],
    {
        items: ['Amsterdam', 'Antwerp', 'Athens'],
        multiple: true,
        onChange: onChange
    },
    function(SelectivityReact, test, ref, container, $) {
        $('.selectivity-multiple-input')[0].value = 'Amsterdam';
        TestUtil.simulateEvent('.selectivity-multiple-input', 'keyup');
        TestUtil.simulateEvent('.selectivity-multiple-input', 'change');
        TestUtil.simulateEvent('.selectivity-multiple-input', 'keyup', { keyCode: 13 });

        test.deepEqual(ref.getValue(), ['Amsterdam']);

        test.equal(changeEvents.length, 1);
        test.deepEqual(changeEvents[0].added, { id: 'Amsterdam', text: 'Amsterdam' });
        test.deepEqual(changeEvents[0].value, ['Amsterdam']);
    }
);

TestUtil.createReactTest(
    'react/keyboard: test up and down navigation',
    ['inputs/single', 'plugins/keyboard', 'dropdown', 'templates'],
    {
        items: ['Amsterdam', 'Antwerp', 'Athens']
    },
    function(SelectivityReact, test, ref, container, $) {
        TestUtil.simulateEvent('.selectivity-single-select', 'click');

        test.equal($('.selectivity-result-item').length, 3);
        test.equal($('.selectivity-result-item.highlight').length, 1);
        test.equal($('.selectivity-result-item.highlight')[0].textContent, 'Amsterdam');

        TestUtil.simulateEvent('.selectivity-search-input', 'keydown', { keyCode: 40 });

        test.equal($('.selectivity-result-item.highlight').length, 1);
        test.equal($('.selectivity-result-item.highlight')[0].textContent, 'Antwerp');

        TestUtil.simulateEvent('.selectivity-search-input', 'keydown', { keyCode: 40 });

        test.equal($('.selectivity-result-item.highlight').length, 1);
        test.equal($('.selectivity-result-item.highlight')[0].textContent, 'Athens');

        TestUtil.simulateEvent('.selectivity-search-input', 'keydown', { keyCode: 40 });

        test.equal($('.selectivity-result-item.highlight').length, 1);
        test.equal($('.selectivity-result-item.highlight')[0].textContent, 'Amsterdam');

        TestUtil.simulateEvent('.selectivity-search-input', 'keydown', { keyCode: 38 });

        test.equal($('.selectivity-result-item.highlight').length, 1);
        test.equal($('.selectivity-result-item.highlight')[0].textContent, 'Athens');

        TestUtil.simulateEvent('.selectivity-search-input', 'keydown', { keyCode: 38 });

        test.equal($('.selectivity-result-item.highlight').length, 1);
        test.equal($('.selectivity-result-item.highlight')[0].textContent, 'Antwerp');
    }
);
