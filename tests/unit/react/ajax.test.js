import React from "react";
import { mount } from "enzyme";
import waitForExpect from "wait-for-expect";

const FAKE_URL = "http://localhost/my-endpoint";

const mockResponse = [
    { id: 1, text: "Amsterdam" },
    { id: 2, text: "Antwerp" },
    { id: 3, text: "Athens" },
];
const expectedDropdownContent =
    '<div class="selectivity-results-container">' +
    '<div class="selectivity-result-item highlight" data-item-id="1">Amsterdam</div>' +
    '<div class="selectivity-result-item" data-item-id="2">Antwerp</div>' +
    '<div class="selectivity-result-item" data-item-id="3">Athens</div>' +
    "</div>";

test("react/ajax: test response as array", async () => {
    require("../../../src/inputs/single");
    require("../../../src/plugins/ajax");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const fetch = jest.fn().mockResolvedValue(mockResponse);

    const wrapper = mount(<SelectivityReact ajax={{ fetch, url: FAKE_URL }} />);
    const el = wrapper.getDOMNode();
    el.dispatchEvent(new MouseEvent("click"));

    await waitForExpect(() => {
        expect(fetch).toHaveBeenCalledWith(FAKE_URL, {}, expect.anything());
        expect(el.querySelector(".selectivity-results-container").outerHTML).toEqual(
            expectedDropdownContent,
        );
    });
});

test("react/ajax: test response as array with default fetch method", async () => {
    require("../../../src/inputs/single");
    require("../../../src/plugins/ajax");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    window.fetch = jest.fn().mockResolvedValue(mockResponse);

    const wrapper = mount(
        <SelectivityReact
            ajax={{ params: (term, offset) => ({ offset, q: term }), url: FAKE_URL }}
        />,
    );
    const el = wrapper.getDOMNode();
    el.dispatchEvent(new MouseEvent("click"));

    await waitForExpect(() => {
        expect(window.fetch).toHaveBeenCalledWith(`${FAKE_URL}?offset=0&q=`, {}, expect.anything());
        expect(el.querySelector(".selectivity-results-container").outerHTML).toEqual(
            expectedDropdownContent,
        );
    });
});
