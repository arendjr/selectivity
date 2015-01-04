'use strict';

var escape = require('./escape');

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
     */
    dropdown: (
        '<div class="select3-dropdown">' +
            '<div class="select3-results-container"></div>' +
        '</div>'
    ),

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
     *                placeholder - String containing the placeholder text to display if no items
     *                              are selected. May be empty if no placeholder is defined.
     */
    multiSelectInput: function(options) {
        return (
            '<div class="select3-multiple-input-container">' +
                '<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" ' +
                       'class="select3-multiple-input" ' +
                       'placeholder="' + escape(options.placeholder) + '">' +
                '<span class="select3-multiple-input select3-width-detector"></span>' +
                '<div class="clearfix"></div>' +
            '</div>'
        );
    },

    /**
     * Renders multi-selection input boxes.
     *
     * The template is expected to have a top-level element with the class 'select3-selected-item'.
     * This element is also required to have a 'data-item-id' attribute with the ID set to that
     * passed through the options object.
     *
     * An element with the class 'select3-item-remove' should be present which, when clicked, will
     * cause the element to be removed.
     *
     * @param options Options object containing the following properties:
     *                highlighted - Boolean whether this item is currently highlighted.
     *                id - Identifier for the item.
     *                text - Text label which the user sees.
     */
    multiSelectItem: function(options) {
        var extraClass = (options.highlighted ? ' highlighted' : '');
        return (
            '<span class="select3-selected-item' + extraClass + '" ' +
                  'data-item-id="' + escape(options.id) + '">' +
                '<a class="select3-selected-item-remove">' +
                    '<i class="fa fa-remove"></i>' +
                '</a>' +
                escape(options.text) +
            '</span>'
        );
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
     */
    resultItem: function(options) {
        return (
            '<div class="select3-result-item" data-item-id="' + escape(options.id) + '">' +
                escape(options.text) +
            '</div>'
        );
    }

};
