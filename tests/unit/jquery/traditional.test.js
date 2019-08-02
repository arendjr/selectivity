import { noop } from "lodash";

test("jquery/traditional: test initialization of single select input", () => {
    const $ = require("jquery");
    require("../../../src/inputs/single");
    require("../../../src/plugins/jquery/traditional");
    require("../../../src/templates");
    require("../../../src/apis/jquery");

    document.body.innerHTML = `<select id="selectivity-input" name="my_select">
        <option value="1">One</option>
        <option value="2">Two</option>
        <option value="3" selected>Three</option>
        <option value="4">Four</option>
    </select>`;

    const $input = $("#selectivity-input");
    $input.selectivity();

    expect($input.selectivity("data")).toEqual({ id: "3", text: "Three" });
    expect($input.selectivity("value")).toBe("3");

    expect($("#selectivity-input").selectivity("value")).toBe("3");

    const $options = $('select[name="my_select"] option[selected]');
    expect($options).toHaveLength(1);
    expect($options.first().val()).toBe("3");

    expect($(".selectivity-input")[0].id).toBe("s9y_selectivity-input");
});

test("jquery/traditional: test initialization of single select input with custom query", () => {
    const $ = require("jquery");
    require("../../../src/inputs/single");
    require("../../../src/plugins/jquery/traditional");
    require("../../../src/templates");
    require("../../../src/apis/jquery");

    document.body.innerHTML = `<select id="selectivity-input" name="my_select">
        <option value="1">One</option>
        <option value="2">Two</option>
        <option value="3" selected>Three</option>
        <option value="4">Four</option>
    </select>`;

    const $input = $("#selectivity-input");
    $input.selectivity({ query: noop });

    expect($input.selectivity("data")).toEqual({ id: "3", text: "Three" });
    expect($input.selectivity("value")).toBe("3");

    expect($input[0].selectivity.items).toBe(null);
});

test("jquery/traditional: test initialization of single select input with empty value", () => {
    const $ = require("jquery");
    require("../../../src/inputs/single");
    require("../../../src/plugins/jquery/traditional");
    require("../../../src/templates");
    require("../../../src/apis/jquery");

    document.body.innerHTML = `<select id="selectivity-input" name="my_select">
        <option value="">Select one</option>
        <option value="1">One</option>
        <option value="2">Two</option>
        <option value="3">Three</option>
        <option value="4">Four</option>
    </select>`;

    const $input = $("#selectivity-input");
    $input.selectivity({ query: noop });

    expect($input.selectivity("data")).toEqual({ id: "", text: "Select one" });
    expect($input.selectivity("value")).toBe("");
});

test("jquery/traditional: test initialization of multiple select input", () => {
    const $ = require("jquery");
    require("../../../src/inputs/multiple");
    require("../../../src/plugins/jquery/traditional");
    require("../../../src/templates");
    require("../../../src/apis/jquery");

    document.body.innerHTML = `<select id="selectivity-input" name="my_select" multiple>
        <option value="1">One</option>
        <option value="2">Two</option>
        <option value="3" selected>Three</option>
        <option value="4" selected>Four</option>
    </select>`;

    const $input = $("#selectivity-input");
    $input.selectivity();

    expect($input.selectivity("data")).toEqual([
        { id: "3", text: "Three" },
        { id: "4", text: "Four" },
    ]);
    expect($input.selectivity("value")).toEqual(["3", "4"]);

    expect($("#selectivity-input").selectivity("value")).toEqual(["3", "4"]);

    const $options = $('select[name="my_select"] option[selected]');
    expect($options).toHaveLength(2);
    expect($options.first().val()).toBe("3");
    expect($options.last().val()).toBe("4");

    expect($(".selectivity-input")[0].id).toBe("s9y_selectivity-input");
});

test("jquery/traditional: test change events of single select input", () => {
    const $ = require("jquery");
    require("../../../src/inputs/single");
    require("../../../src/plugins/jquery/traditional");
    require("../../../src/templates");
    require("../../../src/apis/jquery");

    document.body.innerHTML = `<select id="selectivity-input" name="my_select">
        <option value="1">One</option>
        <option value="2">Two</option>
        <option value="3" selected>Three</option>
        <option value="4">Four</option>
    </select>`;

    let $input = $("#selectivity-input");
    const $originalInput = $input;
    $input = $input.selectivity({ query: noop });

    const changeListener = jest.fn();
    const originalChangeListener = jest.fn();

    $input.on("change", changeListener);
    $originalInput.on("change", originalChangeListener);

    const event = new Event("selectivity-selected");
    event.item = { id: "1", text: "foo bar" };
    $input[0].dispatchEvent(event);

    expect(changeListener).toHaveBeenCalledTimes(1);
    expect(changeListener).toHaveBeenCalledWith(expect.objectContaining({ value: "1" }));

    expect(originalChangeListener).toHaveBeenCalledTimes(1);
    expect(originalChangeListener).toHaveBeenCalledWith(expect.objectContaining({ value: "1" }));

    expect($originalInput.val()).toBe("1");
    expect($input.selectivity("value")).toBe("1");
});

