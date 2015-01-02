'use strict';

var $ = require('jquery');

var Select3 = require('./select3-base');

/**
 * MultipleSelect3 Constructor.
 *
 * @param options Options object. Accepts all options from the Select3 Base Constructor.
 */
function MultipleSelect3(options) {

    Select3.call(this, options);

    this.$el.html(this.template('multiSelectInput', this.options));

    this._highlightedItemId = null;

    this._rerenderSelection();
}

MultipleSelect3.prototype = Object.create(Select3.prototype);
MultipleSelect3.prototype.constructor = MultipleSelect3;

/**
 * Methods.
 */
$.extend(MultipleSelect3.prototype, {

    /**
     * Adds an item to the selection, if it's not selected yet.
     *
     * @param item The item to add. May be an item with 'id' and 'text' properties or just an ID.
     */
    add: function(item) {

        if (Select3.isValidId(item)) {
            if (this._value.indexOf(item) === -1) {
                this._value.push(item);

                if (this.options.initSelection) {
                    this.options.initSelection([item], function(data) {
                        if (this._value.lastIndexOf(item) > -1) {
                            item = this.validateItem(data[0]);
                            this._data.push(item);

                            this.triggerChange({ added: item });
                        }
                    }.bind(this));
                } else {
                    item = this.getItemForId(item);
                    this._data.push(item);

                    this.triggerChange({ added: item });
                }
            }
        } else {
            item = this.validateItem(item);
            if (this._value.indexOf(item.id) === -1) {
                this._data.push(item);
                this._value.push(item.id);

                this.triggerChange({ added: item });
            }
        }
    },

    /**
     * Events map.
     *
     * Follows the same format as Backbone: http://backbonejs.org/#View-delegateEvents
     */
    events: {
        'change': '_rerenderSelection',
        'click': '_clicked',
        'click .select3-selected-item-remove': '_itemRemoveClicked',
        'click .select3-selected-item': '_itemClicked',
        'focus .select3-multiple-input': '_focused',
        'keyup .select3-multiple-input': '_keyReleased',
        'paste .select3-multiple-input': function() {
            setTimeout(this.search.bind(this), 10);
        },
        'select3-selecting': '_resultSelected'
    },

    /**
     * Applies focus to the input.
     */
    focus: function() {

        this._getInput().focus();
    },

    /**
     * Returns the correct data for a given value.
     *
     * @param value The value to get the data for. Should be an array of IDs.
     *
     * @return The corresponding data. Will be an array of objects with 'id' and 'text' properties.
     *         Note that if no items are defined, this method assumes the text labels will be equal
     *         to the IDs.
     */
    getDataForValue: function(value) {

        return value.map(this.getItemForId.bind(this)).filter(function(item) { return !!item; });
    },

    /**
     * Returns the correct value for the given data.
     *
     * @param data The data to get the value for. Should be an array of objects with 'id' and 'text'
     *             properties.
     *
     * @return The corresponding value. Will be an array of IDs.
     */
    getValueForData: function(data) {

        return data.map(function(item) { return item.id; });
    },

    /**
     * Removes an item from the selection, if it is selected.
     *
     * @param item The item to remove. May be an item with 'id' and 'text' properties or just an ID.
     */
    remove: function(item) {

        var id = ($.type(item) === 'object' ? item.id : item);

        var removedItem;
        var index = Select3.findIndexById(this._data, id);
        if (index > -1) {
            removedItem = this._data[index];
            this._data.splice(index, 1);
        }

        index = this._value.indexOf(id);
        if (index > -1) {
            this._value.splice(index, 1);
        }

        if (removedItem) {
            this.triggerChange({ removed: removedItem });
        }

        if (id === this._highlightedItemId) {
            this._highlightedItemId = null;
        }
    },

    /**
     * Validates data to set. Throws an exception if the data is invalid.
     *
     * @param data The data to validate. Should be an array of objects with 'id' and 'text'
     *             properties.
     *
     * @return The validated data. This may differ from the input data.
     */
    validateData: function(data) {

        if (data === null) {
            return [];
        } else if ($.type(data) === 'array') {
            return data.map(this.validateItem.bind(this));
        } else {
            throw new Error('Data for MultiSelect3 instance should be array');
        }
    },

    /**
     * Validates a value to set. Throws an exception if the value is invalid.
     *
     * @param value The value to validate. Should be an array of IDs.
     *
     * @return The validated value. This may differ from the input value.
     */
    validateValue: function(value) {

        if (value === null) {
            return [];
        } else if ($.type(value) === 'array') {
            if (value.every(Select3.isValidId)) {
                return value;
            } else {
                throw new Error('Value contains invalid IDs');
            }
        } else {
            throw new Error('Value for MultiSelect3 instance should be an array');
        }
    },

    /**
     * @private
     */
    _backspacePressed: function() {

        if (this._highlightedItemId) {
            this._deletePressed();
        } else if (this._value.length) {
            this._highlightItem(this._value.slice(-1)[0]);
        }
    },

    /**
     * @private
     */
    _clicked: function() {

        this.focus();
        return false;
    },

    /**
     * @private
     */
    _deletePressed: function() {

        if (this._highlightedItemId) {
            this.remove(this._highlightedItemId);

            this.$el.trigger('change');
        }
    },

    /**
     * @private
     */
    _focused: function() {

        if (this.options.showDropdown !== false) {
            this.open();
        }
    },

    /**
     * @private
     */
    _getInput: function() {

        return this.$('.select3-multiple-input:not(.select3-width-detector)');
    },

    /**
     * @private
     */
    _highlightItem: function(id) {

        this._highlightedItemId = id;
        this.$('.select3-selected-item').removeClass('highlighted')
            .filter('[data-item-id=' + Select3.quoteCssAttr(id) + ']').addClass('highlighted');

        if (this.hasKeyboard) {
            this.focus();
        }
    },

    /**
     * @private
     */
    _itemClicked: function(event) {

        this._highlightItem(this._getItemId(event));
    },

    /**
     * @private
     */
    _itemRemoveClicked: function(event) {

        this.remove(this._getItemId(event));

        return false;
    },

    /**
     * @private
     */
    _keyReleased: function(event) {

        var inputHasText = this._getInput().val();

        if (event.keyCode === Select3.Keys.ENTER && !event.ctrlKey) {
            if (this.highlightedResult) {
                this.add(this.highlightedResult);
            }

            return false;
        } else if (event.keyCode === Select3.Keys.BACKSPACE && !inputHasText) {
            this._backspacePressed();

            return false;
        } else if (event.keyCode === Select3.Keys.DELETE && !inputHasText) {
            this._deletePressed();

            return false;
        } else if (event.keyCode === Select3.Keys.ESCAPE) {
            this.close();

            return false;
        } else {
            this._search();
        }

        this._updateInputWidth();
    },

    /**
     * @private
     */
    _rerenderSelection: function(event) {

        event = event || {};

        var $input = this._getInput();
        if (event.added) {
            $input.before(this.template('multiSelectItem', $.extend({
                highlighted: (event.added.id === this._highlightedItemId)
            }, event.added)));
        } else if (event.removed) {
            var quotedId = Select3.quoteCssAttr(event.removed.id);
            this.$('.select3-selected-item[data-item-id=' + quotedId + ']').remove();
        } else {
            this.$('.select3-selected-item').remove();

            this._data.forEach(function(item) {
                $input.before(this.template('multiSelectItem', $.extend({
                    highlighted: (item.id === this._highlightedItemId)
                }, item)));
            }, this);
        }
    },

    /**
     * @private
     */
    _resultSelected: function(event) {

        if (this._value.indexOf(event.id) === -1) {
            this.add(event.item);
        } else {
            this.remove(event.item);
        }
    },

    /**
     * @private
     */
    _search: function() {

        this.search(this._getInput().val());
    },

    /**
     * @private
     */
    _updateInputWidth: function() {

        var $input = this._getInput(), $widthDetector = this.$('.select3-width-detector');
        $widthDetector.text($input.val() || !this._data.length && this.options.placeholder || '');
        $input.width($widthDetector.width() + 20);
    }

});

Select3.Implementations.Multiple = MultipleSelect3;

module.exports = MultipleSelect3;
