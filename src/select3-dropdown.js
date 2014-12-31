'use strict';

var $ = require('jquery');

var Select3 = require('./select3-base');

/**
 * Select3 Dropdown Constructor.
 */
function Select3Dropdown() {


}

/**
 * Methods.
 */
$.extend(Select3Dropdown.prototype, {

    /**
     * Removes the entire dropdown from the DOM.
     */
    remove: function() {

        this.$el.remove();
    },

    /**
     * Shows the results from a search query.
     *
     * @param results Array of result items.
     */
    showResults: function(/*results, options*/) {

    }

});

Select3.Dropdown = Select3Dropdown;

module.exports = Select3Dropdown;
