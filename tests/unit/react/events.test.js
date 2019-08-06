import React from "react";
import { mount } from "enzyme";
import { noop } from "lodash";

const data = { id: 1, text: "Amsterdam" };

const items = [{ id: 1, text: "Amsterdam" }, { id: 2, text: "Antwerp" }, { id: 3, text: "Athens" }];

test("react/events: test change event triggered when result clicked", () => {
    require("../../../src/inputs/single");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const onChange = jest.fn();

    const el = mount(
        <SelectivityReact data={data} items={items} onChange={onChange} />,
    ).getDOMNode();

    el.click();
    el.querySelector('.selectivity-result-item[data-item-id="2"]').click();

    expect(el.selectivity.getValue()).toBe(2);
    expect(onChange).toBeCalledWith(
        expect.objectContaining({ data: { id: 2, text: "Antwerp" }, value: 2 }),
    );
});

test("react/events: test change event suppressed for top-down change", async () => {
    require("../../../src/inputs/single");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const onChange = jest.fn();

    const wrapper = mount(<SelectivityReact data={data} items={items} onChange={onChange} />);

    wrapper.setProps({ data: { id: 2, text: "Antwerp" }, items, onChange });

    expect(wrapper.getDOMNode().selectivity.getValue()).toBe(2);
    expect(onChange).not.toBeCalled();
});

test("react/events: test change event called properly when onChange listener changed", async () => {
    require("../../../src/inputs/single");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const onChange = jest.fn();

    const wrapper = mount(<SelectivityReact data={data} items={items} onChange={noop} />);
    wrapper.setProps({ data, items, onChange });

    const el = wrapper.getDOMNode();
    el.click();
    el.querySelector('.selectivity-result-item[data-item-id="2"]').click();

    expect(el.selectivity.getValue()).toBe(2);
    expect(onChange).toBeCalledWith(
        expect.objectContaining({ data: { id: 2, text: "Antwerp" }, value: 2 }),
    );
});
