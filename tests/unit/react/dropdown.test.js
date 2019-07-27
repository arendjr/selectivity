import React from "react";
import { mount } from "enzyme";

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

function query(options) {
    const limit = 10;
    const results = options.term ? items.filter(item => item.includes(options.term)) : items;
    options.callback({
        results: results.slice(options.offset, options.offset + limit),
        more: results.length > options.offset + limit,
    });
}

function queryDisabledItems(options) {
    options.callback({
        results: items.map((item, index) => ({
            id: item,
            text: item,
            disabled: index % 2 === 0,
        })),
        more: false,
    });
}

test("react/dropdown: test disabled items", () => {
    require("../../../src/inputs/single");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const wrapper = mount(<SelectivityReact query={queryDisabledItems} />);
    const el = wrapper.getDOMNode();
    const $ = el.querySelector.bind(el);

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(0);

    el.click();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(1);
    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(25);
    expect(el.querySelectorAll(".selectivity-load-more")).toHaveLength(0);

    expect($(".selectivity-result-item").textContent).toBe("Amsterdam");
    expect($(".selectivity-result-item:last-child").textContent).toBe("Helsinki");

    expect($('.selectivity-result-item[data-item-id="Amsterdam"]')).toHaveClass("disabled");
    expect($('.selectivity-result-item[data-item-id="Antwerp"]')).not.toHaveClass("disabled");
    expect($('.selectivity-result-item[data-item-id="Athens"]')).toHaveClass("disabled");
    expect($('.selectivity-result-item[data-item-id="Barcelona"]')).not.toHaveClass("disabled");

    // disabled item should not be selectable
    $('.selectivity-result-item[data-item-id="Amsterdam"]').click();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(1);
    expect(el.selectivity.getValue()).toBe(null);

    // enabled item should be, of course
    $('.selectivity-result-item[data-item-id="Antwerp"]').click();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(0);
    expect(el.selectivity.getValue()).toBe("Antwerp");
});

test("react/dropdown: test disabled items with submenu plugin loaded", () => {
    require("../../../src/inputs/single");
    require("../../../src/plugins/submenu");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const wrapper = mount(<SelectivityReact query={queryDisabledItems} />);
    const el = wrapper.getDOMNode();
    const $ = el.querySelector.bind(el);

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(0);

    el.click();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(1);
    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(25);
    expect(el.querySelectorAll(".selectivity-load-more")).toHaveLength(0);

    expect($(".selectivity-result-item").textContent).toBe("Amsterdam");
    expect($(".selectivity-result-item:last-child").textContent).toBe("Helsinki");

    expect($('.selectivity-result-item[data-item-id="Amsterdam"]')).toHaveClass("disabled");
    expect($('.selectivity-result-item[data-item-id="Antwerp"]')).not.toHaveClass("disabled");
    expect($('.selectivity-result-item[data-item-id="Athens"]')).toHaveClass("disabled");
    expect($('.selectivity-result-item[data-item-id="Barcelona"]')).not.toHaveClass("disabled");

    // disabled item should not be selectable
    $('.selectivity-result-item[data-item-id="Amsterdam"]').click();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(1);
    expect(el.selectivity.getValue()).toBe(null);

    // enabled item should be, of course
    $('.selectivity-result-item[data-item-id="Antwerp"]').click();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(0);
    expect(el.selectivity.getValue()).toBe("Antwerp");
});

test("react/dropdown: test initial highlights", () => {
    require("../../../src/inputs/single");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const wrapper = mount(<SelectivityReact items={["Amsterdam", "Antwerp", "Athens"]} />);
    const el = wrapper.getDOMNode();
    const $ = el.querySelector.bind(el);

    expect(el.selectivity.getValue()).toBe(null);

    el.click();

    // first item should be highlighted when there is no selection yet
    expect(el.querySelectorAll(".selectivity-result-item.highlight")).toHaveLength(1);
    expect($(".selectivity-result-item.highlight").textContent).toBe("Amsterdam");

    $('.selectivity-result-item[data-item-id="Athens"]').click();

    expect(el.selectivity.getValue()).toBe("Athens");

    el.click();

    // selected item should be highlighted once there is a selection
    expect(el.querySelectorAll(".selectivity-result-item.highlight")).toHaveLength(1);
    expect($(".selectivity-result-item.highlight").textContent).toBe("Athens");
});

test("react/dropdown: test multiple input initial highlights", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const wrapper = mount(
        <SelectivityReact items={["Amsterdam", "Antwerp", "Athens"]} multiple={true} />,
    );
    const el = wrapper.getDOMNode();
    const $ = el.querySelector.bind(el);

    expect(el.selectivity.getValue()).toEqual([]);

    el.click();

    // 3 results
    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(3);
    // first item should be highlighted when there is no selection yet
    expect(el.querySelectorAll(".selectivity-result-item.highlight")).toHaveLength(1);
    expect($(".selectivity-result-item.highlight").textContent).toBe("Amsterdam");

    $('.selectivity-result-item[data-item-id="Amsterdam"]').click();

    expect(el.selectivity.getValue()).toEqual(["Amsterdam"]);

    el.click();

    // selected items should not be rendered in dropdown
    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(2);
    expect(el.querySelectorAll(".selectivity-result-item.highlight")).toHaveLength(1);
    // first (unselected) result should be highlighted
    expect($(".selectivity-result-item.highlight").textContent).toBe("Antwerp");
});

test("react/dropdown: test load more", () => {
    require("../../../src/inputs/single");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const wrapper = mount(<SelectivityReact query={query} />);
    const el = wrapper.getDOMNode();
    const $ = el.querySelector.bind(el);

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(0);
    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(0);
    expect(el.querySelectorAll(".selectivity-load-more")).toHaveLength(0);

    el.click();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(1);
    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(10);
    expect(el.querySelectorAll(".selectivity-load-more")).toHaveLength(1);

    expect($(".selectivity-result-item").textContent).toBe("Amsterdam");
    expect($(".selectivity-result-item:nth-last-child(2)").textContent).toBe("Bucharest");

    $(".selectivity-load-more").click();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(1);
    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(20);
    expect(el.querySelectorAll(".selectivity-load-more")).toHaveLength(1);

    $(".selectivity-load-more").click();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(1);
    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(25);
    expect(el.querySelectorAll(".selectivity-load-more")).toHaveLength(0);

    expect($(".selectivity-result-item").textContent).toBe("Amsterdam");
    expect($(".selectivity-result-item:last-child").textContent).toBe("Helsinki");
});

test("react/dropdown: test search", () => {
    require("../../../src/inputs/single");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const wrapper = mount(<SelectivityReact query={query} />);
    const el = wrapper.getDOMNode();
    const $ = el.querySelector.bind(el);

    el.click();

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(1);
    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(10);
    expect(el.querySelectorAll(".selectivity-load-more")).toHaveLength(1);

    // "am" should match 3 results
    $(".selectivity-search-input").value = "am";
    $(".selectivity-search-input").dispatchEvent(new KeyboardEvent("keyup"));

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(1);
    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(3);
    expect(el.querySelectorAll(".selectivity-load-more")).toHaveLength(0);

    // clear input
    $(".selectivity-search-input").value = "";
    $(".selectivity-search-input").dispatchEvent(new KeyboardEvent("keyup"));

    expect(el.querySelectorAll(".selectivity-dropdown")).toHaveLength(1);
    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(10);
    expect(el.querySelectorAll(".selectivity-load-more")).toHaveLength(1);
});
