'use strict';

var extend = require('lodash/extend');
var isString = require('lodash/isString');

var EventListener = require('./event-listener');
var toggleClass = require('./util/toggle-class');

/**
 * Selectivity Base Constructor.
 *
 * You will never use this constructor directly. Instead, you use $(selector).selectivity(options)
 * to create an instance of either MultipleSelectivity or SingleSelectivity. This class defines all
 * functionality that is common between both.
 *
 * @param options Options object. Accepts the same options as the setOptions method(), in addition
 *                to the following ones:
 *                data - Initial selection data to set. This should be an array of objects with 'id'
 *                       and 'text' properties. This option is mutually exclusive with 'value'.
 *                element - The DOM element to which to attach the Selectivity instance. This
 *                          property is set by the API wrapper.
 *                value - Initial value to set. This should be an array of IDs. This property is
 *                        mutually exclusive with 'data'.
 */
function Selectivity(options) {

    /**
     * Reference to the currently open dropdown.
     */
    this.dropdown = null;

    /**
     * DOM element to which this instance is attached.
     */
    this.el = options.element;

    /**
     * Whether the input is enabled.
     *
     * This is false when the option readOnly is false or the option removeOnly is false.
     */
    this.enabled = (!options.readOnly && !options.removeOnly);

    /**
     * DOM element for the input.
     *
     * May be null as long as there is no visible input. It is set by initInput().
     */
    this.input = null;

    /**
     * Array of items from which to select. If set, this will be an array of objects with 'id' and
     * 'text' properties.
     *
     * If given, all items are expected to be available locally and all selection operations operate
     * on this local array only. If null, items are not available locally, and a query function
     * should be provided to fetch remote data.
     */
    this.items = null;

    /**
     * Options passed to the Selectivity instance or set through setOptions().
     */
    this.options = {};

    /**
     * Mapping of templates.
     *
     * Custom templates can be specified in the options object.
     */
    this.templates = extend({}, Selectivity.Templates);

    /**
     * The last used search term.
     */
    this.term = '';

    this.setOptions(options);

    if (options.value) {
        this.setValue(options.value, { triggerChange: false });
    } else {
        this.setData(options.data || null, { triggerChange: false });
    }

    this.el.setAttribute('tabindex', options.tabIndex || 0);

    this.events = new EventListener(this.el, this);
    this.events.on({
        'blur': this._blur,
        'mouseenter': this._mouseenter,
        'mouseleave': this._mouseleave,
        'selectivity-close': this._closed
    });
}

/**
 * Methods.
 */
