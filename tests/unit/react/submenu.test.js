import React from "react";
import { mount } from "enzyme";
import waitForExpect from "wait-for-expect";

const items = [
    { id: "1", text: "First Item" },
    { id: "2", text: "Second Item" },
    {
        id: "3",
        text: "First Submenu",
        submenu: {
            items: [{ id: "3-1", text: "Third Item" }, { id: "3-2", text: "Fourth Item" }],
        },
    },
    {
        id: "4",
        text: "Second Submenu",
        submenu: {
            items: [{ id: "4-1", text: "Fifth Item" }, { id: "4-2", text: "Sixth Item" }],
        },
    },
];

const itemsWithSearchInput = [
    {
        id: 1,
        text: "First Item",
        submenu: {
            items: [{ id: 2, text: "First subitem" }, { id: 3, text: "Second subitem" }],
            showSearchInput: true,
        },
    },
];

test("react/submenu: test search input in submenu in multiple select input", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/plugins/submenu");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact items={itemsWithSearchInput} multiple={true} />,
    ).getDOMNode();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(0);
    expect(el.selectivity.getValue()).toEqual([]);

    el.click();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(1);

    el.querySelector('.selectivity-result-item[data-item-id="1"]').dispatchEvent(
        new MouseEvent("mouseenter"),
    );

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(2);

    el.querySelector('.selectivity-result-item[data-item-id="2"]').click();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(0);
    expect(el.selectivity.getValue()).toEqual([2]);
});

test("react/submenu: test search in submenu in single select input", () => {
    require("../../../src/inputs/single");
    require("../../../src/plugins/submenu");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(<SelectivityReact items={itemsWithSearchInput} />).getDOMNode();

    el.click();

    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(3);

    el.querySelector('.selectivity-result-item[data-item-id="1"]').dispatchEvent(
        new MouseEvent("mouseevent"),
    );

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(2);
    expect(el.querySelectorAll(".selectivity-search-input")).toHaveLength(2);
    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(3);

    // After searching for "Second" only two result items should remain:
    el.querySelectorAll(".selectivity-search-input")[1].value = "Second";
    el.querySelectorAll(".selectivity-search-input")[1].dispatchEvent(new KeyboardEvent("keyup"));

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(2);
    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(2);

    // After clearing the search all result items should be displayed again:
    el.querySelectorAll(".selectivity-search-input")[1].value = "";
    el.querySelectorAll(".selectivity-search-input")[1].dispatchEvent(new KeyboardEvent("keyup"));

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(2);
    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(3);
});

test("react/submenu: test select item after opening submenu", async () => {
    require("../../../src/inputs/single");
    require("../../../src/plugins/submenu");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(<SelectivityReact items={items} />).getDOMNode();

    expect(el.selectivity.getValue()).toBe(null);

    el.querySelector(".selectivity-single-select").click();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(1);

    el.querySelector('.selectivity-result-item[data-item-id="3"]').dispatchEvent(
        new MouseEvent("mouseenter"),
    );

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(2);

    el.querySelector('.selectivity-result-item[data-item-id="2"]').dispatchEvent(
        new MouseEvent("mouseenter"),
    );

    await waitForExpect(() => {
        expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(1);
    });

    el.querySelector('.selectivity-result-item[data-item-id="2"]').click();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(0);

    expect(el.selectivity.getData()).toEqual({ id: "2", text: "Second Item" });
    expect(el.selectivity.getValue()).toBe("2");
});

test("react/submenu: test select item in submenu", async () => {
    require("../../../src/inputs/single");
    require("../../../src/plugins/submenu");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(<SelectivityReact items={items} />).getDOMNode();

    el.querySelector(".selectivity-single-select").click();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(1);

    el.querySelector('.selectivity-result-item[data-item-id="3"]').dispatchEvent(
        new MouseEvent("mouseenter"),
    );

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(2);

    el.querySelector('.selectivity-result-item[data-item-id="3-1"]').click();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(0);

    expect(el.selectivity.getData()).toEqual({ id: "3-1", text: "Third Item" });
    expect(el.selectivity.getValue()).toBe("3-1");
});

test("react/submenu: test change value through props", async () => {
    require("../../../src/inputs/single");
    require("../../../src/plugins/submenu");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const wrapper = mount(<SelectivityReact items={items} />);
    const el = wrapper.getDOMNode();

    expect(el.selectivity.getValue()).toBe(null);

    wrapper.setProps({ items, value: "3-1" });

    expect(el.selectivity.getData()).toEqual({ id: "3-1", text: "Third Item" });
    expect(el.selectivity.getValue()).toBe("3-1");
});
