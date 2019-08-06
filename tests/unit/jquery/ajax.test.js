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

test("jquery/ajax: test response as array", async () => {
    const $ = require("jquery");
    require("../../../src/inputs/single");
    require("../../../src/plugins/ajax");
    require("../../../src/dropdown");
    require("../../../src/templates");
    require("../../../src/apis/jquery");

    const fetch = jest.fn().mockResolvedValue(mockResponse);

    const $input = $("<div />");
    $input.selectivity({ ajax: { fetch, url: FAKE_URL } });
    $input[0].click();

    await waitForExpect(() => {
        expect(fetch).toHaveBeenCalledWith(FAKE_URL, {}, expect.anything());
        expect($input.find(".selectivity-results-container")[0].outerHTML).toEqual(
            expectedDropdownContent,
        );
    });
});

test("jquery/ajax: test response as object with default fetch method", async () => {
    const $ = require("jquery");
    require("../../../src/inputs/single");
    require("../../../src/plugins/ajax");
    require("../../../src/plugins/jquery/ajax");
    require("../../../src/dropdown");
    require("../../../src/templates");
    require("../../../src/apis/jquery");

    // The jQuery API should use $.ajax to polyfill the fetch() method,
    // and it should be able to handle object responses.
    $.ajax = jest.fn().mockResolvedValue(mockResponse);

    const $input = $("<div />");
    $input.selectivity({
        ajax: {
            url: FAKE_URL,
            params: (term, offset) => ({ offset, q: term }),
        },
    });

    $input[0].click();

    await waitForExpect(() => {
        expect($.ajax).toHaveBeenCalledWith(
            `${FAKE_URL}?offset=0&q=`,
            expect.objectContaining({ cache: true, method: "GET" }),
        );
        expect($input.find(".selectivity-results-container")[0].outerHTML).toEqual(
            expectedDropdownContent,
        );
    });
});
