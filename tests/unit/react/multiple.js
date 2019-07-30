import React from "react";
import { mount } from "enzyme";
import { noop } from "lodash";

test("react/multiple: test click after search", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const items = ["Amsterdam", "Antwerp", "Athens"];

    const el = mount(<SelectivityReact items={items} multiple={true} />).getDOMNode();

    el.querySelector(".selectivity-multiple-input").click();
    el.querySelector(".selectivity-multiple-input").value = "amster";
    el.querySelector(".selectivity-multiple-input").dispatchEvent(new KeyboardEvent("keyup"));
    el.querySelector('.selectivity-result-item[data-item-id="Amsterdam"]').click();

    expect(el.selectivity.getValue()).toEqual(["Amsterdam"]);
    expect(el.querySelector(".selectivity-multiple-input").value).toBe("");
});

test("react/multiple: test filter selected items (1)", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact
            defaultValue={["Amsterdam", "Athens"]}
            items={["Amsterdam", "Antwerp", "Athens"]}
            multiple={true}
        />,
    ).getDOMNode();

    el.firstChild.click();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(1);
    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(1);
    expect(el.querySelector(".selectivity-result-item").textContent).toBe("Antwerp");
});

test("react/multiple: test filter selected items (2)", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact
            defaultValue={["Athens"]}
            items={["Amsterdam", "Antwerp", "Athens"]}
            multiple={true}
        />,
    ).getDOMNode();

    el.firstChild.click();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(1);
    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(2);
    expect(el.querySelector(".selectivity-result-item:first-child").textContent).toBe("Amsterdam");
    expect(el.querySelector(".selectivity-result-item:last-child").textContent).toBe("Antwerp");
});

test("react/multiple: test initial data", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact
            defaultData={[{ id: 1, text: "Amsterdam" }, { id: 2, text: "Antwerp" }]}
            items={[
                { id: 1, text: "Amsterdam" },
                { id: 2, text: "Antwerp" },
                { id: 3, text: "Athens" },
            ]}
            multiple={true}
        />,
    ).getDOMNode();

    expect(el.selectivity.getData()).toEqual([
        { id: 1, text: "Amsterdam" },
        { id: 2, text: "Antwerp" },
    ]);
    expect(el.selectivity.getValue()).toEqual([1, 2]);
});

test("react/multiple: test initial value", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact
            defaultValue={["Amsterdam", "Antwerp"]}
            items={["Amsterdam", "Antwerp", "Athens"]}
            multiple={true}
        />,
    ).getDOMNode();

    expect(el.selectivity.getData()).toEqual([
        { id: "Amsterdam", text: "Amsterdam" },
        { id: "Antwerp", text: "Antwerp" },
    ]);
    expect(el.selectivity.getValue()).toEqual(["Amsterdam", "Antwerp"]);
});

test("react/multiple: test nested data", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact
            defaultData={[{ id: 54, text: "Vienna" }, { id: 2, text: "Antwerp" }]}
            items={[
                { text: "Austria", children: [{ id: 54, text: "Vienna" }] },
                {
                    text: "Belgium",
                    children: [{ id: 2, text: "Antwerp" }, { id: 9, text: "Brussels" }],
                },
                { text: "Bulgaria", children: [{ id: 48, text: "Sofia" }] },
            ]}
            multiple={true}
        />,
    ).getDOMNode();

    expect(el.selectivity.getData()).toEqual([
        { id: 54, text: "Vienna" },
        { id: 2, text: "Antwerp" },
    ]);
    expect(el.selectivity.getValue()).toEqual([54, 2]);
});

test("react/multiple: test without data", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact
            items={[
                { id: 1, text: "Amsterdam" },
                { id: 2, text: "Antwerp" },
                { id: 3, text: "Athens" },
            ]}
            multiple={true}
        />,
    ).getDOMNode();

    expect(el.selectivity.getData()).toEqual([]);
    expect(el.selectivity.getValue()).toEqual([]);
    expect(el.selectivity.enabled).toBe(true);
    expect(el.querySelectorAll("input")).toHaveLength(1);
});

test("react/multiple: test without data and remove-only", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact
            items={[
                { id: 1, text: "Amsterdam" },
                { id: 2, text: "Antwerp" },
                { id: 3, text: "Athens" },
            ]}
            multiple={true}
            removeOnly={true}
        />,
    ).getDOMNode();

    expect(el.selectivity.getData()).toEqual([]);
    expect(el.selectivity.getValue()).toEqual([]);
    expect(el.selectivity.enabled).toBe(false);
    expect(el.querySelectorAll("input")).toHaveLength(0);
});

