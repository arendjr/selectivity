'use strict';

var extend = require('lodash/extend');
var isString = require('lodash/isString');

var Selectivity = require('../selectivity');
var parseElement = require('../util/parse-element');
var quoteCssAttr = require('../util/quote-css-attr');
var removeElement = require('../util/remove-element');
var stopPropagation = require('../util/stop-propagation');

var KEY_BACKSPACE = 8;
var KEY_DELETE = 46;
var KEY_ENTER = 13;

var hasTouch = 'ontouchstart' in window;

/**
 * MultipleSelectivity Constructor.
 */
function InputTypeMultiple(options) {

    Selectivity.call(this, options);

    this.el.innerHTML = this.template('multipleSelectInput', { enabled: this.enabled });

    this._highlightedItemId = null;

    this.initSearchInput(this.$('.selectivity-multiple-input:not(.selectivity-width-detector)'));

    this.rerenderSelection();

    if (!options.positionDropdown) {
        // dropdowns for multiple-value inputs should open below the select box,
        // unless there is not enough space below, but there is space enough above, then it should
        // open upwards
        this.options.positionDropdown = function(el, selectEl) {
            var rect = selectEl.getBoundingClientRect();
            var dropdownHeight = el.clientHeight;
            var openUpwards = (rect.bottom + dropdownHeight > window.innerHeight &&
                               rect.top - dropdownHeight > 0);

            extend(el.style, {
                left: rect.left + 'px',
                top: (openUpwards ? rect.top - dropdownHeight : rect.bottom) + 'px',
                width: rect.width + 'px'
            });
        };
    }

    extend(this.allowedOptions, {
        /**
         * If set to true, when the user enters a backspace while there is no text in the search
         * field but there are selected items, the last selected item will be highlighted and when a
         * second backspace is entered the item is deleted. If false, the item gets deleted on the
         * first backspace. The default value is false.
         */
        backspaceHighlightsBeforeDelete: 'boolean',

        /**
         * Function to create a new item from a user's search term. This is used to turn the term
         * into an item when dropdowns are disabled and the user presses Enter. It is also used by
         * the default tokenizer to create items for individual tokens. The function receives a
         * 'token' parameter which is the search term (or part of a search term) to create an item
         * for and must return an item object with 'id' and 'text' properties or null if no token
         * can be created from the term. The default is a function that returns an item where the id
         * and text both match the token for any non-empty string and which returns null otherwise.
         */
        createTokenItem: 'function',

        /**
         * Function for tokenizing search terms. Will receive the following parameters:
         * input - The input string to tokenize.
         * selection - The current selection data.
         * createToken - Callback to create a token from the search terms. Should be passed an item
         *               object with 'id' and 'text' properties.
         * options - The options set on the Selectivity instance.
         *
         * Any string returned by the tokenizer function is treated as the remainder of untokenized
         * input.
         */
        tokenizer: 'function'
    });

    this.events.on({
        'change': this.rerenderSelection,
        'change selectivity-multiple-input': stopPropagation,
        'click': this._clicked,
        'click selectivity-multiple-selected-item': this._itemClicked,
        'click selectivity-multiple-selected-item-remove': this._itemRemoveClicked,
        'keydown selectivity-multiple-input': this._keyHeld,
        'keyup selectivity-multiple-input': this._keyReleased,
        'paste selectivity-multiple-input': this._onPaste,
        'selectivity-selected': this._resultSelected
    });
}

/**
 * Methods.
 */
var callSuper = Selectivity.inherits(InputTypeMultiple, Selectivity, {

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

        this.$searchInput.val('');
    },

    /**
     * Clears the data and value.
     */
    clear: function() {

        this.data([]);
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
            var quotedId = quoteCssAttr(event.removed.id);
            removeElement(
                this.$('.selectivity-multiple-selected-item[data-item-id=' + quotedId + ']')
            );
        } else {
            var el;
            while ((el = this.$('.selectivity-multiple-selected-item'))) {
                removeElement(el);
            }

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
    search: function() {

        var term = this.$searchInput.val();

        if (this.options.tokenizer) {
            term = this.options.tokenizer(term, this._data, this.add.bind(this), this.options);

            if (isString(term) && term !== this.$searchInput.val()) {
                this.$searchInput.val(term);
            }
        }

        if (this.dropdown) {
            callSuper(this, 'search');
        }
    },

    /**
     * @inherit
     */
    setOptions: function(options) {

        var wasEnabled = this.enabled;

        callSuper(this, 'setOptions', options);

        if (wasEnabled !== this.enabled) {
            this.el.innerHTML = this.template('multipleSelectInput', { enabled: this.enabled });
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
        } else if (data instanceof Array) {
            return data.map(this.validateItem, this);
        } else {
            throw new Error('Data for MultiSelectivity instance should be array');
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
        } else if (value instanceof Array) {
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

        if (this.enabled && this.options.showDropdown !== false) {
            this.open();

            stopPropagation(event);
        }
    },

    /**
     * @private
     */
    _createToken: function() {

        var term = this.$searchInput.val();
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
    _highlightItem: function(id) {

        this._highlightedItemId = id;

        this.el.querySelectorAll('.selectivity-multiple-selected-item').forEach(function(el) {
            el.classList[el.getAttribute('data-item-id') === id ? 'add' : 'remove']('highlighted');
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

        this._updateInputWidth();

        stopPropagation(event);
    },

    /**
     * @private
     */
    _keyHeld: function(event) {

        this._originalValue = this.searchInput.value;

        if (event.keyCode === KEY_ENTER && !event.ctrlKey) {
            event.preventDefault();
        }
    },

    /**
     * @private
     */
    _keyReleased: function(event) {

        var inputHadText = !!this._originalValue;

        if (event.keyCode === KEY_ENTER && !event.ctrlKey) {
            if (this.options.createTokenItem) {
                this._createToken();
            }
        } else if (event.keyCode === KEY_BACKSPACE && !inputHadText) {
            this._backspacePressed();
        } else if (event.keyCode === KEY_DELETE && !inputHadText) {
            this._deletePressed();
        }

        this._updateInputWidth();
    },

    /**
     * @private
     */
    _onPaste: function() {

        setTimeout(function() {
            this.search();

            if (this.options.createTokenItem) {
                this._createToken();
            }
        }.bind(this), 10);
    },

    _renderSelectedItem: function(item) {

        var el = parseElement(this.template('multipleSelectedItem', extend({
            highlighted: (item.id === this._highlightedItemId),
            removable: !this.options.readOnly
        }, item)));

        this.searchInput.parentNode.insertBefore(el, this.searchInput);
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

        var inputContainer = this.$('.selectivity-multiple-input-container');
        inputContainer.scrollTop(inputContainer.clientHeight);
    },

    /**
     * @private
     */
    _updateInputWidth: function() {

        if (this.enabled) {
            var input = this.searchInput;
            var widthDetector = this.$('.selectivity-width-detector');
            widthDetector.textContent = (input.value ||
                                         !this._data.length && this.options.placeholder || '');
            input.style.width = widthDetector.clientWidth + 20;

            this.positionDropdown();
        }
    },

    /**
     * @private
     */
    _updatePlaceholder: function() {

        var placeholder = this._data.length ? '' : this.options.placeholder;
        if (this.enabled) {
            this.searchInput.setAttribute('placeholder', placeholder);
        } else {
            this.$('.selectivity-placeholder').textContent = placeholder;
        }
    }

});

module.exports = Selectivity.InputTypes.Multiple = InputTypeMultiple;
