import React from "react";
import { mount } from "enzyme";
import { noop } from "lodash";

const itemsWithIds = [
    { id: 1, text: "Amsterdam" },
    { id: 2, text: "Antwerp" },
    { id: 3, text: "Athens" },
];

const nestedItems = [
    {
        text: "Austria",
        children: [{ id: 54, text: "Vienna" }],
    },
    {
        text: "Belgium",
        children: [{ id: 2, text: "Antwerp" }, { id: 9, text: "Brussels" }],
    },
    {
        text: "Bulgaria",
        children: [{ id: 48, text: "Sofia" }],
    },
];

test("react/single: test initial data and don't open dropdown after clear", () => {
    require("../../../src/inputs/single");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact
            allowClear={true}
            defaultData={{ id: 1, text: "Amsterdam" }}
            items={itemsWithIds}
        />,
    ).getDOMNode();

    expect(el.selectivity.getData()).toEqual({ id: 1, text: "Amsterdam" });
    expect(el.selectivity.getValue()).toBe(1);

    el.querySelector(".selectivity-single-selected-item-remove").click();

    expect(el.selectivity.getData()).toBe(null);
    expect(el.selectivity.getValue()).toBe(null);

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(0);
});

test("react/single: test clear by setting null through props", () => {
    require("../../../src/inputs/single");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const wrapper = mount(
        <SelectivityReact
            allowClear={true}
            onChange={noop}
            query={queryOptions => {
                queryOptions.callback({ results: itemsWithIds });
            }}
            value={1}
        />,
    );
    const el = wrapper.getDOMNode();

    expect(el.selectivity.getValue()).toBe(1);

    wrapper.setProps({
        allowClear: true,
        onChange: noop,
        value: null,
    });

    expect(el.selectivity.getData()).toBe(null);
    expect(el.selectivity.getValue()).toBe(null);

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(0);
});

test("react/single: test initial value", () => {
    require("../../../src/inputs/single");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact
            allowClear={true}
            defaultValue="Amsterdam"
            items={["Amsterdam", "Antwerp", "Athens"]}
        />,
    ).getDOMNode();

    expect(el.selectivity.getData()).toEqual({ id: "Amsterdam", text: "Amsterdam" });
    expect(el.selectivity.getValue()).toBe("Amsterdam");

    expect(el.querySelector("input")).toHaveValue("Amsterdam");
});

test("react/single: test nested data", () => {
    require("../../../src/inputs/single");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact defaultData={{ id: 2, text: "Antwerp" }} items={nestedItems} />,
    ).getDOMNode();

    expect(el.selectivity.getData()).toEqual({ id: 2, text: "Antwerp" });
    expect(el.selectivity.getValue()).toBe(2);
});

test("react/single: test nested value", () => {
    require("../../../src/inputs/single");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(<SelectivityReact defaultValue={2} items={nestedItems} />).getDOMNode();

    expect(el.selectivity.getData()).toEqual({ id: 2, text: "Antwerp" });
    expect(el.selectivity.getValue()).toBe(2);
});

test("react/single: test without data", () => {
    require("../../../src/inputs/single");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(<SelectivityReact items={itemsWithIds} />).getDOMNode();

    expect(el.selectivity.getData()).toBe(null);
    expect(el.selectivity.getValue()).toBe(null);
});

test("react/single: test without search input", () => {
    require("../../../src/inputs/single");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact items={itemsWithIds} showSearchInputInDropdown={false} />,
    ).getDOMNode();

    expect(el.selectivity.getValue()).toBe(null);

    el.selectivity.open();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(1);
    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(3);
    expect(el.querySelector(".selectivity-result-item").textContent).toBe("Amsterdam");

    el.querySelector(".selectivity-result-item").click();

    expect(el.selectivity.getValue()).toBe(1);
});

test("react/single: test change value through props", () => {
    require("../../../src/inputs/single");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const wrapper = mount(
        <SelectivityReact
            items={["Amsterdam", "Antwerp", "Athens"]}
            onChange={noop}
            value="Amsterdam"
        />,
    );
    const el = wrapper.getDOMNode();

    expect(el.selectivity.getValue()).toBe("Amsterdam");

    wrapper.setProps({
        items: ["Amsterdam", "Antwerp", "Athens"],
        value: "Antwerp",
    });

    expect(el.selectivity.getData()).toEqual({ id: "Antwerp", text: "Antwerp" });
    expect(el.selectivity.getValue()).toBe("Antwerp");
});

