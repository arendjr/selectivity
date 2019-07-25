const TestUtil = require("../../test-util");

const FAKE_URL = "http://localhost/my-endpoint";

const expectedDOM =
    '<div class="selectivity-results-container">' +
    '<div class="selectivity-result-item highlight" data-item-id="1">Amsterdam</div>' +
    '<div class="selectivity-result-item" data-item-id="2">Antwerp</div>' +
    '<div class="selectivity-result-item" data-item-id="3">Athens</div>' +
    "</div>";

TestUtil.createJQueryTest(
    "jquery/ajax: test response as array",
    ["inputs/single", "plugins/ajax", "dropdown", "templates"],
    { async: true },
    function(test, $input, $) {
        test.plan(2);

        $input.selectivity({
            ajax: {
                url: FAKE_URL,
                fetch: function(url) {
                    test.equal(url, FAKE_URL);

                    return Promise.resolve([
                        { id: 1, text: "Amsterdam" },
                        { id: 2, text: "Antwerp" },
                        { id: 3, text: "Athens" },
                    ]);
                },
            },
        });

        TestUtil.simulateEvent($input[0], "click");

        setImmediate(function() {
            test.equal($(".selectivity-results-container").prop("outerHTML"), expectedDOM);
            test.end();
        });
    },
);

TestUtil.createJQueryTest(
    "jquery/ajax: test response as object with default fetch method",
    ["inputs/single", "plugins/ajax", "plugins/jquery/ajax", "dropdown", "templates"],
    { async: true },
    function(test, $input, $) {
        test.plan(4);

        // the jQuery API should use $.ajax to polyfill the fetch() method,
        // and it should be able to handle object responses
        $.ajax = function(url, settings) {
            test.equal(url, `${FAKE_URL}?q=&offset=0`);
            test.equal(settings.cache, true);
            test.equal(settings.method, "GET");

            return Promise.resolve({
                one: { id: 1, text: "Amsterdam" },
                two: { id: 2, text: "Antwerp" },
                three: { id: 3, text: "Athens" },
            });
        };

        $input.selectivity({
            ajax: {
                url: FAKE_URL,
                params: function(term, offset) {
                    return { q: term, offset: offset };
                },
            },
        });

        TestUtil.simulateEvent($input[0], "click");

        setTimeout(function() {
            test.equal($(".selectivity-results-container").prop("outerHTML"), expectedDOM);
            test.end();
        }, 10);
    },
);
