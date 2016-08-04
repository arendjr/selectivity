'use strict';

var _ = require('lodash');
var React = require('react');
var ReactDOM = require('react-dom');

var TestUtil = require('../../test-util');

TestUtil.createReactTest(
    'react/single: test don\'t open after clear',
    ['inputs/single', 'dropdown', 'templates'],
    {
        allowClear: true,
        defaultData: { id: 1, text: 'Amsterdam' },
        items: [
            { id: 1, text: 'Amsterdam' },
            { id: 2, text: 'Antwerp' },
            { id: 3, text: 'Athens' }
        ]
    },
    function(SelectivityReact, test, ref, container, $) {
        test.equal(ref.getValue(), 1);

        TestUtil.simulateEvent('.selectivity-single-selected-item-remove', 'click');

        test.equal(ref.getData(), null);
        test.equal(ref.getValue(), null);

        test.equal($('.selectivity-dropdown').length, 0);
    }
);

TestUtil.createReactTest(
    'react/single: test initial data',
    ['inputs/single', 'templates'],
    {
        defaultData: { id: 1, text: 'Amsterdam' },
        items: [
            { id: 1, text: 'Amsterdam' },
            { id: 2, text: 'Antwerp' },
            { id: 3, text: 'Athens' }
        ]
    },
    function(SelectivityReact, test, ref) {
        test.deepEqual(ref.getData(), { id: 1, text: 'Amsterdam' });

        test.deepEqual(ref.getValue(), 1);
    }
);

TestUtil.createReactTest(
    'react/single: test initial value',
    ['inputs/single', 'templates'],
    { defaultValue: 'Amsterdam', items: ['Amsterdam', 'Antwerp', 'Athens'] },
    function(SelectivityReact, test, ref) {
        test.deepEqual(ref.getData(), { id: 'Amsterdam', text: 'Amsterdam' });

        test.deepEqual(ref.getValue(), 'Amsterdam');
    }
);

var nestedItems = [{
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
}];

TestUtil.createReactTest(
    'react/single: test nested data',
    ['inputs/single', 'templates'],
    { defaultData: { id: 2, text: 'Antwerp' }, items: nestedItems },
    function(SelectivityReact, test, ref) {
        test.deepEqual(ref.getData(), { id: 2, text: 'Antwerp' });

        test.deepEqual(ref.getValue(), 2);
    }
);

TestUtil.createReactTest(
    'react/single: test nested value',
    ['inputs/single', 'templates'],
    { defaultValue: 2, items: nestedItems },
    function(SelectivityReact, test, ref) {
        test.deepEqual(ref.getData(), { id: 2, text: 'Antwerp' });

        test.deepEqual(ref.getValue(), 2);
    }
);

TestUtil.createReactTest(
    'react/single: test without data',
    ['inputs/single', 'templates'],
    {
        items: [
            { id: 1, text: 'Amsterdam' },
            { id: 2, text: 'Antwerp' },
            { id: 3, text: 'Athens' }
        ]
    },
    function(SelectivityReact, test, ref) {
        test.deepEqual(ref.getData(), null);

        test.deepEqual(ref.getValue(), null);
    }
);

TestUtil.createReactTest(
    'react/single: test without search input',
    ['inputs/single', 'dropdown', 'templates'],
    {
        items: [
            { id: 1, text: 'Amsterdam' },
            { id: 2, text: 'Antwerp' },
            { id: 3, text: 'Athens' }
        ],
        showSearchInputInDropdown: false
    },
    function(SelectivityReact, test, ref, container, $) {
        test.equal(ref.getValue(), null);

        ref.open();

        test.equal($('.selectivity-dropdown').length, 1);
        test.equal($('.selectivity-result-item').length, 3);
        test.equal($('.selectivity-result-item')[0].textContent, 'Amsterdam');

        TestUtil.simulateEvent('.selectivity-result-item', 'click');

        test.equal(ref.getValue(), 1);
    }
);

