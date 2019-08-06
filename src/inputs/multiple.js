import isString from "lodash/isString";

import Selectivity from "../selectivity";
import { assign } from "../util/object";
import getItemSelector from "../util/get-item-selector";
import getKeyCode from "../util/get-key-code";
import parseElement from "../util/parse-element";
import removeElement from "../util/remove-element";
import stopPropagation from "../util/stop-propagation";
import toggleClass from "../util/toggle-class";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;
const KEY_ENTER = 13;

const INPUT_SELECTOR = ".selectivity-multiple-input";
const SELECTED_ITEM_SELECTOR = ".selectivity-multiple-selected-item";

const hasTouch = "ontouchstart" in window;

/**
 * MultipleInput Constructor.
 */
export default function MultipleInput(options) {
    Selectivity.call(
        this,
        assign(
            {
                // dropdowns for multiple-value inputs should open below the select box,
                // unless there is not enough space below, but there is space enough above, then it should
                // open upwards
                positionDropdown(el, selectEl) {
                    const rect = selectEl.getBoundingClientRect();
                    const dropdownHeight = el.clientHeight;
                    const openUpwards =
                        rect.bottom + dropdownHeight > window.innerHeight &&
                        rect.top - dropdownHeight > 0;

                    assign(el.style, {
                        left: `${rect.left}px`,
                        top: `${openUpwards ? rect.top - dropdownHeight : rect.bottom}px`,
                        width: `${rect.width}px`,
                    });
                },

                showSearchInputInDropdown: false,
            },
            options,
        ),
    );

    this._reset();

    const events = {
        change: this.rerenderSelection,
        click: this._clicked,
        "selectivity-selected": this._resultSelected,
    };
    events[`change ${INPUT_SELECTOR}`] = stopPropagation;
    events[`click ${SELECTED_ITEM_SELECTOR}`] = this._itemClicked;
    events[`click ${SELECTED_ITEM_SELECTOR}-remove`] = this._itemRemoveClicked;
    events[`keydown ${INPUT_SELECTOR}`] = this._keyHeld;
    events[`keyup ${INPUT_SELECTOR}`] = this._keyReleased;
    events[`paste ${INPUT_SELECTOR}`] = this._onPaste;

    this.events.on(events);
}

/**
 * Methods.
 */
