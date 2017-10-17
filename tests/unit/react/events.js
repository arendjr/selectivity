'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

var TestUtil = require('../../test-util');

function noop() {}

var changeEvent;
function onChange(event) {
    changeEvent = event;
}

var data = { id: 1, text: 'Amsterdam' };

var items = [{ id: 1, text: 'Amsterdam' }, { id: 2, text: 'Antwerp' }, { id: 3, text: 'Athens' }];

TestUtil.createReactTest(
    'react/events: test change event triggered when result clicked',
    ['inputs/single', 'dropdown', 'templates'],
    { data: data, items: items, onChange: onChange },
    function(SelectivityReact, test, ref, container) {
        changeEvent = null;

        TestUtil.simulateEvent(container.firstChild, 'click');
        TestUtil.simulateEvent('.selectivity-result-item[data-item-id="2"]', 'click');

        test.equal(ref.getValue(), 2);
        test.equal(changeEvent.value, 2);
    }
);

TestUtil.createReactTest(
    'react/events: test change event suppressed for top-down change',
    ['inputs/single', 'dropdown', 'templates'],
    { async: true, data: data, items: items, onChange: onChange },
    function(SelectivityReact, test, ref, container) {
        test.plan(2);

        changeEvent = null;

        ReactDOM.render(
            React.createElement(SelectivityReact, {
                data: { id: 2, text: 'Antwerp' },
                items: items,
                onChange: onChange
            }),
            container,
            function() {
                test.equal(ref.getValue(), 2);
                test.equal(changeEvent, null);

                test.end();
            }
        );
    }
);

TestUtil.createReactTest(
    'react/events: test change event called properly when onChange listener changed',
    ['inputs/single', 'dropdown', 'templates'],
    { async: true, data: data, items: items, onChange: noop },
    function(SelectivityReact, test, ref, container) {
        test.plan(3);

        changeEvent = null;

        ReactDOM.render(
            React.createElement(SelectivityReact, {
                data: data,
                items: items,
                onChange: onChange
            }),
            container,
            function() {
                test.equal(changeEvent, null);

                TestUtil.simulateEvent(container.firstChild, 'click');
                TestUtil.simulateEvent('.selectivity-result-item[data-item-id="2"]', 'click');

                test.equal(ref.getValue(), 2);
                test.equal(changeEvent.value, 2);

                test.end();
            }
        );
    }
);