test("react/single: test set value with init selection", () => {
    require("../../../src/inputs/single");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    function initSelection(value, callback) {
        callback({ id: value, text: itemsWithIds.find(item => item.id === value).text });
    }

    const wrapper = mount(
        <SelectivityReact initSelection={initSelection} onChange={noop} value={1} />,
    );
    const el = wrapper.getDOMNode();

    expect(el.selectivity.getData()).toEqual({ id: 1, text: "Amsterdam" });
    expect(el.selectivity.getValue()).toBe(1);

    wrapper.setProps({ initSelection, value: 2 });

    expect(el.selectivity.getData()).toEqual({ id: 2, text: "Antwerp" });
    expect(el.selectivity.getValue()).toBe(2);
});

test("react/single: test set value without items", () => {
    require("../../../src/inputs/single");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const wrapper = mount(<SelectivityReact onChange={noop} value="Amsterdam" />);
    const el = wrapper.getDOMNode();

    expect(el.selectivity.getValue()).toBe("Amsterdam");

    wrapper.setProps({ value: "Antwerp" });

    expect(el.selectivity.getData()).toEqual({ id: "Antwerp", text: "Antwerp" });
    expect(el.selectivity.getValue()).toBe("Antwerp");
});

test("react/single: test changing default value doesn't change value", () => {
    require("../../../src/inputs/single");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const wrapper = mount(
        <SelectivityReact defaultValue="Amsterdam" items={["Amsterdam", "Antwerp", "Athens"]} />,
    );
    const el = wrapper.getDOMNode();

    expect(el.selectivity.getValue()).toBe("Amsterdam");

    wrapper.setProps({
        defaultValue: "Antwerp",
        items: ["Amsterdam", "Antwerp", "Athens"],
    });

    expect(el.selectivity.getData()).toEqual({ id: "Amsterdam", text: "Amsterdam" });
    expect(el.selectivity.getValue()).toBe("Amsterdam");
});

test("react/single: test mouse over", () => {
    require("../../../src/inputs/single");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(<SelectivityReact defaultValue="Amsterdam" />).getDOMNode();

    el.querySelector(".selectivity-single-select").dispatchEvent(new MouseEvent("mouseenter"));

    expect(el).toHaveClass("hover");

    el.querySelector(".selectivity-single-select").dispatchEvent(
        new MouseEvent("mouseleave", { fromElement: el.firstChild }),
    );

    expect(el).not.toHaveClass("hover");
});

test("react/single: test required option", () => {
    require("../../../src/inputs/single");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(<SelectivityReact required={true} />).getDOMNode();

    expect(el.querySelector("input").required).toBe(true);
});

test("react/single: test click and mouse over", () => {
    require("../../../src/inputs/single");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(<SelectivityReact defaultValue="Amsterdam" />).getDOMNode();

    el.querySelector(".selectivity-single-select").click();

    expect(el).toHaveClass("open");

    el.querySelector(".selectivity-single-select").dispatchEvent(new MouseEvent("mouseenter"));

    expect(el).toHaveClass("open");
    expect(el).toHaveClass("hover");

    el.selectivity.close();

    expect(el).not.toHaveClass("open");
    expect(el).toHaveClass("hover");
});

test("react/single: test blur event after opening single select", () => {
    require("../../../src/inputs/single");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact defaultValue="Amsterdam" showSearchInputInDropdown={false} />,
    ).getDOMNode();

    el.querySelector(".selectivity-single-select").click();

    expect(el).toHaveClass("open");

    el.dispatchEvent(new FocusEvent("blur"));
    el.querySelector(".selectivity-single-select").dispatchEvent(new FocusEvent("blur"));

    expect(el).toHaveClass("open");
});

test("react/single: test don't close when hovering while blur event occurs", () => {
    require("../../../src/inputs/single");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact defaultValue="Amsterdam" showSearchInputInDropdown={false} />,
    ).getDOMNode();

    el.querySelector(".selectivity-single-select").click();
    el.querySelector(".selectivity-single-select").dispatchEvent(new MouseEvent("mouseenter"));
    el.dispatchEvent(new FocusEvent("blur"));

    expect(el).toHaveClass("open");
});

test("react/single: test default tab index", () => {
    require("../../../src/inputs/single");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact defaultValue="Amsterdam" showSearchInputInDropdown={false} />,
    ).getDOMNode();

    expect(el).toHaveAttribute("tabindex", "0");
});

test("react/single: test tab index option", () => {
    require("../../../src/inputs/single");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact
            defaultValue="Amsterdam"
            showSearchInputInDropdown={false}
            tabIndex={2}
        />,
    ).getDOMNode();

    expect(el).toHaveAttribute("tabindex", "2");
});
