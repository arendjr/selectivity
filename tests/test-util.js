'use strict';

var freshy = require('freshy');
var jsdom = require('jsdom');
var tape = require('tape');

module.exports = {

    /**
     * Wrapper to easily create unit tests that test Selectivity within a DOM environment.
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
    createDomTest: function(name, modules, options, fn) {

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
                            freshy.unload('../src/selectivity-' + module);
                        });
                        freshy.unload('../src/selectivity-base');
                        freshy.unload('jquery');

                        window.close();
                        end();
                    };

                    global.document = window.document;
                    global.window = window;

                    window.$ = window.jQuery = require('jquery');

                    test.doesNotThrow(function() {
                        require('../src/selectivity-base');
                        modules.forEach(function(module) {
                            require('../src/selectivity-' + module);
                        });

                        fn(test, window.$('#selectivity-input'), window.$);
                    });

                    if (!options.async) {
                        test.end();
                    }
                }
            });
        });
    }

};
