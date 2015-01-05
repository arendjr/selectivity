(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

_dereq_('./select3-backdrop');
_dereq_('./select3-base');
_dereq_('./select3-diacritics');
_dereq_('./select3-dropdown');
_dereq_('./select3-multiple');
_dereq_('./select3-single');
_dereq_('./select3-templates');

},{"./select3-backdrop":3,"./select3-base":4,"./select3-diacritics":5,"./select3-dropdown":6,"./select3-multiple":8,"./select3-single":9,"./select3-templates":10}],2:[function(_dereq_,module,exports){
'use strict';

/**
 * @license
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
};

/**
 * Used by `escape` to convert characters to HTML entities.
 *
 * @private
 * @param {string} match The matched character to escape.
 * @returns {string} Returns the escaped character.
 */
function escapeHtmlChar(match) {
    return htmlEscapes[match];
}

var reUnescapedHtml = new RegExp('[' + Object.keys(htmlEscapes).join('') + ']', 'g');

/**
 * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
 * corresponding HTML entities.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {string} string The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escape('Fred, Wilma, & Pebbles');
 * // => 'Fred, Wilma, &amp; Pebbles'
 */
function escape(string) {
    return string ? String(string).replace(reUnescapedHtml, escapeHtmlChar) : '';
}

module.exports = escape;

},{}],3:[function(_dereq_,module,exports){
'use strict';

var $ = window.jQuery || window.Zepto;

var Select3Dropdown = _dereq_('./select3-dropdown');

var BACKDROP_Z_INDEX = 9998;
var FOREGROUND_Z_INDEX = 9999;

/**
 * Methods.
 */
$.extend(Select3Dropdown.prototype, {

    /**
     * @inherit
     */
    addToDom: function() {

        var $select3El = this.select3.$el;
        $select3El.css({ zIndex: FOREGROUND_Z_INDEX, position: 'relative' });
        this.$el.appendTo($select3El[0].ownerDocument.body).css('zIndex', FOREGROUND_Z_INDEX);
    },

    /**
     * @inherit
     */
    removeCloseHandler: function() {

        this._$backdrop.remove();
        this._$backdrop = null;
    },

    /**
     * @inherit
     */
    setupCloseHandler: function() {

        var $backdrop = $('<div>').addClass('.select3-backdrop').css({
            background: 'transparent',
            bottom: 0,
            left: 0,
            position: 'fixed',
            right: 0,
            top: 0,
            zIndex: BACKDROP_Z_INDEX
        }).on('click', this.close.bind(this));

        $('body').append($backdrop);

        this._$backdrop = $backdrop;
    }

});

},{"./select3-dropdown":6,"jquery":"jquery"}],4:[function(_dereq_,module,exports){
'use strict';

var $ = window.jQuery || window.Zepto;

/**
 * Create a new Select3 instance or invoke a method on an instance.
 *
 * @param methodName Optional name of a method to call. If omitted, a Select3 instance is created
 *                   for each element in the set of matched elements. If an element in the set
 *                   already has a Select3 instance, the result is the same as if the setOptions()
 *                   method is called.
 * @param options Optional options object to pass to the given method or the constructor. See the
 *                documentation for the respective methods to see which options they accept. In case
 *                a new instance is being created, the following property is used:
 *                implementation - The implementation to use. Default implementations include
 *                                 'Multiple' and 'Single', but you can add custom implementations
 *                                 to the Implementations map. The default value is 'Single', unless
 *                                 multiple is true in which case it is 'Multiple'.
 *                multiple - Boolean determining whether multiple items may be selected
 *                           (default: false). If true, a MultipleSelect3 instance is created,
 *                           otherwise a SingleSelect3 instance is created.
 *
 * @return If the given method returns a value, this method returns the value of that method
 *         executed on the first element in the set of matched elements.
 */
function select3(methodName, options) {
    /* jshint validthis: true */

    var result;

    this.each(function() {
        var instance = this.select3;

        if (instance) {
            if ($.type(methodName) !== 'string') {
                options = methodName;
                methodName = 'setOptions';
            }

            if ($.type(instance[methodName]) === 'function') {
                if ($.type(result) === 'undefined') {
                    result = instance[methodName].call(instance, options);
                }
            } else {
                throw new Error('Unknown method: ' + methodName);
            }
        } else {
            if ($.type(methodName) === 'string') {
                throw new Error('Cannot call method on element without Select3 instance');
            } else {
                options = $.extend({}, methodName, { element: this });

                var Implementations = Select3.Implementations;
                var Implementation = (options.implementation || (options.multiple ? 'Multiple'
                                                                                  : 'Single'));
                if ($.type(Implementation) !== 'function') {
                    if (Implementations[Implementation]) {
                        Implementation = Implementations[Implementation];
                    } else {
                        throw new Error('Unknown Select3 implementation: ' + Implementation);
                    }
                }

                this.select3 = new Implementation(options);
            }
        }
    });

    return result;
}

/**
 * Select3 Base Constructor.
 *
 * You will never use this constructor directly. Instead, you use $(selector).select3(options) to
 * create an instance of either MultipleSelect3 or SingleSelect3. This class defines all
 * functionality that is common between both.
 *
 * @param options Options object. Accepts the same options as the setOptions method(), in addition
 *                to the following ones:
 *                data - Initial selection data to set. This should be an array of objects with 'id'
 *                       and 'text' properties. This option is mutually exclusive with 'value'.
 *                element - The DOM element to which to attach the Select3 instance. This property
 *                          is set automatically by the $.fn.select3() function.
 *                value - Initial value to set. This should be an array of IDs. This property is
 *                        mutually exclusive with 'data'.
 */
function Select3(options) {

    if (!(this instanceof Select3)) {
        return select3.apply(this, arguments);
    }

    /**
     * jQuery container for the element to which this instance is attached.
     */
    this.$el = $(options.element).on('select3-close', this._closed.bind(this));

    /**
     * Reference to the currently open dropdown.
     */
    this.dropdown = null;

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
    this.matcher = Select3.matcher;

    /**
     * Results from a search query.
     */
    this.results = [];

    /**
     * The currently highlighted result.
     */
    this.highlightedResult = null;

    /**
     * Mapping of templates.
     *
     * Custom templates can be specified in the options object.
     */
    this.templates = $.extend({}, Select3.Templates);

    this.setOptions(options);

    if (options.value) {
        this.value(options.value);
    } else {
        this.data(options.data || null);
    }

    this._events = [];

    this.delegateEvents();
}

/**
 * Methods.
 */
$.extend(Select3.prototype, {

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
     * @param newData Optional new data to set. For a MultipleSelect3 instance the data must be
     *                an array of objects with 'id' and 'text' properties, for a SingleSelect3
     *                instance the data must be a single such object or null to indicate no item is
     *                selected.
     *
     * @return If newData is omitted, this method returns the current data.
     */
    data: function(newData) {

        if ($.type(newData) === 'undefined') {
            return this._data;
        } else {
            newData = this.validateData(newData);

            this._data = newData;
            this._value = this.getValueForData(newData);

            this.triggerChange();
        }
    },

    /**
     * Attaches all listeners from the events map to the instance's element.
     *
     * Normally, you should not have to call this method yourself as it's called automatically in
     * the constructor.
     */
    delegateEvents: function() {

        this.undelegateEvents();

        $.each(this.events, function(event, listener) {
            var selector, index = event.indexOf(' ');
            if (index > -1) {
                selector = event.slice(index + 1);
                event = event.slice(0, index);
            }

            if ($.type(listener) === 'string') {
                listener = this[listener];
            }

            listener = listener.bind(this);

            if (selector) {
                this.$el.on(event, selector, listener);
            } else {
                this.$el.on(event, listener);
            }

            this._events.push({ event: event, selector: selector, listener: listener });
        }.bind(this));
    },

    /**
     * Destroys the Select3 instance.
     */
    destroy: function() {

        this.undelegateEvents();

        var $el = this.$el;
        $el.children().remove();
        $el[0].select3 = null;
        $el = null;
    },

    /**
     * Filters the results to be displayed in the dropdown.
     *
     * The default implementation simply returns the results unfiltered, but the MultiSelect3 class
     * overrides this method to filter out any items that have already been selected.
     *
     * @param results Array of items with 'id' and 'text' properties.
     *
     * @return The filtered array.
     */
    filterResults: function(results) {

        return results;
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
            return Select3.findById(items, id);
        } else {
            return { id: id, text: '' + id };
        }
    },

    /**
     * Opens the dropdown.
     */
    open: function() {

        if (!this.dropdown) {
            var event = $.Event('select3-opening');
            this.$el.trigger(event);

            if (!event.isDefaultPrevented()) {
                this.dropdown = new Select3.Dropdown({ select3: this });

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
     * Searches for results based on a search term entered by the user.
     *
     * If an items array has been passed with the options to the Select3 instance, a local search
     * will be performed among those items. Otherwise, the query function specified in the options
     * will be used to perform the search. If neither is defined, nothing happens.
     *
     * @param term The search term the user is searching for.
     */
    search: function(term) {

        if (this.items) {
            term = Select3.transformText(term);
            var matcher = this.matcher;
            this._setResults(this.items.filter(function(item) {
                return matcher(term, item.text);
            }));
        } else if (this.options.query) {
            this.options.query({
                callback: function(response) {
                    this._setResults(
                        this.validateData(response.results.map(Select3.processItem)),
                        { hasMore: !!response.more }
                    );
                }.bind(this),
                offset: 0,
                term: term,
            });
        }
    },

    /**
     * Sets one or more options on this Select3 instance.
     *
     * @param options Options object. May contain one or more of the following properties:
     *                closeOnSelect - Set to false to keep the dropdown open after the user has
     *                                selected an item. This is useful if you want to allow the user
     *                                to quickly select multiple items. The default value is true.
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
     *                          term - The search term. Note that for performance reasons, the term
     *                                 has always been already processed using
     *                                 Select3.transformText().
     *                          text - The text that should match the search term.
     *                placeholder - Placeholder text to display when the element has no focus and
     *                              selected items.
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
     *                        term - The search term the user is searching for. Unlike with the
     *                               matcher function, the term has not been processed using
     *                               Select3.transformText().
     *                showDropdown - Set to false if you don't want to use any dropdown (you can
     *                               still open it programmatically using open()).
     *                templates - Object with instance-specific templates to override the global
     *                            templates assigned to Select3.Templates.
     */
    setOptions: function(options) {

        this.options = options;

        $.each(options, function(key, value) {
            switch (key) {
            case 'closeOnSelect':
                if ($.type(value) !== 'boolean') {
                    throw new Error('closeOnSelect must be a boolean');
                }
                break;

            case 'initSelection':
                if ($.type(value) !== 'function') {
                    throw new Error('initSelection must be a function');
                }
                break;

            case 'items':
                if ($.type(value) === 'array') {
                    this.items = value.map(Select3.processItem);
                } else {
                    throw new Error('items must be an array');
                }
                break;

            case 'matcher':
                if ($.type(value) !== 'function') {
                    throw new Error('matcher must be a function');
                }
                this.matcher = value;
                break;

            case 'placeholder':
                if ($.type(value) !== 'string') {
                    throw new Error('placeholder must be a string');
                }
                break;

            case 'query':
                if ($.type(value) !== 'function') {
                    throw new Error('query must be a function');
                }
                break;

            case 'templates':
                this.templates = $.extend({}, this.templates, value);
                break;
            }
        }.bind(this));
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
     * The event object at least contains the following properties:
     * data - The new data of the Select3 instance.
     * val - The new value of the Select3 instance.
     *
     * @param Optional additional options added to the event object.
     */
    triggerChange: function(options) {

        this.$el.trigger($.Event('change', $.extend({
            data: this._data,
            val: this._value
        }, options)));
    },

    /**
     * Detaches all listeners from the events map from the instance's element.
     *
     * Normally, you should not have to call this method yourself as it's called automatically in
     * the destroy() method.
     */
    undelegateEvents: function() {

        this._events.forEach(function(event) {
            if (event.selector) {
                this.$el.off(event.event, event.selector, event.listener);
            } else {
                this.$el.off(event.event, event.listener);
            }
        }, this);

        this._events = [];
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

        if (item && Select3.isValidId(item.id) && $.type(item.text) === 'string') {
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
     * Note that if neither the items option nor the initSelection option have been set, Select3
     * will have no way to determine what text labels should be used with the given IDs in which
     * case it will assume the text is equal to the ID. This is useful if you're working with tags,
     * or selecting e-mail addresses for instance, but may not always be what you want.
     *
     * @param newValue Optional new value to set. For a MultipleSelect3 instance the value must be
     *                 an array of IDs, for a SingleSelect3 instance the value must be a single ID
     *                 (a string or a number) or null to indicate no item is selected.
     *
     * @return If newValue is omitted, this method returns the current value.
     */
    value: function(newValue) {

        if ($.type(newValue) === 'undefined') {
            return this._value;
        } else {
            newValue = this.validateValue(newValue);

            this._value = newValue;

            if (this.options.initSelection) {
                this.options.initSelection(newValue, function(data) {
                    if (this._value === newValue) {
                        this._data = this.validateData(data);

                        this.triggerChange();
                    }
                }.bind(this));
            } else {
                this._data = this.getDataForValue(newValue);

                this.triggerChange();
            }
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
    _getItemId: function(event) {

        // returns the item ID related to an event target.
        // IDs can be either numbers or strings, but attribute values are always strings, so we
        // will have to find out whether the item ID ought to be a number or string ourselves.
        // $.fn.data() is a bit overzealous for our case, because it returns a number whenever the
        // attribute value can be parsed as a number. however, it is possible an item had an ID
        // which is a string but which is parseable as number, in which case we verify if the ID
        // as number is actually found among the data or results. if it isn't, we assume it was
        // supposed to be a string after all...

        var id = $(event.target).closest('[data-item-id]').data('item-id');
        if ($.type(id) === 'string') {
            return id;
        } else {
            if (Select3.findById(this.data, id) || Select3.findById(this.results, id)) {
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
        this.resultsOptions = options;

        if (this.dropdown) {
            this.dropdown.showResults(this.filterResults(results), options || {});
        }
    }

});

/**
 * Dropdown class to use for displaying dropdowns.
 */
Select3.Dropdown = null;

/**
 * Mapping of implementations.
 */
Select3.Implementations = {};

/**
 * Mapping of keys.
 */
Select3.Keys = {
    BACKSPACE: 8,
    DELETE: 46,
    DOWN_ARROW: 40,
    ENTER: 13,
    ESCAPE: 27,
    LEFT_ARROW: 37,
    RIGHT_ARROW: 39,
    UP_ARROW: 38
};

/**
 * Mapping with templates to use for rendering select boxes and dropdowns. See select3-templates.js
 * for a useful set of default templates, as well as for documentation of the individual templates.
 */
Select3.Templates = {};

/**
 * Finds an item in the given array with the specified ID.
 *
 * @param array Array to search in.
 * @param id ID to search for.
 *
 * @return The item in the array with the given ID, or null if the item was not found.
 */
Select3.findById = function(array, id) {

    var index = Select3.findIndexById(array, id);
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
Select3.findIndexById = function(array, id) {

    for (var i = 0, length = array.length; i < length; i++) {
        if (array[i].id === id) {
            return i;
        }
    }
    return -1;
};

/**
 * Checks whether a value can be used as a valid ID for selection items. Only numbers and strings
 * are accepted to be used as IDs.
 *
 * @param id The value to check whether it is a valid ID.
 *
 * @return true if the value is a valid ID, false otherwise.
 */
Select3.isValidId = function(id) {

    var type = $.type(id);
    return type === 'number' || type === 'string';
};

/**
 * Decides whether a given text string matches a search term. The default implementation simply
 * checks whether the term is contained within the text, after transforming them using
 * transformText().
 *
 * @param term The search term. Note that for performance reasons, the term has always been already
 *             processed using transformText().
 * @param text The text that should match the search term.
 *
 * @return true if the text matches the term, false otherwise.
 */
Select3.matcher = function(term, text) {

    return Select3.transformText(text).indexOf(term) > -1;
};

/**
 * Helper function for processing items.
 *
 * @param item The item to process, either as object containing 'id' and 'text' properties or just
 *             as ID.
 *
 * @return Object containing 'id' and 'text' properties.
 */
Select3.processItem = function(item) {

    if (Select3.isValidId(item)) {
        return { id: item, text: '' + item };
    } else if (item && Select3.isValidId(item.id)) {
        return item;
    } else {
        throw new Error('items array contains invalid items');
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
Select3.quoteCssAttr = function(string) {

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
Select3.transformText = function(string) {

    return string.toLowerCase();
};

$.fn.select3 = Select3;

module.exports = Select3;

},{"jquery":"jquery"}],5:[function(_dereq_,module,exports){
'use strict';

var DIACRITICS = {
    '\u24B6': 'A',
    '\uFF21': 'A',
    '\u00C0': 'A',
    '\u00C1': 'A',
    '\u00C2': 'A',
    '\u1EA6': 'A',
    '\u1EA4': 'A',
    '\u1EAA': 'A',
    '\u1EA8': 'A',
    '\u00C3': 'A',
    '\u0100': 'A',
    '\u0102': 'A',
    '\u1EB0': 'A',
    '\u1EAE': 'A',
    '\u1EB4': 'A',
    '\u1EB2': 'A',
    '\u0226': 'A',
    '\u01E0': 'A',
    '\u00C4': 'A',
    '\u01DE': 'A',
    '\u1EA2': 'A',
    '\u00C5': 'A',
    '\u01FA': 'A',
    '\u01CD': 'A',
    '\u0200': 'A',
    '\u0202': 'A',
    '\u1EA0': 'A',
    '\u1EAC': 'A',
    '\u1EB6': 'A',
    '\u1E00': 'A',
    '\u0104': 'A',
    '\u023A': 'A',
    '\u2C6F': 'A',
    '\uA732': 'AA',
    '\u00C6': 'AE',
    '\u01FC': 'AE',
    '\u01E2': 'AE',
    '\uA734': 'AO',
    '\uA736': 'AU',
    '\uA738': 'AV',
    '\uA73A': 'AV',
    '\uA73C': 'AY',
    '\u24B7': 'B',
    '\uFF22': 'B',
    '\u1E02': 'B',
    '\u1E04': 'B',
    '\u1E06': 'B',
    '\u0243': 'B',
    '\u0182': 'B',
    '\u0181': 'B',
    '\u24B8': 'C',
    '\uFF23': 'C',
    '\u0106': 'C',
    '\u0108': 'C',
    '\u010A': 'C',
    '\u010C': 'C',
    '\u00C7': 'C',
    '\u1E08': 'C',
    '\u0187': 'C',
    '\u023B': 'C',
    '\uA73E': 'C',
    '\u24B9': 'D',
    '\uFF24': 'D',
    '\u1E0A': 'D',
    '\u010E': 'D',
    '\u1E0C': 'D',
    '\u1E10': 'D',
    '\u1E12': 'D',
    '\u1E0E': 'D',
    '\u0110': 'D',
    '\u018B': 'D',
    '\u018A': 'D',
    '\u0189': 'D',
    '\uA779': 'D',
    '\u01F1': 'DZ',
    '\u01C4': 'DZ',
    '\u01F2': 'Dz',
    '\u01C5': 'Dz',
    '\u24BA': 'E',
    '\uFF25': 'E',
    '\u00C8': 'E',
    '\u00C9': 'E',
    '\u00CA': 'E',
    '\u1EC0': 'E',
    '\u1EBE': 'E',
    '\u1EC4': 'E',
    '\u1EC2': 'E',
    '\u1EBC': 'E',
    '\u0112': 'E',
    '\u1E14': 'E',
    '\u1E16': 'E',
    '\u0114': 'E',
    '\u0116': 'E',
    '\u00CB': 'E',
    '\u1EBA': 'E',
    '\u011A': 'E',
    '\u0204': 'E',
    '\u0206': 'E',
    '\u1EB8': 'E',
    '\u1EC6': 'E',
    '\u0228': 'E',
    '\u1E1C': 'E',
    '\u0118': 'E',
    '\u1E18': 'E',
    '\u1E1A': 'E',
    '\u0190': 'E',
    '\u018E': 'E',
    '\u24BB': 'F',
    '\uFF26': 'F',
    '\u1E1E': 'F',
    '\u0191': 'F',
    '\uA77B': 'F',
    '\u24BC': 'G',
    '\uFF27': 'G',
    '\u01F4': 'G',
    '\u011C': 'G',
    '\u1E20': 'G',
    '\u011E': 'G',
    '\u0120': 'G',
    '\u01E6': 'G',
    '\u0122': 'G',
    '\u01E4': 'G',
    '\u0193': 'G',
    '\uA7A0': 'G',
    '\uA77D': 'G',
    '\uA77E': 'G',
    '\u24BD': 'H',
    '\uFF28': 'H',
    '\u0124': 'H',
    '\u1E22': 'H',
    '\u1E26': 'H',
    '\u021E': 'H',
    '\u1E24': 'H',
    '\u1E28': 'H',
    '\u1E2A': 'H',
    '\u0126': 'H',
    '\u2C67': 'H',
    '\u2C75': 'H',
    '\uA78D': 'H',
    '\u24BE': 'I',
    '\uFF29': 'I',
    '\u00CC': 'I',
    '\u00CD': 'I',
    '\u00CE': 'I',
    '\u0128': 'I',
    '\u012A': 'I',
    '\u012C': 'I',
    '\u0130': 'I',
    '\u00CF': 'I',
    '\u1E2E': 'I',
    '\u1EC8': 'I',
    '\u01CF': 'I',
    '\u0208': 'I',
    '\u020A': 'I',
    '\u1ECA': 'I',
    '\u012E': 'I',
    '\u1E2C': 'I',
    '\u0197': 'I',
    '\u24BF': 'J',
    '\uFF2A': 'J',
    '\u0134': 'J',
    '\u0248': 'J',
    '\u24C0': 'K',
    '\uFF2B': 'K',
    '\u1E30': 'K',
    '\u01E8': 'K',
    '\u1E32': 'K',
    '\u0136': 'K',
    '\u1E34': 'K',
    '\u0198': 'K',
    '\u2C69': 'K',
    '\uA740': 'K',
    '\uA742': 'K',
    '\uA744': 'K',
    '\uA7A2': 'K',
    '\u24C1': 'L',
    '\uFF2C': 'L',
    '\u013F': 'L',
    '\u0139': 'L',
    '\u013D': 'L',
    '\u1E36': 'L',
    '\u1E38': 'L',
    '\u013B': 'L',
    '\u1E3C': 'L',
    '\u1E3A': 'L',
    '\u0141': 'L',
    '\u023D': 'L',
    '\u2C62': 'L',
    '\u2C60': 'L',
    '\uA748': 'L',
    '\uA746': 'L',
    '\uA780': 'L',
    '\u01C7': 'LJ',
    '\u01C8': 'Lj',
    '\u24C2': 'M',
    '\uFF2D': 'M',
    '\u1E3E': 'M',
    '\u1E40': 'M',
    '\u1E42': 'M',
    '\u2C6E': 'M',
    '\u019C': 'M',
    '\u24C3': 'N',
    '\uFF2E': 'N',
    '\u01F8': 'N',
    '\u0143': 'N',
    '\u00D1': 'N',
    '\u1E44': 'N',
    '\u0147': 'N',
    '\u1E46': 'N',
    '\u0145': 'N',
    '\u1E4A': 'N',
    '\u1E48': 'N',
    '\u0220': 'N',
    '\u019D': 'N',
    '\uA790': 'N',
    '\uA7A4': 'N',
    '\u01CA': 'NJ',
    '\u01CB': 'Nj',
    '\u24C4': 'O',
    '\uFF2F': 'O',
    '\u00D2': 'O',
    '\u00D3': 'O',
    '\u00D4': 'O',
    '\u1ED2': 'O',
    '\u1ED0': 'O',
    '\u1ED6': 'O',
    '\u1ED4': 'O',
    '\u00D5': 'O',
    '\u1E4C': 'O',
    '\u022C': 'O',
    '\u1E4E': 'O',
    '\u014C': 'O',
    '\u1E50': 'O',
    '\u1E52': 'O',
    '\u014E': 'O',
    '\u022E': 'O',
    '\u0230': 'O',
    '\u00D6': 'O',
    '\u022A': 'O',
    '\u1ECE': 'O',
    '\u0150': 'O',
    '\u01D1': 'O',
    '\u020C': 'O',
    '\u020E': 'O',
    '\u01A0': 'O',
    '\u1EDC': 'O',
    '\u1EDA': 'O',
    '\u1EE0': 'O',
    '\u1EDE': 'O',
    '\u1EE2': 'O',
    '\u1ECC': 'O',
    '\u1ED8': 'O',
    '\u01EA': 'O',
    '\u01EC': 'O',
    '\u00D8': 'O',
    '\u01FE': 'O',
    '\u0186': 'O',
    '\u019F': 'O',
    '\uA74A': 'O',
    '\uA74C': 'O',
    '\u01A2': 'OI',
    '\uA74E': 'OO',
    '\u0222': 'OU',
    '\u24C5': 'P',
    '\uFF30': 'P',
    '\u1E54': 'P',
    '\u1E56': 'P',
    '\u01A4': 'P',
    '\u2C63': 'P',
    '\uA750': 'P',
    '\uA752': 'P',
    '\uA754': 'P',
    '\u24C6': 'Q',
    '\uFF31': 'Q',
    '\uA756': 'Q',
    '\uA758': 'Q',
    '\u024A': 'Q',
    '\u24C7': 'R',
    '\uFF32': 'R',
    '\u0154': 'R',
    '\u1E58': 'R',
    '\u0158': 'R',
    '\u0210': 'R',
    '\u0212': 'R',
    '\u1E5A': 'R',
    '\u1E5C': 'R',
    '\u0156': 'R',
    '\u1E5E': 'R',
    '\u024C': 'R',
    '\u2C64': 'R',
    '\uA75A': 'R',
    '\uA7A6': 'R',
    '\uA782': 'R',
    '\u24C8': 'S',
    '\uFF33': 'S',
    '\u1E9E': 'S',
    '\u015A': 'S',
    '\u1E64': 'S',
    '\u015C': 'S',
    '\u1E60': 'S',
    '\u0160': 'S',
    '\u1E66': 'S',
    '\u1E62': 'S',
    '\u1E68': 'S',
    '\u0218': 'S',
    '\u015E': 'S',
    '\u2C7E': 'S',
    '\uA7A8': 'S',
    '\uA784': 'S',
    '\u24C9': 'T',
    '\uFF34': 'T',
    '\u1E6A': 'T',
    '\u0164': 'T',
    '\u1E6C': 'T',
    '\u021A': 'T',
    '\u0162': 'T',
    '\u1E70': 'T',
    '\u1E6E': 'T',
    '\u0166': 'T',
    '\u01AC': 'T',
    '\u01AE': 'T',
    '\u023E': 'T',
    '\uA786': 'T',
    '\uA728': 'TZ',
    '\u24CA': 'U',
    '\uFF35': 'U',
    '\u00D9': 'U',
    '\u00DA': 'U',
    '\u00DB': 'U',
    '\u0168': 'U',
    '\u1E78': 'U',
    '\u016A': 'U',
    '\u1E7A': 'U',
    '\u016C': 'U',
    '\u00DC': 'U',
    '\u01DB': 'U',
    '\u01D7': 'U',
    '\u01D5': 'U',
    '\u01D9': 'U',
    '\u1EE6': 'U',
    '\u016E': 'U',
    '\u0170': 'U',
    '\u01D3': 'U',
    '\u0214': 'U',
    '\u0216': 'U',
    '\u01AF': 'U',
    '\u1EEA': 'U',
    '\u1EE8': 'U',
    '\u1EEE': 'U',
    '\u1EEC': 'U',
    '\u1EF0': 'U',
    '\u1EE4': 'U',
    '\u1E72': 'U',
    '\u0172': 'U',
    '\u1E76': 'U',
    '\u1E74': 'U',
    '\u0244': 'U',
    '\u24CB': 'V',
    '\uFF36': 'V',
    '\u1E7C': 'V',
    '\u1E7E': 'V',
    '\u01B2': 'V',
    '\uA75E': 'V',
    '\u0245': 'V',
    '\uA760': 'VY',
    '\u24CC': 'W',
    '\uFF37': 'W',
    '\u1E80': 'W',
    '\u1E82': 'W',
    '\u0174': 'W',
    '\u1E86': 'W',
    '\u1E84': 'W',
    '\u1E88': 'W',
    '\u2C72': 'W',
    '\u24CD': 'X',
    '\uFF38': 'X',
    '\u1E8A': 'X',
    '\u1E8C': 'X',
    '\u24CE': 'Y',
    '\uFF39': 'Y',
    '\u1EF2': 'Y',
    '\u00DD': 'Y',
    '\u0176': 'Y',
    '\u1EF8': 'Y',
    '\u0232': 'Y',
    '\u1E8E': 'Y',
    '\u0178': 'Y',
    '\u1EF6': 'Y',
    '\u1EF4': 'Y',
    '\u01B3': 'Y',
    '\u024E': 'Y',
    '\u1EFE': 'Y',
    '\u24CF': 'Z',
    '\uFF3A': 'Z',
    '\u0179': 'Z',
    '\u1E90': 'Z',
    '\u017B': 'Z',
    '\u017D': 'Z',
    '\u1E92': 'Z',
    '\u1E94': 'Z',
    '\u01B5': 'Z',
    '\u0224': 'Z',
    '\u2C7F': 'Z',
    '\u2C6B': 'Z',
    '\uA762': 'Z',
    '\u24D0': 'a',
    '\uFF41': 'a',
    '\u1E9A': 'a',
    '\u00E0': 'a',
    '\u00E1': 'a',
    '\u00E2': 'a',
    '\u1EA7': 'a',
    '\u1EA5': 'a',
    '\u1EAB': 'a',
    '\u1EA9': 'a',
    '\u00E3': 'a',
    '\u0101': 'a',
    '\u0103': 'a',
    '\u1EB1': 'a',
    '\u1EAF': 'a',
    '\u1EB5': 'a',
    '\u1EB3': 'a',
    '\u0227': 'a',
    '\u01E1': 'a',
    '\u00E4': 'a',
    '\u01DF': 'a',
    '\u1EA3': 'a',
    '\u00E5': 'a',
    '\u01FB': 'a',
    '\u01CE': 'a',
    '\u0201': 'a',
    '\u0203': 'a',
    '\u1EA1': 'a',
    '\u1EAD': 'a',
    '\u1EB7': 'a',
    '\u1E01': 'a',
    '\u0105': 'a',
    '\u2C65': 'a',
    '\u0250': 'a',
    '\uA733': 'aa',
    '\u00E6': 'ae',
    '\u01FD': 'ae',
    '\u01E3': 'ae',
    '\uA735': 'ao',
    '\uA737': 'au',
    '\uA739': 'av',
    '\uA73B': 'av',
    '\uA73D': 'ay',
    '\u24D1': 'b',
    '\uFF42': 'b',
    '\u1E03': 'b',
    '\u1E05': 'b',
    '\u1E07': 'b',
    '\u0180': 'b',
    '\u0183': 'b',
    '\u0253': 'b',
    '\u24D2': 'c',
    '\uFF43': 'c',
    '\u0107': 'c',
    '\u0109': 'c',
    '\u010B': 'c',
    '\u010D': 'c',
    '\u00E7': 'c',
    '\u1E09': 'c',
    '\u0188': 'c',
    '\u023C': 'c',
    '\uA73F': 'c',
    '\u2184': 'c',
    '\u24D3': 'd',
    '\uFF44': 'd',
    '\u1E0B': 'd',
    '\u010F': 'd',
    '\u1E0D': 'd',
    '\u1E11': 'd',
    '\u1E13': 'd',
    '\u1E0F': 'd',
    '\u0111': 'd',
    '\u018C': 'd',
    '\u0256': 'd',
    '\u0257': 'd',
    '\uA77A': 'd',
    '\u01F3': 'dz',
    '\u01C6': 'dz',
    '\u24D4': 'e',
    '\uFF45': 'e',
    '\u00E8': 'e',
    '\u00E9': 'e',
    '\u00EA': 'e',
    '\u1EC1': 'e',
    '\u1EBF': 'e',
    '\u1EC5': 'e',
    '\u1EC3': 'e',
    '\u1EBD': 'e',
    '\u0113': 'e',
    '\u1E15': 'e',
    '\u1E17': 'e',
    '\u0115': 'e',
    '\u0117': 'e',
    '\u00EB': 'e',
    '\u1EBB': 'e',
    '\u011B': 'e',
    '\u0205': 'e',
    '\u0207': 'e',
    '\u1EB9': 'e',
    '\u1EC7': 'e',
    '\u0229': 'e',
    '\u1E1D': 'e',
    '\u0119': 'e',
    '\u1E19': 'e',
    '\u1E1B': 'e',
    '\u0247': 'e',
    '\u025B': 'e',
    '\u01DD': 'e',
    '\u24D5': 'f',
    '\uFF46': 'f',
    '\u1E1F': 'f',
    '\u0192': 'f',
    '\uA77C': 'f',
    '\u24D6': 'g',
    '\uFF47': 'g',
    '\u01F5': 'g',
    '\u011D': 'g',
    '\u1E21': 'g',
    '\u011F': 'g',
    '\u0121': 'g',
    '\u01E7': 'g',
    '\u0123': 'g',
    '\u01E5': 'g',
    '\u0260': 'g',
    '\uA7A1': 'g',
    '\u1D79': 'g',
    '\uA77F': 'g',
    '\u24D7': 'h',
    '\uFF48': 'h',
    '\u0125': 'h',
    '\u1E23': 'h',
    '\u1E27': 'h',
    '\u021F': 'h',
    '\u1E25': 'h',
    '\u1E29': 'h',
    '\u1E2B': 'h',
    '\u1E96': 'h',
    '\u0127': 'h',
    '\u2C68': 'h',
    '\u2C76': 'h',
    '\u0265': 'h',
    '\u0195': 'hv',
    '\u24D8': 'i',
    '\uFF49': 'i',
    '\u00EC': 'i',
    '\u00ED': 'i',
    '\u00EE': 'i',
    '\u0129': 'i',
    '\u012B': 'i',
    '\u012D': 'i',
    '\u00EF': 'i',
    '\u1E2F': 'i',
    '\u1EC9': 'i',
    '\u01D0': 'i',
    '\u0209': 'i',
    '\u020B': 'i',
    '\u1ECB': 'i',
    '\u012F': 'i',
    '\u1E2D': 'i',
    '\u0268': 'i',
    '\u0131': 'i',
    '\u24D9': 'j',
    '\uFF4A': 'j',
    '\u0135': 'j',
    '\u01F0': 'j',
    '\u0249': 'j',
    '\u24DA': 'k',
    '\uFF4B': 'k',
    '\u1E31': 'k',
    '\u01E9': 'k',
    '\u1E33': 'k',
    '\u0137': 'k',
    '\u1E35': 'k',
    '\u0199': 'k',
    '\u2C6A': 'k',
    '\uA741': 'k',
    '\uA743': 'k',
    '\uA745': 'k',
    '\uA7A3': 'k',
    '\u24DB': 'l',
    '\uFF4C': 'l',
    '\u0140': 'l',
    '\u013A': 'l',
    '\u013E': 'l',
    '\u1E37': 'l',
    '\u1E39': 'l',
    '\u013C': 'l',
    '\u1E3D': 'l',
    '\u1E3B': 'l',
    '\u017F': 'l',
    '\u0142': 'l',
    '\u019A': 'l',
    '\u026B': 'l',
    '\u2C61': 'l',
    '\uA749': 'l',
    '\uA781': 'l',
    '\uA747': 'l',
    '\u01C9': 'lj',
    '\u24DC': 'm',
    '\uFF4D': 'm',
    '\u1E3F': 'm',
    '\u1E41': 'm',
    '\u1E43': 'm',
    '\u0271': 'm',
    '\u026F': 'm',
    '\u24DD': 'n',
    '\uFF4E': 'n',
    '\u01F9': 'n',
    '\u0144': 'n',
    '\u00F1': 'n',
    '\u1E45': 'n',
    '\u0148': 'n',
    '\u1E47': 'n',
    '\u0146': 'n',
    '\u1E4B': 'n',
    '\u1E49': 'n',
    '\u019E': 'n',
    '\u0272': 'n',
    '\u0149': 'n',
    '\uA791': 'n',
    '\uA7A5': 'n',
    '\u01CC': 'nj',
    '\u24DE': 'o',
    '\uFF4F': 'o',
    '\u00F2': 'o',
    '\u00F3': 'o',
    '\u00F4': 'o',
    '\u1ED3': 'o',
    '\u1ED1': 'o',
    '\u1ED7': 'o',
    '\u1ED5': 'o',
    '\u00F5': 'o',
    '\u1E4D': 'o',
    '\u022D': 'o',
    '\u1E4F': 'o',
    '\u014D': 'o',
    '\u1E51': 'o',
    '\u1E53': 'o',
    '\u014F': 'o',
    '\u022F': 'o',
    '\u0231': 'o',
    '\u00F6': 'o',
    '\u022B': 'o',
    '\u1ECF': 'o',
    '\u0151': 'o',
    '\u01D2': 'o',
    '\u020D': 'o',
    '\u020F': 'o',
    '\u01A1': 'o',
    '\u1EDD': 'o',
    '\u1EDB': 'o',
    '\u1EE1': 'o',
    '\u1EDF': 'o',
    '\u1EE3': 'o',
    '\u1ECD': 'o',
    '\u1ED9': 'o',
    '\u01EB': 'o',
    '\u01ED': 'o',
    '\u00F8': 'o',
    '\u01FF': 'o',
    '\u0254': 'o',
    '\uA74B': 'o',
    '\uA74D': 'o',
    '\u0275': 'o',
    '\u01A3': 'oi',
    '\u0223': 'ou',
    '\uA74F': 'oo',
    '\u24DF': 'p',
    '\uFF50': 'p',
    '\u1E55': 'p',
    '\u1E57': 'p',
    '\u01A5': 'p',
    '\u1D7D': 'p',
    '\uA751': 'p',
    '\uA753': 'p',
    '\uA755': 'p',
    '\u24E0': 'q',
    '\uFF51': 'q',
    '\u024B': 'q',
    '\uA757': 'q',
    '\uA759': 'q',
    '\u24E1': 'r',
    '\uFF52': 'r',
    '\u0155': 'r',
    '\u1E59': 'r',
    '\u0159': 'r',
    '\u0211': 'r',
    '\u0213': 'r',
    '\u1E5B': 'r',
    '\u1E5D': 'r',
    '\u0157': 'r',
    '\u1E5F': 'r',
    '\u024D': 'r',
    '\u027D': 'r',
    '\uA75B': 'r',
    '\uA7A7': 'r',
    '\uA783': 'r',
    '\u24E2': 's',
    '\uFF53': 's',
    '\u00DF': 's',
    '\u015B': 's',
    '\u1E65': 's',
    '\u015D': 's',
    '\u1E61': 's',
    '\u0161': 's',
    '\u1E67': 's',
    '\u1E63': 's',
    '\u1E69': 's',
    '\u0219': 's',
    '\u015F': 's',
    '\u023F': 's',
    '\uA7A9': 's',
    '\uA785': 's',
    '\u1E9B': 's',
    '\u24E3': 't',
    '\uFF54': 't',
    '\u1E6B': 't',
    '\u1E97': 't',
    '\u0165': 't',
    '\u1E6D': 't',
    '\u021B': 't',
    '\u0163': 't',
    '\u1E71': 't',
    '\u1E6F': 't',
    '\u0167': 't',
    '\u01AD': 't',
    '\u0288': 't',
    '\u2C66': 't',
    '\uA787': 't',
    '\uA729': 'tz',
    '\u24E4': 'u',
    '\uFF55': 'u',
    '\u00F9': 'u',
    '\u00FA': 'u',
    '\u00FB': 'u',
    '\u0169': 'u',
    '\u1E79': 'u',
    '\u016B': 'u',
    '\u1E7B': 'u',
    '\u016D': 'u',
    '\u00FC': 'u',
    '\u01DC': 'u',
    '\u01D8': 'u',
    '\u01D6': 'u',
    '\u01DA': 'u',
    '\u1EE7': 'u',
    '\u016F': 'u',
    '\u0171': 'u',
    '\u01D4': 'u',
    '\u0215': 'u',
    '\u0217': 'u',
    '\u01B0': 'u',
    '\u1EEB': 'u',
    '\u1EE9': 'u',
    '\u1EEF': 'u',
    '\u1EED': 'u',
    '\u1EF1': 'u',
    '\u1EE5': 'u',
    '\u1E73': 'u',
    '\u0173': 'u',
    '\u1E77': 'u',
    '\u1E75': 'u',
    '\u0289': 'u',
    '\u24E5': 'v',
    '\uFF56': 'v',
    '\u1E7D': 'v',
    '\u1E7F': 'v',
    '\u028B': 'v',
    '\uA75F': 'v',
    '\u028C': 'v',
    '\uA761': 'vy',
    '\u24E6': 'w',
    '\uFF57': 'w',
    '\u1E81': 'w',
    '\u1E83': 'w',
    '\u0175': 'w',
    '\u1E87': 'w',
    '\u1E85': 'w',
    '\u1E98': 'w',
    '\u1E89': 'w',
    '\u2C73': 'w',
    '\u24E7': 'x',
    '\uFF58': 'x',
    '\u1E8B': 'x',
    '\u1E8D': 'x',
    '\u24E8': 'y',
    '\uFF59': 'y',
    '\u1EF3': 'y',
    '\u00FD': 'y',
    '\u0177': 'y',
    '\u1EF9': 'y',
    '\u0233': 'y',
    '\u1E8F': 'y',
    '\u00FF': 'y',
    '\u1EF7': 'y',
    '\u1E99': 'y',
    '\u1EF5': 'y',
    '\u01B4': 'y',
    '\u024F': 'y',
    '\u1EFF': 'y',
    '\u24E9': 'z',
    '\uFF5A': 'z',
    '\u017A': 'z',
    '\u1E91': 'z',
    '\u017C': 'z',
    '\u017E': 'z',
    '\u1E93': 'z',
    '\u1E95': 'z',
    '\u01B6': 'z',
    '\u0225': 'z',
    '\u0240': 'z',
    '\u2C6C': 'z',
    '\uA763': 'z',
    '\u0386': '\u0391',
    '\u0388': '\u0395',
    '\u0389': '\u0397',
    '\u038A': '\u0399',
    '\u03AA': '\u0399',
    '\u038C': '\u039F',
    '\u038E': '\u03A5',
    '\u03AB': '\u03A5',
    '\u038F': '\u03A9',
    '\u03AC': '\u03B1',
    '\u03AD': '\u03B5',
    '\u03AE': '\u03B7',
    '\u03AF': '\u03B9',
    '\u03CA': '\u03B9',
    '\u0390': '\u03B9',
    '\u03CC': '\u03BF',
    '\u03CD': '\u03C5',
    '\u03CB': '\u03C5',
    '\u03B0': '\u03C5',
    '\u03C9': '\u03C9',
    '\u03C2': '\u03C3'
};

var Select3 = _dereq_('./select3-base');
var previousTransform = Select3.transformText;

/**
 * Extended version of the transformText() function that simplifies diacritics to their latin1
 * counterparts.
 *
 * Note that if all query functions fetch their results from a remote server, you may not need this
 * function, because it makes sense to remove diacritics server-side in such cases.
 */
Select3.transformText = function(string) {
    var result = '';
    for (var i = 0, length = string.length; i < length; i++) {
        var character = string[i];
        result += DIACRITICS[character] || character;
    }
    return previousTransform(result);
};

},{"./select3-base":4}],6:[function(_dereq_,module,exports){
'use strict';

var $ = window.jQuery || window.Zepto;

var Select3 = _dereq_('./select3-base');

/**
 * Select3 Dropdown Constructor.
 *
 * @param options Options object. Should have the following properties:
 *                select3 - Select3 instance to show the dropdown for.
 */
function Select3Dropdown(options) {

    var select3 = options.select3;

    this.$el = $(select3.template('dropdown'));

    this.select3 = select3;

    this._closeProxy = this.close.bind(this);
    if (select3.options.closeOnSelect !== false) {
        select3.$el.on('select3-selecting', this._closeProxy);
    }

    this.addToDom();
    this.position();
    this.setupCloseHandler();

    this._delegateEvents();

    select3.$el.trigger('select3-open');
}

/**
 * Methods.
 */
$.extend(Select3Dropdown.prototype, {

    /**
     * Convenience shortcut for this.$el.find(selector).
     */
    $: function(selector) {

        return this.$el.find(selector);
    },

    /**
     * Adds the dropdown to the DOM.
     */
    addToDom: function() {

        this.$el.appendTo(this.select3.$el[0].ownerDocument.body);
    },

    /**
     * Closes the dropdown.
     */
    close: function() {

        this.$el.remove();

        this.removeCloseHandler();

        this.select3.$el.off('select3-selecting', this._closeProxy)
                        .trigger('select3-close');
    },

    /**
     * Events map.
     *
     * Follows the same format as Backbone: http://backbonejs.org/#View-delegateEvents
     */
    events: {
        'click .select3-load-more': '_loadMoreClicked',
        'click .select3-result-item': '_resultClicked'
    },

    /**
     * Positions the dropdown inside the DOM.
     */
    position: function() {

        var $selectEl = this.select3.$el;
        var offset = $selectEl.offset();
        this.$el.css({ left: offset.left + 'px', top: offset.top + $selectEl.height() + 'px' })
                .width($selectEl.width());
    },

    /**
     * Removes the event handler to close the dropdown.
     */
    removeCloseHandler: function() {

        $('body').off('click', this._closeProxy);
    },

    /**
     * Sets up an event handler that will close the dropdown when the Select3 control loses focus.
     */
    setupCloseHandler: function() {

        $('body').on('click', this._closeProxy);
    },

    /**
     * Shows the results from a search query.
     *
     * @param results Array of result items.
     * @param options Options object. May contain the following properties:
     *                hasMore - Boolean whether more results can be fetched using the query()
     *                          function.
     */
    showResults: function(results, options) {

        options = options || {};

        var select3 = this.select3;
        var $resultsContainer = this.$('.select3-results-container');
        $resultsContainer.html(results.map(function(item) {
            return select3.template('resultItem', item);
        }).join(''));

        if (options.hasMore) {
            $resultsContainer.append(select3.template('loadMore'));
        }
    },

    /**
     * @private
     */
    _delegateEvents: function() {

        $.each(this.events, function(event, listener) {
            var index = event.indexOf(' ');
            var selector = event.slice(index + 1);
            event = event.slice(0, index);

            if ($.type(listener) === 'string') {
                listener = this[listener];
            }

            listener = listener.bind(this);

            this.$el.on(event, selector, listener);
        }.bind(this));
    },

    /**
     * @private
     */
    _loadMoreClicked: function() {

        // TODO
    },

    /**
     * @private
     */
    _resultClicked: function(event) {

        var select3 = this.select3;
        var id = select3._getItemId(event);
        var item = Select3.findById(select3.results, id);

        var options = { id: id, item: item };
        event = $.Event('select3-selecting', options);
        select3.$el.trigger(event);

        if (!event.isDefaultPrevented()) {
            event = $.Event('select3-selected', options);
            select3.$el.trigger(event);
        }

        return false;
    }

});

Select3.Dropdown = Select3Dropdown;

module.exports = Select3Dropdown;

},{"./select3-base":4,"jquery":"jquery"}],7:[function(_dereq_,module,exports){
'use strict';

var Select3 = _dereq_('./select3-base');

/**
 * Localizable elements of the Select3 Templates.
 */
Select3.Locale = {

    loadMore: 'Load more...'

};

},{"./select3-base":4}],8:[function(_dereq_,module,exports){
'use strict';

var $ = window.jQuery || window.Zepto;

var Select3 = _dereq_('./select3-base');

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
        'keyup .select3-multiple-input': '_keyReleased',
        'paste .select3-multiple-input': function() {
            setTimeout(this.search.bind(this), 10);
        },
        'select3-selected': '_resultSelected'
    },

    /**
     * @inherit
     */
    filterResults: function(results) {

        return results.filter(function(item) {
            return !Select3.findById(this._data, item.id);
        }, this);
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

        if (this.options.showDropdown !== false) {
            this.open();
        }

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
        } else if (event.keyCode === Select3.Keys.BACKSPACE && !inputHasText) {
            this._backspacePressed();
        } else if (event.keyCode === Select3.Keys.DELETE && !inputHasText) {
            this._deletePressed();
        } else if (event.keyCode === Select3.Keys.ESCAPE) {
            this.close();
        } else {
            this._search();
        }

        this._updateInputWidth();

        return false;
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

            this._scrollToBottom();
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

        if (event.added || event.removed) {
            if (this.dropdown) {
                this.dropdown.showResults(this.filterResults(this.results), this.resultsOptions);
            }

            if (this.hasKeyboard) {
                this.focus();
            }
        }

        this.positionDropdown();

        $input.attr('placeholder', this._data.length ? '' : this.options.placeholder);
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

        var $inputContainer = this.$('.select3-multiple-input-container');
        $inputContainer.scrollTop($inputContainer.outerHeight());
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

        this.positionDropdown();
    }

});

Select3.Implementations.Multiple = MultipleSelect3;

module.exports = MultipleSelect3;

},{"./select3-base":4,"jquery":"jquery"}],9:[function(_dereq_,module,exports){
'use strict';

var $ = window.jQuery || window.Zepto;

var Select3 = _dereq_('./select3-base');

/**
 * SingleSelect3 Constructor.
 *
 * @param options Options object. Accepts all options from the Select3 Base Constructor.
 */
function SingleSelect3(options) {

    Select3.call(this, options);
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
    events: {},

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
    }

});

Select3.Implementations.Single = SingleSelect3;

module.exports = SingleSelect3;

},{"./select3-base":4,"jquery":"jquery"}],10:[function(_dereq_,module,exports){
'use strict';

var escape = _dereq_('./escape');

var Select3 = _dereq_('./select3-base');

_dereq_('./select3-locale');

/**
 * Default set of templates to use with Select3.
 *
 * Note that every template can be defined as either a string, a function returning a string (like
 * Handlebars templates, for instance) or as an object containing a render function (like Hogan.js
 * templates, for instance).
 */
Select3.Templates = {

    /**
     * Renders the dropdown.
     *
     * The template is expected to have at least one element with the class
     * 'select3-results-container', which is where all results will be added to.
     */
    dropdown: (
        '<div class="select3-dropdown">' +
            '<div class="select3-results-container"></div>' +
        '</div>'
    ),

    /**
     * Load more indicator.
     *
     * This template is expected to have an element with a 'select3-load-more' class which, when
     * clicked, will load more results.
     */
    loadMore: function() {
        return '<div class="select3-load-more">' + Select3.Locale.loadMore + '</div>';
    },

    /**
     * Renders multi-selection input boxes.
     *
     * The template is expected to have at least have elements with the following classes:
     * 'select3-multiple-input-container' - The element containing all the selected items and the
     *                                      input for selecting additional items.
     * 'select3-multiple-input' - The actual input element that allows the user to type to search
     *                            for more items. When selected items are added, they are inserted
     *                            right before this element.
     * 'select3-width-detector' - This element is optional, but important to make sure the
     *                            '.select3-multiple-input' element will fit in the container. The
     *                            width detector also has the 'select2-multiple-input' class on
     *                            purpose to be able to detect the width of text entered in the
     *                            input element.
     */
    multiSelectInput: (
        '<div class="select3-multiple-input-container">' +
            '<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" ' +
                   'class="select3-multiple-input">' +
            '<span class="select3-multiple-input select3-width-detector"></span>' +
            '<div class="clearfix"></div>' +
        '</div>'
    ),

    /**
     * Renders multi-selection input boxes.
     *
     * The template is expected to have a top-level element with the class 'select3-selected-item'.
     * This element is also required to have a 'data-item-id' attribute with the ID set to that
     * passed through the options object.
     *
     * An element with the class 'select3-item-remove' should be present which, when clicked, will
     * cause the element to be removed.
     *
     * @param options Options object containing the following properties:
     *                highlighted - Boolean whether this item is currently highlighted.
     *                id - Identifier for the item.
     *                text - Text label which the user sees.
     */
    multiSelectItem: function(options) {
        var extraClass = (options.highlighted ? ' highlighted' : '');
        return (
            '<span class="select3-selected-item' + extraClass + '" ' +
                  'data-item-id="' + escape(options.id) + '">' +
                '<a class="select3-selected-item-remove">' +
                    '<i class="fa fa-remove"></i>' +
                '</a>' +
                escape(options.text) +
            '</span>'
        );
    },

    /**
     * Render a result item in the dropdown.
     *
     * The template is expected to have a top-level element with the class 'select3-result-item'.
     * This element is also required to have a 'data-item-id' attribute with the ID set to that
     * passed through the options object.
     *
     * @param options Options object containing the following properties:
     *                id - Identifier for the item.
     *                text - Text label which the user sees.
     */
    resultItem: function(options) {
        return (
            '<div class="select3-result-item" data-item-id="' + escape(options.id) + '">' +
                escape(options.text) +
            '</div>'
        );
    }

};

},{"./escape":2,"./select3-base":4,"./select3-locale":7}]},{},[1]);
