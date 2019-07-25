const freshy = require("freshy");
const { JSDOM } = require("jsdom");
const tape = require("tape");

require("@babel/register")();

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
     *           test - The tape test instance.
     *           $input - jQuery container for the '#selectivity-input' element defined in
     *                    resources/testcase.html.
     *           $ - jQuery instance.
     */
    createJQueryTest(name, modules, options, fn) {
        if (options instanceof Function) {
            fn = options;
            options = {};
        }

        const indexResource = options.indexResource || "testcase.html";

        tape(name, function(test) {
            JSDOM.fromFile(`tests/resources/${indexResource}`).then(dom => {
                const window = dom.window;

                const end = test.end.bind(test);
                test.end = function() {
                    for (const module of modules) {
                        freshy.unload(`../src/${module}`);
                    }
                    freshy.unload("../src/apis/jquery");
                    freshy.unload("../src/selectivity");
                    freshy.unload("jquery");

                    window.close();
                    end();
                };

                global.document = window.document;
                global.window = window;

                window.$ = window.jQuery = require("jquery");

                require("../src/selectivity");
                require("../src/apis/jquery");
                for (const module of modules) {
                    require(`../src/${module}`);
                }

                fn(test, window.$("#selectivity-input"), window.$);

                if (!options.async) {
                    test.end();
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
     *           test - The tape test instance.
     *           $input - jQuery container for the '#selectivity-input' element defined in
     *                    resources/testcase.html.
     *           $ - jQuery instance.
     */
    createReactTest(name, modules, props, fn) {
        const indexResource = props.indexResource || "testcase.html";

        tape(name, function(test) {
            JSDOM.fromFile(`tests/resources/${indexResource}`).then(dom => {
                const window = dom.window;

                global.console.debug = () => {};
                global.document = window.document;
                global.navigator = {
                    userAgent:
                        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, " +
                        "like Gecko) Chrome/51.0.2704.106 Safari/537.36",
                };
                global.window = window;

                window.$ = window.jQuery = require("jquery");

                require("../src/selectivity");
                for (const module of modules) {
                    require(`../src/${module}`);
                }

                const React = require("react");
                const ReactDOM = require("react-dom");
                const SelectivityReact = require("../src/apis/react");

                const container = document.querySelector("#selectivity-input");

                const end = test.end.bind(test);
                test.end = function() {
                    ReactDOM.unmountComponentAtNode(container);

                    for (const module of modules) {
                        freshy.unload(`../src/${module}`);
                    }
                    freshy.unload("../src/apis/react");
                    freshy.unload("../src/selectivity");

                    window.close();
                    end();
                };

                let ref = null;
                props.ref = _ref => {
                    ref = _ref;
                };

                ReactDOM.render(
                    React.createElement(SelectivityReact, props),
                    container,
                    function() {
                        fn(SelectivityReact, test, ref, container, selector =>
                            container.querySelectorAll(selector),
                        );

                        if (!props.async) {
                            test.end();
                        }
                    },
                );
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
    simulateEvent(element, eventName, eventData) {
        let el = element;
        if (typeof el === "string") {
            el = document.querySelector(el);
        }
        if (!el) {
            throw new Error(`No such element: ${element}`);
        }

        eventData = eventData || {};
        let eventInterface = "Event";
        if (eventName === "blur" || eventName === "focus") {
            eventData.bubbles = false;
            eventInterface = "FocusEvent";
        } else if (eventName === "click" || eventName.startsWith("mouse")) {
            eventData.bubbles = eventName !== "mouseenter" && eventName !== "mouseleave";
            eventInterface = "MouseEvent";
        } else if (eventName.startsWith("key")) {
            eventData.bubbles = true;
            eventInterface = "KeyboardEvent";
        }

        const event = new window[eventInterface](eventName, eventData);
        Object.assign(event, eventData);
        el.dispatchEvent(event);
    },
};
