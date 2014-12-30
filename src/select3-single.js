'use strict';

var $ = require('jquery');

var Select3 = require('./select3-base');

/**
 * SingleSelect3 Constructor.
 *
 * @param options Options object. Accepts all options from the Select3 Base Constructor.
 */
function SingleSelect3(options) {

    Select3.call(this, options);
}

SingleSelect3.prototype = Object.create(Select3.prototype);
SingleSelect3.prototype.constructor = SingleSelect3;

/**
 * Methods.
 */
$.extend(SingleSelect3.prototype, {

    /**
     * Returns the correct data for a given value.
     *
     * @param value The value to get the data for. Should be an ID.
     *
     * @return The corresponding data. Will be an object with 'id' and 'text' properties. Note that
     *         if no items are defined, this method assumes the text label will be equal to the ID.
     */
    getDataForValue: function(value) {

        var items = this.items;
        if (items) {
            for (var i = 0, length = items.length; i < length; i++) {
                if (items[i].id === value) {
                    return items[i];
                }
            }
            return null;
        } else {
            return { id: value, text: '' + value };
        }
    },

    /**
     * Returns the correct value for the given data.
     *
     * @param data The data to get the value for. Should be an object with 'id' and 'text'
     *             properties or null.
     *
     * @return The corresponding value. Will be an ID or null.
     */
    getValueForData: function(data) {

        return (data ? data.id : null);
    },

    /**
     * Validates data to set. Throws an exception if the data is invalid.
     *
     * @param data The data to validate. Should be an object with 'id' and 'text' properties or null
     *             to indicate no item is selected.
     *
     * @return The validated data. This may differ from the input data.
     */
    validateData: function(data) {

        if (data === null) {
            return data;
        } else if (data && Select3.isValidID(data.id) || $.type(data.text) === 'string') {
            return data;
        } else {
            throw new Error('Data item should have id and text properties');
        }
    },

    /**
     * Validates a value to set. Throws an exception if the value is invalid.
     *
     * @param value The value to validate. Should be null or a valid ID.
     *
     * @return The validated value. This may differ from the input value.
     */
    validateValue: function(value) {

        if (value === null || Select3.isValidID(value)) {
            return value;
        } else {
            throw new Error('Value for SingleSelect3 instance should be a valid ID or null');
        }
    }

});

module.exports = SingleSelect3;
