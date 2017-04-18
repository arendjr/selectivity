'use strict';

var extend = require('lodash/extend');
var isString = require('lodash/isString');

var Selectivity = require('../selectivity');
var getItemSelector = require('../util/get-item-selector');
var getKeyCode = require('../util/get-key-code');
var parseElement = require('../util/parse-element');
var removeElement = require('../util/remove-element');
var stopPropagation = require('../util/stop-propagation');
var toggleClass = require('../util/toggle-class');

var KEY_BACKSPACE = 8;
var KEY_DELETE = 46;
var KEY_ENTER = 13;

var INPUT_SELECTOR = '.selectivity-multiple-input';
var SELECTED_ITEM_SELECTOR = '.selectivity-multiple-selected-item';

var hasTouch = 'ontouchstart' in window;

/**
 * MultipleInput Constructor.
 */
function MultipleInput(options) {

    Selectivity.call(this, extend({
        // dropdowns for multiple-value inputs should open below the select box,
        // unless there is not enough space below, but there is space enough above, then it should
        // open upwards
        positionDropdown: function(el, selectEl) {
            var rect = selectEl.getBoundingClientRect();
            var dropdownHeight = el.clientHeight;
            var openUpwards = (rect.bottom + dropdownHeight > window.innerHeight &&
                               rect.top - dropdownHeight > 0);

            extend(el.style, {
                left: rect.left + 'px',
                top: (openUpwards ? rect.top - dropdownHeight : rect.bottom) + 'px',
                width: rect.width + 'px'
            });
        },

        showSearchInputInDropdown: false
    }, options));

    this._reset();

    var events = {
        'change': this.rerenderSelection,
        'click': this._clicked,
        'selectivity-selected': this._resultSelected
    };
    events['change ' + INPUT_SELECTOR] = stopPropagation;
    events['click ' + SELECTED_ITEM_SELECTOR] = this._itemClicked;
    events['click ' + SELECTED_ITEM_SELECTOR + '-remove'] = this._itemRemoveClicked;
    events['keydown ' + INPUT_SELECTOR] = this._keyHeld;
    events['keyup ' + INPUT_SELECTOR] = this._keyReleased;
    events['paste ' + INPUT_SELECTOR] = this._onPaste;

    this.events.on(events);
}

/**
 * Methods.
 */