TestUtil.createReactTest(
    'react/single: test set value',
    ['inputs/single', 'templates'],
    {
        async: true,
        items: ['Amsterdam', 'Antwerp', 'Athens'],
        onChange: _.noop,
        value: 'Amsterdam'
    },
    function(SelectivityReact, test, ref, container) {
        test.plan(3);

        test.deepEqual(ref.getValue(), 'Amsterdam');

        ReactDOM.render(
            React.createElement(SelectivityReact, {
                items: ['Amsterdam', 'Antwerp', 'Athens'],
                value: 'Antwerp'
            }),
            container,
            function() {
                test.deepEqual(ref.getData(), { id: 'Antwerp', text: 'Antwerp' });
                test.equal(ref.getValue(), 'Antwerp');
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
    callback({ id: value, text: cities[value] });
}

TestUtil.createReactTest(
    'react/single: test set value with init selection',
    ['inputs/single', 'templates'],
    { async: true, initSelection: initSelection, onChange: _.noop, value: 1 },
    function(SelectivityReact, test, ref, container) {
        test.plan(4);

        test.deepEqual(ref.getData(), { id: 1, text: 'Amsterdam' });
        test.equal(ref.getValue(), 1);

        ReactDOM.render(
            React.createElement(SelectivityReact, { initSelection: initSelection, value: 2 }),
            container,
            function() {
                test.deepEqual(ref.getData(), { id: 2, text: 'Antwerp' });
                test.equal(ref.getValue(), 2);
                test.end();
            }
        );
    }
);

TestUtil.createReactTest(
    'react/single: test set value without items',
    ['inputs/single', 'templates'],
    { async: true, onChange: _.noop, value: 'Amsterdam' },
    function(SelectivityReact, test, ref, container) {
        test.plan(3);

        test.equal(ref.getValue(), 'Amsterdam');

        ReactDOM.render(
            React.createElement(SelectivityReact, { value: 'Antwerp' }),
            container,
            function() {
                test.deepEqual(ref.getData(), { id: 'Antwerp', text: 'Antwerp' });
                test.equal(ref.getValue(), 'Antwerp');
                test.end();
            }
        );
    }
);

TestUtil.createReactTest(
    'react/single: test set default value doesn\'t change value',
    ['inputs/single', 'templates'],
    { async: true, defaultValue: 'Amsterdam', items: ['Amsterdam', 'Antwerp', 'Athens'] },
    function(SelectivityReact, test, ref, container) {
        test.plan(3);

        test.equal(ref.getValue(), 'Amsterdam');

        ReactDOM.render(
            React.createElement(SelectivityReact, {
                defaultValue: 'Antwerp',
                items: ['Amsterdam', 'Antwerp', 'Athens']
            }),
            container,
            function() {
                test.deepEqual(ref.getData(), { id: 'Amsterdam', text: 'Amsterdam' });
                test.equal(ref.getValue(), 'Amsterdam');
                test.end();
            }
        );
    }
);

TestUtil.createReactTest(
    'react/single: test mouse over',
    ['inputs/single', 'templates'],
    { defaultValue: 'Amsterdam' },
    function(SelectivityReact, test, ref, container) {
        TestUtil.simulateEvent('.selectivity-single-select', 'mouseenter');

        test.ok(container.firstChild.classList.contains('hover'));

        TestUtil.simulateEvent(container.firstChild, 'mouseleave');

        test.equal(container.firstChild.classList.contains('hover'), false);
    }
);

TestUtil.createReactTest(
    'react/single: test click and mouse over',
    ['inputs/single', 'dropdown', 'templates'],
    { async: true, defaultValue: 'Amsterdam' },
    function(SelectivityReact, test, ref, container) {
        test.plan(3);

        TestUtil.simulateEvent('.selectivity-single-select', 'click');

        test.equal(container.firstChild.getAttribute('class'), 'open');

        TestUtil.simulateEvent('.selectivity-single-select', 'mouseenter');

        test.equal(container.firstChild.getAttribute('class'), 'open hover');

        ref.close();

        setTimeout(function() {
            test.equal(container.firstChild.getAttribute('class'), 'hover');
            test.end();
        }, 10);
    }
);

TestUtil.createReactTest(
    'react/single: test blur event after opening single select',
    ['inputs/single', 'dropdown', 'templates'],
    { async: true, defaultValue: 'Amsterdam', showSearchInputInDropdown: false },
    function(SelectivityReact, test, ref, container) {
        test.plan(2);

        TestUtil.simulateEvent('.selectivity-single-select', 'click');

        test.ok(container.firstChild.classList.contains('open'));

        TestUtil.simulateEvent(container.firstChild, 'blur');

        setTimeout(function() {
            test.equal(container.firstChild.classList.contains('open'), false);
            test.end();
        }, 200);
    }
);

TestUtil.createReactTest(
    'react/single: test don\'t close when hovering while blur event occurs',
    ['inputs/single', 'dropdown', 'templates'],
    { defaultValue: 'Amsterdam', showSearchInputInDropdown: false },
    function(SelectivityReact, test, ref, container) {
        TestUtil.simulateEvent('.selectivity-single-select', 'click');
        TestUtil.simulateEvent('.selectivity-single-select', 'mouseenter');
        TestUtil.simulateEvent(container.firstChild, 'blur');

        test.ok(container.firstChild.classList.contains('open'));
    }
);

TestUtil.createReactTest(
    'react/single: test default tab index',
    ['inputs/single', 'dropdown', 'templates'],
    { defaultValue: 'Amsterdam', showSearchInputInDropdown: false },
    function(SelectivityReact, test, ref, container) {
        test.equal(container.firstChild.getAttribute('tabindex'), '0');
    }
);

TestUtil.createReactTest(
    'react/single: test tab index option',
    ['inputs/single', 'dropdown', 'templates'],
    { defaultValue: 'Amsterdam', showSearchInputInDropdown: false, tabIndex: 2 },
    function(SelectivityReact, test, ref, container) {
        test.equal(container.firstChild.getAttribute('tabindex'), '2');
    }
);
