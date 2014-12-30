'use strict';

module.exports = {

    /**
     * Wrapper to easily create unit tests that test Select3 within a DOM environment.
     *
     * @param modules Array of Select3 modules to test, e.g. ['base', 'single'].
     * @param fn The actual test function. Receives two arguments:
     *           test - The nodeunit test instance.
     *           $input - jQuery container for the '#select3-input' element defined in
     *                    resources/testcase.html.
     */
    createDomTest: function(modules, fn) {

        return function(test) {
            require('jsdom').env('tests/resources/testcase.html', function(errors, window) {
                test.strictEqual(errors, null);

                test.doesNotThrow(function() {
                    var $ = require('../vendor/jquery')(window);
                    var proxyquire = require('proxyquire').noCallThru();

                    modules.forEach(function(module) {
                        proxyquire('../src/select3-' + module, { 'jquery': $ });
                    });

                    fn(test, window.$('#select3-input'));
                });

                test.done();
            });
        }
    }

};