extend(Selectivity.prototype, {

    /**
     * Convenience shortcut for this.el.querySelector(selector).
     */
    $: function(selector) {

        return this.el.querySelector(selector);
    },

    /**
     * Closes the dropdown.
     */
    close: function() {

        this._clearCloseTimeout();

        if (this.dropdown) {
            this.dropdown.close();
            this.dropdown = null;
        }
    },

    /**
     * Destroys the Selectivity instance.
     */
    destroy: function() {

        this.events.destruct();

        var el = this.el;
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
        el.selectivity = null;
    },

    /**
     * Filters the results to be displayed in the dropdown.
     *
     * The default implementation simply returns the results unfiltered, but the MultipleSelectivity
     * class overrides this method to filter out any items that have already been selected.
     *
     * @param results Array of items with 'id' and 'text' properties.
     *
     * @return The filtered array.
     */
    filterResults: function(results) {

        return results;
    },

    /**
     * Applies focus to the input.
     */
    focus: function() {

        this._clearCloseTimeout();

        this._focusing = true;

        if (this.input) {
            this.input.focus();
        }

        this._focusing = false;
    },

    /**
     * Returns the selection data.
     */
    getData: function() {

        return this._data;
    },

    /**
     * Returns the correct item for a given ID.
     *
     * @param id The ID to get the item for.
     *
     * @return The corresponding item. Will be an object with 'id' and 'text' properties or null if
     *         the item cannot be found. Note that if no items are defined, this method assumes the
     *         text labels will be equal to the IDs.
     */
    getItemForId: function(id) {

        var items = this.items;
        if (items) {
            return Selectivity.findNestedById(items, id);
        } else {
            return { id: id, text: '' + id };
        }
    },

    /**
     * Returns the item ID related to an element or event target.
     *
     * @param elementOrEvent The DOM element or event to get the item ID for.
     *
     * @return Item ID or null if no ID could be found.
     */
    getRelatedItemId: function(elementOrEvent) {

        var el = elementOrEvent.target || elementOrEvent;
        while (el) {
            if (el.hasAttribute('data-item-id')) {
                break;
            }
            el = el.parentNode;
        }

        if (!el) {
            return null;
        }

        var id = el.getAttribute('data-item-id');

        // IDs can be either numbers or strings, but attribute values are always strings, so we
        // will have to find out whether the item ID ought to be a number or string ourselves.
        if (Selectivity.findById(this._data || [], id)) {
            return id;
        } else {
            var dropdown = this.dropdown;
            while (dropdown) {
                if (Selectivity.findNestedById(dropdown.results, id)) {
                    return id;
                }
                // FIXME: reference to submenu plugin doesn't belong in base
                dropdown = dropdown.submenu;
            }
            var number = parseInt(id, 10);
            return ('' + number === id ? number : id);
        }
    },

    /**
     * Returns the value of the selection.
     */
    getValue: function() {

        return this._value;
    },

    /**
     * Initializes the input element.
     *
     * Sets the input property, invokes all input listeners and (by default) attaches the action of
     * searching when something is typed.
     *
     * @param input Input element.
     * @param options Optional options object. May contain the following property:
     *                search - If false, no event handlers are setup to initiate searching when the
     *                         user types in the input field. This is useful if you want to use the
     *                         input only to handle keyboard support.
     */
    initInput: function(input, options) {

        this.input = input;

        var selectivity = this;
        var inputListeners = this.options.inputListeners || Selectivity.InputListeners;
        inputListeners.forEach(function(listener) {
            listener(selectivity, input, options);
        });

        if (!options || options.search !== false) {
            input.addEventListener('keyup', function(event) {
                if (!event.defaultPrevented) {
                    selectivity.search(event.target.value);
                }
            });
        }
    },

    /**
     * Opens the dropdown.
     */
    open: function() {

        if (this._opening || this.dropdown || !this.triggerEvent('selectivity-opening')) {
            return;
        }

        this._opening = true;

        var Dropdown = this.options.dropdown || Selectivity.Dropdown;
        if (Dropdown) {
            this.dropdown = new Dropdown(this, {
                items: this.items,
                position: this.options.positionDropdown,
                query: this.options.query,
                showSearchInput: (this.options.showSearchInputInDropdown !== false)
            });
        }

        this.search('');

        this.focus();

        toggleClass(this.el, 'open', true);

        this._opening = false;
    },

    /**
     * (Re-)positions the dropdown.
     */
    positionDropdown: function() {

        if (this.dropdown) {
            this.dropdown.position();
        }
    },

    /**
     * Searches for results based on the term given.
     *
     * If an items array has been passed with the options to the Selectivity instance, a local
     * search will be performed among those items. Otherwise, the query function specified in the
     * options will be used to perform the search. If neither is defined, nothing happens.
     *
     * @param term Term to search for.
     */
    search: function(term) {

        this.open();

        if (this.dropdown) {
            this.dropdown.search(term);
        }
    },

    /**
     * Sets the selection data.
     *
     * The selection data contains both IDs and text labels. If you only want to set or get the IDs,
     * you should use the value() method.
     *
     * @param newData New data to set. For a MultipleSelectivity instance the data must be an array
     *                of objects with 'id' and 'text' properties, for a SingleSelectivity instance
     *                the data must be a single such object or null to indicate no item is selected.
     * @param options Optional options object. May contain the following property:
     *                triggerChange - Set to false to suppress the "change" event being triggered.
     *                                Note this will also cause the UI to not update automatically;
     *                                so you may want to call rerenderSelection() manually when
     *                                using this option.
     */
    setData: function(newData, options) {

        options = options || {};

        newData = this.validateData(newData);

        this._data = newData;
        this._value = this.getValueForData(newData);

        if (options.triggerChange !== false) {
            this.triggerChange();
        }
    },

    /**
     * Sets one or more options on this Selectivity instance.
     *
     * @param options Options object. May contain one or more of the following properties:
     *                closeOnSelect - Set to false to keep the dropdown open after the user has
     *                                selected an item. This is useful if you want to allow the user
     *                                to quickly select multiple items. The default value is true.
     *                dropdown - Custom dropdown implementation to use for this instance.
     *                initSelection - Function to map values by ID to selection data. This function
     *                                receives two arguments, 'value' and 'callback'. The value is
     *                                the current value of the selection, which is an ID or an array
     *                                of IDs depending on the input type. The callback should be
     *                                invoked with an object or array of objects, respectively,
     *                                containing 'id' and 'text' properties.
     *                inputListeners - Array of search input listeners. By default, the global
     *                                 array Selectivity.InputListeners is used.
     *                items - Array of items from which to select. Should be an array of objects
     *                        with 'id' and 'text' properties. As convenience, you may also pass an
     *                        array of strings, in which case the same string is used for both the
     *                        'id' and 'text' properties. If items are given, all items are expected
     *                        to be available locally and all selection operations operate on this
     *                        local array only. If null, items are not available locally, and a
     *                        query function should be provided to fetch remote data.
     *                matcher - Function to determine whether text matches a given search term. Note
     *                          this function is only used if you have specified an array of items.
     *                          Receives two arguments:
     *                          item - The item that should match the search term.
     *                          term - The search term. Note that for performance reasons, the term
     *                                 has always been already processed using
     *                                 Selectivity.transformText().
     *                          The method should return the item if it matches, and null otherwise.
     *                          If the item has a children array, the matcher is expected to filter
     *                          those itself (be sure to only return the filtered array of children
     *                          in the returned item and not to modify the children of the item
     *                          argument).
     *                placeholder - Placeholder text to display when the element has no focus and
     *                              no selected items.
     *                positionDropdown - Function to position the dropdown. Receives two arguments:
     *                                   dropdownEl - The element to be positioned.
     *                                   selectEl - The element of the Selectivity instance, that
     *                                              you can position the dropdown to.
     *                                   The default implementation positions the dropdown element
     *                                   under the Selectivity's element and gives it the same
     *                                   width.
     *                query - Function to use for querying items. Receives a single object as
     *                        argument with the following properties:
     *                        callback - Callback to invoke when the results are available. This
     *                                   callback should be passed a single object as argument with
     *                                   the following properties:
     *                                   more - Boolean that can be set to true to indicate there
     *                                          are more results available. Additional results may
     *                                          be fetched by the user through pagination.
     *                                   results - Array of result items. The format for the result
     *                                             items is the same as for passing local items.
     *                        offset - This property is only used for pagination and indicates how
     *                                 many results should be skipped when returning more results.
     *                        selectivity - The Selectivity instance the query function is used on.
     *                        term - The search term the user is searching for. Unlike with the
     *                               matcher function, the term has not been processed using
     *                               Selectivity.transformText().
     *                readOnly - If true, disables any modification of the input.
     *                removeOnly - If true, disables any modification of the input except removing
     *                             of selected items.
     *                shouldOpenSubmenu - Function to call that will decide whether a submenu should
     *                                    be opened. Receives two parameters:
     *                                    item - The currently highlighted result item.
     *                                    reason - The reason why the item is being highlighted.
     *                                             See Dropdown#highlight() for possible values.
     *                showDropdown - Set to false if you don't want to use any dropdown (you can
     *                               still open it programmatically using open()).
     *                showSearchInputInDropdown - Set to false to remove the search input used in
     *                                            dropdowns. The default is true for single-value
     *                                            inputs.
     *                templates - Object with instance-specific templates to override the global
     *                            templates assigned to Selectivity.Templates.
     */
    setOptions: function(options) {

        options = options || {};

        var selectivity = this;
        Selectivity.OptionListeners.forEach(function(listener) {
            listener(selectivity, options);
        });

        if ('items' in options) {
            this.items = (options.items ? Selectivity.processItems(options.items) : null);
        }
        if ('templates' in options) {
            extend(this.templates, options.templates);
        }

        extend(this.options, options);

        this.enabled = (!this.options.readOnly && !this.options.removeOnly);
    },

    /**
     * Sets the value of the selection.
     *
     * The value of the selection only concerns the IDs of the selection items. If you are
     * interested in the IDs and the text labels, you should use the data() method.
     *
     * Note that if neither the items option nor the initSelection option have been set, Selectivity
     * will have no way to determine what text labels should be used with the given IDs in which
     * case it will assume the text is equal to the ID. This is useful if you're working with tags,
     * or selecting e-mail addresses for instance, but may not always be what you want.
     *
     * @param newValue New value to set. For a MultipleSelectivity instance the value must be an
     *                 array of IDs, for a SingleSelectivity instance the value must be a single ID
     *                 (a string or a number) or null to indicate no item is selected.
     * @param options Optional options object. May contain the following property:
     *                triggerChange - Set to false to suppress the "change" event being triggered.
     *                                Note this will also cause the UI to not update automatically;
     *                                so you may want to call rerenderSelection() manually when
     *                                using this option.
     */
    setValue: function(newValue, options) {

        options = options || {};

        newValue = this.validateValue(newValue);

        this._value = newValue;

        if (this.options.initSelection) {
            this.options.initSelection(newValue, function(data) {
                if (this._value === newValue) {
                    this._data = this.validateData(data);

                    if (options.triggerChange !== false) {
                        this.triggerChange();
                    }
                }
            }.bind(this));
        } else {
            this._data = this.getDataForValue(newValue);

            if (options.triggerChange !== false) {
                this.triggerChange();
            }
        }
    },

    /**
     * Returns the result of the given template.
     *
     * @param templateName Name of the template to process.
     * @param options Options to pass to the template.
     *
     * @return String containing HTML.
     */
    template: function(templateName, options) {

        var template = this.templates[templateName];
        if (!template) {
            throw new Error('Unknown template: ' + templateName);
        }

        if (typeof template === 'function') {
            return template(options);
        } else if (template.render) {
            return template.render(options);
        } else {
            return template.toString();
        }
    },

    /**
     * Triggers the change event.
     *
     * The event object at least contains the following property:
     * value - The new value of the Selectivity instance.
     *
     * @param Optional additional options added to the event object.
     */
    triggerChange: function(options) {

        var data = extend({ value: this._value }, options);
        this.triggerEvent('change', data);
        this.triggerEvent('selectivity-change', data);
    },

    /**
     * Triggers an event on the instance's element.
     *
     * @param eventName Name of the event to trigger.
     * @param data Optional event data to be added to the event object.
     *
     * @return Whether the default action of the event may be executed, ie. returns false if
     *         preventDefault() has been called.
     */
    triggerEvent: function(eventName, data) {

        var event = document.createEvent('Event');
        event.initEvent(eventName, /* bubbles: */ false, /* cancelable: */ true);
        extend(event, data);
        this.el.dispatchEvent(event);
        return !event.defaultPrevented;
    },

    /**
     * Validates a single item. Throws an exception if the item is invalid.
     *
     * @param item The item to validate.
     *
     * @return The validated item. May differ from the input item.
     */
    validateItem: function(item) {

        if (item && Selectivity.isValidId(item.id) && isString(item.text)) {
            return item;
        } else {
            throw new Error('Item should have id (number or string) and text (string) properties');
        }
    },

    /**
     * @private
     */
    _blur: function() {

        if (!this._focusing && !this.el.classList.contains('hover')) {
            // Without the timeout it appears clicks on result items are not always properly
            // handled, especially when the user doesn't click exactly on the text of the result
            // item. I don't understand really why that happens, or why the timeout has to be so
            // large, but after trial and error, this now seems to work reliably...
            this._clearCloseTimeout();
            this._closeTimeout = setTimeout(this.close.bind(this), 166);
        }
    },

    /**
     * @private
     */
    _clearCloseTimeout: function() {

        if (this._closeTimeout) {
            clearTimeout(this._closeTimeout);
            this._closeTimeout = 0;
        }
    },

    /**
     * @private
     */
    _closed: function() {

        this.dropdown = null;

        toggleClass(this.el, 'open', false);
    },

    /**
     * @private
     */
    _mouseleave: function() {

        toggleClass(this.el, 'hover', false);
    },

    /**
     * @private
     */
    _mouseenter: function() {

        toggleClass(this.el, 'hover', true);
    }

});

