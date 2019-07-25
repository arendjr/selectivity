const TestUtil = require("../../test-util");

TestUtil.createJQueryTest(
    "jquery/events: test change event",
    ["inputs/single", "templates"],
    function(test, $input) {
        let changeEvent = null;

        $input
            .selectivity({
                data: { id: 1, text: "Amsterdam" },
                items: [
                    { id: 1, text: "Amsterdam" },
                    { id: 2, text: "Antwerp" },
                    { id: 3, text: "Athens" },
                ],
            })
            .on("change", function(event) {
                changeEvent = event;
            });

        $input.selectivity("data", { id: 2, text: "Antwerp" });

        test.equal(changeEvent.value, 2);
    },
);

TestUtil.createJQueryTest(
    "jquery/events: test suppress change event",
    ["inputs/single", "templates"],
    function(test, $input) {
        let changeEvent = null;

        $input
            .selectivity({
                data: { id: 1, text: "Amsterdam" },
                items: [
                    { id: 1, text: "Amsterdam" },
                    { id: 2, text: "Antwerp" },
                    { id: 3, text: "Athens" },
                ],
            })
            .on("change", function(event) {
                changeEvent = event;
            });

        $input.selectivity("data", { id: 2, text: "Antwerp" }, { triggerChange: false });

        test.equal(changeEvent, null);
    },
);
