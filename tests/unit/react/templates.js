'use strict';

var React = require('react');
var div = React.createFactory('div');
var input = React.createFactory('input');
var span = React.createFactory('span');

var TestUtil = require('../../test-util');

TestUtil.createReactTest(
    'react/templates: test templates specified as React elements',
    ['inputs/single', 'plugins/react/templates'],
    {
        defaultValue: 'Amsterdam <script>',
        items: ['Amsterdam <script>', 'Antwerp', 'Athens'],
        templates: {
            singleSelectInput: function() {
                return div({ className: 'selectivity-single-select react-template' },
                    input({ type: 'text', className: 'selectivity-single-select-input' }),
                    div({ className: 'selectivity-single-result-container' })
                );
            },
            singleSelectedItem: function(options) {
                return span({
                    className: 'selectivity-single-selected-item',
                    'data-item-id': options.id
                }, options.text);
            }
        }
    },
    function(SelectivityReact, test, ref, container, $) {
        test.equal($('.selectivity-single-select.react-template').length, 1);
        test.equal($('.selectivity-single-result-container').length, 1);
        test.equal($('.selectivity-single-selected-item').length, 1);
        test.ok(
            $('.selectivity-single-selected-item')[0].textContent.indexOf('Amsterdam <script>') > -1
        );
        test.equal(
            $('.selectivity-single-selected-item')[0].getAttribute('data-item-id'),
            'Amsterdam <script>'
        );
    }
);