test("jquery/traditional: test change events of multiple select input", () => {
    const $ = require("jquery");
    require("../../../src/inputs/multiple");
    require("../../../src/plugins/jquery/traditional");
    require("../../../src/templates");
    require("../../../src/apis/jquery");

    document.body.innerHTML = `<select id="selectivity-input" name="my_select" multiple>
        <option value="1">One</option>
        <option value="2">Two</option>
        <option value="3" selected>Three</option>
        <option value="4" selected>Four</option>
    </select>`;

    let $input = $("#selectivity-input");
    const $originalInput = $input;
    $input = $input.selectivity({ query: noop });

    const changeListener = jest.fn();
    const originalChangeListener = jest.fn();

    $input.on("change", changeListener);
    $originalInput.on("change", originalChangeListener);

    const event1 = new Event("selectivity-selected");
    event1.item = { id: "1", text: "foo bar" };
    $input[0].dispatchEvent(event1);

    expect($originalInput.val()).toEqual(["1", "3", "4"]);

    expect(changeListener).toHaveBeenCalledTimes(1);
    expect(changeListener).toHaveBeenCalledWith(
        expect.objectContaining({ added: { id: "1", text: "foo bar" }, value: ["3", "4", "1"] }),
    );

    expect(originalChangeListener).toHaveBeenCalledTimes(1);
    expect(originalChangeListener).toHaveBeenCalledWith(
        expect.objectContaining({ added: { id: "1", text: "foo bar" }, value: ["3", "4", "1"] }),
    );

    const event2 = new Event("selectivity-selected");
    event2.item = { id: "2", text: "foo bar" };
    $input[0].dispatchEvent(event2);

    expect($originalInput.val()).toEqual(["1", "2", "3", "4"]);
    expect($input.selectivity("value")).toEqual(["3", "4", "1", "2"]);

    expect(changeListener).toHaveBeenCalledTimes(2);
    expect(changeListener).toHaveBeenCalledWith(
        expect.objectContaining({
            added: { id: "2", text: "foo bar" },
            value: ["3", "4", "1", "2"],
        }),
    );

    expect(originalChangeListener).toHaveBeenCalledTimes(2);
    expect(originalChangeListener).toHaveBeenCalledWith(
        expect.objectContaining({
            added: { id: "2", text: "foo bar" },
            value: ["3", "4", "1", "2"],
        }),
    );

    $input.selectivity("remove", "2");

    expect($originalInput.val()).toEqual(["1", "3", "4"]);
    expect($input.selectivity("value")).toEqual(["3", "4", "1"]);

    expect(changeListener).toHaveBeenCalledTimes(3);
    expect(changeListener).toHaveBeenCalledWith(
        expect.objectContaining({ removed: { id: "2", text: "foo bar" }, value: ["3", "4", "1"] }),
    );

    expect(originalChangeListener).toHaveBeenCalledTimes(3);
    expect(originalChangeListener).toHaveBeenCalledWith(
        expect.objectContaining({ removed: { id: "2", text: "foo bar" }, value: ["3", "4", "1"] }),
    );
});

test("jquery/traditional: test placeholder with multiple select input", () => {
    const $ = require("jquery");
    require("../../../src/inputs/multiple");
    require("../../../src/plugins/jquery/traditional");
    require("../../../src/templates");
    require("../../../src/apis/jquery");

    document.body.innerHTML = `<select data-placeholder="Select one or more" id="selectivity-input" multiple name="my_select">
        <option value="1">One</option>
        <option value="2">Two</option>
        <option value="3">Three</option>
        <option value="4">Four</option>
    </select>`;

    const $input = $("#selectivity-input");
    $input.selectivity();

    expect($input.selectivity("data")).toEqual([]);
    expect($('select[name="my_select"] option[selected]')).toHaveLength(0);
    expect($(".multiple-selected-item")).toHaveLength(0);

    const input = $(".selectivity-multiple-input")[0];
    expect(input.value).toBe("");
    expect(input).toHaveAttribute("placeholder", "Select one or more");
});
