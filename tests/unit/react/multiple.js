'use strict';

var _ = require('lodash');
var React = require('react');
var ReactDOM = require('react-dom');

var TestUtil = require('../../test-util');

TestUtil.createReactTest(
    'react/multiple: test click after search',
    ['inputs/multiple', 'dropdown', 'templates'],
    {
        items: ['Amsterdam', 'Antwerp', 'Athens'],
        multiple: true
    },
    function(SelectivityReact, test, ref, container, $) {
        TestUtil.simulateEvent('.selectivity-multiple-input', 'click');
        $('.selectivity-multiple-input')[0].value = 'amster';
        TestUtil.simulateEvent('.selectivity-multiple-input', 'keyup');
        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="Amsterdam"]', 'click');

        test.deepEqual(ref.getValue(), ['Amsterdam']);
        test.equal($('.selectivity-multiple-input')[0].value, '');
    }
);

TestUtil.createReactTest(
    'react/multiple: test filter selected items (1)',
    ['inputs/multiple', 'dropdown', 'templates'],
    {
        defaultValue: ['Amsterdam', 'Athens'],
        items: ['Amsterdam', 'Antwerp', 'Athens'],
        multiple: true
    },
    function(SelectivityReact, test, ref, container, $) {
        TestUtil.simulateEvent(container.firstChild, 'click');

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 1);
        test.equal($('.selectivity-result-item')[0].textContent, 'Antwerp');
    }
);

TestUtil.createReactTest(
    'react/multiple: test filter selected items (2)',
    ['inputs/multiple', 'dropdown', 'templates'],
    {
        defaultValue: ['Athens'],
        items: ['Amsterdam', 'Antwerp', 'Athens'],
        multiple: true
    },
    function(SelectivityReact, test, ref, container, $) {
        TestUtil.simulateEvent(container.firstChild, 'click');

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 2);
        test.equal($('.selectivity-result-item')[0].textContent, 'Amsterdam');
        test.equal($('.selectivity-result-item')[1].textContent, 'Antwerp');
    }
);

TestUtil.createReactTest(
    'react/multiple: test initial data',
    ['inputs/multiple', 'templates'],
    {
        defaultData: [{ id: 1, text: 'Amsterdam' }, { id: 2, text: 'Antwerp' }],
        items: [
            { id: 1, text: 'Amsterdam' },
            { id: 2, text: 'Antwerp' },
            { id: 3, text: 'Athens' }
        ],
        multiple: true
    },
    function(SelectivityReact, test, ref) {
        test.deepEqual(ref.getData(), [{ id: 1, text: 'Amsterdam' }, { id: 2, text: 'Antwerp' }]);

        test.deepEqual(ref.getValue(), [1, 2]);
    }
);

TestUtil.createReactTest(
    'react/multiple: test initial value',
    ['inputs/multiple', 'templates'],
    {
        defaultValue: ['Amsterdam', 'Antwerp'],
        items: ['Amsterdam', 'Antwerp', 'Athens'],
        multiple: true
    },
    function(SelectivityReact, test, ref) {
        test.deepEqual(ref.getData(), [
            { id: 'Amsterdam', text: 'Amsterdam' },
            { id: 'Antwerp', text: 'Antwerp' }
        ]);

        test.deepEqual(ref.getValue(), ['Amsterdam', 'Antwerp']);
    }
);

TestUtil.createReactTest(
    'react/multiple: test nested data',
    ['inputs/multiple', 'templates'],
    {
        defaultData: [{ id: 54, text: 'Vienna' }, { id: 2, text: 'Antwerp' }],
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
        ],
        multiple: true
    },
    function(SelectivityReact, test, ref) {
        test.deepEqual(ref.getData(), [{ id: 54, text: 'Vienna' }, { id: 2, text: 'Antwerp' }]);

        test.deepEqual(ref.getValue(), [54, 2]);
    }
);