/**
 * Dropdown class to use for displaying dropdowns.
 *
 * The default implementation of a dropdown is defined in the selectivity-dropdown module.
 */
Selectivity.Dropdown = null;

/**
 * Array of input listeners.
 *
 * Input listeners are invoked when initInput() is called (typically right after the input is
 * created). Every listener receives three arguments:
 *
 * selectivity - The Selectivity instance.
 * input - DOM element of the input.
 * options - Options that were passed to initInput().
 *
 * An example of a search input listener is the selectivity-keyboard module.
 */
Selectivity.InputListeners = [];

/**
 * Mapping of input types.
 */
Selectivity.Inputs = {};

/**
 * Array of option listeners.
 *
 * Option listeners are invoked when setOptions() is called. Every listener receives two arguments:
 *
 * selectivity - The Selectivity instance.
 * options - The options that are about to be set. The listener may modify this options object.
 *
 * An example of an option listener is the selectivity-traditional module.
 */
Selectivity.OptionListeners = [];

/**
 * Mapping with templates to use for rendering select boxes and dropdowns. See
 * selectivity-templates.js for a useful set of default templates, as well as for documentation of
 * the individual templates.
 */
Selectivity.Templates = {};

/**
 * Finds an item in the given array with the specified ID.
 *
 * @param array Array to search in.
 * @param id ID to search for.
 *
 * @return The item in the array with the given ID, or null if the item was not found.
 */
