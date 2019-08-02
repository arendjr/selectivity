import React from "react";
import { mount } from "enzyme";

test("react/multiple: test trim spaces functionality", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/plugins/tokenizer");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact
            multiple={true}
            showDropdown={false}
            tokenSeparators={[","]}
            trimSpaces={true}
        />,
    ).getDOMNode();

    el.querySelector(".selectivity-multiple-input").value = " Amsterdam  , Berlin   , ";
    el.querySelector(".selectivity-multiple-input").dispatchEvent(new KeyboardEvent("keyup"));

    expect(el.selectivity.getData()).toEqual([
        { id: "Amsterdam", text: "Amsterdam" },
        { id: "Berlin", text: "Berlin" },
    ]);
    expect(el.selectivity.getValue()).toEqual(["Amsterdam", "Berlin"]);
});

test("react/multiple: test allow duplicates", () => {
    require("../../../src/inputs/multiple");
    require("../../../src/plugins/tokenizer");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact
            allowDuplicates={true}
            multiple={true}
            showDropdown={false}
            tokenSeparators={[","]}
        />,
    ).getDOMNode();

    el.querySelector(".selectivity-multiple-input").value = "Berlin,Amsterdam,Berlin,";
    el.querySelector(".selectivity-multiple-input").dispatchEvent(new KeyboardEvent("keyup"));

    expect(el.selectivity.getData()).toEqual([
        { id: "Berlin", text: "Berlin" },
        { id: "Amsterdam", text: "Amsterdam" },
        { id: "Berlin", text: "Berlin" },
    ]);
    expect(el.selectivity.getValue()).toEqual(["Berlin", "Amsterdam", "Berlin"]);
});
