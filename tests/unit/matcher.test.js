test("matcher: test basic matcher", () => {
    const { matcher } = require("../../src/selectivity").default;

    expect(matcher({ id: 1, text: "Amsterdam" }, "am")).toEqual({ id: 1, text: "Amsterdam" });
    expect(matcher({ id: 1, text: "Amsterdam" }, "sterdam")).toEqual({ id: 1, text: "Amsterdam" });

    expect(matcher({ id: 45, text: "Rotterdam" }, "am")).toEqual({ id: 45, text: "Rotterdam" });
    expect(matcher({ id: 45, text: "Rotterdam" }, "sterdam")).toEqual(null);

    expect(matcher({ id: 29, text: "Łódź" }, "łódź")).toEqual({ id: 29, text: "Łódź" });
    expect(matcher({ id: 29, text: "Łódź" }, "lodz")).toEqual(null);
});

test("matcher: test diacritics", () => {
    require("../../src/plugins/diacritics");
    const Selectivity = require("../../src/selectivity").default;

    const { matcher } = Selectivity;

    expect(matcher({ id: 1, text: "Amsterdam" }, "am")).toEqual({ id: 1, text: "Amsterdam" });
    expect(matcher({ id: 1, text: "Amsterdam" }, "sterdam")).toEqual({ id: 1, text: "Amsterdam" });

    expect(matcher({ id: 45, text: "Rotterdam" }, "am")).toEqual({ id: 45, text: "Rotterdam" });
    expect(matcher({ id: 45, text: "Rotterdam" }, "sterdam")).toEqual(null);

    expect(matcher({ id: 29, text: "Łódź" }, "lodz")).toEqual({ id: 29, text: "Łódź" });
});
