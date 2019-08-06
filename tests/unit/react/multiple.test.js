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
    expect(el.querySelectorAll("input")).toHaveLength(1);

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
    expect(el.selectivity.getValue()).toEqual(["Amsterdam"]);

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

test("react/multiple: test set value with initSelection()", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    function initSelection(value, callback) {
        const cities = {
            1: "Amsterdam",
            2: "Antwerp",
            3: "Athens",
        };
        callback(value.map(id => ({ id: id, text: cities[id] })));
    }

    const wrapper = mount(
        <SelectivityReact
            initSelection={initSelection}
            multiple={true}
            onChange={noop}
            value={[1]}
        />,
    );

    const el = wrapper.getDOMNode();
    expect(el.selectivity.getData()).toEqual([{ id: 1, text: "Amsterdam" }]);
    expect(el.selectivity.getValue()).toEqual([1]);

    wrapper.setProps({
        initSelection: initSelection,
        value: [2, 3],
    });

    expect(el.selectivity.getData()).toEqual([
        { id: 2, text: "Antwerp" },
        { id: 3, text: "Athens" },
    ]);
    expect(el.selectivity.getValue()).toEqual([2, 3]);
});

test("react/multiple: test set value without items", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const wrapper = mount(
        <SelectivityReact multiple={true} onChange={noop} value={["Amsterdam"]} />,
    );

    const el = wrapper.getDOMNode();
    expect(el.selectivity.getValue()).toEqual(["Amsterdam"]);

    wrapper.setProps({ value: ["Antwerp", "Athens"] });

    expect(el.selectivity.getData()).toEqual([
        { id: "Antwerp", text: "Antwerp" },
        { id: "Athens", text: "Athens" },
    ]);
    expect(el.selectivity.getValue()).toEqual(["Antwerp", "Athens"]);
});

test("react/multiple: test changing default value doesn't change value", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const wrapper = mount(
        <SelectivityReact
            defaultValue={["Amsterdam"]}
            items={["Amsterdam", "Antwerp", "Athens"]}
            multiple={true}
        />,
    );

    const el = wrapper.getDOMNode();
    expect(el.selectivity.getValue()).toEqual(["Amsterdam"]);

    wrapper.setProps({
        defaultValue: ["Antwerp", "Athens"],
        items: ["Amsterdam", "Antwerp", "Athens"],
    });

    expect(el.selectivity.getData()).toEqual([{ id: "Amsterdam", text: "Amsterdam" }]);
    expect(el.selectivity.getValue()).toEqual(["Amsterdam"]);
});

test("react/multiple: test mouse over", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact multiple={true} onChange={noop} value={["Amsterdam"]} />,
    ).getDOMNode();

    el.querySelector(".selectivity-multiple-input").dispatchEvent(new MouseEvent("mouseenter"));

    expect(el).toHaveClass("hover");

    el.querySelector(".selectivity-multiple-input").dispatchEvent(
        new MouseEvent("mouseleave", { fromElement: el.firstChild }),
    );

    expect(el).not.toHaveClass("hover");
});

test("react/multiple: test click and mouse over", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact multiple={true} onChange={noop} value={["Amsterdam"]} />,
    ).getDOMNode();

    el.querySelector(".selectivity-multiple-input-container").click();

    expect(el).toHaveClass("open");

    el.querySelector(".selectivity-multiple-input").dispatchEvent(new MouseEvent("mouseenter"));

    expect(el).toHaveClass("open");
    expect(el).toHaveClass("hover");

    el.selectivity.close();

    expect(el).not.toHaveClass("open");
    expect(el).toHaveClass("hover");
});

test("react/multiple: test blur event after opening", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact multiple={true} onChange={noop} value={["Amsterdam"]} />,
    ).getDOMNode();

    el.querySelector(".selectivity-multiple-input-container").click();

    expect(el).toHaveClass("open");

    el.firstChild.dispatchEvent(new FocusEvent("blur"));

    expect(el).not.toHaveClass("hover");
});

test("react/multiple: test read-only input", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const wrapper = mount(
        <SelectivityReact multiple={true} onChange={noop} value={["Amsterdam", "Antwerp"]} />,
    );
    const el = wrapper.getDOMNode();

    expect(el.querySelectorAll(".selectivity-multiple-selected-item")).toHaveLength(2);
    expect(el.querySelectorAll(".selectivity-multiple-selected-item-remove")).toHaveLength(2);

    wrapper.setProps({
        readOnly: true,
        value: ["Amsterdam", "Antwerp"],
    });

    expect(el.querySelectorAll(".selectivity-multiple-selected-item")).toHaveLength(2);
    expect(el.querySelectorAll(".selectivity-multiple-selected-item-remove")).toHaveLength(0);

    wrapper.setProps({
        readOnly: false,
        value: ["Amsterdam", "Antwerp"],
    });

    expect(el.querySelectorAll(".selectivity-multiple-selected-item")).toHaveLength(2);
    expect(el.querySelectorAll(".selectivity-multiple-selected-item-remove")).toHaveLength(2);
});

test("react/multiple: test filtering of children", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact
            defaultValue={[3]}
            items={[
                { text: "Belgium", children: [{ id: 2, text: "Antwerp" }] },
                { text: "Greece", children: [{ id: 3, text: "Athens" }] },
                { text: "Netherlands", children: [{ id: 1, text: "Amsterdam" }] },
            ]}
            multiple={true}
        />,
    ).getDOMNode();

    el.firstChild.click();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(1);
    expect(el.querySelectorAll(".selectivity-result-label")).toHaveLength(3);
    expect(el.querySelectorAll(".selectivity-result-label")[0].textContent).toBe("Belgium");
    expect(el.querySelectorAll(".selectivity-result-label")[1].textContent).toBe("Greece");
    expect(el.querySelectorAll(".selectivity-result-label")[2].textContent).toBe("Netherlands");
    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(2);
    expect(el.querySelectorAll(".selectivity-result-item")[0].textContent).toBe("Antwerp");
    expect(el.querySelectorAll(".selectivity-result-item")[1].textContent).toBe("Amsterdam");
});
