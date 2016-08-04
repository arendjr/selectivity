'use strict';

var _ = require('lodash');
var freshy = require('freshy');
var jsdom = require('jsdom');
var tape = require('tape');

module.exports = {

    /**
     * Wrapper to easily create unit tests that test Selectivity with jQuery.
     *
     * @param name Test name.
     * @param modules Array of Selectivity modules to test, e.g. ['base', 'single'].
     * @param options Optional options object. May contain the following properties:
     *                indexResource - Filename of the index resource (default: 'testcase.html').
     *                async - Set to true to indicate the test function is asynchronous and calls
     *                        done() itself.
     * @param fn The actual test function. Receives three arguments:
     *           test - The nodeunit test instance.
     *           $input - jQuery container for the '#selectivity-input' element defined in
     *                    resources/testcase.html.
     *           $ - jQuery instance.
     */
    createJQueryTest: function(name, modules, options, fn) {

        if (options instanceof Function) {
            fn = options;
            options = {};
        }

        var indexResource = options.indexResource || 'testcase.html';

        tape(name, function(test) {
            jsdom.env({
                file: 'tests/resources/' + indexResource,
                onload: function(window) {
                    var end = test.end.bind(test);
                    test.end = function() {
                        modules.forEach(function(module) {
                            freshy.unload('../src/' + module);
                        });
                        freshy.unload('../src/apis/jquery');
                        freshy.unload('../src/selectivity');
                        freshy.unload('jquery');

                        window.close();
                        end();
                    };

                    global.document = window.document;
                    global.window = window;

                    window.$ = window.jQuery = require('jquery');

                    require('../src/selectivity');
                    require('../src/apis/jquery');
                    modules.forEach(function(module) {
                        require('../src/' + module);
                    });

                    fn(test, window.$('#selectivity-input'), window.$);

                    if (!options.async) {
                        test.end();
                    }
                }
            });
        });
    },

    /**
     * Wrapper to easily create unit tests that test Selectivity with React.
     *
     * @param name Test name.
     * @param modules Array of Selectivity modules to test, e.g. ['base', 'single'].
     * @param options Props to pass to the Selectivity instance. May contain the following options:
     *                indexResource - Filename of the index resource (default: 'testcase.html').
     *                async - Set to true to indicate the test function is asynchronous and calls
     *                        done() itself.
     * @param fn The actual test function. Receives three arguments:
     *           test - The nodeunit test instance.
     *           $input - jQuery container for the '#selectivity-input' element defined in
     *                    resources/testcase.html.
     *           $ - jQuery instance.
     */
    createReactTest: function(name, modules, props, fn) {

        var indexResource = props.indexResource || 'testcase.html';

        tape(name, function(test) {
            jsdom.env({
                file: 'tests/resources/' + indexResource,
                onload: function(window) {
                    var end = test.end.bind(test);
                    test.end = function() {
                        ReactDOM.unmountComponentAtNode(container);

                        modules.forEach(function(module) {
                            freshy.unload('../src/' + module);
                        });
                        freshy.unload('../src/apis/react');
                        freshy.unload('../src/selectivity');

                        window.close();
                        end();
                    };

                    global.console.debug = _.noop;
                    global.document = window.document;
                    global.navigator = {
                        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, ' +
                                   'like Gecko) Chrome/51.0.2704.106 Safari/537.36'
                    };
                    global.window = window;

                    window.$ = window.jQuery = require('jquery');

                    require('../src/selectivity');
                    modules.forEach(function(module) {
                        require('../src/' + module);
                    });

                    var React = require('react');
                    var ReactDOM = require('react-dom');
                    var SelectivityReact = require('../src/apis/react');

                    var container = document.querySelector('#selectivity-input');

                    var ref = null;
                    props.ref = function(_ref) {
                        ref = _ref;
                    };

                    ReactDOM.render(
                        React.createElement(SelectivityReact, props),
                        container,
                        function() {
                            fn(SelectivityReact, test, ref, container, function(selector) {
                                return container.querySelectorAll(selector);
                            });

                            if (!props.async) {
                                test.end();
                            }
                        }
                    );
                }
            });
        });
    },

    /**
     * Simulates an event on a given element.
     *
     * @param element The element to trigger the event on. May also be specified through a CSS
     *                selector.
     * @param eventName Name of the event to trigger.
     * @param eventData Optional properties to assign to the event.
     */
    simulateEvent: function(element, eventName, eventData) {

        var el = element;
        if (_.isString(el)) {
            el = document.querySelector(el);
        }
        if (!el) {
            throw new Error('No such element: ' + element);
        }

        eventData = eventData || {};
        var eventInterface = 'Event';
        if (eventName === 'blur' || eventName === 'focus') {
            eventData.bubbles = false;
            eventInterface = 'FocusEvent';
        } else if (eventName === 'click' || _.startsWith(eventName, 'mouse')) {
            eventData.bubbles = (eventName !== 'mouseenter' && eventName !== 'mouseleave');
            eventInterface = 'MouseEvent';
        } else if (_.startsWith(eventName, 'key')) {
            eventData.bubbles = true;
            eventInterface = 'KeyboardEvent';
        }

        var event = new window[eventInterface](eventName, eventData);
        _.extend(event, eventData);
        el.dispatchEvent(event);
    }

};