TestUtil.createReactTest(
    'react/multiple: test without data',
    ['inputs/multiple', 'templates'],
    {
        items: [
            { id: 1, text: 'Amsterdam' },
            { id: 2, text: 'Antwerp' },
            { id: 3, text: 'Athens' }
        ],
        multiple: true
    },
    function(SelectivityReact, test, ref, container, $) {
        test.deepEqual(ref.getData(), []);

        test.deepEqual(ref.getValue(), []);

        test.equal(ref.selectivity.enabled, true);

        test.equal($('input').length, 1);
    }
);

TestUtil.createReactTest(
    'react/multiple: test without data and remove-only',
    ['inputs/multiple', 'templates'],
    {
        items: [
            { id: 1, text: 'Amsterdam' },
            { id: 2, text: 'Antwerp' },
            { id: 3, text: 'Athens' }
        ],
        multiple: true,
        removeOnly: true
    },
    function(SelectivityReact, test, ref, container, $) {
        test.deepEqual(ref.getData(), []);

        test.deepEqual(ref.getValue(), []);

        test.equal(ref.selectivity.enabled, false);

        test.equal($('input').length, 0);
    }
);

TestUtil.createReactTest(
    'react/multiple: test setting remove-only after construction',
    ['inputs/multiple', 'templates'],
    {
        async: true,
        items: [
            { id: 1, text: 'Amsterdam' },
            { id: 2, text: 'Antwerp' },
            { id: 3, text: 'Athens' }
        ],
        multiple: true
    },
    function(SelectivityReact, test, ref, container, $) {
        test.equal($('input').length, 1);

        ReactDOM.render(
            React.createElement(SelectivityReact, {
                items: [
                    { id: 1, text: 'Amsterdam' },
                    { id: 2, text: 'Antwerp' },
                    { id: 3, text: 'Athens' }
                ],
                removeOnly: true
            }),
            container,
            function() {
                test.equal($('input').length, 0);

                test.end();
            }
        );
    }
);

TestUtil.createReactTest(
    'react/multiple: test set value',
    ['inputs/multiple', 'templates'],
    {
        async: true,
        items: ['Amsterdam', 'Antwerp', 'Athens'],
        multiple: true,
        onChange: _.noop,
        value: ['Amsterdam']
    },
    function(SelectivityReact, test, ref, container) {
        test.plan(3);

        test.deepEqual(ref.getValue(), ['Amsterdam']);

        ReactDOM.render(
            React.createElement(SelectivityReact, {
                items: ['Amsterdam', 'Antwerp', 'Athens'],
                value: ['Antwerp', 'Athens']
            }),
            container,
            function() {
                test.deepEqual(ref.getData(), [
                    { id: 'Antwerp', text: 'Antwerp' },
                    { id: 'Athens', text: 'Athens' }
                ]);

                test.deepEqual(ref.getValue(), ['Antwerp', 'Athens']);

                test.end();
            }
        );
    }
);

function initSelection(value, callback) {
    var cities = {
        1: 'Amsterdam',
        2: 'Antwerp',
        3: 'Athens'
    };
    callback(
        value.map(function(id) {
            return { id: id, text: cities[id] };
        })
    );
}

TestUtil.createReactTest(
    'react/multiple: test set value with init selection',
    ['inputs/multiple', 'templates'],
    { async: true, initSelection: initSelection, multiple: true, onChange: _.noop, value: [1] },
    function(SelectivityReact, test, ref, container) {
        test.plan(4);

        test.deepEqual(ref.getData(), [{ id: 1, text: 'Amsterdam' }]);
        test.deepEqual(ref.getValue(), [1]);

        ReactDOM.render(
            React.createElement(SelectivityReact, { initSelection: initSelection, value: [2, 3] }),
            container,
            function() {
                test.deepEqual(ref.getData(), [
                    { id: 2, text: 'Antwerp' },
                    { id: 3, text: 'Athens' }
                ]);

                test.deepEqual(ref.getValue(), [2, 3]);

                test.end();
            }
        );
    }
);

