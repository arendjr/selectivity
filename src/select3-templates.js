'use strict';

var escape = require('lodash.escape').escape;

var Select3 = require('./select3-core');

/**
 * Default set of templates to use with Select3.
 *
 * Note that every template can be defined as either a string, a function returning a string (like
 * Handlebars templates, for instance) or as an object containing a render function (like Hogan.js
 * templates, for instance).
 */
Select3.Templates = {

    /**
     * Renders multi-selection input boxes.
     *
     * The template is expected to have at least have elements with the following classes:
     * 'select3-multiple-input-container' - Container element containing the selected items. Any
     *                                      items that are selected are added as children of this
     *                                      element.
     * 'select3-multiple-input' - The actual input element that allows the user to type to search
     *                            for more items. When selected items are added to the
     *                            '.select3-multiple-input-container' element, they are inserted
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
     * The template is expected to have a top-level element with the class 'select3-item'. This
     * element is also required to have a 'data-item-id' attribute with the ID set to that passed
     * through the options object.
     *
     * @param options Options object containing the following properties:
     *                id - Identifier for the item.
     *                label - Text label which the user sees.
     *                selected - Boolean whether this item is currently selected.
     */
    multiSelectItem: function(options) {
        return (
            '<span class="select3-item' + (options.selected ? ' selected' : '') + '" ' +
                  'data-item-id="' + escape(options.id) + '">' +
                escape(options.text) +
                '<a class="select3-item-remove action-remove-item">' +
                    '<i class="fa fa-remove"></i>' +
                '</a>' +
            '</span>'
        );
    }

};
