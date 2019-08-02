import React from "react";
import { mount } from "enzyme";

const div = React.createFactory("div");
const input = React.createFactory("input");
const span = React.createFactory("span");

test("react/templates: test templates specified as React elements", () => {
    require("../../../src/inputs/single");
    require("../../../src/plugins/react/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(
        <SelectivityReact
            defaultValue="Amsterdam <script>"
            items={["Amsterdam <script>", "Antwerp", "Athens"]}
            templates={{
                singleSelectInput: () =>
                    div(
                        { className: "selectivity-single-select react-template" },
                        input({ type: "text", className: "selectivity-single-select-input" }),
                        div({ className: "selectivity-single-result-container" }),
                    ),
                singleSelectedItem: options =>
                    span(
                        {
                            className: "selectivity-single-selected-item",
                            "data-item-id": options.id,
                        },
                        options.text,
                    ),
            }}
        />,
    ).getDOMNode();

    expect(el.querySelectorAll(".selectivity-single-select.react-template")).toHaveLength(1);
    expect(el.querySelectorAll(".selectivity-single-result-container")).toHaveLength(1);
    expect(el.querySelectorAll(".selectivity-single-selected-item")).toHaveLength(1);
    expect(el.querySelector(".selectivity-single-selected-item").textContent).toContain(
        "Amsterdam <script>",
    );
    expect(el.querySelector(".selectivity-single-selected-item")).toHaveAttribute(
        "data-item-id",
        "Amsterdam <script>",
    );
});