const callSuper = Selectivity.inherits(MultipleInput, Selectivity, {
    /**
     * Adds an item to the selection, if it's not selected yet.
     *
     * @param item The item to add. May be an item with 'id' and 'text' properties or just an ID.
     */
    add(item) {
        const itemIsId = Selectivity.isValidId(item);
        const id = itemIsId ? item : this.validateItem(item) && item.id;

        if (this.options.allowDuplicates || this._value.indexOf(id) === -1) {
            this._value.push(id);

            if (itemIsId && this.options.initSelection) {
                this.options.initSelection(
                    [id],
                    function(data) {
                        if (this._value.indexOf(id) > -1) {
                            item = this.validateItem(data[0]);
                            this._data.push(item);

                            this.triggerChange({ added: item });
                        }
                    }.bind(this),
                );
            } else {
                if (itemIsId) {
                    item = this.getItemForId(id);
                }
                this._data.push(item);

                this.triggerChange({ added: item });
            }
        }

        this.input.value = "";
        this._updateInputWidth();
    },

    /**
     * Clears the data and value.
     */
    clear() {
        this.setData([]);
    },

    /**
     * @inherit
     */
    filterResults(results) {
        results = results.map(function(item) {
            const result = {
                id: item.id,
                text: item.text,
            };
            if (item.children) {
                result["children"] = this.filterResults(item.children);
            }
            return result;
        }, this);

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
    getDataForValue(value) {
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
    getValueForData(data) {
        return data.map(function(item) {
            return item.id;
        });
    },

    /**
     * Removes an item from the selection, if it is selected.
     *
     * @param item The item to remove. May be an item with 'id' and 'text' properties or just an ID.
     */
    remove(item) {
        const id = item.id || item;

        let removedItem;
        let index = Selectivity.findIndexById(this._data, id);
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
    rerenderSelection(event) {
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
                    hasMore: this.dropdown.hasMore,
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
    search(term) {
        if (this.options.tokenizer) {
            term = this.options.tokenizer(term, this._data, this.add.bind(this), this.options);

            if (isString(term) && term !== this.input.value) {
                this.input.value = term;
            }
        }

        this._updateInputWidth();

        if (this.dropdown) {
            callSuper(this, "search", term);
        }
    },

    /**
     * @inherit
     */
    setOptions(options) {
        const wasEnabled = this.enabled;

        callSuper(this, "setOptions", options);

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
    validateData(data) {
        if (data === null) {
            return [];
        } else if (Array.isArray(data)) {
            return data.map(this.validateItem, this);
        } else {
            throw new Error("Data for MultiSelectivity instance should be an array");
        }
    },

    /**
     * Validates a value to set. Throws an exception if the value is invalid.
     *
     * @param value The value to validate. Should be an array of IDs.
     *
     * @return The validated value. This may differ from the input value.
     */
    validateValue(value) {
        if (value === null) {
            return [];
        } else if (Array.isArray(value)) {
            if (value.every(Selectivity.isValidId)) {
                return value;
            } else {
                throw new Error("Value contains invalid IDs");
            }
        } else {
            throw new Error("Value for MultiSelectivity instance should be an array");
        }
    },

    /**
     * @private
     */
    _backspacePressed() {
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
    _clicked(event) {
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
    _createToken() {
        const term = this.input.value;
        const createTokenItem = this.options.createTokenItem;

        if (term && createTokenItem) {
            const item = createTokenItem(term);
            if (item) {
                this.add(item);
            }
        }
    },

    /**
     * @private
     */
    _deletePressed() {
        if (this._highlightedItemId) {
            this.remove(this._highlightedItemId);
        }
    },

    /**
     * @private
     */
    _forEachSelectedItem(callback) {
        Array.prototype.forEach.call(this.el.querySelectorAll(SELECTED_ITEM_SELECTOR), callback);
    },

    /**
     * @private
     */
    _highlightItem(id) {
        this._highlightedItemId = id;

        this._forEachSelectedItem(function(el) {
            toggleClass(el, "highlighted", el.getAttribute("data-item-id") === id);
        });

        if (!hasTouch) {
            this.focus();
        }
    },

    /**
     * @private
     */
    _itemClicked(event) {
        if (this.enabled) {
            this._highlightItem(this.getRelatedItemId(event));
        }
    },

    /**
     * @private
     */
    _itemRemoveClicked(event) {
        this.remove(this.getRelatedItemId(event));

        stopPropagation(event);
    },

    /**
     * @private
     */
    _keyHeld(event) {
        this._originalValue = this.input.value;

        if (getKeyCode(event) === KEY_ENTER && !event.ctrlKey) {
            event.preventDefault();
        }
    },

    /**
     * @private
     */
    _keyReleased(event) {
        const inputHadText = !!this._originalValue;
        const keyCode = getKeyCode(event);

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
    _onPaste() {
        setTimeout(
            function() {
                this.search(this.input.value);

                this._createToken();
            }.bind(this),
            10,
        );
    },

    /**
     * @private
     */
    _renderSelectedItem(item) {
        const el = parseElement(
            this.template(
                "multipleSelectedItem",
                assign(
                    {
                        highlighted: item.id === this._highlightedItemId,
                        removable: !this.options.readOnly,
                    },
                    item,
                ),
            ),
        );

        this.input.parentNode.insertBefore(el, this.input);
    },

    /**
     * @private
     */
    _reset() {
        this.el.innerHTML = this.template("multipleSelectInput", { enabled: this.enabled });

        this._highlightedItemId = null;

        this.initInput(this.$(INPUT_SELECTOR));

        this.rerenderSelection();
    },

    /**
     * @private
     */
    _resultSelected(event) {
        if (this._value.indexOf(event.id) === -1) {
            this.add(event.item);
        } else {
            this.remove(event.item);
        }
    },

    /**
     * @private
     */
    _scrollToBottom() {
        const inputContainer = this.$(`${INPUT_SELECTOR}-container`);
        inputContainer.scrollTop = inputContainer.clientHeight;
    },

    /**
     * @private
     */
    _updateInputWidth() {
        if (this.enabled) {
            const inputContent =
                this.input.value || (!this._data.length && this.options.placeholder) || "";
            this.input.setAttribute("size", inputContent.length + 2);

            this.positionDropdown();
        }
    },

    /**
     * @private
     */
    _updatePlaceholder() {
        const placeholder = (!this._data.length && this.options.placeholder) || "";
        if (this.enabled) {
            this.input.setAttribute("placeholder", placeholder);
        } else {
            this.$(".selectivity-placeholder").textContent = placeholder;
        }
    },
});

Selectivity.Inputs.Multiple = MultipleInput;
