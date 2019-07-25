const TestUtil = require("../../test-util");

const items = [
    "Amsterdam",
    "Antwerp",
    "Athens",
    "Barcelona",
    "Berlin",
    "Birmingham",
    "Bradford",
    "Bremen",
    "Brussels",
    "Bucharest",
    "Budapest",
    "Cologne",
    "Copenhagen",
    "Dortmund",
    "Dresden",
    "Dublin",
    "Düsseldorf",
    "Essen",
    "Frankfurt",
    "Genoa",
    "Glasgow",
    "Gothenburg",
    "Hamburg",
    "Hannover",
    "Helsinki",
];

function query() {
    let timeout = 30;
    return function(options) {
        const limit = 10;
        const results = options.term
            ? items.filter(function(item) {
                  return item.indexOf(options.term) > -1;
              })
            : items;

        timeout -= 10;
        setTimeout(function() {
            options.callback({
                results: results.slice(options.offset, options.offset + limit),
                more: results.length > options.offset + limit,
            });
        }, timeout);
    };
}

TestUtil.createJQueryTest(
    "jquery/async: test with async",
    ["inputs/single", "plugins/async", "dropdown", "templates"],
    { async: true },
    function(test, $input, $) {
        $input.selectivity({ query: query() });

        $input.find(".selectivity-single-select").click();
        $input.selectivity("search", "am");
        $input.selectivity("search", "dam");

        setTimeout(function() {
            test.equal($(".selectivity-result-item").length, 1);
            test.equal($(".selectivity-result-item").text(), "Amsterdam");
        }, 5);

        setTimeout(function() {
            test.equal($(".selectivity-result-item").length, 1);

            test.end();
        }, 25);
    },
);

TestUtil.createJQueryTest(
    "jquery/async: test without async",
    ["inputs/single", "dropdown", "templates"],
    { async: true },
    function(test, $input, $) {
        $input.selectivity({ query: query() });

        $input.find(".selectivity-single-select").click();
        $input.selectivity("search", "am");
        $input.selectivity("search", "dam");

        setTimeout(function() {
            test.equal($(".selectivity-result-item").length, 1);
            test.equal($(".selectivity-result-item").text(), "Amsterdam");
        }, 5);

        setTimeout(function() {
            // without async there would be more results
            test.equal($(".selectivity-result-item").length, 10);

            test.end();
        }, 25);
    },
);