TestUtil.createReactTest(
    'react/multiple: test set value without items',
    ['inputs/multiple', 'templates'],
    { async: true, multiple: true, onChange: _.noop, value: ['Amsterdam'] },
    function(SelectivityReact, test, ref, container) {
        test.plan(3);

        test.deepEqual(ref.getValue(), ['Amsterdam']);

        ReactDOM.render(
            React.createElement(SelectivityReact, { value: ['Antwerp', 'Athens'] }),
            container,
            function() {
                test.deepEqual(ref.getData(), [
                    { id: 'Antwerp', text: 'Antwerp' },
                    { id: 'Athens', text: 'Athens' }
                ]);

                test.deepEqual(ref.getValue(), ['Antwerp', 'Athens']);

                test.end();
            }
        );
    }
);

TestUtil.createReactTest(
    "react/multiple: test set default value doesn't change value",
    ['inputs/multiple', 'templates'],
    {
        async: true,
        defaultValue: ['Amsterdam'],
        items: ['Amsterdam', 'Antwerp', 'Athens'],
        multiple: true
    },
    function(SelectivityReact, test, ref, container) {
        test.plan(3);

        test.deepEqual(ref.getValue(), ['Amsterdam']);

        ReactDOM.render(
            React.createElement(SelectivityReact, {
                defaultValue: ['Antwerp', 'Athens'],
                items: ['Amsterdam', 'Antwerp', 'Athens']
            }),
            container,
            function() {
                test.deepEqual(ref.getData(), [{ id: 'Amsterdam', text: 'Amsterdam' }]);
                test.deepEqual(ref.getValue(), ['Amsterdam']);
                test.end();
            }
        );
    }
);

TestUtil.createReactTest(
    'react/multiple: test mouse over',
    ['inputs/multiple', 'templates'],
    { multiple: true, onChange: _.noop, value: ['Amsterdam'] },
    function(SelectivityReact, test, ref, container) {
        TestUtil.simulateEvent('.selectivity-multiple-input', 'mouseenter');

        test.ok(container.firstChild.classList.contains('hover'));

        TestUtil.simulateEvent('.selectivity-multiple-input', 'mouseleave', {
            fromElement: container.firstChild
        });

        test.equal(container.firstChild.classList.contains('hover'), false);
    }
);

TestUtil.createReactTest(
    'react/multiple: test click and mouse over',
    ['inputs/multiple', 'dropdown', 'templates'],
    { async: true, multiple: true, onChange: _.noop, value: ['Amsterdam'] },
    function(SelectivityReact, test, ref, container) {
        test.plan(3);

        TestUtil.simulateEvent('.selectivity-multiple-input-container', 'click');

        test.equal(container.firstChild.getAttribute('class'), 'open');

        TestUtil.simulateEvent('.selectivity-multiple-input', 'mouseenter');

        test.equal(container.firstChild.getAttribute('class'), 'open hover');
        ref.close();

        setTimeout(function() {
            test.equal(container.firstChild.getAttribute('class'), 'hover');
            test.end();
        }, 10);
    }
);

TestUtil.createReactTest(
    'react/multiple: test blur event after opening',
    ['inputs/multiple', 'dropdown', 'templates'],
    { async: true, multiple: true, onChange: _.noop, value: ['Amsterdam'] },
    function(SelectivityReact, test, ref, container) {
        test.plan(2);

        TestUtil.simulateEvent('.selectivity-multiple-input-container', 'click');

        test.equal(container.firstChild.getAttribute('class'), 'open');

        TestUtil.simulateEvent(container.firstChild, 'blur');

        setTimeout(function() {
            test.equal(container.firstChild.classList.contains('hover'), false);
            test.end();
        }, 200);
    }
);

