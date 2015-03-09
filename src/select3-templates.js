'use strict';

var escape = require('./lodash/escape');

var Select3 = require('./select3-base');

require('./select3-locale');

/**
 * Default set of templates to use with Select3.
 *
 * Note that every template can be defined as either a string, a function returning a string (like
 * Handlebars templates, for instance) or as an object containing a render function (like Hogan.js
 * templates, for instance).
 */
Select3.Templates = {

    /**
     * Renders the dropdown.
     *
     * The template is expected to have at least one element with the class
     * 'select3-results-container', which is where all results will be added to.
     *
     * @param options Options object containing the following properties:
     *                dropdownCssClass - Optional CSS class to add to the top-level element.
     *                searchInputPlaceholder - Optional placeholder text to display in the search
     *                                         input in the dropdown.
     *                showSearchInput - Boolean whether a search input should be shown. If true,
     *                                  an input element with the 'select3-search-input' is
     *                                  expected.
     */
    dropdown: function(options) {
        var extraClass = (options.dropdownCssClass ? ' ' + options.dropdownCssClass : ''),
            searchInput = '';
        if (options.showSearchInput) {
            extraClass += ' has-search-input';

            var placeholder = options.searchInputPlaceholder;
            searchInput = (
                '<div class="select3-search-input-container">' +
                    '<input class="select3-search-input"' +
                            (placeholder ? ' placeholder="' + escape(placeholder) + '"'
                                         : '') + '>' +
                '</div>'
            );
        }
        return (
            '<div class="select3-dropdown' + extraClass + '">' +
                searchInput +
                '<div class="select3-results-container"></div>' +
            '</div>'
        );
    },

    /**
     * Renders an error message in the dropdown.
     *
     * @param options Options object containing the following properties:
     *                escape - Boolean whether the message should be HTML-escaped.
     *                message - The message to display.
     */
    error: function(options) {
        return (
            '<div class="select3-error">' +
                (options.escape ? escape(options.message) : options.message) +
            '</div>'
        );
    },

    /**
     * Renders a loading indicator in the dropdown.
     *
     * This template is expected to have an element with a 'select3-loading' class which may be
     * replaced with actual results.
     */
    loading: function() {
        return '<div class="select3-loading">' + Select3.Locale.loading + '</div>';
    },

    /**
     * Load more indicator.
     *
     * This template is expected to have an element with a 'select3-load-more' class which, when
     * clicked, will load more results.
     */
    loadMore: function() {
        return '<div class="select3-load-more">' + Select3.Locale.loadMore + '</div>';
    },

    /**
     * Renders multi-selection input boxes.
     *
     * The template is expected to have at least have elements with the following classes:
     * 'select3-multiple-input-container' - The element containing all the selected items and the
     *                                      input for selecting additional items.
     * 'select3-multiple-input' - The actual input element that allows the user to type to search
     *                            for more items. When selected items are added, they are inserted
     *                            right before this element.
     * 'select3-width-detector' - This element is optional, but important to make sure the
     *                            '.select3-multiple-input' element will fit in the container. The
     *                            width detector also has the 'select2-multiple-input' class on
     *                            purpose to be able to detect the width of text entered in the
     *                            input element.
     *
     * @param options Options object containing the following property:
     *                enabled - Boolean whether the input is enabled.
     */
    multipleSelectInput: function(options) {
        return (
            '<div class="select3-multiple-input-container">' +
                (options.enabled ? '<input type="text" autocomplete="off" autocorrect="off" ' +
                                          'autocapitalize="off" class="select3-multiple-input">' +
                                   '<span class="select3-multiple-input select3-width-detector">' +
                                   '</span>'
                                 : '<div class="select3-multiple-input select3-placeholder">' +
                                   '</div>') +
                '<div class="clearfix"></div>' +
            '</div>'
        );
    },

    /**
     * Renders a selected item in multi-selection input boxes.
     *
     * The template is expected to have a top-level element with the class
     * 'select3-multiple-selected-item'. This element is also required to have a 'data-item-id'
     * attribute with the ID set to that passed through the options object.
     *
     * An element with the class 'select3-multiple-selected-item-remove' should be present which,
     * when clicked, will cause the element to be removed.
     *
     * @param options Options object containing the following properties:
     *                highlighted - Boolean whether this item is currently highlighted.
     *                id - Identifier for the item.
     *                removable - Boolean whether a remove icon should be displayed.
     *                text - Text label which the user sees.
     */
    multipleSelectedItem: function(options) {
        var extraClass = (options.highlighted ? ' highlighted' : '');
        return (
            '<span class="select3-multiple-selected-item' + extraClass + '" ' +
                  'data-item-id="' + escape(options.id) + '">' +
                escape(options.text) +
                (options.removable ? '<a class="select3-multiple-selected-item-remove">' +
                                         '<i class="fa fa-remove"></i>' +
                                     '</a>'
                                   : '') +
            '</span>'
        );
    },

    /**
     * Renders a message there are no results for the given query.
     *
     * @param options Options object containing the following property:
     *                term - Search term the user is searching for.
     */
    noResults: function(options) {
        var Locale = Select3.Locale;
        return (
            '<div class="select3-error">' +
                (options.term ? Locale.noResultsForTerm(options.term) : Locale.noResults) +
            '</div>'
        );
    },

    /**
     * Renders a container for item children.
     *
     * The template is expected to have an element with the class 'select3-result-children'.
     *
     * @param options Options object containing the following property:
     *                childrenHtml - Rendered HTML for the children.
     */
    resultChildren: function(options) {
        return '<div class="select3-result-children">' + options.childrenHtml + '</div>';
    },

    /**
     * Render a result item in the dropdown.
     *
     * The template is expected to have a top-level element with the class 'select3-result-item'.
     * This element is also required to have a 'data-item-id' attribute with the ID set to that
     * passed through the options object.
     *
     * @param options Options object containing the following properties:
     *                id - Identifier for the item.
     *                text - Text label which the user sees.
     *                submenu - Truthy if the result item has a menu with subresults.
     */
    resultItem: function(options) {
        return (
            '<div class="select3-result-item" data-item-id="' + escape(options.id) + '">' +
                escape(options.text) +
                (options.submenu ? '<i class="select3-submenu-icon fa fa-chevron-right"></i>'
                                 : '') +
            '</div>'
        );
    },

    /**
     * Render a result label in the dropdown.
     *
     * The template is expected to have a top-level element with the class 'select3-result-label'.
     *
     * @param options Options object containing the following properties:
     *                text - Text label.
     */
    resultLabel: function(options) {
        return '<div class="select3-result-label">' + escape(options.text) + '</div>';
    },

    /**
     * Renders single-select input boxes.
     *
     * The template is expected to have at least one element with the class
     * 'select3-single-result-container' which is the element containing the selected item or the
     * placeholder.
     */
    singleSelectInput: (
        '<div class="select3-single-select">' +
            '<div class="select3-single-result-container"></div>' +
            '<i class="fa fa-sort-desc select3-caret"></i>' +
        '</div>'
    ),

    /**
     * Renders the placeholder for single-select input boxes.
     *
     * The template is expected to have a top-level element with the class 'select3-placeholder'.
     *
     * @param options Options object containing the following property:
     *                placeholder - The placeholder text.
     */
    singleSelectPlaceholder: function(options) {
        return (
            '<div class="select3-placeholder">' +
                escape(options.placeholder) +
            '</div>'
        );
    },

    /**
     * Renders the selected item in single-select input boxes.
     *
     * The template is expected to have a top-level element with the class
     * 'select3-single-selected-item'. This element is also required to have a 'data-item-id'
     * attribute with the ID set to that passed through the options object.
     *
     * @param options Options object containing the following properties:
     *                id - Identifier for the item.
     *                removable - Boolean whether a remove icon should be displayed.
     *                text - Text label which the user sees.
     */
    singleSelectedItem: function(options) {
        return (
            '<span class="select3-single-selected-item" ' +
                  'data-item-id="' + escape(options.id) + '">' +
                (options.removable ? '<a class="select3-single-selected-item-remove">' +
                                         '<i class="fa fa-remove"></i>' +
                                     '</a>'
                                   : '') +
                escape(options.text) +
            '</span>'
        );
    }

};
