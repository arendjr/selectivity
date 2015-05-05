'use strict';

module.exports = {

    /**
     * Wrapper to easily create unit tests that test Selectivity within a DOM environment.
     *
     * @param modules Array of Selectivity modules to test, e.g. ['base', 'single'].
     * @param options Optional options object. May contain the following properties:
     *                indexResource - Filename of the index resource (default: 'testcase.html').
     *                async - Set to true to indicate the test function is asynchronous and calls
     *                        done() itself.
     * @param fn The actual test function. Receives two arguments:
     *           test - The nodeunit test instance.
     *           $input - jQuery container for the '#selectivity-input' element defined in
     *                    resources/testcase.html.
     */
    createDomTest: function(modules, options, fn) {

        if (options instanceof Function) {
            fn = options;
            options = {};
        }

        var indexResource = options.indexResource || 'testcase.html';

        return function(test) {
            require('jsdom').env('tests/resources/' + indexResource, function(errors, window) {
                test.strictEqual(errors, null);

                test.doesNotThrow(function() {
                    var $ = require('../vendor/jquery')(window);
                    var proxyquire = require('proxyquire').noCallThru();

                    var EventDelegator = proxyquire('../src/event-delegator', { 'jquery': $ });

                    var stubs = { 'jquery': $, './event-delegator': EventDelegator };
                    proxyquire('../src/selectivity-base', stubs);

                    // I wish this could be solved without hard-coding the dependenies here...
                    var dependencies = {
                        'async': ['base'],
                        'backdrop': ['dropdown'],
                        'base': [],
                        'diacritics': ['base'],
                        'dropdown': ['base'],
                        'email': ['base', 'multiple'],
                        'keyboard': ['base'],
                        'locale': ['base'],
                        'multiple': ['base'],
                        'single': ['base'],
                        'submenu': ['base', 'dropdown'],
                        'templates': ['base', 'locale'],
                        'tokenizer': ['base'],
                        'traditional': ['base']
                    };

                    var orderedModules = [];

                    function insertDependencies(module) {
                        if (dependencies[module]) {
                            dependencies[module].forEach(function(dependency) {
                                insertDependencies(dependency);
                                if (orderedModules.indexOf(dependency) === -1) {
                                    orderedModules.push(dependency);
                                }
                            });
                            if (orderedModules.indexOf(module) === -1) {
                                orderedModules.push(module);
                            }
                        } else {
                            throw new Error('Dependencies for module ' + module + ' not specified');
                        }
                    }

                    modules.forEach(insertDependencies);

                    orderedModules.forEach(function(module) {
                        var selectivityModule = proxyquire('../src/selectivity-' + module, stubs);
                        stubs['./selectivity-' + module] = selectivityModule;
                    });

                    fn(test, window.$('#selectivity-input'), $);
                });

                if (!options.async) {
                    test.done();
                }
            });
        };
    }

};
