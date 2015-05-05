'use strict';

var $ = require('jquery');

var EventDelegator = require('./event-delegator');

/**
 * Create a new Selectivity instance or invoke a method on an instance.
 *
 * @param methodName Optional name of a method to call. If omitted, a Selectivity instance is
 *                   created for each element in the set of matched elements. If an element in the
 *                   set already has a Selectivity instance, the result is the same as if the
 *                   setOptions() method is called.
 * @param options Optional options object to pass to the given method or the constructor. See the
 *                documentation for the respective methods to see which options they accept. In case
 *                a new instance is being created, the following property is used:
 *                inputType - The input type to use. Default input types include 'Multiple' and
 *                            'Single', but you can add custom input types to the InputTypes map or
 *                            just specify one here as a function. The default value is 'Single',
 *                            unless multiple is true in which case it is 'Multiple'.
 *                multiple - Boolean determining whether multiple items may be selected
 *                           (default: false). If true, a MultipleSelectivity instance is created,
 *                           otherwise a SingleSelectivity instance is created.
 *
 * @return If the given method returns a value, this method returns the value of that method
 *         executed on the first element in the set of matched elements.
 */
function selectivity(methodName, options) {
    /* jshint validthis: true */

    var result;

    this.each(function() {
        var instance = this.selectivity;

        if (instance) {
            if ($.type(methodName) !== 'string') {
                options = methodName;
                methodName = 'setOptions';
            }

            if ($.type(instance[methodName]) === 'function') {
                if (result === undefined) {
                    result = instance[methodName].call(instance, options);
                }
            } else {
                throw new Error('Unknown method: ' + methodName);
            }
        } else {
            if ($.type(methodName) === 'string') {
                if (methodName !== 'destroy') {
                    throw new Error('Cannot call method on element without Selectivity instance');
                }
            } else {
                options = $.extend({}, methodName, { element: this });

                // this is a one-time hack to facilitate the selectivity-traditional module, because
                // the module is not able to hook this early into creation of the instance
                var $this = $(this);
                if ($this.is('select') && $this.prop('multiple')) {
                    options.multiple = true;
                }

                var InputTypes = Selectivity.InputTypes;
                var InputType = (options.inputType || (options.multiple ? 'Multiple' : 'Single'));
                if ($.type(InputType) !== 'function') {
                    if (InputTypes[InputType]) {
                        InputType = InputTypes[InputType];
                    } else {
                        throw new Error('Unknown Selectivity input type: ' + InputType);
                    }
                }

                this.selectivity = new InputType(options);
            }
        }
    });

    return (result === undefined ? this : result);
}

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
 *                          property is set automatically by the $.fn.selectivity() function.
 *                value - Initial value to set. This should be an array of IDs. This property is
 *                        mutually exclusive with 'data'.
 */
function Selectivity(options) {

    if (!(this instanceof Selectivity)) {
        return selectivity.apply(this, arguments);
    }

    /**
     * jQuery container for the element to which this instance is attached.
     */
    this.$el = $(options.element);

    /**
     * jQuery container for the search input.
     *
     * May be null as long as there is no visible search input. It is set by initSearchInput().
     */
    this.$searchInput = null;

    /**
     * Reference to the currently open dropdown.
     */
    this.dropdown = null;

    /**
     * Whether the input is enabled.
     *
     * This is false when the option readOnly is false or the option removeOnly is false.
     */
    this.enabled = true;

    /**
     * Boolean whether the browser has touch input.
     */
    this.hasTouch = (typeof window !== 'undefined' && 'ontouchstart' in window);

    /**
     * Boolean whether the browser has a physical keyboard attached to it.
     *
     * Given that there is no way for JavaScript to reliably detect this yet, we just assume it's
     * the opposite of hasTouch for now.
     */
    this.hasKeyboard = !this.hasTouch;

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
     * The function to be used for matching search results.
     */
    this.matcher = Selectivity.matcher;

    /**
     * Options passed to the Selectivity instance or set through setOptions().
     */
    this.options = {};

    /**
     * Results from a search query.
     */
    this.results = [];

    /**
     * Array of search input listeners.
     *
     * Custom listeners can be specified in the options object.
     */
    this.searchInputListeners = Selectivity.SearchInputListeners;

    /**
     * Mapping of templates.
     *
     * Custom templates can be specified in the options object.
     */
    this.templates = $.extend({}, Selectivity.Templates);

    /**
     * The last used search term.
     */
    this.term = '';

    this.setOptions(options);

    if (options.value) {
        this.value(options.value, { triggerChange: false });
    } else {
        this.data(options.data || null, { triggerChange: false });
    }

    this._$searchInputs = [];

    this.$el.on('selectivity-close', this._closed.bind(this));

    EventDelegator.call(this);
}