test("react/multiple: test setting remove-only after construction", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const wrapper = mount(
        <SelectivityReact
            items={[
                { id: 1, text: "Amsterdam" },
                { id: 2, text: "Antwerp" },
                { id: 3, text: "Athens" },
            ]}
            multiple={true}
        />,
    );

    const el = wrapper.getDOMNode();
    expect(el.selectivity.enabled).toBe(true);
    expect(el.querySelectorAll("input")).toHaveLength(0);

    wrapper.setProps({
        items: [
            { id: 1, text: "Amsterdam" },
            { id: 2, text: "Antwerp" },
            { id: 3, text: "Athens" },
        ],
        removeOnly: true,
    });

    expect(el.selectivity.enabled).toBe(false);
    expect(el.querySelectorAll("input")).toHaveLength(0);
});

test("react/multiple: test set value", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const wrapper = mount(
        <SelectivityReact
            items={["Amsterdam", "Antwerp", "Athens"]}
            multiple={true}
            onChange={noop}
            value={["Amsterdam"]}
        />,
    );

    const el = wrapper.getDOMNode();
    expect(el.selectivity.getValue).toEqual(["Amsterdam"]);

    wrapper.setProps({
        items: ["Amsterdam", "Antwerp", "Athens"],
        value: ["Antwerp", "Athens"],
    });

    expect(el.selectivity.getData()).toEqual([
        { id: "Antwerp", text: "Antwerp" },
        { id: "Athens", text: "Athens" },
    ]);
    expect(el.selectivity.getValue()).toEqual(["Antwerp", "Athens"]);
});

function initSelection(value, callback) {
    const cities = {
        1: "Amsterdam",
        2: "Antwerp",
        3: "Athens",
    };
    callback(
        value.map(function(id) {
            return { id: id, text: cities[id] };
        }),
    );
}

TestUtil.createReactTest(
    "react/multiple: test set value with init selection",
    ["inputs/multiple", "templates"],
    { async: true, initSelection: initSelection, multiple: true, onChange: _.noop, value: [1] },
    function(SelectivityReact, test, ref, container) {
        test.plan(4);

        test.deepEqual(ref.getData(), [{ id: 1, text: "Amsterdam" }]);
        test.deepEqual(ref.getValue(), [1]);

        ReactDOM.render(
            React.createElement(SelectivityReact, { initSelection: initSelection, value: [2, 3] }),
            container,
            function() {
                test.deepEqual(ref.getData(), [
                    { id: 2, text: "Antwerp" },
                    { id: 3, text: "Athens" },
                ]);

                test.deepEqual(ref.getValue(), [2, 3]);

                test.end();
            },
        );
    },
);

TestUtil.createReactTest(
    "react/multiple: test set value without items",
    ["inputs/multiple", "templates"],
    { async: true, multiple: true, onChange: _.noop, value: ["Amsterdam"] },
    function(SelectivityReact, test, ref, container) {
        test.plan(3);

        test.deepEqual(ref.getValue(), ["Amsterdam"]);

        ReactDOM.render(
            React.createElement(SelectivityReact, { value: ["Antwerp", "Athens"] }),
            container,
            function() {
                test.deepEqual(ref.getData(), [
                    { id: "Antwerp", text: "Antwerp" },
                    { id: "Athens", text: "Athens" },
                ]);

                test.deepEqual(ref.getValue(), ["Antwerp", "Athens"]);

                test.end();
            },
        );
    },
);

TestUtil.createReactTest(
    "react/multiple: test set default value doesn't change value",
    ["inputs/multiple", "templates"],
    {
        async: true,
        defaultValue: ["Amsterdam"],
        items: ["Amsterdam", "Antwerp", "Athens"],
        multiple: true,
    },
    function(SelectivityReact, test, ref, container) {
        test.plan(3);

        test.deepEqual(ref.getValue(), ["Amsterdam"]);

        ReactDOM.render(
            React.createElement(SelectivityReact, {
                defaultValue: ["Antwerp", "Athens"],
                items: ["Amsterdam", "Antwerp", "Athens"],
            }),
            container,
            function() {
                test.deepEqual(ref.getData(), [{ id: "Amsterdam", text: "Amsterdam" }]);
                test.deepEqual(ref.getValue(), ["Amsterdam"]);
                test.end();
            },
        );
    },
);

TestUtil.createReactTest(
    "react/multiple: test mouse over",
    ["inputs/multiple", "templates"],
    { multiple: true, onChange: _.noop, value: ["Amsterdam"] },
    function(SelectivityReact, test, ref, container) {
        TestUtil.simulateEvent(".selectivity-multiple-input", "mouseenter");

        test.ok(container.firstChild.classList.contains("hover"));

        TestUtil.simulateEvent(".selectivity-multiple-input", "mouseleave", {
            fromElement: container.firstChild,
        });

        test.equal(container.firstChild.classList.contains("hover"), false);
    },
);

TestUtil.createReactTest(
    "react/multiple: test click and mouse over",
    ["inputs/multiple", "dropdown", "templates"],
    { async: true, multiple: true, onChange: _.noop, value: ["Amsterdam"] },
    function(SelectivityReact, test, ref, container) {
        test.plan(3);

        TestUtil.simulateEvent(".selectivity-multiple-input-container", "click");

        test.equal(container.firstChild.getAttribute("class"), "open");

        TestUtil.simulateEvent(".selectivity-multiple-input", "mouseenter");

        test.equal(container.firstChild.getAttribute("class"), "open hover");
        ref.close();

        setTimeout(function() {
            test.equal(container.firstChild.getAttribute("class"), "hover");
            test.end();
        }, 10);
    },
);

