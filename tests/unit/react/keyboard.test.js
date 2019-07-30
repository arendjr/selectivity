import React from "react";
import { mount } from "enzyme";

const KEY_DOWN_ARROW = 40;
const KEY_UP_ARROW = 38;

test("react/keyboard: test select nested item", () => {
    require("../../../src/inputs/single");
    require("../../../src/plugins/keyboard");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const items = [
        { text: "Austria", children: [{ id: 54, text: "Vienna" }] },
        { text: "Belgium", children: [{ id: 2, text: "Antwerp" }, { id: 9, text: "Brussels" }] },
        { text: "Bulgaria", children: [{ id: 48, text: "Sofia" }] },
    ];

    const el = mount(<SelectivityReact items={items} />).getDOMNode();

    el.querySelector(".selectivity-single-select").click();
    el.querySelector(".selectivity-search-input").value = "belg";
    el.querySelector(".selectivity-search-input").dispatchEvent(new KeyboardEvent("keyup"));
    el.querySelector(".selectivity-search-input").dispatchEvent(
        new KeyboardEvent("keyup", { keyCode: 13 }),
    );

    expect(el.selectivity.getValue()).toBe(2);
});

test("react/keyboard: test change event after enter", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/plugins/keyboard");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const items = ["Amsterdam", "Antwerp", "Athens"];
    const onChange = jest.fn();

    const el = mount(
        <SelectivityReact items={items} multiple={true} onChange={onChange} />,
    ).getDOMNode();

    el.querySelector(".selectivity-multiple-input").value = "Amsterdam";
    el.querySelector(".selectivity-multiple-input").dispatchEvent(new KeyboardEvent("keyup"));
    el.querySelector(".selectivity-multiple-input").dispatchEvent(new Event("change"));
    el.querySelector(".selectivity-multiple-input").dispatchEvent(
        new KeyboardEvent("keyup", { keyCode: 13 }),
    );

    expect(el.selectivity.getValue()).toEqual(["Amsterdam"]);

    expect(onChange).toBeCalledTimes(1);
    expect(onChange).toBeCalledWith(
        expect.objectContaining({
            added: { id: "Amsterdam", text: "Amsterdam" },
            value: ["Amsterdam"],
        }),
    );
});

test("react/keyboard: test up and down navigation", () => {
    require("../../../src/inputs/single");
    require("../../../src/plugins/keyboard");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const items = ["Amsterdam", "Antwerp", "Athens"];

    const el = mount(<SelectivityReact items={items} />).getDOMNode();

    el.querySelector(".selectivity-single-select").click();

    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(3);
    expect(el.querySelectorAll(".selectivity-result-item.highlight")).toHaveLength(1);
    expect(el.querySelector(".selectivity-result-item.highlight").textContent).toBe("Amsterdam");

    el.querySelector(".selectivity-search-input").dispatchEvent(
        new KeyboardEvent("keydown", { keyCode: KEY_DOWN_ARROW }),
    );

    expect(el.querySelectorAll(".selectivity-result-item.highlight")).toHaveLength(1);
    expect(el.querySelector(".selectivity-result-item.highlight").textContent).toBe("Antwerp");

    el.querySelector(".selectivity-search-input").dispatchEvent(
        new KeyboardEvent("keydown", { keyCode: KEY_DOWN_ARROW }),
    );

    expect(el.querySelectorAll(".selectivity-result-item.highlight")).toHaveLength(1);
    expect(el.querySelector(".selectivity-result-item.highlight").textContent).toBe("Athens");

    el.querySelector(".selectivity-search-input").dispatchEvent(
        new KeyboardEvent("keydown", { keyCode: KEY_DOWN_ARROW }),
    );

    expect(el.querySelectorAll(".selectivity-result-item.highlight")).toHaveLength(1);
    expect(el.querySelector(".selectivity-result-item.highlight").textContent).toBe("Amsterdam");

    el.querySelector(".selectivity-search-input").dispatchEvent(
        new KeyboardEvent("keydown", { keyCode: KEY_UP_ARROW }),
    );

    expect(el.querySelectorAll(".selectivity-result-item.highlight")).toHaveLength(1);
    expect(el.querySelector(".selectivity-result-item.highlight").textContent).toBe("Athens");

    el.querySelector(".selectivity-search-input").dispatchEvent(
        new KeyboardEvent("keydown", { keyCode: KEY_UP_ARROW }),
    );

    expect(el.querySelectorAll(".selectivity-result-item.highlight")).toHaveLength(1);
    expect(el.querySelector(".selectivity-result-item.highlight").textContent).toBe("Antwerp");
});