/**
 * Methods.
 */
$.extend(Selectivity.prototype, EventDelegator.prototype, {

    /**
     * Convenience shortcut for this.$el.find(selector).
     */
    $: function(selector) {

        return this.$el.find(selector);
    },

    /**
     * Closes the dropdown.
     */
    close: function() {

        if (this.dropdown) {
            this.dropdown.close();
        }
    },

    /**
     * Sets or gets the selection data.
     *
     * The selection data contains both IDs and text labels. If you only want to set or get the IDs,
     * you should use the value() method.
     *
     * @param newData Optional new data to set. For a MultipleSelectivity instance the data must be
     *                an array of objects with 'id' and 'text' properties, for a SingleSelectivity
     *                instance the data must be a single such object or null to indicate no item is
     *                selected.
     * @param options Optional options object. May contain the following property:
     *                triggerChange - Set to false to suppress the "change" event being triggered.
     *
     * @return If newData is omitted, this method returns the current data.
     */
    data: function(newData, options) {

        options = options || {};

        if (newData === undefined) {
            return this._data;
        } else {
            newData = this.validateData(newData);

            this._data = newData;
            this._value = this.getValueForData(newData);

            if (options.triggerChange !== false) {
                this.triggerChange();
            }
        }
    },

    /**
     * Destroys the Selectivity instance.
     */
    destroy: function() {

        this.undelegateEvents();

        var $el = this.$el;
        $el.children().remove();
        $el[0].selectivity = null;
        $el = null;
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

        if (this.$searchInput) {
            this.$searchInput.focus();
        }
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
     * Initializes the search input element.
     *
     * Sets the $searchInput property, invokes all search input listeners and attaches the default
     * action of searching when something is typed.
     *
     * @param $input jQuery container for the input element.
     * @param options Optional options object. May contain the following property:
     *                noSearch - If false, no event handlers are setup to initiate searching when
     *                           the user types in the input field. This is useful if you want to
     *                           use the input only to handle keyboard support.
     */
    initSearchInput: function($input, options) {

        this._$searchInputs.push($input);
        this.$searchInput = $input;

        this.searchInputListeners.forEach(function(listener) {
            listener(this, $input);
        }.bind(this));

        if (!options || options.noSearch !== false) {
            $input.on('keyup', function(event) {
                if (!event.isDefaultPrevented()) {
                    this.search();
                }
            }.bind(this));
        }
    },

    /**
     * Loads a follow-up page with results after a search.
     *
     * This method should only be called after a call to search() when the callback has indicated
     * more results are available.
     */
    loadMore: function() {

        this.options.query({
            callback: function(response) {
                if (response && response.results) {
                    this._addResults(
                        Selectivity.processItems(response.results),
                        { hasMore: !!response.more }
                    );
                } else {
                    throw new Error('callback must be passed a response object');
                }
            }.bind(this),
            error: this._addResults.bind(this, []),
            offset: this.results.length,
            selectivity: this,
            term: this.term
        });
    },

    /**
     * Opens the dropdown.
     *
     * @param options Optional options object. May contain the following property:
     *                showSearchInput - Boolean whether a search input should be shown in the
     *                                  dropdown. Default is false.
     */
    open: function(options) {

        options = options || {};

        if (!this.dropdown) {
            if (this.triggerEvent('selectivity-opening')) {
                var Dropdown = this.options.dropdown || Selectivity.Dropdown;
                if (Dropdown) {
                    this.dropdown = new Dropdown({
                        position: this.options.positionDropdown,
                        selectivity: this,
                        showSearchInput: options.showSearchInput
                    });
                }

                this.search('');
            }
        }
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
     * Removes the search input last initialized with initSearchInput().
     */
    removeSearchInput: function() {

        this._$searchInputs.pop();

        this.$searchInput = this._$searchInputs[this._$searchInputs.length - 1] || null;
    },

    /**
     * Searches for results based on the term entered in the search input.
     *
     * If an items array has been passed with the options to the Selectivity instance, a local
     * search will be performed among those items. Otherwise, the query function specified in the
     * options will be used to perform the search. If neither is defined, nothing happens.
     *
     * @param term Optional term to search for. If ommitted, the value of the search input element
     *             is used as term.
     */
    search: function(term) {

        var self = this;
        function setResults(results, resultOptions) {
            self._setResults(results, $.extend({ term: term }, resultOptions));
        }

        if (term === undefined) {
            if (!self.$searchInput) {
                return;
            }

            term = self.$searchInput.val();
        }

        if (self.items) {
            term = Selectivity.transformText(term);
            var matcher = self.matcher;
            setResults(self.items.map(function(item) {
                return matcher(item, term);
            }).filter(function(item) {
                return !!item;
            }));
        } else if (self.options.query) {
            self.options.query({
                callback: function(response) {
                    if (response && response.results) {
                        setResults(
                            Selectivity.processItems(response.results),
                            { hasMore: !!response.more }
                        );
                    } else {
                        throw new Error('callback must be passed a response object');
                    }
                },
                error: self._showError.bind(self),
                offset: 0,
                selectivity: self,
                term: term
            });
        }

        self.term = term;
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
     *                                   $dropdownEl - The element to be positioned.
     *                                   $selectEl - The element of the Selectivity instance, that
     *                                               you can position the dropdown to.
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
     *                searchInputListeners - Array of search input listeners. By default, the global
     *                                       array Selectivity.SearchInputListeners is used.
     *                showDropdown - Set to false if you don't want to use any dropdown (you can
     *                               still open it programmatically using open()).
     *                templates - Object with instance-specific templates to override the global
     *                            templates assigned to Selectivity.Templates.
     */
    setOptions: function(options) {

        options = options || {};

        Selectivity.OptionListeners.forEach(function(listener) {
            listener(this, options);
        }.bind(this));

        $.extend(this.options, options);

        var allowedTypes = $.extend({
            closeOnSelect: 'boolean',
            dropdown: 'function|null',
            initSelection: 'function|null',
            matcher: 'function|null',
            placeholder: 'string',
            positionDropdown: 'function|null',
            query: 'function|null',
            readOnly: 'boolean',
            removeOnly: 'boolean',
            searchInputListeners: 'array'
        }, options.allowedTypes);

        $.each(options, function(key, value) {
            var type = allowedTypes[key];
            if (type && !type.split('|').some(function(type) { return $.type(value) === type; })) {
                throw new Error(key + ' must be of type ' + type);
            }

            switch (key) {
            case 'items':
                this.items = (value === null ? value : Selectivity.processItems(value));
                break;

            case 'matcher':
                this.matcher = value;
                break;

            case 'searchInputListeners':
                this.searchInputListeners = value;
                break;

            case 'templates':
                $.extend(this.templates, value);
                break;
            }
        }.bind(this));

        this.enabled = (!this.options.readOnly && !this.options.removeOnly);
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
        if (template) {
            if ($.type(template) === 'function') {
                return template(options);
            } else if (template.render) {
                return template.render(options);
            } else {
                return template.toString();
            }
        } else {
            throw new Error('Unknown template: ' + templateName);
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

        this.triggerEvent('change', $.extend({ value: this._value }, options));
    },

    /**
     * Triggers an event on the instance's element.
     *
     * @param Optional event data to be added to the event object.
     *
     * @return Whether the default action of the event may be executed, ie. returns false if
     *         preventDefault() has been called.
     */
    triggerEvent: function(eventName, data) {

        var event = $.Event(eventName, data || {});
        this.$el.trigger(event);
        return !event.isDefaultPrevented();
    },

    /**
     * Shorthand for value().
     */
    val: function(newValue) {

        return this.value(newValue);
    },

    /**
     * Validates a single item. Throws an exception if the item is invalid.
     *
     * @param item The item to validate.
     *
     * @return The validated item. May differ from the input item.
     */
    validateItem: function(item) {

        if (item && Selectivity.isValidId(item.id) && $.type(item.text) === 'string') {
            return item;
        } else {
            throw new Error('Item should have id (number or string) and text (string) properties');
        }
    },

    /**
     * Sets or gets the value of the selection.
     *
     * The value of the selection only concerns the IDs of the selection items. If you are
     * interested in the IDs and the text labels, you should use the data() method.
     *
     * Note that if neither the items option nor the initSelection option have been set, Selectivity
     * will have no way to determine what text labels should be used with the given IDs in which
     * case it will assume the text is equal to the ID. This is useful if you're working with tags,
     * or selecting e-mail addresses for instance, but may not always be what you want.
     *
     * @param newValue Optional new value to set. For a MultipleSelectivity instance the value must be
     *                 an array of IDs, for a SingleSelectivity instance the value must be a single ID
     *                 (a string or a number) or null to indicate no item is selected.
     * @param options Optional options object. May contain the following property:
     *                triggerChange - Set to false to suppress the "change" event being triggered.
     *
     * @return If newValue is omitted, this method returns the current value.
     */
    value: function(newValue, options) {

        options = options || {};

        if (newValue === undefined) {
            return this._value;
        } else {
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
        }
    },

    /**
     * @private
     */
    _addResults: function(results, options) {

        this.results = this.results.concat(results);

        if (this.dropdown) {
            this.dropdown.showResults(
                this.filterResults(results),
                $.extend({ add: true }, options)
            );
        }
    },

    /**
     * @private
     */
    _closed: function() {

        this.dropdown = null;
    },

    /**
     * @private
     */
    _getItemId: function(elementOrEvent) {

        // returns the item ID related to an element or event target.
        // IDs can be either numbers or strings, but attribute values are always strings, so we
        // will have to find out whether the item ID ought to be a number or string ourselves.
        // $.fn.data() is a bit overzealous for our case, because it returns a number whenever the
        // attribute value can be parsed as a number. however, it is possible an item had an ID
        // which is a string but which is parseable as number, in which case we verify if the ID
        // as number is actually found among the data or results. if it isn't, we assume it was
        // supposed to be a string after all...

        var $element;
        if (elementOrEvent.target) {
            $element = $(elementOrEvent.target).closest('[data-item-id]');
        } else if (elementOrEvent.length) {
            $element = elementOrEvent;
        } else {
            $element = $(elementOrEvent);
        }

        var id = $element.data('item-id');
        if ($.type(id) === 'string') {
            return id;
        } else {
            if (Selectivity.findById(this._data || [], id) ||
                Selectivity.findNestedById(this.results, id)) {
                return id;
            } else {
                return '' + id;
            }
        }
    },

    /**
     * @private
     */
    _setResults: function(results, options) {

        this.results = results;

        if (this.dropdown) {
            this.dropdown.showResults(this.filterResults(results), options || {});
        }
    },

    /**
     * @private
     */
    _showError: function(error, options) {

        this.results = [];

        if (this.dropdown) {
            this.dropdown.showError(error, options);
        }
    }

});

/**
 * Dropdown class to use for displaying dropdowns.
 *
 * The default implementation of a dropdown is defined in the selectivity-dropdown module.
 */
Selectivity.Dropdown = null;

/**
 * Mapping of input types.
 */
Selectivity.InputTypes = {};

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
 * Array of search input listeners.
 *
 * Search input listeners are invoked when initSearchInput() is called (typically right after the
 * search input is created). Every listener receives two arguments:
 *
 * selectivity - The Selectivity instance.
 * $input - jQuery container with the search input.
 *
 * An example of a search input listener is the selectivity-keyboard module.
 */
Selectivity.SearchInputListeners = [];

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
Selectivity.findNestedById = /* hasModule('submenu'): null && */function(array, id) {

    for (var i = 0, length = array.length; i < length; i++) {
        var item = array[i];
        if (item.id === id) {
            return item;
        } else if (item.children) {
            var result = Selectivity.findNestedById(item.children, id);
            if (result) {
                return result;
            }
        }
    }
    return null;
};

/**
 * Utility method for inheriting another class.
 *
 * @param SubClass Constructor function of the subclass.
 * @param SuperClass Optional constructor function of the superclass. If omitted, Selectivity is
 *                   used as superclass.
 * @param prototype Object with methods you want to add to the subclass prototype.
 *
 * @return A utility function for calling the methods of the superclass. This function receives two
 *         arguments: The this object on which you want to execute the method and the name of the
 *         method. Any arguments past those are passed to the superclass method.
 */
Selectivity.inherits = function(SubClass, SuperClass, prototype) {

    if (arguments.length === 2) {
        prototype = SuperClass;
        SuperClass = Selectivity;
    }

    SubClass.prototype = $.extend(
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

    var type = $.type(id);
    return type === 'number' || type === 'string';
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
               (Selectivity.isValidId(item.id) || item.children) &&
               $.type(item.text) === 'string') {
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

    if ($.type(items) === 'array') {
        return items.map(Selectivity.processItem);
    } else {
        throw new Error('invalid items');
    }
};

/**
 * Quotes a string so it can be used in a CSS attribute selector. It adds double quotes to the
 * string and escapes all occurrences of the quote character inside the string.
 *
 * @param string The string to quote.
 *
 * @return The quoted string.
 */
Selectivity.quoteCssAttr = function(string) {

    return '"' + ('' + string).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
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

module.exports = $.fn.selectivity = Selectivity;