TestUtil.createReactTest(
    "react/multiple: test blur event after opening",
    ["inputs/multiple", "dropdown", "templates"],
    { async: true, multiple: true, onChange: _.noop, value: ["Amsterdam"] },
    function(SelectivityReact, test, ref, container) {
        test.plan(2);

        TestUtil.simulateEvent(".selectivity-multiple-input-container", "click");

        test.equal(container.firstChild.getAttribute("class"), "open");

        TestUtil.simulateEvent(container.firstChild, "blur");

        setTimeout(function() {
            test.equal(container.firstChild.classList.contains("hover"), false);
            test.end();
        }, 200);
    },
);

TestUtil.createReactTest(
    "react/multiple: test trim spaces functionality",
    ["inputs/multiple", "plugins/tokenizer", "templates"],
    {
        multiple: true,
        showDropdown: false,
        tokenSeparators: [","],
        trimSpaces: true,
    },
    function(SelectivityReact, test, ref, container, $) {
        $(".selectivity-multiple-input")[0].value = " Amsterdam  , Berlin   , ";
        TestUtil.simulateEvent(".selectivity-multiple-input", "keyup");

        test.deepEqual(ref.getData(), [
            { id: "Amsterdam", text: "Amsterdam" },
            { id: "Berlin", text: "Berlin" },
        ]);
        test.deepEqual(ref.getValue(), ["Amsterdam", "Berlin"]);
    },
);

TestUtil.createReactTest(
    "react/multiple: test allow duplicates",
    ["inputs/multiple", "plugins/tokenizer", "templates"],
    {
        allowDuplicates: true,
        multiple: true,
        showDropdown: false,
        tokenSeparators: [","],
    },
    function(SelectivityReact, test, ref, container, $) {
        $(".selectivity-multiple-input")[0].value = "Berlin,Amsterdam,Berlin,";
        TestUtil.simulateEvent(".selectivity-multiple-input", "keyup");

        test.deepEqual(ref.getData(), [
            { id: "Berlin", text: "Berlin" },
            { id: "Amsterdam", text: "Amsterdam" },
            { id: "Berlin", text: "Berlin" },
        ]);
        test.deepEqual(ref.getValue(), ["Berlin", "Amsterdam", "Berlin"]);
    },
);

TestUtil.createReactTest(
    "react/multiple: test read-only input",
    ["inputs/multiple", "templates"],
    { async: true, multiple: true, onChange: _.noop, value: ["Amsterdam", "Antwerp"] },
    function(SelectivityReact, test, ref, container, $) {
        test.plan(6);

        test.equal($(".selectivity-multiple-selected-item").length, 2);
        test.equal($(".selectivity-multiple-selected-item-remove").length, 2);

        ReactDOM.render(
            React.createElement(SelectivityReact, {
                readOnly: true,
                value: ["Amsterdam", "Antwerp"],
            }),
            container,
            function() {
                test.equal($(".selectivity-multiple-selected-item").length, 2);
                test.equal($(".selectivity-multiple-selected-item-remove").length, 0);

                ReactDOM.render(
                    React.createElement(SelectivityReact, {
                        readOnly: false,
                        value: ["Amsterdam", "Antwerp"],
                    }),
                    container,
                    function() {
                        test.equal($(".selectivity-multiple-selected-item").length, 2);
                        test.equal($(".selectivity-multiple-selected-item-remove").length, 2);

                        test.end();
                    },
                );
            },
        );
    },
);

TestUtil.createReactTest(
    "react/multiple: test filtering of children",
    ["inputs/multiple", "dropdown", "templates"],
    {
        defaultValue: [3],
        items: [
            { text: "Belgium", children: [{ id: 2, text: "Antwerp" }] },
            { text: "Greece", children: [{ id: 3, text: "Athens" }] },
            { text: "Netherlands", children: [{ id: 1, text: "Amsterdam" }] },
        ],
        multiple: true,
    },
    function(SelectivityReact, test, ref, container, $) {
        TestUtil.simulateEvent(container.firstChild, "click");

        test.equal($(".selectivity-dropdown").length, 1);
        test.equal($(".selectivity-result-label").length, 3);
        test.equal($(".selectivity-result-label")[0].textContent, "Belgium");
        test.equal($(".selectivity-result-label")[1].textContent, "Greece");
        test.equal($(".selectivity-result-label")[2].textContent, "Netherlands");
        test.equal($(".selectivity-result-item").length, 2);
        test.equal($(".selectivity-result-item")[0].textContent, "Antwerp");
        test.equal($(".selectivity-result-item")[1].textContent, "Amsterdam");
    },
);
