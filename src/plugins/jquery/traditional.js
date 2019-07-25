import $ from "jquery";

import Selectivity from "../../selectivity";

function createSelectivityNextToSelectElement($el, options) {
    let data = options.multiple ? [] : null;

    function mapOptions() {
        const $this = $(this);
        if ($this.is("option")) {
            const text = $this.text();
            let id = $this.attr("value");
            if (id === undefined) {
                id = text;
            }
            if ($this.prop("selected")) {
                const item = { id: id, text: text };
                if (options.multiple) {
                    data.push(item);
                } else {
                    data = item;
                }
            }

            return {
                id: id,
                text: $this.attr("label") || text,
            };
        } else {
            return {
                text: $this.attr("label"),
                children: $this
                    .children("option,optgroup")
                    .map(mapOptions)
                    .get(),
            };
        }
    }

    options.allowClear = "allowClear" in options ? options.allowClear : !$el.prop("required");

    const items = $el
        .children("option,optgroup")
        .map(mapOptions)
        .get();
    options.data = data;

    options.items = options.query ? null : items;

    options.placeholder = options.placeholder || $el.data("placeholder") || "";

    options.tabIndex =
        options.tabIndex === undefined ? $el.attr("tabindex") || 0 : options.tabIndex;

    const classes = ($el.attr("class") || "selectivity-input").split(" ");
    if (classes.indexOf("selectivity-input") < 0) {
        classes.push("selectivity-input");
    }

    const $div = $("<div>").attr({
        id: `s9y_${$el.attr("id")}`,
        class: classes.join(" "),
        style: $el.attr("style"),
        "data-name": $el.attr("name"),
    });
    $div.insertAfter($el);
    $el.hide();
    return $div[0];
}

function bindTraditionalSelectEvents(selectivity) {
    const $el = $(selectivity.el);
    $el.on("change", function(event) {
        const value = event.originalEvent.value;
        $el.prev("select")
            .val($.type(value) === "array" ? value.slice(0) : value)
            .trigger(event);
    });
}

/**
 * Option listener providing support for converting traditional <select> boxes into Selectivity
 * instances.
 */
Selectivity.OptionListeners.push(function(selectivity, options) {
    const $el = $(selectivity.el);
    if ($el.is("select")) {
        if ($el.attr("autofocus")) {
            setTimeout(function() {
                selectivity.focus();
            }, 1);
        }

        selectivity.el = createSelectivityNextToSelectElement($el, options);
        selectivity.el.selectivity = selectivity;

        Selectivity.patchEvents($el);

        bindTraditionalSelectEvents(selectivity);
    }
});