Selectivity.findById = function(array, id) {

    var index = Selectivity.findIndexById(array, id);
    return (index > -1 ? array[index] : null);
};

/**
 * Finds the index of an item in the given array with the specified ID.
 *
 * @param array Array to search in.
 * @param id ID to search for.
 *
 * @return The index of the item in the array with the given ID, or -1 if the item was not found.
 */
Selectivity.findIndexById = function(array, id) {

    for (var i = 0, length = array.length; i < length; i++) {
        if (array[i].id === id) {
            return i;
        }
    }
    return -1;
};

/**
 * Finds an item in the given array with the specified ID. Items in the array may contain 'children'
 * properties which in turn will be searched for the item.
 *
 * @param array Array to search in.
 * @param id ID to search for.
 *
 * @return The item in the array with the given ID, or null if the item was not found.
 */
Selectivity.findNestedById = function(array, id) {

    for (var i = 0, length = array.length; i < length; i++) {
        var item = array[i], result;
        if (item.id === id) {
            result = item;
        } else if (item.children) {
            result = Selectivity.findNestedById(item.children, id);
        } else if (item.submenu && item.submenu.items) {
            // FIXME: reference to submenu plugin doesn't belong in base
            result = Selectivity.findNestedById(item.submenu.items, id);
        }
        if (result) {
            return result;
        }
    }
    return null;
};

