import React from "react";
import delay from "delay";
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

function getQuery() {
    let timeout = 30;
    return async options => {
        const limit = 10;
        const results = options.term ? items.filter(item => item.includes(options.term)) : items;

        timeout -= 10;
        await delay(timeout);
        options.callback({
            results: results.slice(options.offset, options.offset + limit),
            more: results.length > options.offset + limit,
        });
    };
}

test("react/async: test with async", async () => {
    require("../../../src/inputs/single");
    require("../../../src/plugins/async");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(<SelectivityReact query={getQuery()} />).getDOMNode();
    el.click();
    el.selectivity.search("am");
    el.selectivity.search("dam");

    await delay(5);

    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(1);
    expect(el.querySelector(".selectivity-result-item").textContent).toBe("Amsterdam");

    await delay(25);

    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(1);
});

test("react/async: test without async", async () => {
    require("../../../src/inputs/single");
    require("../../../src/dropdown");
    require("../../../src/templates");
    const SelectivityReact = require("../../../src/apis/react").default;

    const el = mount(<SelectivityReact query={getQuery()} />).getDOMNode();
    el.click();
    el.selectivity.search("am");
    el.selectivity.search("dam");

    await delay(5);

    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(1);
    expect(el.querySelector(".selectivity-result-item").textContent).toBe("Amsterdam");

    await delay(25);

    // without async there would be more results
    expect(el.querySelectorAll(".selectivity-result-item")).toHaveLength(10);
});
