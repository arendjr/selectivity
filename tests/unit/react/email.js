const TestUtil = require("../../test-util");

TestUtil.createReactTest(
    "react/email: test value on enter",
    ["inputs/email", "templates"],
    { inputType: "Email" },
    function(SelectivityReact, test, ref, container, $) {
        $(".selectivity-multiple-input")[0].value = "test@gmail.com";
        TestUtil.simulateEvent(".selectivity-multiple-input", "keyup", { keyCode: 13 });

        test.deepEqual(ref.getValue(), ["test@gmail.com"]);
    },
);

TestUtil.createReactTest(
    "react/email: test value after space and enter",
    ["inputs/email", "templates"],
    { inputType: "Email" },
    function(SelectivityReact, test, ref, container, $) {
        const multipleInput = $(".selectivity-multiple-input")[0];
        multipleInput.value = "test@gmail.com ";
        TestUtil.simulateEvent(multipleInput, "keyup", { keyCode: 32 });

        test.equal(multipleInput.value, "");
        test.deepEqual(ref.getValue(), ["test@gmail.com"]);

        multipleInput.value = "test2@gmail.com";
        TestUtil.simulateEvent(multipleInput, "keyup", { keyCode: 13 });

        test.deepEqual(ref.getValue(), ["test@gmail.com", "test2@gmail.com"]);
    },
);