/**
 * Utility method for inheriting another class.
 *
 * @param SubClass Constructor function of the subclass.
 * @param SuperClass Constructor function of the superclass.
 * @param prototype Object with methods you want to add to the subclass prototype.
 *
 * @return A utility function for calling the methods of the superclass. This function receives two
 *         arguments: The this object on which you want to execute the method and the name of the
 *         method. Any arguments past those are passed to the superclass method.
 */
Selectivity.inherits = function(SubClass, SuperClass, prototype) {

    SubClass.prototype = extend(
        Object.create(SuperClass.prototype),
        { constructor: SubClass },
        prototype
    );

    return function(self, methodName) {
        SuperClass.prototype[methodName].apply(self, Array.prototype.slice.call(arguments, 2));
    };
};

/**
 * Checks whether a value can be used as a valid ID for selection items. Only numbers and strings
 * are accepted to be used as IDs.
 *
 * @param id The value to check whether it is a valid ID.
 *
 * @return true if the value is a valid ID, false otherwise.
 */
Selectivity.isValidId = function(id) {

    return typeof id === 'number' || isString(id);
};

/**
 * Decides whether a given item matches a search term. The default implementation simply
 * checks whether the term is contained within the item's text, after transforming them using
 * transformText().
 *
 * @param item The item that should match the search term.
 * @param term The search term. Note that for performance reasons, the term has always been already
 *             processed using transformText().
 *
 * @return true if the text matches the term, false otherwise.
 */
Selectivity.matcher = function(item, term) {

    var result = null;
    if (Selectivity.transformText(item.text).indexOf(term) > -1) {
        result = item;
    } else if (item.children) {
        var matchingChildren = item.children.map(function(child) {
            return Selectivity.matcher(child, term);
        }).filter(function(child) {
            return !!child;
        });
        if (matchingChildren.length) {
            result = { id: item.id, text: item.text, children: matchingChildren };
        }
    }
    return result;
};

/**
 * Helper function for processing items.
 *
 * @param item The item to process, either as object containing 'id' and 'text' properties or just
 *             as ID. The 'id' property of an item is optional if it has a 'children' property
 *             containing an array of items.
 *
 * @return Object containing 'id' and 'text' properties.
 */
Selectivity.processItem = function(item) {

    if (Selectivity.isValidId(item)) {
        return { id: item, text: '' + item };
    } else if (item &&
               (Selectivity.isValidId(item.id) || item.children) && isString(item.text)) {
        if (item.children) {
            item.children = Selectivity.processItems(item.children);
        }

        return item;
    } else {
        throw new Error('invalid item');
    }
};

/**
 * Helper function for processing an array of items.
 *
 * @param items Array of items to process. See processItem() for details about a single item.
 *
 * @return Array with items.
 */
Selectivity.processItems = function(items) {

    if (Array.isArray(items)) {
        return items.map(Selectivity.processItem);
    } else {
        throw new Error('invalid items');
    }
};

/**
 * Transforms text in order to find matches. The default implementation casts all strings to
 * lower-case so that any matches found will be case-insensitive.
 *
 * @param string The string to transform.
 *
 * @return The transformed string.
 */
Selectivity.transformText = function(string) {

    return string.toLowerCase();
};

module.exports = Selectivity;
