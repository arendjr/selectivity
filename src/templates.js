import escape from "lodash/escape";

import Locale from "./locale";
import Selectivity from "./selectivity";

/**
 * Default set of templates to use with Selectivity.js.
 *
 * Template can be defined as either a string, a function returning a string (like Handlebars
 * templates, for instance), an object containing a render function (like Hogan.js templates, fo
 * instance) or as a function returning a DOM element.
 *
 * Every template must return a single root element.
 */
Selectivity.Templates = {
    /**
     * Renders the dropdown.
     *
     * The template is expected to have at least one element with the class
     * 'selectivity-results-container', which is where all results will be added to.
     *
     * @param options Options object containing the following properties:
     *                dropdownCssClass - Optional CSS class to add to the top-level element.
     *                searchInputPlaceholder - Optional placeholder text to display in the search
     *                                         input in the dropdown.
     *                showSearchInput - Boolean whether a search input should be shown. If true,
     *                                  an input element with the 'selectivity-search-input' is
     *                                  expected.
     */
    dropdown(options) {
        let extraClass = options.dropdownCssClass ? ` ${options.dropdownCssClass}` : "",
            searchInput = "";
        if (options.showSearchInput) {
            extraClass += " has-search-input";

            const placeholder = options.searchInputPlaceholder;
            searchInput =
                `${'<div class="selectivity-search-input-container">' +
                    '<input type="text" class="selectivity-search-input"'}${
                    placeholder ? ` placeholder="${escape(placeholder)}"` : ""
                }>` + `</div>`;
        }
        return `<div class="selectivity-dropdown${extraClass}">${searchInput}<div class="selectivity-results-container"></div></div>`;
    },

    /**
     * Renders an error message in the dropdown.
     *
     * @param options Options object containing the following properties:
     *                escape - Boolean whether the message should be HTML-escaped.
     *                message - The message to display.
     */
    error(options) {
        return `<div class="selectivity-error">${
            options.escape ? escape(options.message) : options.message
        }</div>`;
    },

    /**
     * Renders a loading indicator in the dropdown.
     *
     * This template is expected to have an element with a 'selectivity-loading' class which may be
     * replaced with actual results.
     */
    loading() {
        return `<div class="selectivity-loading">${Locale.loading}</div>`;
    },

    /**
     * Load more indicator.
     *
     * This template is expected to have an element with a 'selectivity-load-more' class which, when
     * clicked, will load more results.
     */
    loadMore() {
        return `<div class="selectivity-load-more">${Locale.loadMore}</div>`;
    },

    /**
     * Renders multi-selection input boxes.
     *
     * The template is expected to have at least have elements with the following classes:
     * 'selectivity-multiple-input-container' - The element containing all the selected items and
     *                                          the input for selecting additional items.
     * 'selectivity-multiple-input' - The actual input element that allows the user to type to
     *                                search for more items. When selected items are added, they are
     *                                inserted right before this element.
     *
     * @param options Options object containing the following property:
     *                enabled - Boolean whether the input is enabled.
     */
    multipleSelectInput(options) {
        return (
            `<div class="selectivity-multiple-input-container">${
                options.enabled
                    ? '<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" class="selectivity-multiple-input">'
                    : '<div class="selectivity-multiple-input ' + 'selectivity-placeholder"></div>'
            }<div class="selectivity-clearfix"></div>` + `</div>`
        );
    },

    /**
     * Renders a selected item in multi-selection input boxes.
     *
     * The template is expected to have a top-level element with the class
     * 'selectivity-multiple-selected-item'. This element is also required to have a 'data-item-id'
     * attribute with the ID set to that passed through the options object.
     *
     * An element with the class 'selectivity-multiple-selected-item-remove' should be present
     * which, when clicked, will cause the element to be removed.
     *
     * @param options Options object containing the following properties:
     *                highlighted - Boolean whether this item is currently highlighted.
     *                id - Identifier for the item.
     *                removable - Boolean whether a remove icon should be displayed.
     *                text - Text label which the user sees.
     */
    multipleSelectedItem(options) {
        const extraClass = options.highlighted ? " highlighted" : "";
        return `<span class="selectivity-multiple-selected-item${extraClass}" data-item-id="${escape(
            options.id,
        )}">${
            options.removable
                ? '<a class="selectivity-multiple-selected-item-remove"><i class="fa fa-remove"></i></a>'
                : ""
        }${escape(options.text)}</span>`;
    },

    /**
     * Renders a message there are no results for the given query.
     *
     * @param options Options object containing the following property:
     *                term - Search term the user is searching for.
     */
    noResults(options) {
        return `<div class="selectivity-error">${
            options.term ? Locale.noResultsForTerm(options.term) : Locale.noResults
        }</div>`;
    },

    /**
     * Renders a container for item children.
     *
     * The template is expected to have an element with the class 'selectivity-result-children'.
     *
     * @param options Options object containing the following property:
     *                childrenHtml - Rendered HTML for the children.
     */
    resultChildren(options) {
        return `<div class="selectivity-result-children">${options.childrenHtml}</div>`;
    },

    /**
     * Render a result item in the dropdown.
     *
     * The template is expected to have a top-level element with the class
     * 'selectivity-result-item'. This element is also required to have a 'data-item-id' attribute
     * with the ID set to that passed through the options object.
     *
     * @param options Options object containing the following properties:
     *                id - Identifier for the item.
     *                text - Text label which the user sees.
     *                disabled - Truthy if the item should be disabled.
     *                submenu - Truthy if the result item has a menu with subresults.
     */
    resultItem(options) {
        return `<div class="selectivity-result-item${
            options.disabled ? " disabled" : ""
        }" data-item-id="${escape(options.id)}">${escape(options.text)}${
            options.submenu ? '<i class="selectivity-submenu-icon fa fa-chevron-right"></i>' : ""
        }</div>`;
    },

    /**
     * Render a result label in the dropdown.
     *
     * The template is expected to have a top-level element with the class
     * 'selectivity-result-label'.
     *
     * @param options Options object containing the following properties:
     *                text - Text label.
     */
    resultLabel(options) {
        return `<div class="selectivity-result-label">${escape(options.text)}</div>`;
    },

    /**
     * Renders single-select input boxes.
     *
     * The template is expected to have at least one element with the class
     * 'selectivity-single-result-container' which is the element containing the selected item or
     * the placeholder.
     */
    singleSelectInput(options) {
        return `${'<div class="selectivity-single-select">' +
            '<input type="text" class="selectivity-single-select-input"'}${
            options.required ? " required" : ""
        }><div class="selectivity-single-result-container"></div><i class="fa fa-sort-desc selectivity-caret"></i></div>`;
    },

    /**
     * Renders the placeholder for single-select input boxes.
     *
     * The template is expected to have a top-level element with the class
     * 'selectivity-placeholder'.
     *
     * @param options Options object containing the following property:
     *                placeholder - The placeholder text.
     */
    singleSelectPlaceholder(options) {
        return `<div class="selectivity-placeholder">${escape(options.placeholder)}</div>`;
    },

    /**
     * Renders the selected item in single-select input boxes.
     *
     * The template is expected to have a top-level element with the class
     * 'selectivity-single-selected-item'. This element is also required to have a 'data-item-id'
     * attribute with the ID set to that passed through the options object.
     *
     * @param options Options object containing the following properties:
     *                id - Identifier for the item.
     *                removable - Boolean whether a remove icon should be displayed.
     *                text - Text label which the user sees.
     */
    singleSelectedItem(options) {
        return `<span class="selectivity-single-selected-item" data-item-id="${escape(
            options.id,
        )}">${
            options.removable
                ? '<a class="selectivity-single-selected-item-remove"><i class="fa fa-remove"></i></a>'
                : ""
        }${escape(options.text)}</span>`;
    },

    /**
     * Renders select-box inside single-select input that was initialized on
     * traditional <select> element.
     *
     * @param options Options object containing the following properties:
     *                name - Name of the <select> element.
     *                mode - Mode in which select exists, single or multiple.
     */
    selectCompliance(options) {
        const mode = options.mode;
        let name = options.name;
        if (mode === "multiple" && name.slice(-2) !== "[]") {
            name += "[]";
        }
        return `<select name="${name}"${mode === "multiple" ? " multiple" : ""}></select>`;
    },

    /**
     * Renders the selected item in compliance <select> element as <option>.
     *
     * @param options Options object containing the following properties
     *                id - Identifier for the item.
     *                text - Text label which the user sees.
     */
    selectOptionCompliance(options) {
        return `<option value="${escape(options.id)}" selected>${escape(options.text)}</option>`;
    },
};
