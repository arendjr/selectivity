import React from "react";
import { mount } from "enzyme";

test("react/email: test value on enter", () => {
    require("../../../src/inputs/email");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(<SelectivityReact inputType="Email" />).getDOMNode();

    const input = el.querySelector(".selectivity-multiple-input");
    input.value = "test@gmail.com";
    input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, keyCode: 13 }));

    expect(el.selectivity.getValue()).toEqual(["test@gmail.com"]);
});

test("react/email: test value after space and enter", () => {
    require("../../../src/inputs/email");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(<SelectivityReact inputType="Email" />).getDOMNode();

    const input = el.querySelector(".selectivity-multiple-input");
    input.value = "test@gmail.com ";
    input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, keyCode: 32 }));

    expect(input.value).toBe("");
    expect(el.selectivity.getValue()).toEqual(["test@gmail.com"]);

    input.value = "test2@gmail.com";
    input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, keyCode: 13 }));

    expect(el.selectivity.getValue()).toEqual(["test@gmail.com", "test2@gmail.com"]);
});
