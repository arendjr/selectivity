import Selectivity from "../selectivity";
import { assign } from "../util/object";
import stopPropagation from "../util/stop-propagation";

/**
 * SingleInput Constructor.
 */
export default function SingleInput(options) {
    Selectivity.call(
        this,
        assign(
            {
                // Dropdowns for single-value inputs should open below the select box, unless there
                // is not enough space below, in which case the dropdown should be moved up just
                // enough so it fits in the window, but never so much that it reaches above the top.
                positionDropdown(el, selectEl) {
                    const rect = selectEl.getBoundingClientRect();
                    const dropdownTop = rect.bottom;

                    const deltaUp = Math.min(
                        Math.max(dropdownTop + el.clientHeight - window.innerHeight, 0),
                        rect.top + rect.height,
                    );

                    assign(el.style, {
                        left: `${rect.left}px`,
                        top: `${dropdownTop - deltaUp}px`,
                        width: `${rect.width}px`,
                    });
                },
            },
            options,
        ),
    );

    this.rerender();

    if (options.showSearchInputInDropdown === false) {
        this.initInput(this.$(".selectivity-single-select-input"), { search: false });
    }

    this.events.on({
        change: this.rerenderSelection,
        click: this._clicked,
        "click .selectivity-search-input": stopPropagation,
        "click .selectivity-single-selected-item-remove": this._itemRemoveClicked,
        "focus .selectivity-single-select-input": this._focused,
        "selectivity-selected": this._resultSelected,
    });
}

/**
 * Methods.
 */
const callSuper = Selectivity.inherits(SingleInput, Selectivity, {
    /**
     * Clears the data and value.
     */
    clear() {
        this.setData(null);
    },

    /**
     * @inherit
     *
     * @param options Optional options object. May contain the following property:
     *                keepFocus - If true, the focus will remain on the input.
     */
    close(options) {
        this._closing = true;

        callSuper(this, "close");

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
    getDataForValue(value) {
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
    getValueForData(data) {
        return data ? data.id : null;
    },

    /**
     * Rerenders the entire component.
     */
    rerender() {
        this.el.innerHTML = this.template("singleSelectInput", this.options);

        this.rerenderSelection();
    },

    /**
     * Re-renders the selection.
     *
     * Normally the UI is automatically updated whenever the selection changes, but you may want to
     * call this method explicitly if you've updated the selection with the triggerChange option set
     * to false.
     */
    rerenderSelection() {
        const template = this._data ? "singleSelectedItem" : "singleSelectPlaceholder";
        const options = this._data
            ? assign(
                  {
                      removable: this.options.allowClear && !this.options.readOnly,
                  },
                  this._data,
              )
            : { placeholder: this.options.placeholder };

        this.el.querySelector("input").value = this._value;
        this.$(".selectivity-single-result-container").innerHTML = this.template(template, options);
    },

    /**
     * @inherit
     */
    setOptions(options) {
        const wasEnabled = this.enabled;

        callSuper(this, "setOptions", options);

        if (wasEnabled !== this.enabled) {
            this.rerender();
        }
    },

    /**
     * Validates data to set. Throws an exception if the data is invalid.
     *
     * @param data The data to validate. Should be an object with 'id' and 'text' properties or null
     *             to indicate no item is selected.
     *
     * @return The validated data. This may differ from the input data.
     */
    validateData(data) {
        return data === null ? data : this.validateItem(data);
    },

    /**
     * Validates a value to set. Throws an exception if the value is invalid.
     *
     * @param value The value to validate. Should be null or a valid ID.
     *
     * @return The validated value. This may differ from the input value.
     */
    validateValue(value) {
        if (value === null || Selectivity.isValidId(value)) {
            return value;
        } else {
            throw new Error("Value for SingleSelectivity instance should be a valid ID or null");
        }
    },

    /**
     * @private
     */
    _clicked() {
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
    _focused() {
        if (
            this.enabled &&
            !this._closing &&
            !this._opening &&
            this.options.showDropdown !== false
        ) {
            this.open();
        }
    },

    /**
     * @private
     */
    _itemRemoveClicked(event) {
        this.setData(null);

        stopPropagation(event);
    },

    /**
     * @private
     */
    _resultSelected(event) {
        this.setData(event.item);

        this.close({ keepFocus: true });
    },
});

Selectivity.Inputs.Single = SingleInput;