TestUtil.createReactTest(
    'react/multiple: test trim spaces functionality',
    ['inputs/multiple', 'plugins/tokenizer', 'templates'],
    {
        multiple: true,
        showDropdown: false,
        tokenSeparators: [','],
        trimSpaces: true
    },
    function(SelectivityReact, test, ref, container, $) {
        $('.selectivity-multiple-input')[0].value = ' Amsterdam  , Berlin   , ';
        TestUtil.simulateEvent('.selectivity-multiple-input', 'keyup');

        test.deepEqual(ref.getData(), [
            { id: 'Amsterdam', text: 'Amsterdam' },
            { id: 'Berlin', text: 'Berlin' }
        ]);
        test.deepEqual(ref.getValue(), ['Amsterdam', 'Berlin']);
    }
);

TestUtil.createReactTest(
    'react/multiple: test allow duplicates',
    ['inputs/multiple', 'plugins/tokenizer', 'templates'],
    {
        allowDuplicates: true,
        multiple: true,
        showDropdown: false,
        tokenSeparators: [',']
    },
    function(SelectivityReact, test, ref, container, $) {
        $('.selectivity-multiple-input')[0].value = 'Berlin,Amsterdam,Berlin,';
        TestUtil.simulateEvent('.selectivity-multiple-input', 'keyup');

        test.deepEqual(ref.getData(), [
            { id: 'Berlin', text: 'Berlin' },
            { id: 'Amsterdam', text: 'Amsterdam' },
            { id: 'Berlin', text: 'Berlin' }
        ]);
        test.deepEqual(ref.getValue(), ['Berlin', 'Amsterdam', 'Berlin']);
    }
);

TestUtil.createReactTest(
    'react/multiple: test read-only input',
    ['inputs/multiple', 'templates'],
    { async: true, multiple: true, onChange: _.noop, value: ['Amsterdam', 'Antwerp'] },
    function(SelectivityReact, test, ref, container, $) {
        test.plan(6);

        test.equal($('.selectivity-multiple-selected-item').length, 2);
        test.equal($('.selectivity-multiple-selected-item-remove').length, 2);

        ReactDOM.render(
            React.createElement(SelectivityReact, {
                readOnly: true,
                value: ['Amsterdam', 'Antwerp']
            }),
            container,
            function() {
                test.equal($('.selectivity-multiple-selected-item').length, 2);
                test.equal($('.selectivity-multiple-selected-item-remove').length, 0);

                ReactDOM.render(
                    React.createElement(SelectivityReact, {
                        readOnly: false,
                        value: ['Amsterdam', 'Antwerp']
                    }),
                    container,
                    function() {
                        test.equal($('.selectivity-multiple-selected-item').length, 2);
                        test.equal($('.selectivity-multiple-selected-item-remove').length, 2);

                        test.end();
                    }
                );
            }
        );
    }
);

TestUtil.createReactTest(
    'react/multiple: test filtering of children',
    ['inputs/multiple', 'dropdown', 'templates'],
    {
        defaultValue: [3],
        items: [
            { text: 'Belgium', children: [{ id: 2, text: 'Antwerp' }] },
            { text: 'Greece', children: [{ id: 3, text: 'Athens' }] },
            { text: 'Netherlands', children: [{ id: 1, text: 'Amsterdam' }] }
        ],
        multiple: true
    },
    function(SelectivityReact, test, ref, container, $) {
        TestUtil.simulateEvent(container.firstChild, 'click');

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-label').length, 3);
        test.equal($('.selectivity-result-label')[0].textContent, 'Belgium');
        test.equal($('.selectivity-result-label')[1].textContent, 'Greece');
        test.equal($('.selectivity-result-label')[2].textContent, 'Netherlands');
        test.equal($('.selectivity-result-item').length, 2);
        test.equal($('.selectivity-result-item')[0].textContent, 'Antwerp');
        test.equal($('.selectivity-result-item')[1].textContent, 'Amsterdam');
    }
);
