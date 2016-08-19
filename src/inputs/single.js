'use strict';

var extend = require('lodash/extend');

var Selectivity = require('../selectivity');
var stopPropagation = require('../util/stop-propagation');

/**
 * SingleInput Constructor.
 */
function SingleInput(options) {

    Selectivity.call(this, extend({
        // dropdowns for single-value inputs should open below the select box,
        // unless there is not enough space below, in which case the dropdown should be moved up
        // just enough so it fits in the window, but never so much that it reaches above the top
        positionDropdown: function(el, selectEl) {
            var rect = selectEl.getBoundingClientRect();
            var dropdownTop = rect.bottom;

            var deltaUp = Math.min(
                Math.max(dropdownTop + el.clientHeight - window.innerHeight, 0),
                rect.top + rect.height
            );

            extend(el.style, {
                left: rect.left + 'px',
                top: dropdownTop - deltaUp + 'px',
                width: rect.width + 'px'
            });
        }
    }, options));

    this.el.innerHTML = this.template('singleSelectInput', this.options);

    this.rerenderSelection();

    if (options.showSearchInputInDropdown === false) {
        this.initInput(this.$('.selectivity-single-select-input'), { search: false });
    }

    this.events.on({
        'change': this.rerenderSelection,
        'click': this._clicked,
        'click .selectivity-search-input': stopPropagation,
        'click .selectivity-single-selected-item-remove': this._itemRemoveClicked,
        'focus .selectivity-single-select-input': this._focused,
        'selectivity-selected': this._resultSelected
    });
}

/**
 * Methods.
 */
var callSuper = Selectivity.inherits(SingleInput, Selectivity, {

    /**
     * Clears the data and value.
     */
    clear: function() {

        this.setData(null);
    },

    /**
     * @inherit
     *
     * @param options Optional options object. May contain the following property:
     *                keepFocus - If true, the focus will remain on the input.
     */
    close: function(options) {

        this._closing = true;

        callSuper(this, 'close');

        if (options && options.keepFocus && this.input) {
            this.input.focus();
        }

        this._closing = false;
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
     * Re-renders the selection.
     *
     * Normally the UI is automatically updated whenever the selection changes, but you may want to
     * call this method explicitly if you've updated the selection with the triggerChange option set
     * to false.
     */
    rerenderSelection: function() {

        var template = (this._data ? 'singleSelectedItem' : 'singleSelectPlaceholder');
        var options = (this._data ? extend({
            removable: this.options.allowClear && !this.options.readOnly
        }, this._data) : { placeholder: this.options.placeholder });

        this.$('.selectivity-single-result-container').innerHTML = this.template(template, options);
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

        if (value === null || Selectivity.isValidId(value)) {
            return value;
        } else {
            throw new Error('Value for SingleSelectivity instance should be a valid ID or null');
        }
    },

    /**
     * @private
     */
    _clicked: function() {

        if (this.enabled) {
            if (this.dropdown) {
                this.close({ keepFocus: true });
            } else if (this.options.showDropdown !== false) {
                this.open();
            }
        }
    },

    /**
     * @private
     */
    _focused: function() {

        if (this.enabled && !this._closing && !this._opening &&
            this.options.showDropdown !== false) {
            this.open();
        }
    },

    /**
     * @private
     */
    _itemRemoveClicked: function(event) {

        this.setData(null);

        stopPropagation(event);
    },

    /**
     * @private
     */
    _resultSelected: function(event) {

        this.setData(event.item);

        this.close({ keepFocus: true });
    }

});

module.exports = Selectivity.Inputs.Single = SingleInput;
