const FAKE_URL = "http://localhost/my-endpoint";

const expectedDOM =
    '<div class="selectivity-results-container">' +
    '<div class="selectivity-result-item highlight" data-item-id="1">Amsterdam</div>' +
    '<div class="selectivity-result-item" data-item-id="2">Antwerp</div>' +
    '<div class="selectivity-result-item" data-item-id="3">Athens</div>' +
    "</div>";

let actualUrl;

TestUtil.createReactTest(
    "react/ajax: test response as array",
    ["inputs/single", "plugins/ajax", "dropdown", "templates"],
    {
        ajax: {
            url: FAKE_URL,
            fetch: function(url) {
                actualUrl = url;

                return Promise.resolve([
                    { id: 1, text: "Amsterdam" },
                    { id: 2, text: "Antwerp" },
                    { id: 3, text: "Athens" },
                ]);
            },
        },
        async: true,
    },
    function(SelectivityReact, test, ref, container, $) {
        test.plan(2);

        TestUtil.simulateEvent(container.firstChild, "click");

        setImmediate(function() {
            test.equal(actualUrl, FAKE_URL);
            test.equal($(".selectivity-results-container")[0].outerHTML, expectedDOM);
            test.end();
        });
    },
);

TestUtil.createReactTest(
    "react/ajax: test response as array with default fetch method",
    ["inputs/single", "plugins/ajax", "dropdown", "templates"],
    {
        ajax: {
            url: FAKE_URL,
            params: function(term, offset) {
                return { q: term, offset: offset };
            },
        },
        async: true,
    },
    function(SelectivityReact, test, ref, container, $) {
        test.plan(3);

        // the React API should use window.fetch() as default fetch method,
        // and it should be able to handle object responses
        window.fetch = function(url, init) {
            test.equal(url, `${FAKE_URL}?q=&offset=0`);
            test.deepEqual(init, {});

            return Promise.resolve([
                { id: 1, text: "Amsterdam" },
                { id: 2, text: "Antwerp" },
                { id: 3, text: "Athens" },
            ]);
        };

        TestUtil.simulateEvent(container.firstChild, "click");

        setTimeout(function() {
            test.equal($(".selectivity-results-container")[0].outerHTML, expectedDOM);
            test.end();
        }, 10);
    },
);
