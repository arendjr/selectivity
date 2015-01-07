'use strict';

var $ = require('jquery');

var Select3 = require('./select3-base');

/**
 * SingleSelect3 Constructor.
 *
 * @param options Options object. Accepts all options from the Select3 Base Constructor in addition
 *                to those accepted by SingleSelect3.setOptions().
 */
function SingleSelect3(options) {

    Select3.call(this, options);

    this.$el.html(this.template('singleSelectInput', this.options));

    this._rerenderSelection();
}

SingleSelect3.prototype = Object.create(Select3.prototype);
SingleSelect3.prototype.constructor = SingleSelect3;

/**
 * Methods.
 */
$.extend(SingleSelect3.prototype, {

    /**
     * Events map.
     *
     * Follows the same format as Backbone: http://backbonejs.org/#View-delegateEvents
     */
    events: {
        'change': '_rerenderSelection',
        'click': '_clicked',
        'click .select3-single-selected-item-remove': '_itemRemoveClicked',
        'select3-selected': '_resultSelected'
    },

    /**
     * Applies focus to the input.
     */
    focus: function() {

        // TODO
    },

    /**
     * Returns the correct data for a given value.
     *
     * @param value The value to get the data for. Should be an ID.
     *
     * @return The corresponding data. Will be an object with 'id' and 'text' properties. Note that
     *         if no items are defined, this method assumes the text label will be equal to the ID.
     */
    getDataForValue: function(value) {

        return this.getItemForId(value);
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
     * @inherit
     *
     * @param options Options object. In addition to the options supported in the base
     *                implementation, this may contain the following properties:
     *                allowClear - Boolean whether the selected item may be removed.
     *                showSearchInputInDropdown - Set to false to remove the search input used in
     *                                            dropdowns. The default is true.
     */
    setOptions: function(options) {

        Select3.prototype.setOptions.call(this, options);

        $.each(options, function(key, value) {
            switch (key) {
            case 'allowClear':
                if ($.type(value) !== 'boolean') {
                    throw new Error('allowClear must be a boolean');
                }
                break;

            case 'showSearchInputInDropdown':
                if ($.type(value) !== 'boolean') {
                    throw new Error('showSearchInputInDropdown must be a boolean');
                }
                break;
            }
        }.bind(this));
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

        return (data === null ? data : this.validateItem(data));
    },

    /**
     * Validates a value to set. Throws an exception if the value is invalid.
     *
     * @param value The value to validate. Should be null or a valid ID.
     *
     * @return The validated value. This may differ from the input value.
     */
    validateValue: function(value) {

        if (value === null || Select3.isValidId(value)) {
            return value;
        } else {
            throw new Error('Value for SingleSelect3 instance should be a valid ID or null');
        }
    },

    /**
     * @private
     */
    _clicked: function() {

        if (this.dropdown) {
            this.close();
        } else {
            this.focus();

            if (this.options.showDropdown !== false) {
                this.open({ showSearchInput: this.options.showSearchInputInDropdown !== false });
            }
        }

        return false;
    },

    /**
     * @private
     */
    _itemRemoveClicked: function() {

        this.data(null);

        return false;
    },

    /**
     * @private
     */
    _rerenderSelection: function() {

        var $container = this.$('.select3-single-result-container');
        if (this._data) {
            $container.html(
                this.template('singleSelectedItem', $.extend({
                    showRemove: this.options.allowClear
                }, this._data))
            );
        } else {
            $container.html(
                this.template('singleSelectPlaceholder', { placeholder: this.options.placeholder })
            );
        }
    },

    /**
     * @private
     */
    _resultSelected: function(event) {

        this.data(event.item);
    }

});

Select3.InputTypes.Single = SingleSelect3;

module.exports = SingleSelect3;
