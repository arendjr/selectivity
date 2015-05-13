'use strict';

var $ = require('jquery');

var Selectivity = require('./selectivity-base');

/**
 * SingleSelectivity Constructor.
 *
 * @param options Options object. Accepts all options from the Selectivity Base Constructor in
 *                addition to those accepted by SingleSelectivity.setOptions().
 */
function SingleSelectivity(options) {

    Selectivity.call(this, options);

    this.$el.html(this.template('singleSelectInput', this.options))
            .trigger('selectivity-init', 'single');

    this._rerenderSelection();

    if (!options.positionDropdown) {
        // dropdowns for single-value inputs should open below the select box,
        // unless there is not enough space below, in which case the dropdown should be moved up
        // just enough so it fits in the window, but never so much that it reaches above the top
        this.options.positionDropdown = function($el, $selectEl) {
            var position = $selectEl.position(),
                dropdownHeight = $el.height(),
                selectHeight = $selectEl.height(),
                top = $selectEl[0].getBoundingClientRect().top,
                bottom = top + selectHeight + dropdownHeight,
                deltaUp = 0;

            if (typeof window !== 'undefined') {
                deltaUp = Math.min(Math.max(bottom - $(window).height(), 0), top + selectHeight);
            }

            var width = $selectEl.outerWidth ? $selectEl.outerWidth() : $selectEl.width();
            $el.css({
                left: position.left + 'px',
                top: (position.top + selectHeight - deltaUp) + 'px'
            }).width(width);
        };
    }

    if (options.showSearchInputInDropdown === false) {
        this.initSearchInput(this.$('.selectivity-single-select-input'), { noSearch: true });
    }
}

/**
 * Methods.
 */
var callSuper = Selectivity.inherits(SingleSelectivity, {

    /**
     * Events map.
     *
     * Follows the same format as Backbone: http://backbonejs.org/#View-delegateEvents
     */
    events: {
        'change': '_rerenderSelection',
        'click': '_clicked',
        'focus .selectivity-single-select-input': '_focused',
        'selectivity-selected': '_resultSelected'
    },

    /**
     * Clears the data and value.
     */
    clear: function() {

        this.data(null);
    },

    /**
     * @inherit
     *
     * @param options Optional options object. May contain the following property:
     *                keepFocus - If false, the focus won't remain on the input.
     */
    close: function(options) {

        this._closing = true;

        callSuper(this, 'close');

        var $input = this.$('.selectivity-single-select-input');
        if (!this.$searchInput) {
            this.initSearchInput($input, { noSearch: true });
        }

        if (!options || options.keepFocus !== false) {
            $input.focus();
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
     * @inherit
     */
    open: function(options) {

        var showSearchInput = (this.options.showSearchInputInDropdown !== false);

        callSuper(this, 'open', $.extend({ showSearchInput: showSearchInput }, options));

        if (!showSearchInput) {
            this.focus();
        }
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

        options = options || {};

        options.allowedTypes = $.extend(options.allowedTypes || {}, {
            allowClear: 'boolean',
            showSearchInputInDropdown: 'boolean'
        });

        callSuper(this, 'setOptions', options);
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
                this.close();
            } else if (this.options.showDropdown !== false) {
                this.open();
            }

            return false;
        }
    },

    /**
     * @private
     */
    _focused: function() {

        if (this.enabled && !this._closing && this.options.showDropdown !== false) {
            this.open();
        }
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

        var $container = this.$('.selectivity-single-result-container');
        if (this._data) {
            $container.html(
                this.template('singleSelectedItem', $.extend({
                    removable: this.options.allowClear && !this.options.readOnly
                }, this._data))
            );

            $container.find('.selectivity-single-selected-item-remove')
                      .on('click', this._itemRemoveClicked.bind(this));
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

        this.close();
    }

});

module.exports = Selectivity.InputTypes.Single = SingleSelectivity;