var callSuper = Selectivity.inherits(MultipleInput, Selectivity, {

    /**
     * Adds an item to the selection, if it's not selected yet.
     *
     * @param item The item to add. May be an item with 'id' and 'text' properties or just an ID.
     */
    add: function(item) {

        var itemIsId = Selectivity.isValidId(item);
        var id = (itemIsId ? item : this.validateItem(item) && item.id);

        if (this._value.indexOf(id) === -1) {
            this._value.push(id);

            if (itemIsId && this.options.initSelection) {
                this.options.initSelection([id], function(data) {
                    if (this._value.indexOf(id) > -1) {
                        item = this.validateItem(data[0]);
                        this._data.push(item);

                        this.triggerChange({ added: item });
                    }
                }.bind(this));
            } else {
                if (itemIsId) {
                    item = this.getItemForId(id);
                }
                this._data.push(item);

                this.triggerChange({ added: item });
            }
        }

        this.input.value = '';
        this._updateInputWidth();
    },

    /**
     * Clears the data and value.
     */
    clear: function() {

        this.setData([]);
    },

    /**
     * @inherit
     */
    filterResults: function(results) {

        return results.filter(function(item) {
            return !Selectivity.findById(this._data, item.id);
        }, this);
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

        return value.map(this.getItemForId, this).filter(function(item) {
            return !!item;
        });
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

        return data.map(function(item) {
            return item.id;
        });
    },

    /**
     * Removes an item from the selection, if it is selected.
     *
     * @param item The item to remove. May be an item with 'id' and 'text' properties or just an ID.
     */
    remove: function(item) {

        var id = item.id || item;

        var removedItem;
        var index = Selectivity.findIndexById(this._data, id);
        if (index > -1) {
            removedItem = this._data[index];
            this._data.splice(index, 1);
        }

        if (this._value[index] !== id) {
            index = this._value.indexOf(id);
        }
        if (index > -1) {
            this._value.splice(index, 1);
        }

        if (removedItem) {
            this.triggerChange({ removed: removedItem });
        }

        if (id === this._highlightedItemId) {
            this._highlightedItemId = null;
        }

        this._updateInputWidth();
    },

    /**
     * Re-renders the selection.
     *
     * Normally the UI is automatically updated whenever the selection changes, but you may want to
     * call this method explicitly if you've updated the selection with the triggerChange option set
     * to false.
     */
    rerenderSelection: function(event) {

        event = event || {};

        if (event.added) {
            this._renderSelectedItem(event.added);

            this._scrollToBottom();
        } else if (event.removed) {
            removeElement(this.$(getItemSelector(SELECTED_ITEM_SELECTOR, event.removed.id)));
        } else {
            this._forEachSelectedItem(removeElement);

            this._data.forEach(this._renderSelectedItem, this);

            this._updateInputWidth();
        }

        if (event.added || event.removed) {
            if (this.dropdown) {
                this.dropdown.showResults(this.filterResults(this.dropdown.results), {
                    hasMore: this.dropdown.hasMore
                });
            }

            if (!hasTouch) {
                this.focus();
            }
        }

        this.positionDropdown();

        this._updatePlaceholder();
    },

    /**
     * @inherit
     */
    search: function(term) {

        if (this.options.tokenizer) {
            term = this.options.tokenizer(term, this._data, this.add.bind(this), this.options);

            if (isString(term) && term !== this.input.value) {
                this.input.value = term;
            }
        }

        this._updateInputWidth();

        if (this.dropdown) {
            callSuper(this, 'search', term);
        }
    },

    /**
     * @inherit
     */
    setOptions: function(options) {

        var wasEnabled = this.enabled;

        callSuper(this, 'setOptions', options);

        if (wasEnabled !== this.enabled) {
            this._reset();
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
        } else if (Array.isArray(data)) {
            return data.map(this.validateItem, this);
        } else {
            throw new Error('Data for MultiSelectivity instance should be an array');
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
        } else if (Array.isArray(value)) {
            if (value.every(Selectivity.isValidId)) {
                return value;
            } else {
                throw new Error('Value contains invalid IDs');
            }
        } else {
            throw new Error('Value for MultiSelectivity instance should be an array');
        }
    },

    /**
     * @private
     */
    _backspacePressed: function() {

        if (this.options.backspaceHighlightsBeforeDelete) {
            if (this._highlightedItemId) {
                this._deletePressed();
            } else if (this._value.length) {
                this._highlightItem(this._value.slice(-1)[0]);
            }
        } else if (this._value.length) {
            this.remove(this._value.slice(-1)[0]);
        }
    },

    /**
     * @private
     */
    _clicked: function(event) {

        if (this.enabled) {
            if (this.options.showDropdown !== false) {
                this.open();
            } else {
                this.focus();
            }

            stopPropagation(event);
        }
    },

    /**
     * @private
     */
    _createToken: function() {

        var term = this.input.value;
        var createTokenItem = this.options.createTokenItem;

        if (term && createTokenItem) {
            var item = createTokenItem(term);
            if (item) {
                this.add(item);
            }
        }
    },

    /**
     * @private
     */
    _deletePressed: function() {

        if (this._highlightedItemId) {
            this.remove(this._highlightedItemId);
        }
    },

    /**
     * @private
     */
    _forEachSelectedItem: function(callback) {

        Array.prototype.forEach.call(this.el.querySelectorAll(SELECTED_ITEM_SELECTOR), callback);
    },

    /**
     * @private
     */
    _highlightItem: function(id) {

        this._highlightedItemId = id;

        this._forEachSelectedItem(function(el) {
            toggleClass(el, 'highlighted', el.getAttribute('data-item-id') === id);
        });

        if (!hasTouch) {
            this.focus();
        }
    },

    /**
     * @private
     */
    _itemClicked: function(event) {

        if (this.enabled) {
            this._highlightItem(this.getRelatedItemId(event));
        }
    },

    /**
     * @private
     */
    _itemRemoveClicked: function(event) {

        this.remove(this.getRelatedItemId(event));

        stopPropagation(event);
    },

    /**
     * @private
     */
    _keyHeld: function(event) {

        this._originalValue = this.input.value;

        if (getKeyCode(event) === KEY_ENTER && !event.ctrlKey) {
            event.preventDefault();
        }
    },

    /**
     * @private
     */
    _keyReleased: function(event) {

        var inputHadText = !!this._originalValue;
        var keyCode = getKeyCode(event);

        if (keyCode === KEY_ENTER && !event.ctrlKey) {
            this._createToken();
        } else if (keyCode === KEY_BACKSPACE && !inputHadText) {
            this._backspacePressed();
        } else if (keyCode === KEY_DELETE && !inputHadText) {
            this._deletePressed();
        }
    },

    /**
     * @private
     */
    _onPaste: function() {

        setTimeout(function() {
            this.search(this.input.value);

            this._createToken();
        }.bind(this), 10);
    },

    /**
     * @private
     */
    _renderSelectedItem: function(item) {

        var el = parseElement(this.template('multipleSelectedItem', extend({
            highlighted: (item.id === this._highlightedItemId),
            removable: !this.options.readOnly
        }, item)));

        this.input.parentNode.insertBefore(el, this.input);
    },

    /**
     * @private
     */
    _reset: function() {

        this.el.innerHTML = this.template('multipleSelectInput', { enabled: this.enabled });

        this._highlightedItemId = null;

        this.initInput(this.$(INPUT_SELECTOR));

        this.rerenderSelection();
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
    _scrollToBottom: function() {

        var inputContainer = this.$(INPUT_SELECTOR + '-container');
        inputContainer.scrollTop = inputContainer.clientHeight;
    },

    /**
     * @private
     */
    _updateInputWidth: function() {

        if (this.enabled) {
            var inputContent = (this.input.value ||
                                !this._data.length && this.options.placeholder || '');
            this.input.setAttribute('size', inputContent.length + 2);

            this.positionDropdown();
        }
    },

    /**
     * @private
     */
    _updatePlaceholder: function() {

        var placeholder = (!this._data.length && this.options.placeholder || '');
        if (this.enabled) {
            this.input.setAttribute('placeholder', placeholder);
        } else {
            this.$('.selectivity-placeholder').textContent = placeholder;
        }
    }

});

module.exports = Selectivity.Inputs.Multiple = MultipleInput;
