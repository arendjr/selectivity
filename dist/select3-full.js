(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

require('./select3-base');
require('./select3-dropdown');
require('./select3-diacritics');
require('./select3-templates');

},{"./select3-base":3,"./select3-diacritics":4,"./select3-dropdown":5,"./select3-templates":8}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
'use strict';

var $ = window.jQuery || window.Zepto;

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

    /**
     * jQuery container for the element to which this instance is attached.
     */
    this.$el = $(options.element);

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

    },

    /**
     * Sets one or more options on this Select3 instance.
     *
     * @param options Options object. May contain one or more of the following properties:
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
     *                query - Function to use for fetching items.
     *                templates - Object with instance-specific templates to override the global
     *                            templates assigned to Select3.Templates.
     */
    setOptions: function(options) {

        this.options = options;

        function processItem(item) {
            if (item && Select3.isValidId(item.id)) {
                return item;
            } else if (Select3.isValidId(item)) {
                return { id: item, text: '' + item };
            } else {
                throw new Error('items array contains invalid items');
            }
        }

        $.each(options, function(key, value) {
            switch (key) {
            case 'initSelection':
                if ($.type(value) !== 'function') {
                    throw new Error('initSelection must be a function');
                }
                break;

            case 'items':
                if ($.type(value) === 'array') {
                    this.items = value.map(processItem);
                } else {
                    throw new Error('items must be an array');
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
                    }
                }.bind(this));
            } else {
                this._data = this.getDataForValue(newValue);
            }
        }
    }

});

/**
 * Dropdown class to use for displaying dropdowns.
 */
Select3.Dropdown = null;

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
    UP_ARROW: 38,
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
 * Static function that transforms text in order to find matches. The default implementation
 * casts all strings to lower-case so that any matches found will be case-insensitive.
 *
 * @param string The string to transform.
 *
 * @return The transformed string.
 */
Select3.transformText = function(string) {
    return string.toLowerCase();
};

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
 *                multiple - Boolean determining whether multiple items may be selected
 *                           (default: false). If true, a MultipleSelect3 instance is created,
 *                           otherwise a SingleSelect3 instance is created.
 *
 * @return If the given method returns a value, this method returns the value of that method
 *         executed on the first element in the set of matched elements.
 */
$.fn.select3 = function(methodName, options) {

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
                this.select3 = (options.multiple ? new (require('./select3-multiple'))(options)
                                                 : new (require('./select3-single'))(options));
            }
        }
    });

    return result;
};

module.exports = Select3;

},{"./select3-multiple":6,"./select3-single":7,"jquery":"jquery"}],4:[function(require,module,exports){
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

var Select3 = require('./select3-base');
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

},{"./select3-base":3}],5:[function(require,module,exports){
'use strict';

var $ = window.jQuery || window.Zepto;

var Select3 = require('./select3-base');

/**
 * Select3 Dropdown Constructor.
 *
 * @param options Options object. Accepts all options from the Select3 Base Constructor.
 */
function Select3Dropdown(options) {

    Select3.call(this, options);
}

/**
 * Methods.
 */
$.extend(Select3Dropdown.prototype, {



});

Select3.Dropdown = Select3Dropdown;

module.exports = Select3Dropdown;

},{"./select3-base":3,"jquery":"jquery"}],6:[function(require,module,exports){
'use strict';

var $ = window.jQuery || window.Zepto;

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
                            this._data.push(this.validateItem(data[0]));
                        }
                    }.bind(this));
                } else {
                    this._data.push(this.getItemForId(item));
                }
            }
        } else {
            item = this.validateItem(item);
            if (this._value.indexOf(item.id) === -1) {
                this._data.push(item);
                this._value.push(item.id);
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
        'click .select3-item-remove': '_itemRemoveClicked',
        'click .select3-selected-item': '_itemClicked',
        'focus .select3-selected-item': '_focused',
        'keyup .select3-multiple-input': '_keyReleased',
        'paste .select3-multiple-input': function() {
            setTimeout(this.search.bind(this), 10);
        }
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

        var index = Select3.findIndexById(this.items, id);
        if (index > -1) {
            this._data.splice(index, 1);
        }

        index = this._value.indexOf(id);
        if (index > -1) {
            this._value.splice(index, 1);
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

    _backspacePressed: function() {

        if (this._highlightedItemId) {
            this._deletePressed();
        } else if (this._value.length) {
            this._highlightItem(this._value.slice(-1)[0]);
        }
    },

    _deletePressed: function() {

        if (this._highlightedItemId) {
            this.remove(this._highlightedItemId);

            this.$el.trigger('change');
        }
    },

    _focused: function() {

        if (this.options.showDropdown) {
            this.open();
        }
    },

    _getInput: function() {

        return this.$('.select3-multiple-input:not(.select3-width-detector)');
    },

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

    _highlightItem: function(id) {

        this._highlightedItemId = id;
        this.$('.select3-selected-item').removeClass('highlighted')
            .filter('[data-item-id=' + Select3.quoteCssAttr(id) + ']').addClass('highlighted');

        if (this.hasKeyboard) {
            this.focus();
        }
    },

    _itemClicked: function(event) {

        this._highlightItem(this._getItemId(event));
    },

    _itemRemoveClicked: function(event) {

        this.remove(this._getItemId(event));

        return false;
    },

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

    _rerenderSelection: function() {

        this.$('.select3-selected-item').remove();

        var $input = this._getInput();
        this._data.forEach(function(item) {
            $input.before(this.template('multiSelectItem', $.extend({
                highlighted: (item.id === this._highlightedItemId)
            }, item)));
        }, this);
    },

    _search: function() {

        this.search(this._getInput().val());
    },

    _updateInputWidth: function() {

        var $input = this._getInput(), $widthDetector = this.$('.select3-width-detector');
        $widthDetector.text($input.val() || this._data.length && this.options.placeholder || '');
        $input.width($widthDetector.width() + 20);
    }

});

module.exports = MultipleSelect3;

},{"./select3-base":3,"jquery":"jquery"}],7:[function(require,module,exports){
'use strict';

var $ = window.jQuery || window.Zepto;

var Select3 = require('./select3-base');

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

module.exports = SingleSelect3;

},{"./select3-base":3,"jquery":"jquery"}],8:[function(require,module,exports){
'use strict';

var escape = require('./escape');

var Select3 = require('./select3-base');

/**
 * Default set of templates to use with Select3.
 *
 * Note that every template can be defined as either a string, a function returning a string (like
 * Handlebars templates, for instance) or as an object containing a render function (like Hogan.js
 * templates, for instance).
 */
Select3.Templates = {

    /**
     * Renders multi-selection input boxes.
     *
     * The template is expected to have at least have elements with the following classes:
     * 'select3-multiple-input' - The actual input element that allows the user to type to search
     *                            for more items. When selected items are added, they are inserted
     *                            right before this element.
     * 'select3-width-detector' - This element is optional, but important to make sure the
     *                            '.select3-multiple-input' element will fit in the container. The
     *                            width detector also has the 'select2-multiple-input' class on
     *                            purpose to be able to detect the width of text entered in the
     *                            input element.
     *
     * @param options Options object containing the following property:
     *                placeholder - String containing the placeholder text to display if no items
     *                              are selected. May be empty if no placeholder is defined.
     */
    multiSelectInput: function(options) {
        return (
            '<div class="select3-multiple-input-container">' +
                '<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" ' +
                       'class="select3-multiple-input" ' +
                       'placeholder="' + escape(options.placeholder) + '">' +
                '<span class="select3-multiple-input select3-width-detector"></span>' +
                '<div class="clearfix"></div>' +
            '</div>'
        );
    },

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
                escape(options.text) +
                '<a class="select3-item-remove">' +
                    '<i class="fa fa-remove"></i>' +
                '</a>' +
            '</span>'
        );
    }

};

},{"./escape":2,"./select3-base":3}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2VsZWN0My1mdWxsLmpzIiwic3JjL2VzY2FwZS5qcyIsInNyYy9zZWxlY3QzLWJhc2UuanMiLCJzcmMvc2VsZWN0My1kaWFjcml0aWNzLmpzIiwic3JjL3NlbGVjdDMtZHJvcGRvd24uanMiLCJzcmMvc2VsZWN0My1tdWx0aXBsZS5qcyIsInNyYy9zZWxlY3QzLXNpbmdsZS5qcyIsInNyYy9zZWxlY3QzLXRlbXBsYXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDemdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzkxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuL3NlbGVjdDMtYmFzZScpO1xucmVxdWlyZSgnLi9zZWxlY3QzLWRyb3Bkb3duJyk7XG5yZXF1aXJlKCcuL3NlbGVjdDMtZGlhY3JpdGljcycpO1xucmVxdWlyZSgnLi9zZWxlY3QzLXRlbXBsYXRlcycpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG52YXIgaHRtbEVzY2FwZXMgPSB7XG4gICAgJyYnOiAnJmFtcDsnLFxuICAgICc8JzogJyZsdDsnLFxuICAgICc+JzogJyZndDsnLFxuICAgICdcIic6ICcmcXVvdDsnLFxuICAgIFwiJ1wiOiAnJiMzOTsnXG59O1xuXG4vKipcbiAqIFVzZWQgYnkgYGVzY2FwZWAgdG8gY29udmVydCBjaGFyYWN0ZXJzIHRvIEhUTUwgZW50aXRpZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBtYXRjaCBUaGUgbWF0Y2hlZCBjaGFyYWN0ZXIgdG8gZXNjYXBlLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgZXNjYXBlZCBjaGFyYWN0ZXIuXG4gKi9cbmZ1bmN0aW9uIGVzY2FwZUh0bWxDaGFyKG1hdGNoKSB7XG4gICAgcmV0dXJuIGh0bWxFc2NhcGVzW21hdGNoXTtcbn1cblxudmFyIHJlVW5lc2NhcGVkSHRtbCA9IG5ldyBSZWdFeHAoJ1snICsgT2JqZWN0LmtleXMoaHRtbEVzY2FwZXMpLmpvaW4oJycpICsgJ10nLCAnZycpO1xuXG4vKipcbiAqIENvbnZlcnRzIHRoZSBjaGFyYWN0ZXJzIGAmYCwgYDxgLCBgPmAsIGBcImAsIGFuZCBgJ2AgaW4gYHN0cmluZ2AgdG8gdGhlaXJcbiAqIGNvcnJlc3BvbmRpbmcgSFRNTCBlbnRpdGllcy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBUaGUgc3RyaW5nIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgc3RyaW5nLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmVzY2FwZSgnRnJlZCwgV2lsbWEsICYgUGViYmxlcycpO1xuICogLy8gPT4gJ0ZyZWQsIFdpbG1hLCAmYW1wOyBQZWJibGVzJ1xuICovXG5mdW5jdGlvbiBlc2NhcGUoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZyA/IFN0cmluZyhzdHJpbmcpLnJlcGxhY2UocmVVbmVzY2FwZWRIdG1sLCBlc2NhcGVIdG1sQ2hhcikgOiAnJztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlc2NhcGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5cbi8qKlxuICogU2VsZWN0MyBCYXNlIENvbnN0cnVjdG9yLlxuICpcbiAqIFlvdSB3aWxsIG5ldmVyIHVzZSB0aGlzIGNvbnN0cnVjdG9yIGRpcmVjdGx5LiBJbnN0ZWFkLCB5b3UgdXNlICQoc2VsZWN0b3IpLnNlbGVjdDMob3B0aW9ucykgdG9cbiAqIGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiBlaXRoZXIgTXVsdGlwbGVTZWxlY3QzIG9yIFNpbmdsZVNlbGVjdDMuIFRoaXMgY2xhc3MgZGVmaW5lcyBhbGxcbiAqIGZ1bmN0aW9uYWxpdHkgdGhhdCBpcyBjb21tb24gYmV0d2VlbiBib3RoLlxuICpcbiAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgb2JqZWN0LiBBY2NlcHRzIHRoZSBzYW1lIG9wdGlvbnMgYXMgdGhlIHNldE9wdGlvbnMgbWV0aG9kKCksIGluIGFkZGl0aW9uXG4gKiAgICAgICAgICAgICAgICB0byB0aGUgZm9sbG93aW5nIG9uZXM6XG4gKiAgICAgICAgICAgICAgICBkYXRhIC0gSW5pdGlhbCBzZWxlY3Rpb24gZGF0YSB0byBzZXQuIFRoaXMgc2hvdWxkIGJlIGFuIGFycmF5IG9mIG9iamVjdHMgd2l0aCAnaWQnXG4gKiAgICAgICAgICAgICAgICAgICAgICAgYW5kICd0ZXh0JyBwcm9wZXJ0aWVzLiBUaGlzIG9wdGlvbiBpcyBtdXR1YWxseSBleGNsdXNpdmUgd2l0aCAndmFsdWUnLlxuICogICAgICAgICAgICAgICAgZWxlbWVudCAtIFRoZSBET00gZWxlbWVudCB0byB3aGljaCB0byBhdHRhY2ggdGhlIFNlbGVjdDMgaW5zdGFuY2UuIFRoaXMgcHJvcGVydHlcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICBpcyBzZXQgYXV0b21hdGljYWxseSBieSB0aGUgJC5mbi5zZWxlY3QzKCkgZnVuY3Rpb24uXG4gKiAgICAgICAgICAgICAgICB2YWx1ZSAtIEluaXRpYWwgdmFsdWUgdG8gc2V0LiBUaGlzIHNob3VsZCBiZSBhbiBhcnJheSBvZiBJRHMuIFRoaXMgcHJvcGVydHkgaXNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgbXV0dWFsbHkgZXhjbHVzaXZlIHdpdGggJ2RhdGEnLlxuICovXG5mdW5jdGlvbiBTZWxlY3QzKG9wdGlvbnMpIHtcblxuICAgIC8qKlxuICAgICAqIGpRdWVyeSBjb250YWluZXIgZm9yIHRoZSBlbGVtZW50IHRvIHdoaWNoIHRoaXMgaW5zdGFuY2UgaXMgYXR0YWNoZWQuXG4gICAgICovXG4gICAgdGhpcy4kZWwgPSAkKG9wdGlvbnMuZWxlbWVudCk7XG5cbiAgICAvKipcbiAgICAgKiBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnRseSBvcGVuIGRyb3Bkb3duLlxuICAgICAqL1xuICAgIHRoaXMuZHJvcGRvd24gPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQm9vbGVhbiB3aGV0aGVyIHRoZSBicm93c2VyIGhhcyB0b3VjaCBpbnB1dC5cbiAgICAgKi9cbiAgICB0aGlzLmhhc1RvdWNoID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmICdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdyk7XG5cbiAgICAvKipcbiAgICAgKiBCb29sZWFuIHdoZXRoZXIgdGhlIGJyb3dzZXIgaGFzIGEgcGh5c2ljYWwga2V5Ym9hcmQgYXR0YWNoZWQgdG8gaXQuXG4gICAgICpcbiAgICAgKiBHaXZlbiB0aGF0IHRoZXJlIGlzIG5vIHdheSBmb3IgSmF2YVNjcmlwdCB0byByZWxpYWJseSBkZXRlY3QgdGhpcyB5ZXQsIHdlIGp1c3QgYXNzdW1lIGl0J3NcbiAgICAgKiB0aGUgb3Bwb3NpdGUgb2YgaGFzVG91Y2ggZm9yIG5vdy5cbiAgICAgKi9cbiAgICB0aGlzLmhhc0tleWJvYXJkID0gIXRoaXMuaGFzVG91Y2g7XG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBvZiBpdGVtcyBmcm9tIHdoaWNoIHRvIHNlbGVjdC4gSWYgc2V0LCB0aGlzIHdpbGwgYmUgYW4gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoICdpZCcgYW5kXG4gICAgICogJ3RleHQnIHByb3BlcnRpZXMuXG4gICAgICpcbiAgICAgKiBJZiBnaXZlbiwgYWxsIGl0ZW1zIGFyZSBleHBlY3RlZCB0byBiZSBhdmFpbGFibGUgbG9jYWxseSBhbmQgYWxsIHNlbGVjdGlvbiBvcGVyYXRpb25zIG9wZXJhdGVcbiAgICAgKiBvbiB0aGlzIGxvY2FsIGFycmF5IG9ubHkuIElmIG51bGwsIGl0ZW1zIGFyZSBub3QgYXZhaWxhYmxlIGxvY2FsbHksIGFuZCBhIHF1ZXJ5IGZ1bmN0aW9uXG4gICAgICogc2hvdWxkIGJlIHByb3ZpZGVkIHRvIGZldGNoIHJlbW90ZSBkYXRhLlxuICAgICAqL1xuICAgIHRoaXMuaXRlbXMgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogUmVzdWx0cyBmcm9tIGEgc2VhcmNoIHF1ZXJ5LlxuICAgICAqL1xuICAgIHRoaXMucmVzdWx0cyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGN1cnJlbnRseSBoaWdobGlnaHRlZCByZXN1bHQuXG4gICAgICovXG4gICAgdGhpcy5oaWdobGlnaHRlZFJlc3VsdCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBNYXBwaW5nIG9mIHRlbXBsYXRlcy5cbiAgICAgKlxuICAgICAqIEN1c3RvbSB0ZW1wbGF0ZXMgY2FuIGJlIHNwZWNpZmllZCBpbiB0aGUgb3B0aW9ucyBvYmplY3QuXG4gICAgICovXG4gICAgdGhpcy50ZW1wbGF0ZXMgPSAkLmV4dGVuZCh7fSwgU2VsZWN0My5UZW1wbGF0ZXMpO1xuXG4gICAgdGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgaWYgKG9wdGlvbnMudmFsdWUpIHtcbiAgICAgICAgdGhpcy52YWx1ZShvcHRpb25zLnZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRhdGEob3B0aW9ucy5kYXRhIHx8IG51bGwpO1xuICAgIH1cblxuICAgIHRoaXMuX2V2ZW50cyA9IFtdO1xuXG4gICAgdGhpcy5kZWxlZ2F0ZUV2ZW50cygpO1xufVxuXG4vKipcbiAqIE1ldGhvZHMuXG4gKi9cbiQuZXh0ZW5kKFNlbGVjdDMucHJvdG90eXBlLCB7XG5cbiAgICAvKipcbiAgICAgKiBDb252ZW5pZW5jZSBzaG9ydGN1dCBmb3IgdGhpcy4kZWwuZmluZChzZWxlY3RvcikuXG4gICAgICovXG4gICAgJDogZnVuY3Rpb24oc2VsZWN0b3IpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy4kZWwuZmluZChzZWxlY3Rvcik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsb3NlcyB0aGUgZHJvcGRvd24uXG4gICAgICovXG4gICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldHMgb3IgZ2V0cyB0aGUgc2VsZWN0aW9uIGRhdGEuXG4gICAgICpcbiAgICAgKiBUaGUgc2VsZWN0aW9uIGRhdGEgY29udGFpbnMgYm90aCBJRHMgYW5kIHRleHQgbGFiZWxzLiBJZiB5b3Ugb25seSB3YW50IHRvIHNldCBvciBnZXQgdGhlIElEcyxcbiAgICAgKiB5b3Ugc2hvdWxkIHVzZSB0aGUgdmFsdWUoKSBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbmV3RGF0YSBPcHRpb25hbCBuZXcgZGF0YSB0byBzZXQuIEZvciBhIE11bHRpcGxlU2VsZWN0MyBpbnN0YW5jZSB0aGUgZGF0YSBtdXN0IGJlXG4gICAgICogICAgICAgICAgICAgICAgYW4gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoICdpZCcgYW5kICd0ZXh0JyBwcm9wZXJ0aWVzLCBmb3IgYSBTaW5nbGVTZWxlY3QzXG4gICAgICogICAgICAgICAgICAgICAgaW5zdGFuY2UgdGhlIGRhdGEgbXVzdCBiZSBhIHNpbmdsZSBzdWNoIG9iamVjdCBvciBudWxsIHRvIGluZGljYXRlIG5vIGl0ZW0gaXNcbiAgICAgKiAgICAgICAgICAgICAgICBzZWxlY3RlZC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gSWYgbmV3RGF0YSBpcyBvbWl0dGVkLCB0aGlzIG1ldGhvZCByZXR1cm5zIHRoZSBjdXJyZW50IGRhdGEuXG4gICAgICovXG4gICAgZGF0YTogZnVuY3Rpb24obmV3RGF0YSkge1xuXG4gICAgICAgIGlmICgkLnR5cGUobmV3RGF0YSkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGF0YTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ld0RhdGEgPSB0aGlzLnZhbGlkYXRlRGF0YShuZXdEYXRhKTtcblxuICAgICAgICAgICAgdGhpcy5fZGF0YSA9IG5ld0RhdGE7XG4gICAgICAgICAgICB0aGlzLl92YWx1ZSA9IHRoaXMuZ2V0VmFsdWVGb3JEYXRhKG5ld0RhdGEpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaGVzIGFsbCBsaXN0ZW5lcnMgZnJvbSB0aGUgZXZlbnRzIG1hcCB0byB0aGUgaW5zdGFuY2UncyBlbGVtZW50LlxuICAgICAqXG4gICAgICogTm9ybWFsbHksIHlvdSBzaG91bGQgbm90IGhhdmUgdG8gY2FsbCB0aGlzIG1ldGhvZCB5b3Vyc2VsZiBhcyBpdCdzIGNhbGxlZCBhdXRvbWF0aWNhbGx5IGluXG4gICAgICogdGhlIGNvbnN0cnVjdG9yLlxuICAgICAqL1xuICAgIGRlbGVnYXRlRXZlbnRzOiBmdW5jdGlvbigpIHtcblxuICAgICAgICB0aGlzLnVuZGVsZWdhdGVFdmVudHMoKTtcblxuICAgICAgICAkLmVhY2godGhpcy5ldmVudHMsIGZ1bmN0aW9uKGV2ZW50LCBsaXN0ZW5lcikge1xuICAgICAgICAgICAgdmFyIHNlbGVjdG9yLCBpbmRleCA9IGV2ZW50LmluZGV4T2YoJyAnKTtcbiAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBldmVudC5zbGljZShpbmRleCArIDEpO1xuICAgICAgICAgICAgICAgIGV2ZW50ID0gZXZlbnQuc2xpY2UoMCwgaW5kZXgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoJC50eXBlKGxpc3RlbmVyKSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lciA9IHRoaXNbbGlzdGVuZXJdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsaXN0ZW5lciA9IGxpc3RlbmVyLmJpbmQodGhpcyk7XG5cbiAgICAgICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsLm9uKGV2ZW50LCBzZWxlY3RvciwgbGlzdGVuZXIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5vbihldmVudCwgbGlzdGVuZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9ldmVudHMucHVzaCh7IGV2ZW50OiBldmVudCwgc2VsZWN0b3I6IHNlbGVjdG9yLCBsaXN0ZW5lcjogbGlzdGVuZXIgfSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERlc3Ryb3lzIHRoZSBTZWxlY3QzIGluc3RhbmNlLlxuICAgICAqL1xuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHRoaXMudW5kZWxlZ2F0ZUV2ZW50cygpO1xuXG4gICAgICAgIHZhciAkZWwgPSB0aGlzLiRlbDtcbiAgICAgICAgJGVsLmNoaWxkcmVuKCkucmVtb3ZlKCk7XG4gICAgICAgICRlbFswXS5zZWxlY3QzID0gbnVsbDtcbiAgICAgICAgJGVsID0gbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgY29ycmVjdCBpdGVtIGZvciBhIGdpdmVuIElELlxuICAgICAqXG4gICAgICogQHBhcmFtIGlkIFRoZSBJRCB0byBnZXQgdGhlIGl0ZW0gZm9yLlxuICAgICAqXG4gICAgICogQHJldHVybiBUaGUgY29ycmVzcG9uZGluZyBpdGVtLiBXaWxsIGJlIGFuIG9iamVjdCB3aXRoICdpZCcgYW5kICd0ZXh0JyBwcm9wZXJ0aWVzIG9yIG51bGwgaWZcbiAgICAgKiAgICAgICAgIHRoZSBpdGVtIGNhbm5vdCBiZSBmb3VuZC4gTm90ZSB0aGF0IGlmIG5vIGl0ZW1zIGFyZSBkZWZpbmVkLCB0aGlzIG1ldGhvZCBhc3N1bWVzIHRoZVxuICAgICAqICAgICAgICAgdGV4dCBsYWJlbHMgd2lsbCBiZSBlcXVhbCB0byB0aGUgSURzLlxuICAgICAqL1xuICAgIGdldEl0ZW1Gb3JJZDogZnVuY3Rpb24oaWQpIHtcblxuICAgICAgICB2YXIgaXRlbXMgPSB0aGlzLml0ZW1zO1xuICAgICAgICBpZiAoaXRlbXMpIHtcbiAgICAgICAgICAgIHJldHVybiBTZWxlY3QzLmZpbmRCeUlkKGl0ZW1zLCBpZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4geyBpZDogaWQsIHRleHQ6ICcnICsgaWQgfTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPcGVucyB0aGUgZHJvcGRvd24uXG4gICAgICovXG4gICAgb3BlbjogZnVuY3Rpb24oKSB7XG5cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0cyBvbmUgb3IgbW9yZSBvcHRpb25zIG9uIHRoaXMgU2VsZWN0MyBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgb2JqZWN0LiBNYXkgY29udGFpbiBvbmUgb3IgbW9yZSBvZiB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gICAgICogICAgICAgICAgICAgICAgaW5pdFNlbGVjdGlvbiAtIEZ1bmN0aW9uIHRvIG1hcCB2YWx1ZXMgYnkgSUQgdG8gc2VsZWN0aW9uIGRhdGEuIFRoaXMgZnVuY3Rpb25cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjZWl2ZXMgdHdvIGFyZ3VtZW50cywgJ3ZhbHVlJyBhbmQgJ2NhbGxiYWNrJy4gVGhlIHZhbHVlIGlzXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBzZWxlY3Rpb24sIHdoaWNoIGlzIGFuIElEIG9yIGFuIGFycmF5XG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mIElEcyBkZXBlbmRpbmcgb24gdGhlIGlucHV0IHR5cGUuIFRoZSBjYWxsYmFjayBzaG91bGQgYmVcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW52b2tlZCB3aXRoIGFuIG9iamVjdCBvciBhcnJheSBvZiBvYmplY3RzLCByZXNwZWN0aXZlbHksXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5pbmcgJ2lkJyBhbmQgJ3RleHQnIHByb3BlcnRpZXMuXG4gICAgICogICAgICAgICAgICAgICAgaXRlbXMgLSBBcnJheSBvZiBpdGVtcyBmcm9tIHdoaWNoIHRvIHNlbGVjdC4gU2hvdWxkIGJlIGFuIGFycmF5IG9mIG9iamVjdHNcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgIHdpdGggJ2lkJyBhbmQgJ3RleHQnIHByb3BlcnRpZXMuIEFzIGNvbnZlbmllbmNlLCB5b3UgbWF5IGFsc28gcGFzcyBhblxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgYXJyYXkgb2Ygc3RyaW5ncywgaW4gd2hpY2ggY2FzZSB0aGUgc2FtZSBzdHJpbmcgaXMgdXNlZCBmb3IgYm90aCB0aGVcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICdpZCcgYW5kICd0ZXh0JyBwcm9wZXJ0aWVzLiBJZiBpdGVtcyBhcmUgZ2l2ZW4sIGFsbCBpdGVtcyBhcmUgZXhwZWN0ZWRcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgIHRvIGJlIGF2YWlsYWJsZSBsb2NhbGx5IGFuZCBhbGwgc2VsZWN0aW9uIG9wZXJhdGlvbnMgb3BlcmF0ZSBvbiB0aGlzXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICBsb2NhbCBhcnJheSBvbmx5LiBJZiBudWxsLCBpdGVtcyBhcmUgbm90IGF2YWlsYWJsZSBsb2NhbGx5LCBhbmQgYVxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnkgZnVuY3Rpb24gc2hvdWxkIGJlIHByb3ZpZGVkIHRvIGZldGNoIHJlbW90ZSBkYXRhLlxuICAgICAqICAgICAgICAgICAgICAgIHF1ZXJ5IC0gRnVuY3Rpb24gdG8gdXNlIGZvciBmZXRjaGluZyBpdGVtcy5cbiAgICAgKiAgICAgICAgICAgICAgICB0ZW1wbGF0ZXMgLSBPYmplY3Qgd2l0aCBpbnN0YW5jZS1zcGVjaWZpYyB0ZW1wbGF0ZXMgdG8gb3ZlcnJpZGUgdGhlIGdsb2JhbFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlcyBhc3NpZ25lZCB0byBTZWxlY3QzLlRlbXBsYXRlcy5cbiAgICAgKi9cbiAgICBzZXRPcHRpb25zOiBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuICAgICAgICBmdW5jdGlvbiBwcm9jZXNzSXRlbShpdGVtKSB7XG4gICAgICAgICAgICBpZiAoaXRlbSAmJiBTZWxlY3QzLmlzVmFsaWRJZChpdGVtLmlkKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChTZWxlY3QzLmlzVmFsaWRJZChpdGVtKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IGlkOiBpdGVtLCB0ZXh0OiAnJyArIGl0ZW0gfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpdGVtcyBhcnJheSBjb250YWlucyBpbnZhbGlkIGl0ZW1zJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAkLmVhY2gob3B0aW9ucywgZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgIGNhc2UgJ2luaXRTZWxlY3Rpb24nOlxuICAgICAgICAgICAgICAgIGlmICgkLnR5cGUodmFsdWUpICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW5pdFNlbGVjdGlvbiBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ2l0ZW1zJzpcbiAgICAgICAgICAgICAgICBpZiAoJC50eXBlKHZhbHVlKSA9PT0gJ2FycmF5Jykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zID0gdmFsdWUubWFwKHByb2Nlc3NJdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2l0ZW1zIG11c3QgYmUgYW4gYXJyYXknKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ3F1ZXJ5JzpcbiAgICAgICAgICAgICAgICBpZiAoJC50eXBlKHZhbHVlKSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3F1ZXJ5IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAndGVtcGxhdGVzJzpcbiAgICAgICAgICAgICAgICB0aGlzLnRlbXBsYXRlcyA9ICQuZXh0ZW5kKHt9LCB0aGlzLnRlbXBsYXRlcywgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSByZXN1bHQgb2YgdGhlIGdpdmVuIHRlbXBsYXRlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHRlbXBsYXRlTmFtZSBOYW1lIG9mIHRoZSB0ZW1wbGF0ZSB0byBwcm9jZXNzLlxuICAgICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgdG8gcGFzcyB0byB0aGUgdGVtcGxhdGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIFN0cmluZyBjb250YWluaW5nIEhUTUwuXG4gICAgICovXG4gICAgdGVtcGxhdGU6IGZ1bmN0aW9uKHRlbXBsYXRlTmFtZSwgb3B0aW9ucykge1xuXG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGVzW3RlbXBsYXRlTmFtZV07XG4gICAgICAgIGlmICh0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgaWYgKCQudHlwZSh0ZW1wbGF0ZSkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGVtcGxhdGUob3B0aW9ucyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRlbXBsYXRlLnJlbmRlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZS5yZW5kZXIob3B0aW9ucyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZS50b1N0cmluZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHRlbXBsYXRlOiAnICsgdGVtcGxhdGVOYW1lKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEZXRhY2hlcyBhbGwgbGlzdGVuZXJzIGZyb20gdGhlIGV2ZW50cyBtYXAgZnJvbSB0aGUgaW5zdGFuY2UncyBlbGVtZW50LlxuICAgICAqXG4gICAgICogTm9ybWFsbHksIHlvdSBzaG91bGQgbm90IGhhdmUgdG8gY2FsbCB0aGlzIG1ldGhvZCB5b3Vyc2VsZiBhcyBpdCdzIGNhbGxlZCBhdXRvbWF0aWNhbGx5IGluXG4gICAgICogdGhlIGRlc3Ryb3koKSBtZXRob2QuXG4gICAgICovXG4gICAgdW5kZWxlZ2F0ZUV2ZW50czogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdGhpcy5fZXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5zZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsLm9mZihldmVudC5ldmVudCwgZXZlbnQuc2VsZWN0b3IsIGV2ZW50Lmxpc3RlbmVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwub2ZmKGV2ZW50LmV2ZW50LCBldmVudC5saXN0ZW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuX2V2ZW50cyA9IFtdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG9ydGhhbmQgZm9yIHZhbHVlKCkuXG4gICAgICovXG4gICAgdmFsOiBmdW5jdGlvbihuZXdWYWx1ZSkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlKG5ld1ZhbHVlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVmFsaWRhdGVzIGEgc2luZ2xlIGl0ZW0uIFRocm93cyBhbiBleGNlcHRpb24gaWYgdGhlIGl0ZW0gaXMgaW52YWxpZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBpdGVtIFRoZSBpdGVtIHRvIHZhbGlkYXRlLlxuICAgICAqXG4gICAgICogQHJldHVybiBUaGUgdmFsaWRhdGVkIGl0ZW0uIE1heSBkaWZmZXIgZnJvbSB0aGUgaW5wdXQgaXRlbS5cbiAgICAgKi9cbiAgICB2YWxpZGF0ZUl0ZW06IGZ1bmN0aW9uKGl0ZW0pIHtcblxuICAgICAgICBpZiAoaXRlbSAmJiBTZWxlY3QzLmlzVmFsaWRJZChpdGVtLmlkKSAmJiAkLnR5cGUoaXRlbS50ZXh0KSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJdGVtIHNob3VsZCBoYXZlIGlkIChudW1iZXIgb3Igc3RyaW5nKSBhbmQgdGV4dCAoc3RyaW5nKSBwcm9wZXJ0aWVzJyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0cyBvciBnZXRzIHRoZSB2YWx1ZSBvZiB0aGUgc2VsZWN0aW9uLlxuICAgICAqXG4gICAgICogVGhlIHZhbHVlIG9mIHRoZSBzZWxlY3Rpb24gb25seSBjb25jZXJucyB0aGUgSURzIG9mIHRoZSBzZWxlY3Rpb24gaXRlbXMuIElmIHlvdSBhcmVcbiAgICAgKiBpbnRlcmVzdGVkIGluIHRoZSBJRHMgYW5kIHRoZSB0ZXh0IGxhYmVscywgeW91IHNob3VsZCB1c2UgdGhlIGRhdGEoKSBtZXRob2QuXG4gICAgICpcbiAgICAgKiBOb3RlIHRoYXQgaWYgbmVpdGhlciB0aGUgaXRlbXMgb3B0aW9uIG5vciB0aGUgaW5pdFNlbGVjdGlvbiBvcHRpb24gaGF2ZSBiZWVuIHNldCwgU2VsZWN0M1xuICAgICAqIHdpbGwgaGF2ZSBubyB3YXkgdG8gZGV0ZXJtaW5lIHdoYXQgdGV4dCBsYWJlbHMgc2hvdWxkIGJlIHVzZWQgd2l0aCB0aGUgZ2l2ZW4gSURzIGluIHdoaWNoXG4gICAgICogY2FzZSBpdCB3aWxsIGFzc3VtZSB0aGUgdGV4dCBpcyBlcXVhbCB0byB0aGUgSUQuIFRoaXMgaXMgdXNlZnVsIGlmIHlvdSdyZSB3b3JraW5nIHdpdGggdGFncyxcbiAgICAgKiBvciBzZWxlY3RpbmcgZS1tYWlsIGFkZHJlc3NlcyBmb3IgaW5zdGFuY2UsIGJ1dCBtYXkgbm90IGFsd2F5cyBiZSB3aGF0IHlvdSB3YW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlIE9wdGlvbmFsIG5ldyB2YWx1ZSB0byBzZXQuIEZvciBhIE11bHRpcGxlU2VsZWN0MyBpbnN0YW5jZSB0aGUgdmFsdWUgbXVzdCBiZVxuICAgICAqICAgICAgICAgICAgICAgICBhbiBhcnJheSBvZiBJRHMsIGZvciBhIFNpbmdsZVNlbGVjdDMgaW5zdGFuY2UgdGhlIHZhbHVlIG11c3QgYmUgYSBzaW5nbGUgSURcbiAgICAgKiAgICAgICAgICAgICAgICAgKGEgc3RyaW5nIG9yIGEgbnVtYmVyKSBvciBudWxsIHRvIGluZGljYXRlIG5vIGl0ZW0gaXMgc2VsZWN0ZWQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIElmIG5ld1ZhbHVlIGlzIG9taXR0ZWQsIHRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGN1cnJlbnQgdmFsdWUuXG4gICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XG5cbiAgICAgICAgaWYgKCQudHlwZShuZXdWYWx1ZSkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdWYWx1ZSA9IHRoaXMudmFsaWRhdGVWYWx1ZShuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgIHRoaXMuX3ZhbHVlID0gbmV3VmFsdWU7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaW5pdFNlbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5pbml0U2VsZWN0aW9uKG5ld1ZhbHVlLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl92YWx1ZSA9PT0gbmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLnZhbGlkYXRlRGF0YShkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLmdldERhdGFGb3JWYWx1ZShuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbn0pO1xuXG4vKipcbiAqIERyb3Bkb3duIGNsYXNzIHRvIHVzZSBmb3IgZGlzcGxheWluZyBkcm9wZG93bnMuXG4gKi9cblNlbGVjdDMuRHJvcGRvd24gPSBudWxsO1xuXG4vKipcbiAqIE1hcHBpbmcgb2Yga2V5cy5cbiAqL1xuU2VsZWN0My5LZXlzID0ge1xuICAgIEJBQ0tTUEFDRTogOCxcbiAgICBERUxFVEU6IDQ2LFxuICAgIERPV05fQVJST1c6IDQwLFxuICAgIEVOVEVSOiAxMyxcbiAgICBFU0NBUEU6IDI3LFxuICAgIExFRlRfQVJST1c6IDM3LFxuICAgIFJJR0hUX0FSUk9XOiAzOSxcbiAgICBVUF9BUlJPVzogMzgsXG59O1xuXG4vKipcbiAqIE1hcHBpbmcgd2l0aCB0ZW1wbGF0ZXMgdG8gdXNlIGZvciByZW5kZXJpbmcgc2VsZWN0IGJveGVzIGFuZCBkcm9wZG93bnMuIFNlZSBzZWxlY3QzLXRlbXBsYXRlcy5qc1xuICogZm9yIGEgdXNlZnVsIHNldCBvZiBkZWZhdWx0IHRlbXBsYXRlcywgYXMgd2VsbCBhcyBmb3IgZG9jdW1lbnRhdGlvbiBvZiB0aGUgaW5kaXZpZHVhbCB0ZW1wbGF0ZXMuXG4gKi9cblNlbGVjdDMuVGVtcGxhdGVzID0ge307XG5cbi8qKlxuICogRmluZHMgYW4gaXRlbSBpbiB0aGUgZ2l2ZW4gYXJyYXkgd2l0aCB0aGUgc3BlY2lmaWVkIElELlxuICpcbiAqIEBwYXJhbSBhcnJheSBBcnJheSB0byBzZWFyY2ggaW4uXG4gKiBAcGFyYW0gaWQgSUQgdG8gc2VhcmNoIGZvci5cbiAqXG4gKiBAcmV0dXJuIFRoZSBpdGVtIGluIHRoZSBhcnJheSB3aXRoIHRoZSBnaXZlbiBJRCwgb3IgbnVsbCBpZiB0aGUgaXRlbSB3YXMgbm90IGZvdW5kLlxuICovXG5TZWxlY3QzLmZpbmRCeUlkID0gZnVuY3Rpb24oYXJyYXksIGlkKSB7XG5cbiAgICB2YXIgaW5kZXggPSBTZWxlY3QzLmZpbmRJbmRleEJ5SWQoYXJyYXksIGlkKTtcbiAgICByZXR1cm4gKGluZGV4ID4gLTEgPyBhcnJheVtpbmRleF0gOiBudWxsKTtcbn07XG5cbi8qKlxuICogRmluZHMgdGhlIGluZGV4IG9mIGFuIGl0ZW0gaW4gdGhlIGdpdmVuIGFycmF5IHdpdGggdGhlIHNwZWNpZmllZCBJRC5cbiAqXG4gKiBAcGFyYW0gYXJyYXkgQXJyYXkgdG8gc2VhcmNoIGluLlxuICogQHBhcmFtIGlkIElEIHRvIHNlYXJjaCBmb3IuXG4gKlxuICogQHJldHVybiBUaGUgaW5kZXggb2YgdGhlIGl0ZW0gaW4gdGhlIGFycmF5IHdpdGggdGhlIGdpdmVuIElELCBvciAtMSBpZiB0aGUgaXRlbSB3YXMgbm90IGZvdW5kLlxuICovXG5TZWxlY3QzLmZpbmRJbmRleEJ5SWQgPSBmdW5jdGlvbihhcnJheSwgaWQpIHtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcnJheS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYXJyYXlbaV0uaWQgPT09IGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG59O1xuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIGEgdmFsdWUgY2FuIGJlIHVzZWQgYXMgYSB2YWxpZCBJRCBmb3Igc2VsZWN0aW9uIGl0ZW1zLiBPbmx5IG51bWJlcnMgYW5kIHN0cmluZ3NcbiAqIGFyZSBhY2NlcHRlZCB0byBiZSB1c2VkIGFzIElEcy5cbiAqXG4gKiBAcGFyYW0gaWQgVGhlIHZhbHVlIHRvIGNoZWNrIHdoZXRoZXIgaXQgaXMgYSB2YWxpZCBJRC5cbiAqXG4gKiBAcmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIGlzIGEgdmFsaWQgSUQsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuU2VsZWN0My5pc1ZhbGlkSWQgPSBmdW5jdGlvbihpZCkge1xuXG4gICAgdmFyIHR5cGUgPSAkLnR5cGUoaWQpO1xuICAgIHJldHVybiB0eXBlID09PSAnbnVtYmVyJyB8fCB0eXBlID09PSAnc3RyaW5nJztcbn07XG5cbi8qKlxuICogUXVvdGVzIGEgc3RyaW5nIHNvIGl0IGNhbiBiZSB1c2VkIGluIGEgQ1NTIGF0dHJpYnV0ZSBzZWxlY3Rvci4gSXQgYWRkcyBkb3VibGUgcXVvdGVzIHRvIHRoZVxuICogc3RyaW5nIGFuZCBlc2NhcGVzIGFsbCBvY2N1cnJlbmNlcyBvZiB0aGUgcXVvdGUgY2hhcmFjdGVyIGluc2lkZSB0aGUgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSBzdHJpbmcgVGhlIHN0cmluZyB0byBxdW90ZS5cbiAqXG4gKiBAcmV0dXJuIFRoZSBxdW90ZWQgc3RyaW5nLlxuICovXG5TZWxlY3QzLnF1b3RlQ3NzQXR0ciA9IGZ1bmN0aW9uKHN0cmluZykge1xuXG4gICAgcmV0dXJuICdcIicgKyAoJycgKyBzdHJpbmcpLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJykucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpICsgJ1wiJztcbn07XG5cbi8qKlxuICogU3RhdGljIGZ1bmN0aW9uIHRoYXQgdHJhbnNmb3JtcyB0ZXh0IGluIG9yZGVyIHRvIGZpbmQgbWF0Y2hlcy4gVGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb25cbiAqIGNhc3RzIGFsbCBzdHJpbmdzIHRvIGxvd2VyLWNhc2Ugc28gdGhhdCBhbnkgbWF0Y2hlcyBmb3VuZCB3aWxsIGJlIGNhc2UtaW5zZW5zaXRpdmUuXG4gKlxuICogQHBhcmFtIHN0cmluZyBUaGUgc3RyaW5nIHRvIHRyYW5zZm9ybS5cbiAqXG4gKiBAcmV0dXJuIFRoZSB0cmFuc2Zvcm1lZCBzdHJpbmcuXG4gKi9cblNlbGVjdDMudHJhbnNmb3JtVGV4dCA9IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcudG9Mb3dlckNhc2UoKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IFNlbGVjdDMgaW5zdGFuY2Ugb3IgaW52b2tlIGEgbWV0aG9kIG9uIGFuIGluc3RhbmNlLlxuICpcbiAqIEBwYXJhbSBtZXRob2ROYW1lIE9wdGlvbmFsIG5hbWUgb2YgYSBtZXRob2QgdG8gY2FsbC4gSWYgb21pdHRlZCwgYSBTZWxlY3QzIGluc3RhbmNlIGlzIGNyZWF0ZWRcbiAqICAgICAgICAgICAgICAgICAgIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIHNldCBvZiBtYXRjaGVkIGVsZW1lbnRzLiBJZiBhbiBlbGVtZW50IGluIHRoZSBzZXRcbiAqICAgICAgICAgICAgICAgICAgIGFscmVhZHkgaGFzIGEgU2VsZWN0MyBpbnN0YW5jZSwgdGhlIHJlc3VsdCBpcyB0aGUgc2FtZSBhcyBpZiB0aGUgc2V0T3B0aW9ucygpXG4gKiAgICAgICAgICAgICAgICAgICBtZXRob2QgaXMgY2FsbGVkLlxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9uYWwgb3B0aW9ucyBvYmplY3QgdG8gcGFzcyB0byB0aGUgZ2l2ZW4gbWV0aG9kIG9yIHRoZSBjb25zdHJ1Y3Rvci4gU2VlIHRoZVxuICogICAgICAgICAgICAgICAgZG9jdW1lbnRhdGlvbiBmb3IgdGhlIHJlc3BlY3RpdmUgbWV0aG9kcyB0byBzZWUgd2hpY2ggb3B0aW9ucyB0aGV5IGFjY2VwdC4gSW4gY2FzZVxuICogICAgICAgICAgICAgICAgYSBuZXcgaW5zdGFuY2UgaXMgYmVpbmcgY3JlYXRlZCwgdGhlIGZvbGxvd2luZyBwcm9wZXJ0eSBpcyB1c2VkOlxuICogICAgICAgICAgICAgICAgbXVsdGlwbGUgLSBCb29sZWFuIGRldGVybWluaW5nIHdoZXRoZXIgbXVsdGlwbGUgaXRlbXMgbWF5IGJlIHNlbGVjdGVkXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgIChkZWZhdWx0OiBmYWxzZSkuIElmIHRydWUsIGEgTXVsdGlwbGVTZWxlY3QzIGluc3RhbmNlIGlzIGNyZWF0ZWQsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyd2lzZSBhIFNpbmdsZVNlbGVjdDMgaW5zdGFuY2UgaXMgY3JlYXRlZC5cbiAqXG4gKiBAcmV0dXJuIElmIHRoZSBnaXZlbiBtZXRob2QgcmV0dXJucyBhIHZhbHVlLCB0aGlzIG1ldGhvZCByZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGF0IG1ldGhvZFxuICogICAgICAgICBleGVjdXRlZCBvbiB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgc2V0IG9mIG1hdGNoZWQgZWxlbWVudHMuXG4gKi9cbiQuZm4uc2VsZWN0MyA9IGZ1bmN0aW9uKG1ldGhvZE5hbWUsIG9wdGlvbnMpIHtcblxuICAgIHZhciByZXN1bHQ7XG5cbiAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXMuc2VsZWN0MztcblxuICAgICAgICBpZiAoaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGlmICgkLnR5cGUobWV0aG9kTmFtZSkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IG1ldGhvZE5hbWU7XG4gICAgICAgICAgICAgICAgbWV0aG9kTmFtZSA9ICdzZXRPcHRpb25zJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCQudHlwZShpbnN0YW5jZVttZXRob2ROYW1lXSkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBpZiAoJC50eXBlKHJlc3VsdCkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGluc3RhbmNlW21ldGhvZE5hbWVdLmNhbGwoaW5zdGFuY2UsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIG1ldGhvZDogJyArIG1ldGhvZE5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCQudHlwZShtZXRob2ROYW1lKSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjYWxsIG1ldGhvZCBvbiBlbGVtZW50IHdpdGhvdXQgU2VsZWN0MyBpbnN0YW5jZScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gJC5leHRlbmQoe30sIG1ldGhvZE5hbWUsIHsgZWxlbWVudDogdGhpcyB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdDMgPSAob3B0aW9ucy5tdWx0aXBsZSA/IG5ldyAocmVxdWlyZSgnLi9zZWxlY3QzLW11bHRpcGxlJykpKG9wdGlvbnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBuZXcgKHJlcXVpcmUoJy4vc2VsZWN0My1zaW5nbGUnKSkob3B0aW9ucykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3QzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRElBQ1JJVElDUyA9IHtcbiAgICAnXFx1MjRCNic6ICdBJyxcbiAgICAnXFx1RkYyMSc6ICdBJyxcbiAgICAnXFx1MDBDMCc6ICdBJyxcbiAgICAnXFx1MDBDMSc6ICdBJyxcbiAgICAnXFx1MDBDMic6ICdBJyxcbiAgICAnXFx1MUVBNic6ICdBJyxcbiAgICAnXFx1MUVBNCc6ICdBJyxcbiAgICAnXFx1MUVBQSc6ICdBJyxcbiAgICAnXFx1MUVBOCc6ICdBJyxcbiAgICAnXFx1MDBDMyc6ICdBJyxcbiAgICAnXFx1MDEwMCc6ICdBJyxcbiAgICAnXFx1MDEwMic6ICdBJyxcbiAgICAnXFx1MUVCMCc6ICdBJyxcbiAgICAnXFx1MUVBRSc6ICdBJyxcbiAgICAnXFx1MUVCNCc6ICdBJyxcbiAgICAnXFx1MUVCMic6ICdBJyxcbiAgICAnXFx1MDIyNic6ICdBJyxcbiAgICAnXFx1MDFFMCc6ICdBJyxcbiAgICAnXFx1MDBDNCc6ICdBJyxcbiAgICAnXFx1MDFERSc6ICdBJyxcbiAgICAnXFx1MUVBMic6ICdBJyxcbiAgICAnXFx1MDBDNSc6ICdBJyxcbiAgICAnXFx1MDFGQSc6ICdBJyxcbiAgICAnXFx1MDFDRCc6ICdBJyxcbiAgICAnXFx1MDIwMCc6ICdBJyxcbiAgICAnXFx1MDIwMic6ICdBJyxcbiAgICAnXFx1MUVBMCc6ICdBJyxcbiAgICAnXFx1MUVBQyc6ICdBJyxcbiAgICAnXFx1MUVCNic6ICdBJyxcbiAgICAnXFx1MUUwMCc6ICdBJyxcbiAgICAnXFx1MDEwNCc6ICdBJyxcbiAgICAnXFx1MDIzQSc6ICdBJyxcbiAgICAnXFx1MkM2Ric6ICdBJyxcbiAgICAnXFx1QTczMic6ICdBQScsXG4gICAgJ1xcdTAwQzYnOiAnQUUnLFxuICAgICdcXHUwMUZDJzogJ0FFJyxcbiAgICAnXFx1MDFFMic6ICdBRScsXG4gICAgJ1xcdUE3MzQnOiAnQU8nLFxuICAgICdcXHVBNzM2JzogJ0FVJyxcbiAgICAnXFx1QTczOCc6ICdBVicsXG4gICAgJ1xcdUE3M0EnOiAnQVYnLFxuICAgICdcXHVBNzNDJzogJ0FZJyxcbiAgICAnXFx1MjRCNyc6ICdCJyxcbiAgICAnXFx1RkYyMic6ICdCJyxcbiAgICAnXFx1MUUwMic6ICdCJyxcbiAgICAnXFx1MUUwNCc6ICdCJyxcbiAgICAnXFx1MUUwNic6ICdCJyxcbiAgICAnXFx1MDI0Myc6ICdCJyxcbiAgICAnXFx1MDE4Mic6ICdCJyxcbiAgICAnXFx1MDE4MSc6ICdCJyxcbiAgICAnXFx1MjRCOCc6ICdDJyxcbiAgICAnXFx1RkYyMyc6ICdDJyxcbiAgICAnXFx1MDEwNic6ICdDJyxcbiAgICAnXFx1MDEwOCc6ICdDJyxcbiAgICAnXFx1MDEwQSc6ICdDJyxcbiAgICAnXFx1MDEwQyc6ICdDJyxcbiAgICAnXFx1MDBDNyc6ICdDJyxcbiAgICAnXFx1MUUwOCc6ICdDJyxcbiAgICAnXFx1MDE4Nyc6ICdDJyxcbiAgICAnXFx1MDIzQic6ICdDJyxcbiAgICAnXFx1QTczRSc6ICdDJyxcbiAgICAnXFx1MjRCOSc6ICdEJyxcbiAgICAnXFx1RkYyNCc6ICdEJyxcbiAgICAnXFx1MUUwQSc6ICdEJyxcbiAgICAnXFx1MDEwRSc6ICdEJyxcbiAgICAnXFx1MUUwQyc6ICdEJyxcbiAgICAnXFx1MUUxMCc6ICdEJyxcbiAgICAnXFx1MUUxMic6ICdEJyxcbiAgICAnXFx1MUUwRSc6ICdEJyxcbiAgICAnXFx1MDExMCc6ICdEJyxcbiAgICAnXFx1MDE4Qic6ICdEJyxcbiAgICAnXFx1MDE4QSc6ICdEJyxcbiAgICAnXFx1MDE4OSc6ICdEJyxcbiAgICAnXFx1QTc3OSc6ICdEJyxcbiAgICAnXFx1MDFGMSc6ICdEWicsXG4gICAgJ1xcdTAxQzQnOiAnRFonLFxuICAgICdcXHUwMUYyJzogJ0R6JyxcbiAgICAnXFx1MDFDNSc6ICdEeicsXG4gICAgJ1xcdTI0QkEnOiAnRScsXG4gICAgJ1xcdUZGMjUnOiAnRScsXG4gICAgJ1xcdTAwQzgnOiAnRScsXG4gICAgJ1xcdTAwQzknOiAnRScsXG4gICAgJ1xcdTAwQ0EnOiAnRScsXG4gICAgJ1xcdTFFQzAnOiAnRScsXG4gICAgJ1xcdTFFQkUnOiAnRScsXG4gICAgJ1xcdTFFQzQnOiAnRScsXG4gICAgJ1xcdTFFQzInOiAnRScsXG4gICAgJ1xcdTFFQkMnOiAnRScsXG4gICAgJ1xcdTAxMTInOiAnRScsXG4gICAgJ1xcdTFFMTQnOiAnRScsXG4gICAgJ1xcdTFFMTYnOiAnRScsXG4gICAgJ1xcdTAxMTQnOiAnRScsXG4gICAgJ1xcdTAxMTYnOiAnRScsXG4gICAgJ1xcdTAwQ0InOiAnRScsXG4gICAgJ1xcdTFFQkEnOiAnRScsXG4gICAgJ1xcdTAxMUEnOiAnRScsXG4gICAgJ1xcdTAyMDQnOiAnRScsXG4gICAgJ1xcdTAyMDYnOiAnRScsXG4gICAgJ1xcdTFFQjgnOiAnRScsXG4gICAgJ1xcdTFFQzYnOiAnRScsXG4gICAgJ1xcdTAyMjgnOiAnRScsXG4gICAgJ1xcdTFFMUMnOiAnRScsXG4gICAgJ1xcdTAxMTgnOiAnRScsXG4gICAgJ1xcdTFFMTgnOiAnRScsXG4gICAgJ1xcdTFFMUEnOiAnRScsXG4gICAgJ1xcdTAxOTAnOiAnRScsXG4gICAgJ1xcdTAxOEUnOiAnRScsXG4gICAgJ1xcdTI0QkInOiAnRicsXG4gICAgJ1xcdUZGMjYnOiAnRicsXG4gICAgJ1xcdTFFMUUnOiAnRicsXG4gICAgJ1xcdTAxOTEnOiAnRicsXG4gICAgJ1xcdUE3N0InOiAnRicsXG4gICAgJ1xcdTI0QkMnOiAnRycsXG4gICAgJ1xcdUZGMjcnOiAnRycsXG4gICAgJ1xcdTAxRjQnOiAnRycsXG4gICAgJ1xcdTAxMUMnOiAnRycsXG4gICAgJ1xcdTFFMjAnOiAnRycsXG4gICAgJ1xcdTAxMUUnOiAnRycsXG4gICAgJ1xcdTAxMjAnOiAnRycsXG4gICAgJ1xcdTAxRTYnOiAnRycsXG4gICAgJ1xcdTAxMjInOiAnRycsXG4gICAgJ1xcdTAxRTQnOiAnRycsXG4gICAgJ1xcdTAxOTMnOiAnRycsXG4gICAgJ1xcdUE3QTAnOiAnRycsXG4gICAgJ1xcdUE3N0QnOiAnRycsXG4gICAgJ1xcdUE3N0UnOiAnRycsXG4gICAgJ1xcdTI0QkQnOiAnSCcsXG4gICAgJ1xcdUZGMjgnOiAnSCcsXG4gICAgJ1xcdTAxMjQnOiAnSCcsXG4gICAgJ1xcdTFFMjInOiAnSCcsXG4gICAgJ1xcdTFFMjYnOiAnSCcsXG4gICAgJ1xcdTAyMUUnOiAnSCcsXG4gICAgJ1xcdTFFMjQnOiAnSCcsXG4gICAgJ1xcdTFFMjgnOiAnSCcsXG4gICAgJ1xcdTFFMkEnOiAnSCcsXG4gICAgJ1xcdTAxMjYnOiAnSCcsXG4gICAgJ1xcdTJDNjcnOiAnSCcsXG4gICAgJ1xcdTJDNzUnOiAnSCcsXG4gICAgJ1xcdUE3OEQnOiAnSCcsXG4gICAgJ1xcdTI0QkUnOiAnSScsXG4gICAgJ1xcdUZGMjknOiAnSScsXG4gICAgJ1xcdTAwQ0MnOiAnSScsXG4gICAgJ1xcdTAwQ0QnOiAnSScsXG4gICAgJ1xcdTAwQ0UnOiAnSScsXG4gICAgJ1xcdTAxMjgnOiAnSScsXG4gICAgJ1xcdTAxMkEnOiAnSScsXG4gICAgJ1xcdTAxMkMnOiAnSScsXG4gICAgJ1xcdTAxMzAnOiAnSScsXG4gICAgJ1xcdTAwQ0YnOiAnSScsXG4gICAgJ1xcdTFFMkUnOiAnSScsXG4gICAgJ1xcdTFFQzgnOiAnSScsXG4gICAgJ1xcdTAxQ0YnOiAnSScsXG4gICAgJ1xcdTAyMDgnOiAnSScsXG4gICAgJ1xcdTAyMEEnOiAnSScsXG4gICAgJ1xcdTFFQ0EnOiAnSScsXG4gICAgJ1xcdTAxMkUnOiAnSScsXG4gICAgJ1xcdTFFMkMnOiAnSScsXG4gICAgJ1xcdTAxOTcnOiAnSScsXG4gICAgJ1xcdTI0QkYnOiAnSicsXG4gICAgJ1xcdUZGMkEnOiAnSicsXG4gICAgJ1xcdTAxMzQnOiAnSicsXG4gICAgJ1xcdTAyNDgnOiAnSicsXG4gICAgJ1xcdTI0QzAnOiAnSycsXG4gICAgJ1xcdUZGMkInOiAnSycsXG4gICAgJ1xcdTFFMzAnOiAnSycsXG4gICAgJ1xcdTAxRTgnOiAnSycsXG4gICAgJ1xcdTFFMzInOiAnSycsXG4gICAgJ1xcdTAxMzYnOiAnSycsXG4gICAgJ1xcdTFFMzQnOiAnSycsXG4gICAgJ1xcdTAxOTgnOiAnSycsXG4gICAgJ1xcdTJDNjknOiAnSycsXG4gICAgJ1xcdUE3NDAnOiAnSycsXG4gICAgJ1xcdUE3NDInOiAnSycsXG4gICAgJ1xcdUE3NDQnOiAnSycsXG4gICAgJ1xcdUE3QTInOiAnSycsXG4gICAgJ1xcdTI0QzEnOiAnTCcsXG4gICAgJ1xcdUZGMkMnOiAnTCcsXG4gICAgJ1xcdTAxM0YnOiAnTCcsXG4gICAgJ1xcdTAxMzknOiAnTCcsXG4gICAgJ1xcdTAxM0QnOiAnTCcsXG4gICAgJ1xcdTFFMzYnOiAnTCcsXG4gICAgJ1xcdTFFMzgnOiAnTCcsXG4gICAgJ1xcdTAxM0InOiAnTCcsXG4gICAgJ1xcdTFFM0MnOiAnTCcsXG4gICAgJ1xcdTFFM0EnOiAnTCcsXG4gICAgJ1xcdTAxNDEnOiAnTCcsXG4gICAgJ1xcdTAyM0QnOiAnTCcsXG4gICAgJ1xcdTJDNjInOiAnTCcsXG4gICAgJ1xcdTJDNjAnOiAnTCcsXG4gICAgJ1xcdUE3NDgnOiAnTCcsXG4gICAgJ1xcdUE3NDYnOiAnTCcsXG4gICAgJ1xcdUE3ODAnOiAnTCcsXG4gICAgJ1xcdTAxQzcnOiAnTEonLFxuICAgICdcXHUwMUM4JzogJ0xqJyxcbiAgICAnXFx1MjRDMic6ICdNJyxcbiAgICAnXFx1RkYyRCc6ICdNJyxcbiAgICAnXFx1MUUzRSc6ICdNJyxcbiAgICAnXFx1MUU0MCc6ICdNJyxcbiAgICAnXFx1MUU0Mic6ICdNJyxcbiAgICAnXFx1MkM2RSc6ICdNJyxcbiAgICAnXFx1MDE5Qyc6ICdNJyxcbiAgICAnXFx1MjRDMyc6ICdOJyxcbiAgICAnXFx1RkYyRSc6ICdOJyxcbiAgICAnXFx1MDFGOCc6ICdOJyxcbiAgICAnXFx1MDE0Myc6ICdOJyxcbiAgICAnXFx1MDBEMSc6ICdOJyxcbiAgICAnXFx1MUU0NCc6ICdOJyxcbiAgICAnXFx1MDE0Nyc6ICdOJyxcbiAgICAnXFx1MUU0Nic6ICdOJyxcbiAgICAnXFx1MDE0NSc6ICdOJyxcbiAgICAnXFx1MUU0QSc6ICdOJyxcbiAgICAnXFx1MUU0OCc6ICdOJyxcbiAgICAnXFx1MDIyMCc6ICdOJyxcbiAgICAnXFx1MDE5RCc6ICdOJyxcbiAgICAnXFx1QTc5MCc6ICdOJyxcbiAgICAnXFx1QTdBNCc6ICdOJyxcbiAgICAnXFx1MDFDQSc6ICdOSicsXG4gICAgJ1xcdTAxQ0InOiAnTmonLFxuICAgICdcXHUyNEM0JzogJ08nLFxuICAgICdcXHVGRjJGJzogJ08nLFxuICAgICdcXHUwMEQyJzogJ08nLFxuICAgICdcXHUwMEQzJzogJ08nLFxuICAgICdcXHUwMEQ0JzogJ08nLFxuICAgICdcXHUxRUQyJzogJ08nLFxuICAgICdcXHUxRUQwJzogJ08nLFxuICAgICdcXHUxRUQ2JzogJ08nLFxuICAgICdcXHUxRUQ0JzogJ08nLFxuICAgICdcXHUwMEQ1JzogJ08nLFxuICAgICdcXHUxRTRDJzogJ08nLFxuICAgICdcXHUwMjJDJzogJ08nLFxuICAgICdcXHUxRTRFJzogJ08nLFxuICAgICdcXHUwMTRDJzogJ08nLFxuICAgICdcXHUxRTUwJzogJ08nLFxuICAgICdcXHUxRTUyJzogJ08nLFxuICAgICdcXHUwMTRFJzogJ08nLFxuICAgICdcXHUwMjJFJzogJ08nLFxuICAgICdcXHUwMjMwJzogJ08nLFxuICAgICdcXHUwMEQ2JzogJ08nLFxuICAgICdcXHUwMjJBJzogJ08nLFxuICAgICdcXHUxRUNFJzogJ08nLFxuICAgICdcXHUwMTUwJzogJ08nLFxuICAgICdcXHUwMUQxJzogJ08nLFxuICAgICdcXHUwMjBDJzogJ08nLFxuICAgICdcXHUwMjBFJzogJ08nLFxuICAgICdcXHUwMUEwJzogJ08nLFxuICAgICdcXHUxRURDJzogJ08nLFxuICAgICdcXHUxRURBJzogJ08nLFxuICAgICdcXHUxRUUwJzogJ08nLFxuICAgICdcXHUxRURFJzogJ08nLFxuICAgICdcXHUxRUUyJzogJ08nLFxuICAgICdcXHUxRUNDJzogJ08nLFxuICAgICdcXHUxRUQ4JzogJ08nLFxuICAgICdcXHUwMUVBJzogJ08nLFxuICAgICdcXHUwMUVDJzogJ08nLFxuICAgICdcXHUwMEQ4JzogJ08nLFxuICAgICdcXHUwMUZFJzogJ08nLFxuICAgICdcXHUwMTg2JzogJ08nLFxuICAgICdcXHUwMTlGJzogJ08nLFxuICAgICdcXHVBNzRBJzogJ08nLFxuICAgICdcXHVBNzRDJzogJ08nLFxuICAgICdcXHUwMUEyJzogJ09JJyxcbiAgICAnXFx1QTc0RSc6ICdPTycsXG4gICAgJ1xcdTAyMjInOiAnT1UnLFxuICAgICdcXHUyNEM1JzogJ1AnLFxuICAgICdcXHVGRjMwJzogJ1AnLFxuICAgICdcXHUxRTU0JzogJ1AnLFxuICAgICdcXHUxRTU2JzogJ1AnLFxuICAgICdcXHUwMUE0JzogJ1AnLFxuICAgICdcXHUyQzYzJzogJ1AnLFxuICAgICdcXHVBNzUwJzogJ1AnLFxuICAgICdcXHVBNzUyJzogJ1AnLFxuICAgICdcXHVBNzU0JzogJ1AnLFxuICAgICdcXHUyNEM2JzogJ1EnLFxuICAgICdcXHVGRjMxJzogJ1EnLFxuICAgICdcXHVBNzU2JzogJ1EnLFxuICAgICdcXHVBNzU4JzogJ1EnLFxuICAgICdcXHUwMjRBJzogJ1EnLFxuICAgICdcXHUyNEM3JzogJ1InLFxuICAgICdcXHVGRjMyJzogJ1InLFxuICAgICdcXHUwMTU0JzogJ1InLFxuICAgICdcXHUxRTU4JzogJ1InLFxuICAgICdcXHUwMTU4JzogJ1InLFxuICAgICdcXHUwMjEwJzogJ1InLFxuICAgICdcXHUwMjEyJzogJ1InLFxuICAgICdcXHUxRTVBJzogJ1InLFxuICAgICdcXHUxRTVDJzogJ1InLFxuICAgICdcXHUwMTU2JzogJ1InLFxuICAgICdcXHUxRTVFJzogJ1InLFxuICAgICdcXHUwMjRDJzogJ1InLFxuICAgICdcXHUyQzY0JzogJ1InLFxuICAgICdcXHVBNzVBJzogJ1InLFxuICAgICdcXHVBN0E2JzogJ1InLFxuICAgICdcXHVBNzgyJzogJ1InLFxuICAgICdcXHUyNEM4JzogJ1MnLFxuICAgICdcXHVGRjMzJzogJ1MnLFxuICAgICdcXHUxRTlFJzogJ1MnLFxuICAgICdcXHUwMTVBJzogJ1MnLFxuICAgICdcXHUxRTY0JzogJ1MnLFxuICAgICdcXHUwMTVDJzogJ1MnLFxuICAgICdcXHUxRTYwJzogJ1MnLFxuICAgICdcXHUwMTYwJzogJ1MnLFxuICAgICdcXHUxRTY2JzogJ1MnLFxuICAgICdcXHUxRTYyJzogJ1MnLFxuICAgICdcXHUxRTY4JzogJ1MnLFxuICAgICdcXHUwMjE4JzogJ1MnLFxuICAgICdcXHUwMTVFJzogJ1MnLFxuICAgICdcXHUyQzdFJzogJ1MnLFxuICAgICdcXHVBN0E4JzogJ1MnLFxuICAgICdcXHVBNzg0JzogJ1MnLFxuICAgICdcXHUyNEM5JzogJ1QnLFxuICAgICdcXHVGRjM0JzogJ1QnLFxuICAgICdcXHUxRTZBJzogJ1QnLFxuICAgICdcXHUwMTY0JzogJ1QnLFxuICAgICdcXHUxRTZDJzogJ1QnLFxuICAgICdcXHUwMjFBJzogJ1QnLFxuICAgICdcXHUwMTYyJzogJ1QnLFxuICAgICdcXHUxRTcwJzogJ1QnLFxuICAgICdcXHUxRTZFJzogJ1QnLFxuICAgICdcXHUwMTY2JzogJ1QnLFxuICAgICdcXHUwMUFDJzogJ1QnLFxuICAgICdcXHUwMUFFJzogJ1QnLFxuICAgICdcXHUwMjNFJzogJ1QnLFxuICAgICdcXHVBNzg2JzogJ1QnLFxuICAgICdcXHVBNzI4JzogJ1RaJyxcbiAgICAnXFx1MjRDQSc6ICdVJyxcbiAgICAnXFx1RkYzNSc6ICdVJyxcbiAgICAnXFx1MDBEOSc6ICdVJyxcbiAgICAnXFx1MDBEQSc6ICdVJyxcbiAgICAnXFx1MDBEQic6ICdVJyxcbiAgICAnXFx1MDE2OCc6ICdVJyxcbiAgICAnXFx1MUU3OCc6ICdVJyxcbiAgICAnXFx1MDE2QSc6ICdVJyxcbiAgICAnXFx1MUU3QSc6ICdVJyxcbiAgICAnXFx1MDE2Qyc6ICdVJyxcbiAgICAnXFx1MDBEQyc6ICdVJyxcbiAgICAnXFx1MDFEQic6ICdVJyxcbiAgICAnXFx1MDFENyc6ICdVJyxcbiAgICAnXFx1MDFENSc6ICdVJyxcbiAgICAnXFx1MDFEOSc6ICdVJyxcbiAgICAnXFx1MUVFNic6ICdVJyxcbiAgICAnXFx1MDE2RSc6ICdVJyxcbiAgICAnXFx1MDE3MCc6ICdVJyxcbiAgICAnXFx1MDFEMyc6ICdVJyxcbiAgICAnXFx1MDIxNCc6ICdVJyxcbiAgICAnXFx1MDIxNic6ICdVJyxcbiAgICAnXFx1MDFBRic6ICdVJyxcbiAgICAnXFx1MUVFQSc6ICdVJyxcbiAgICAnXFx1MUVFOCc6ICdVJyxcbiAgICAnXFx1MUVFRSc6ICdVJyxcbiAgICAnXFx1MUVFQyc6ICdVJyxcbiAgICAnXFx1MUVGMCc6ICdVJyxcbiAgICAnXFx1MUVFNCc6ICdVJyxcbiAgICAnXFx1MUU3Mic6ICdVJyxcbiAgICAnXFx1MDE3Mic6ICdVJyxcbiAgICAnXFx1MUU3Nic6ICdVJyxcbiAgICAnXFx1MUU3NCc6ICdVJyxcbiAgICAnXFx1MDI0NCc6ICdVJyxcbiAgICAnXFx1MjRDQic6ICdWJyxcbiAgICAnXFx1RkYzNic6ICdWJyxcbiAgICAnXFx1MUU3Qyc6ICdWJyxcbiAgICAnXFx1MUU3RSc6ICdWJyxcbiAgICAnXFx1MDFCMic6ICdWJyxcbiAgICAnXFx1QTc1RSc6ICdWJyxcbiAgICAnXFx1MDI0NSc6ICdWJyxcbiAgICAnXFx1QTc2MCc6ICdWWScsXG4gICAgJ1xcdTI0Q0MnOiAnVycsXG4gICAgJ1xcdUZGMzcnOiAnVycsXG4gICAgJ1xcdTFFODAnOiAnVycsXG4gICAgJ1xcdTFFODInOiAnVycsXG4gICAgJ1xcdTAxNzQnOiAnVycsXG4gICAgJ1xcdTFFODYnOiAnVycsXG4gICAgJ1xcdTFFODQnOiAnVycsXG4gICAgJ1xcdTFFODgnOiAnVycsXG4gICAgJ1xcdTJDNzInOiAnVycsXG4gICAgJ1xcdTI0Q0QnOiAnWCcsXG4gICAgJ1xcdUZGMzgnOiAnWCcsXG4gICAgJ1xcdTFFOEEnOiAnWCcsXG4gICAgJ1xcdTFFOEMnOiAnWCcsXG4gICAgJ1xcdTI0Q0UnOiAnWScsXG4gICAgJ1xcdUZGMzknOiAnWScsXG4gICAgJ1xcdTFFRjInOiAnWScsXG4gICAgJ1xcdTAwREQnOiAnWScsXG4gICAgJ1xcdTAxNzYnOiAnWScsXG4gICAgJ1xcdTFFRjgnOiAnWScsXG4gICAgJ1xcdTAyMzInOiAnWScsXG4gICAgJ1xcdTFFOEUnOiAnWScsXG4gICAgJ1xcdTAxNzgnOiAnWScsXG4gICAgJ1xcdTFFRjYnOiAnWScsXG4gICAgJ1xcdTFFRjQnOiAnWScsXG4gICAgJ1xcdTAxQjMnOiAnWScsXG4gICAgJ1xcdTAyNEUnOiAnWScsXG4gICAgJ1xcdTFFRkUnOiAnWScsXG4gICAgJ1xcdTI0Q0YnOiAnWicsXG4gICAgJ1xcdUZGM0EnOiAnWicsXG4gICAgJ1xcdTAxNzknOiAnWicsXG4gICAgJ1xcdTFFOTAnOiAnWicsXG4gICAgJ1xcdTAxN0InOiAnWicsXG4gICAgJ1xcdTAxN0QnOiAnWicsXG4gICAgJ1xcdTFFOTInOiAnWicsXG4gICAgJ1xcdTFFOTQnOiAnWicsXG4gICAgJ1xcdTAxQjUnOiAnWicsXG4gICAgJ1xcdTAyMjQnOiAnWicsXG4gICAgJ1xcdTJDN0YnOiAnWicsXG4gICAgJ1xcdTJDNkInOiAnWicsXG4gICAgJ1xcdUE3NjInOiAnWicsXG4gICAgJ1xcdTI0RDAnOiAnYScsXG4gICAgJ1xcdUZGNDEnOiAnYScsXG4gICAgJ1xcdTFFOUEnOiAnYScsXG4gICAgJ1xcdTAwRTAnOiAnYScsXG4gICAgJ1xcdTAwRTEnOiAnYScsXG4gICAgJ1xcdTAwRTInOiAnYScsXG4gICAgJ1xcdTFFQTcnOiAnYScsXG4gICAgJ1xcdTFFQTUnOiAnYScsXG4gICAgJ1xcdTFFQUInOiAnYScsXG4gICAgJ1xcdTFFQTknOiAnYScsXG4gICAgJ1xcdTAwRTMnOiAnYScsXG4gICAgJ1xcdTAxMDEnOiAnYScsXG4gICAgJ1xcdTAxMDMnOiAnYScsXG4gICAgJ1xcdTFFQjEnOiAnYScsXG4gICAgJ1xcdTFFQUYnOiAnYScsXG4gICAgJ1xcdTFFQjUnOiAnYScsXG4gICAgJ1xcdTFFQjMnOiAnYScsXG4gICAgJ1xcdTAyMjcnOiAnYScsXG4gICAgJ1xcdTAxRTEnOiAnYScsXG4gICAgJ1xcdTAwRTQnOiAnYScsXG4gICAgJ1xcdTAxREYnOiAnYScsXG4gICAgJ1xcdTFFQTMnOiAnYScsXG4gICAgJ1xcdTAwRTUnOiAnYScsXG4gICAgJ1xcdTAxRkInOiAnYScsXG4gICAgJ1xcdTAxQ0UnOiAnYScsXG4gICAgJ1xcdTAyMDEnOiAnYScsXG4gICAgJ1xcdTAyMDMnOiAnYScsXG4gICAgJ1xcdTFFQTEnOiAnYScsXG4gICAgJ1xcdTFFQUQnOiAnYScsXG4gICAgJ1xcdTFFQjcnOiAnYScsXG4gICAgJ1xcdTFFMDEnOiAnYScsXG4gICAgJ1xcdTAxMDUnOiAnYScsXG4gICAgJ1xcdTJDNjUnOiAnYScsXG4gICAgJ1xcdTAyNTAnOiAnYScsXG4gICAgJ1xcdUE3MzMnOiAnYWEnLFxuICAgICdcXHUwMEU2JzogJ2FlJyxcbiAgICAnXFx1MDFGRCc6ICdhZScsXG4gICAgJ1xcdTAxRTMnOiAnYWUnLFxuICAgICdcXHVBNzM1JzogJ2FvJyxcbiAgICAnXFx1QTczNyc6ICdhdScsXG4gICAgJ1xcdUE3MzknOiAnYXYnLFxuICAgICdcXHVBNzNCJzogJ2F2JyxcbiAgICAnXFx1QTczRCc6ICdheScsXG4gICAgJ1xcdTI0RDEnOiAnYicsXG4gICAgJ1xcdUZGNDInOiAnYicsXG4gICAgJ1xcdTFFMDMnOiAnYicsXG4gICAgJ1xcdTFFMDUnOiAnYicsXG4gICAgJ1xcdTFFMDcnOiAnYicsXG4gICAgJ1xcdTAxODAnOiAnYicsXG4gICAgJ1xcdTAxODMnOiAnYicsXG4gICAgJ1xcdTAyNTMnOiAnYicsXG4gICAgJ1xcdTI0RDInOiAnYycsXG4gICAgJ1xcdUZGNDMnOiAnYycsXG4gICAgJ1xcdTAxMDcnOiAnYycsXG4gICAgJ1xcdTAxMDknOiAnYycsXG4gICAgJ1xcdTAxMEInOiAnYycsXG4gICAgJ1xcdTAxMEQnOiAnYycsXG4gICAgJ1xcdTAwRTcnOiAnYycsXG4gICAgJ1xcdTFFMDknOiAnYycsXG4gICAgJ1xcdTAxODgnOiAnYycsXG4gICAgJ1xcdTAyM0MnOiAnYycsXG4gICAgJ1xcdUE3M0YnOiAnYycsXG4gICAgJ1xcdTIxODQnOiAnYycsXG4gICAgJ1xcdTI0RDMnOiAnZCcsXG4gICAgJ1xcdUZGNDQnOiAnZCcsXG4gICAgJ1xcdTFFMEInOiAnZCcsXG4gICAgJ1xcdTAxMEYnOiAnZCcsXG4gICAgJ1xcdTFFMEQnOiAnZCcsXG4gICAgJ1xcdTFFMTEnOiAnZCcsXG4gICAgJ1xcdTFFMTMnOiAnZCcsXG4gICAgJ1xcdTFFMEYnOiAnZCcsXG4gICAgJ1xcdTAxMTEnOiAnZCcsXG4gICAgJ1xcdTAxOEMnOiAnZCcsXG4gICAgJ1xcdTAyNTYnOiAnZCcsXG4gICAgJ1xcdTAyNTcnOiAnZCcsXG4gICAgJ1xcdUE3N0EnOiAnZCcsXG4gICAgJ1xcdTAxRjMnOiAnZHonLFxuICAgICdcXHUwMUM2JzogJ2R6JyxcbiAgICAnXFx1MjRENCc6ICdlJyxcbiAgICAnXFx1RkY0NSc6ICdlJyxcbiAgICAnXFx1MDBFOCc6ICdlJyxcbiAgICAnXFx1MDBFOSc6ICdlJyxcbiAgICAnXFx1MDBFQSc6ICdlJyxcbiAgICAnXFx1MUVDMSc6ICdlJyxcbiAgICAnXFx1MUVCRic6ICdlJyxcbiAgICAnXFx1MUVDNSc6ICdlJyxcbiAgICAnXFx1MUVDMyc6ICdlJyxcbiAgICAnXFx1MUVCRCc6ICdlJyxcbiAgICAnXFx1MDExMyc6ICdlJyxcbiAgICAnXFx1MUUxNSc6ICdlJyxcbiAgICAnXFx1MUUxNyc6ICdlJyxcbiAgICAnXFx1MDExNSc6ICdlJyxcbiAgICAnXFx1MDExNyc6ICdlJyxcbiAgICAnXFx1MDBFQic6ICdlJyxcbiAgICAnXFx1MUVCQic6ICdlJyxcbiAgICAnXFx1MDExQic6ICdlJyxcbiAgICAnXFx1MDIwNSc6ICdlJyxcbiAgICAnXFx1MDIwNyc6ICdlJyxcbiAgICAnXFx1MUVCOSc6ICdlJyxcbiAgICAnXFx1MUVDNyc6ICdlJyxcbiAgICAnXFx1MDIyOSc6ICdlJyxcbiAgICAnXFx1MUUxRCc6ICdlJyxcbiAgICAnXFx1MDExOSc6ICdlJyxcbiAgICAnXFx1MUUxOSc6ICdlJyxcbiAgICAnXFx1MUUxQic6ICdlJyxcbiAgICAnXFx1MDI0Nyc6ICdlJyxcbiAgICAnXFx1MDI1Qic6ICdlJyxcbiAgICAnXFx1MDFERCc6ICdlJyxcbiAgICAnXFx1MjRENSc6ICdmJyxcbiAgICAnXFx1RkY0Nic6ICdmJyxcbiAgICAnXFx1MUUxRic6ICdmJyxcbiAgICAnXFx1MDE5Mic6ICdmJyxcbiAgICAnXFx1QTc3Qyc6ICdmJyxcbiAgICAnXFx1MjRENic6ICdnJyxcbiAgICAnXFx1RkY0Nyc6ICdnJyxcbiAgICAnXFx1MDFGNSc6ICdnJyxcbiAgICAnXFx1MDExRCc6ICdnJyxcbiAgICAnXFx1MUUyMSc6ICdnJyxcbiAgICAnXFx1MDExRic6ICdnJyxcbiAgICAnXFx1MDEyMSc6ICdnJyxcbiAgICAnXFx1MDFFNyc6ICdnJyxcbiAgICAnXFx1MDEyMyc6ICdnJyxcbiAgICAnXFx1MDFFNSc6ICdnJyxcbiAgICAnXFx1MDI2MCc6ICdnJyxcbiAgICAnXFx1QTdBMSc6ICdnJyxcbiAgICAnXFx1MUQ3OSc6ICdnJyxcbiAgICAnXFx1QTc3Ric6ICdnJyxcbiAgICAnXFx1MjRENyc6ICdoJyxcbiAgICAnXFx1RkY0OCc6ICdoJyxcbiAgICAnXFx1MDEyNSc6ICdoJyxcbiAgICAnXFx1MUUyMyc6ICdoJyxcbiAgICAnXFx1MUUyNyc6ICdoJyxcbiAgICAnXFx1MDIxRic6ICdoJyxcbiAgICAnXFx1MUUyNSc6ICdoJyxcbiAgICAnXFx1MUUyOSc6ICdoJyxcbiAgICAnXFx1MUUyQic6ICdoJyxcbiAgICAnXFx1MUU5Nic6ICdoJyxcbiAgICAnXFx1MDEyNyc6ICdoJyxcbiAgICAnXFx1MkM2OCc6ICdoJyxcbiAgICAnXFx1MkM3Nic6ICdoJyxcbiAgICAnXFx1MDI2NSc6ICdoJyxcbiAgICAnXFx1MDE5NSc6ICdodicsXG4gICAgJ1xcdTI0RDgnOiAnaScsXG4gICAgJ1xcdUZGNDknOiAnaScsXG4gICAgJ1xcdTAwRUMnOiAnaScsXG4gICAgJ1xcdTAwRUQnOiAnaScsXG4gICAgJ1xcdTAwRUUnOiAnaScsXG4gICAgJ1xcdTAxMjknOiAnaScsXG4gICAgJ1xcdTAxMkInOiAnaScsXG4gICAgJ1xcdTAxMkQnOiAnaScsXG4gICAgJ1xcdTAwRUYnOiAnaScsXG4gICAgJ1xcdTFFMkYnOiAnaScsXG4gICAgJ1xcdTFFQzknOiAnaScsXG4gICAgJ1xcdTAxRDAnOiAnaScsXG4gICAgJ1xcdTAyMDknOiAnaScsXG4gICAgJ1xcdTAyMEInOiAnaScsXG4gICAgJ1xcdTFFQ0InOiAnaScsXG4gICAgJ1xcdTAxMkYnOiAnaScsXG4gICAgJ1xcdTFFMkQnOiAnaScsXG4gICAgJ1xcdTAyNjgnOiAnaScsXG4gICAgJ1xcdTAxMzEnOiAnaScsXG4gICAgJ1xcdTI0RDknOiAnaicsXG4gICAgJ1xcdUZGNEEnOiAnaicsXG4gICAgJ1xcdTAxMzUnOiAnaicsXG4gICAgJ1xcdTAxRjAnOiAnaicsXG4gICAgJ1xcdTAyNDknOiAnaicsXG4gICAgJ1xcdTI0REEnOiAnaycsXG4gICAgJ1xcdUZGNEInOiAnaycsXG4gICAgJ1xcdTFFMzEnOiAnaycsXG4gICAgJ1xcdTAxRTknOiAnaycsXG4gICAgJ1xcdTFFMzMnOiAnaycsXG4gICAgJ1xcdTAxMzcnOiAnaycsXG4gICAgJ1xcdTFFMzUnOiAnaycsXG4gICAgJ1xcdTAxOTknOiAnaycsXG4gICAgJ1xcdTJDNkEnOiAnaycsXG4gICAgJ1xcdUE3NDEnOiAnaycsXG4gICAgJ1xcdUE3NDMnOiAnaycsXG4gICAgJ1xcdUE3NDUnOiAnaycsXG4gICAgJ1xcdUE3QTMnOiAnaycsXG4gICAgJ1xcdTI0REInOiAnbCcsXG4gICAgJ1xcdUZGNEMnOiAnbCcsXG4gICAgJ1xcdTAxNDAnOiAnbCcsXG4gICAgJ1xcdTAxM0EnOiAnbCcsXG4gICAgJ1xcdTAxM0UnOiAnbCcsXG4gICAgJ1xcdTFFMzcnOiAnbCcsXG4gICAgJ1xcdTFFMzknOiAnbCcsXG4gICAgJ1xcdTAxM0MnOiAnbCcsXG4gICAgJ1xcdTFFM0QnOiAnbCcsXG4gICAgJ1xcdTFFM0InOiAnbCcsXG4gICAgJ1xcdTAxN0YnOiAnbCcsXG4gICAgJ1xcdTAxNDInOiAnbCcsXG4gICAgJ1xcdTAxOUEnOiAnbCcsXG4gICAgJ1xcdTAyNkInOiAnbCcsXG4gICAgJ1xcdTJDNjEnOiAnbCcsXG4gICAgJ1xcdUE3NDknOiAnbCcsXG4gICAgJ1xcdUE3ODEnOiAnbCcsXG4gICAgJ1xcdUE3NDcnOiAnbCcsXG4gICAgJ1xcdTAxQzknOiAnbGonLFxuICAgICdcXHUyNERDJzogJ20nLFxuICAgICdcXHVGRjREJzogJ20nLFxuICAgICdcXHUxRTNGJzogJ20nLFxuICAgICdcXHUxRTQxJzogJ20nLFxuICAgICdcXHUxRTQzJzogJ20nLFxuICAgICdcXHUwMjcxJzogJ20nLFxuICAgICdcXHUwMjZGJzogJ20nLFxuICAgICdcXHUyNEREJzogJ24nLFxuICAgICdcXHVGRjRFJzogJ24nLFxuICAgICdcXHUwMUY5JzogJ24nLFxuICAgICdcXHUwMTQ0JzogJ24nLFxuICAgICdcXHUwMEYxJzogJ24nLFxuICAgICdcXHUxRTQ1JzogJ24nLFxuICAgICdcXHUwMTQ4JzogJ24nLFxuICAgICdcXHUxRTQ3JzogJ24nLFxuICAgICdcXHUwMTQ2JzogJ24nLFxuICAgICdcXHUxRTRCJzogJ24nLFxuICAgICdcXHUxRTQ5JzogJ24nLFxuICAgICdcXHUwMTlFJzogJ24nLFxuICAgICdcXHUwMjcyJzogJ24nLFxuICAgICdcXHUwMTQ5JzogJ24nLFxuICAgICdcXHVBNzkxJzogJ24nLFxuICAgICdcXHVBN0E1JzogJ24nLFxuICAgICdcXHUwMUNDJzogJ25qJyxcbiAgICAnXFx1MjRERSc6ICdvJyxcbiAgICAnXFx1RkY0Ric6ICdvJyxcbiAgICAnXFx1MDBGMic6ICdvJyxcbiAgICAnXFx1MDBGMyc6ICdvJyxcbiAgICAnXFx1MDBGNCc6ICdvJyxcbiAgICAnXFx1MUVEMyc6ICdvJyxcbiAgICAnXFx1MUVEMSc6ICdvJyxcbiAgICAnXFx1MUVENyc6ICdvJyxcbiAgICAnXFx1MUVENSc6ICdvJyxcbiAgICAnXFx1MDBGNSc6ICdvJyxcbiAgICAnXFx1MUU0RCc6ICdvJyxcbiAgICAnXFx1MDIyRCc6ICdvJyxcbiAgICAnXFx1MUU0Ric6ICdvJyxcbiAgICAnXFx1MDE0RCc6ICdvJyxcbiAgICAnXFx1MUU1MSc6ICdvJyxcbiAgICAnXFx1MUU1Myc6ICdvJyxcbiAgICAnXFx1MDE0Ric6ICdvJyxcbiAgICAnXFx1MDIyRic6ICdvJyxcbiAgICAnXFx1MDIzMSc6ICdvJyxcbiAgICAnXFx1MDBGNic6ICdvJyxcbiAgICAnXFx1MDIyQic6ICdvJyxcbiAgICAnXFx1MUVDRic6ICdvJyxcbiAgICAnXFx1MDE1MSc6ICdvJyxcbiAgICAnXFx1MDFEMic6ICdvJyxcbiAgICAnXFx1MDIwRCc6ICdvJyxcbiAgICAnXFx1MDIwRic6ICdvJyxcbiAgICAnXFx1MDFBMSc6ICdvJyxcbiAgICAnXFx1MUVERCc6ICdvJyxcbiAgICAnXFx1MUVEQic6ICdvJyxcbiAgICAnXFx1MUVFMSc6ICdvJyxcbiAgICAnXFx1MUVERic6ICdvJyxcbiAgICAnXFx1MUVFMyc6ICdvJyxcbiAgICAnXFx1MUVDRCc6ICdvJyxcbiAgICAnXFx1MUVEOSc6ICdvJyxcbiAgICAnXFx1MDFFQic6ICdvJyxcbiAgICAnXFx1MDFFRCc6ICdvJyxcbiAgICAnXFx1MDBGOCc6ICdvJyxcbiAgICAnXFx1MDFGRic6ICdvJyxcbiAgICAnXFx1MDI1NCc6ICdvJyxcbiAgICAnXFx1QTc0Qic6ICdvJyxcbiAgICAnXFx1QTc0RCc6ICdvJyxcbiAgICAnXFx1MDI3NSc6ICdvJyxcbiAgICAnXFx1MDFBMyc6ICdvaScsXG4gICAgJ1xcdTAyMjMnOiAnb3UnLFxuICAgICdcXHVBNzRGJzogJ29vJyxcbiAgICAnXFx1MjRERic6ICdwJyxcbiAgICAnXFx1RkY1MCc6ICdwJyxcbiAgICAnXFx1MUU1NSc6ICdwJyxcbiAgICAnXFx1MUU1Nyc6ICdwJyxcbiAgICAnXFx1MDFBNSc6ICdwJyxcbiAgICAnXFx1MUQ3RCc6ICdwJyxcbiAgICAnXFx1QTc1MSc6ICdwJyxcbiAgICAnXFx1QTc1Myc6ICdwJyxcbiAgICAnXFx1QTc1NSc6ICdwJyxcbiAgICAnXFx1MjRFMCc6ICdxJyxcbiAgICAnXFx1RkY1MSc6ICdxJyxcbiAgICAnXFx1MDI0Qic6ICdxJyxcbiAgICAnXFx1QTc1Nyc6ICdxJyxcbiAgICAnXFx1QTc1OSc6ICdxJyxcbiAgICAnXFx1MjRFMSc6ICdyJyxcbiAgICAnXFx1RkY1Mic6ICdyJyxcbiAgICAnXFx1MDE1NSc6ICdyJyxcbiAgICAnXFx1MUU1OSc6ICdyJyxcbiAgICAnXFx1MDE1OSc6ICdyJyxcbiAgICAnXFx1MDIxMSc6ICdyJyxcbiAgICAnXFx1MDIxMyc6ICdyJyxcbiAgICAnXFx1MUU1Qic6ICdyJyxcbiAgICAnXFx1MUU1RCc6ICdyJyxcbiAgICAnXFx1MDE1Nyc6ICdyJyxcbiAgICAnXFx1MUU1Ric6ICdyJyxcbiAgICAnXFx1MDI0RCc6ICdyJyxcbiAgICAnXFx1MDI3RCc6ICdyJyxcbiAgICAnXFx1QTc1Qic6ICdyJyxcbiAgICAnXFx1QTdBNyc6ICdyJyxcbiAgICAnXFx1QTc4Myc6ICdyJyxcbiAgICAnXFx1MjRFMic6ICdzJyxcbiAgICAnXFx1RkY1Myc6ICdzJyxcbiAgICAnXFx1MDBERic6ICdzJyxcbiAgICAnXFx1MDE1Qic6ICdzJyxcbiAgICAnXFx1MUU2NSc6ICdzJyxcbiAgICAnXFx1MDE1RCc6ICdzJyxcbiAgICAnXFx1MUU2MSc6ICdzJyxcbiAgICAnXFx1MDE2MSc6ICdzJyxcbiAgICAnXFx1MUU2Nyc6ICdzJyxcbiAgICAnXFx1MUU2Myc6ICdzJyxcbiAgICAnXFx1MUU2OSc6ICdzJyxcbiAgICAnXFx1MDIxOSc6ICdzJyxcbiAgICAnXFx1MDE1Ric6ICdzJyxcbiAgICAnXFx1MDIzRic6ICdzJyxcbiAgICAnXFx1QTdBOSc6ICdzJyxcbiAgICAnXFx1QTc4NSc6ICdzJyxcbiAgICAnXFx1MUU5Qic6ICdzJyxcbiAgICAnXFx1MjRFMyc6ICd0JyxcbiAgICAnXFx1RkY1NCc6ICd0JyxcbiAgICAnXFx1MUU2Qic6ICd0JyxcbiAgICAnXFx1MUU5Nyc6ICd0JyxcbiAgICAnXFx1MDE2NSc6ICd0JyxcbiAgICAnXFx1MUU2RCc6ICd0JyxcbiAgICAnXFx1MDIxQic6ICd0JyxcbiAgICAnXFx1MDE2Myc6ICd0JyxcbiAgICAnXFx1MUU3MSc6ICd0JyxcbiAgICAnXFx1MUU2Ric6ICd0JyxcbiAgICAnXFx1MDE2Nyc6ICd0JyxcbiAgICAnXFx1MDFBRCc6ICd0JyxcbiAgICAnXFx1MDI4OCc6ICd0JyxcbiAgICAnXFx1MkM2Nic6ICd0JyxcbiAgICAnXFx1QTc4Nyc6ICd0JyxcbiAgICAnXFx1QTcyOSc6ICd0eicsXG4gICAgJ1xcdTI0RTQnOiAndScsXG4gICAgJ1xcdUZGNTUnOiAndScsXG4gICAgJ1xcdTAwRjknOiAndScsXG4gICAgJ1xcdTAwRkEnOiAndScsXG4gICAgJ1xcdTAwRkInOiAndScsXG4gICAgJ1xcdTAxNjknOiAndScsXG4gICAgJ1xcdTFFNzknOiAndScsXG4gICAgJ1xcdTAxNkInOiAndScsXG4gICAgJ1xcdTFFN0InOiAndScsXG4gICAgJ1xcdTAxNkQnOiAndScsXG4gICAgJ1xcdTAwRkMnOiAndScsXG4gICAgJ1xcdTAxREMnOiAndScsXG4gICAgJ1xcdTAxRDgnOiAndScsXG4gICAgJ1xcdTAxRDYnOiAndScsXG4gICAgJ1xcdTAxREEnOiAndScsXG4gICAgJ1xcdTFFRTcnOiAndScsXG4gICAgJ1xcdTAxNkYnOiAndScsXG4gICAgJ1xcdTAxNzEnOiAndScsXG4gICAgJ1xcdTAxRDQnOiAndScsXG4gICAgJ1xcdTAyMTUnOiAndScsXG4gICAgJ1xcdTAyMTcnOiAndScsXG4gICAgJ1xcdTAxQjAnOiAndScsXG4gICAgJ1xcdTFFRUInOiAndScsXG4gICAgJ1xcdTFFRTknOiAndScsXG4gICAgJ1xcdTFFRUYnOiAndScsXG4gICAgJ1xcdTFFRUQnOiAndScsXG4gICAgJ1xcdTFFRjEnOiAndScsXG4gICAgJ1xcdTFFRTUnOiAndScsXG4gICAgJ1xcdTFFNzMnOiAndScsXG4gICAgJ1xcdTAxNzMnOiAndScsXG4gICAgJ1xcdTFFNzcnOiAndScsXG4gICAgJ1xcdTFFNzUnOiAndScsXG4gICAgJ1xcdTAyODknOiAndScsXG4gICAgJ1xcdTI0RTUnOiAndicsXG4gICAgJ1xcdUZGNTYnOiAndicsXG4gICAgJ1xcdTFFN0QnOiAndicsXG4gICAgJ1xcdTFFN0YnOiAndicsXG4gICAgJ1xcdTAyOEInOiAndicsXG4gICAgJ1xcdUE3NUYnOiAndicsXG4gICAgJ1xcdTAyOEMnOiAndicsXG4gICAgJ1xcdUE3NjEnOiAndnknLFxuICAgICdcXHUyNEU2JzogJ3cnLFxuICAgICdcXHVGRjU3JzogJ3cnLFxuICAgICdcXHUxRTgxJzogJ3cnLFxuICAgICdcXHUxRTgzJzogJ3cnLFxuICAgICdcXHUwMTc1JzogJ3cnLFxuICAgICdcXHUxRTg3JzogJ3cnLFxuICAgICdcXHUxRTg1JzogJ3cnLFxuICAgICdcXHUxRTk4JzogJ3cnLFxuICAgICdcXHUxRTg5JzogJ3cnLFxuICAgICdcXHUyQzczJzogJ3cnLFxuICAgICdcXHUyNEU3JzogJ3gnLFxuICAgICdcXHVGRjU4JzogJ3gnLFxuICAgICdcXHUxRThCJzogJ3gnLFxuICAgICdcXHUxRThEJzogJ3gnLFxuICAgICdcXHUyNEU4JzogJ3knLFxuICAgICdcXHVGRjU5JzogJ3knLFxuICAgICdcXHUxRUYzJzogJ3knLFxuICAgICdcXHUwMEZEJzogJ3knLFxuICAgICdcXHUwMTc3JzogJ3knLFxuICAgICdcXHUxRUY5JzogJ3knLFxuICAgICdcXHUwMjMzJzogJ3knLFxuICAgICdcXHUxRThGJzogJ3knLFxuICAgICdcXHUwMEZGJzogJ3knLFxuICAgICdcXHUxRUY3JzogJ3knLFxuICAgICdcXHUxRTk5JzogJ3knLFxuICAgICdcXHUxRUY1JzogJ3knLFxuICAgICdcXHUwMUI0JzogJ3knLFxuICAgICdcXHUwMjRGJzogJ3knLFxuICAgICdcXHUxRUZGJzogJ3knLFxuICAgICdcXHUyNEU5JzogJ3onLFxuICAgICdcXHVGRjVBJzogJ3onLFxuICAgICdcXHUwMTdBJzogJ3onLFxuICAgICdcXHUxRTkxJzogJ3onLFxuICAgICdcXHUwMTdDJzogJ3onLFxuICAgICdcXHUwMTdFJzogJ3onLFxuICAgICdcXHUxRTkzJzogJ3onLFxuICAgICdcXHUxRTk1JzogJ3onLFxuICAgICdcXHUwMUI2JzogJ3onLFxuICAgICdcXHUwMjI1JzogJ3onLFxuICAgICdcXHUwMjQwJzogJ3onLFxuICAgICdcXHUyQzZDJzogJ3onLFxuICAgICdcXHVBNzYzJzogJ3onLFxuICAgICdcXHUwMzg2JzogJ1xcdTAzOTEnLFxuICAgICdcXHUwMzg4JzogJ1xcdTAzOTUnLFxuICAgICdcXHUwMzg5JzogJ1xcdTAzOTcnLFxuICAgICdcXHUwMzhBJzogJ1xcdTAzOTknLFxuICAgICdcXHUwM0FBJzogJ1xcdTAzOTknLFxuICAgICdcXHUwMzhDJzogJ1xcdTAzOUYnLFxuICAgICdcXHUwMzhFJzogJ1xcdTAzQTUnLFxuICAgICdcXHUwM0FCJzogJ1xcdTAzQTUnLFxuICAgICdcXHUwMzhGJzogJ1xcdTAzQTknLFxuICAgICdcXHUwM0FDJzogJ1xcdTAzQjEnLFxuICAgICdcXHUwM0FEJzogJ1xcdTAzQjUnLFxuICAgICdcXHUwM0FFJzogJ1xcdTAzQjcnLFxuICAgICdcXHUwM0FGJzogJ1xcdTAzQjknLFxuICAgICdcXHUwM0NBJzogJ1xcdTAzQjknLFxuICAgICdcXHUwMzkwJzogJ1xcdTAzQjknLFxuICAgICdcXHUwM0NDJzogJ1xcdTAzQkYnLFxuICAgICdcXHUwM0NEJzogJ1xcdTAzQzUnLFxuICAgICdcXHUwM0NCJzogJ1xcdTAzQzUnLFxuICAgICdcXHUwM0IwJzogJ1xcdTAzQzUnLFxuICAgICdcXHUwM0M5JzogJ1xcdTAzQzknLFxuICAgICdcXHUwM0MyJzogJ1xcdTAzQzMnXG59O1xuXG52YXIgU2VsZWN0MyA9IHJlcXVpcmUoJy4vc2VsZWN0My1iYXNlJyk7XG52YXIgcHJldmlvdXNUcmFuc2Zvcm0gPSBTZWxlY3QzLnRyYW5zZm9ybVRleHQ7XG5cbi8qKlxuICogRXh0ZW5kZWQgdmVyc2lvbiBvZiB0aGUgdHJhbnNmb3JtVGV4dCgpIGZ1bmN0aW9uIHRoYXQgc2ltcGxpZmllcyBkaWFjcml0aWNzIHRvIHRoZWlyIGxhdGluMVxuICogY291bnRlcnBhcnRzLlxuICpcbiAqIE5vdGUgdGhhdCBpZiBhbGwgcXVlcnkgZnVuY3Rpb25zIGZldGNoIHRoZWlyIHJlc3VsdHMgZnJvbSBhIHJlbW90ZSBzZXJ2ZXIsIHlvdSBtYXkgbm90IG5lZWQgdGhpc1xuICogZnVuY3Rpb24sIGJlY2F1c2UgaXQgbWFrZXMgc2Vuc2UgdG8gcmVtb3ZlIGRpYWNyaXRpY3Mgc2VydmVyLXNpZGUgaW4gc3VjaCBjYXNlcy5cbiAqL1xuU2VsZWN0My50cmFuc2Zvcm1UZXh0ID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgdmFyIHJlc3VsdCA9ICcnO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBzdHJpbmcubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNoYXJhY3RlciA9IHN0cmluZ1tpXTtcbiAgICAgICAgcmVzdWx0ICs9IERJQUNSSVRJQ1NbY2hhcmFjdGVyXSB8fCBjaGFyYWN0ZXI7XG4gICAgfVxuICAgIHJldHVybiBwcmV2aW91c1RyYW5zZm9ybShyZXN1bHQpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcblxudmFyIFNlbGVjdDMgPSByZXF1aXJlKCcuL3NlbGVjdDMtYmFzZScpO1xuXG4vKipcbiAqIFNlbGVjdDMgRHJvcGRvd24gQ29uc3RydWN0b3IuXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBvYmplY3QuIEFjY2VwdHMgYWxsIG9wdGlvbnMgZnJvbSB0aGUgU2VsZWN0MyBCYXNlIENvbnN0cnVjdG9yLlxuICovXG5mdW5jdGlvbiBTZWxlY3QzRHJvcGRvd24ob3B0aW9ucykge1xuXG4gICAgU2VsZWN0My5jYWxsKHRoaXMsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIE1ldGhvZHMuXG4gKi9cbiQuZXh0ZW5kKFNlbGVjdDNEcm9wZG93bi5wcm90b3R5cGUsIHtcblxuXG5cbn0pO1xuXG5TZWxlY3QzLkRyb3Bkb3duID0gU2VsZWN0M0Ryb3Bkb3duO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdDNEcm9wZG93bjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcblxudmFyIFNlbGVjdDMgPSByZXF1aXJlKCcuL3NlbGVjdDMtYmFzZScpO1xuXG4vKipcbiAqIE11bHRpcGxlU2VsZWN0MyBDb25zdHJ1Y3Rvci5cbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIG9iamVjdC4gQWNjZXB0cyBhbGwgb3B0aW9ucyBmcm9tIHRoZSBTZWxlY3QzIEJhc2UgQ29uc3RydWN0b3IuXG4gKi9cbmZ1bmN0aW9uIE11bHRpcGxlU2VsZWN0MyhvcHRpb25zKSB7XG5cbiAgICBTZWxlY3QzLmNhbGwodGhpcywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLiRlbC5odG1sKHRoaXMudGVtcGxhdGUoJ211bHRpU2VsZWN0SW5wdXQnLCB0aGlzLm9wdGlvbnMpKTtcblxuICAgIHRoaXMuX2hpZ2hsaWdodGVkSXRlbUlkID0gbnVsbDtcblxuICAgIHRoaXMuX3JlcmVuZGVyU2VsZWN0aW9uKCk7XG59XG5cbk11bHRpcGxlU2VsZWN0My5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFNlbGVjdDMucHJvdG90eXBlKTtcbk11bHRpcGxlU2VsZWN0My5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNdWx0aXBsZVNlbGVjdDM7XG5cbi8qKlxuICogTWV0aG9kcy5cbiAqL1xuJC5leHRlbmQoTXVsdGlwbGVTZWxlY3QzLnByb3RvdHlwZSwge1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhbiBpdGVtIHRvIHRoZSBzZWxlY3Rpb24sIGlmIGl0J3Mgbm90IHNlbGVjdGVkIHlldC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBpdGVtIFRoZSBpdGVtIHRvIGFkZC4gTWF5IGJlIGFuIGl0ZW0gd2l0aCAnaWQnIGFuZCAndGV4dCcgcHJvcGVydGllcyBvciBqdXN0IGFuIElELlxuICAgICAqL1xuICAgIGFkZDogZnVuY3Rpb24oaXRlbSkge1xuXG4gICAgICAgIGlmIChTZWxlY3QzLmlzVmFsaWRJZChpdGVtKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3ZhbHVlLmluZGV4T2YoaXRlbSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdmFsdWUucHVzaChpdGVtKTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaW5pdFNlbGVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuaW5pdFNlbGVjdGlvbihbaXRlbV0sIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl92YWx1ZS5sYXN0SW5kZXhPZihpdGVtKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGF0YS5wdXNoKHRoaXMudmFsaWRhdGVJdGVtKGRhdGFbMF0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kYXRhLnB1c2godGhpcy5nZXRJdGVtRm9ySWQoaXRlbSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGl0ZW0gPSB0aGlzLnZhbGlkYXRlSXRlbShpdGVtKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl92YWx1ZS5pbmRleE9mKGl0ZW0uaWQpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RhdGEucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZS5wdXNoKGl0ZW0uaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50cyBtYXAuXG4gICAgICpcbiAgICAgKiBGb2xsb3dzIHRoZSBzYW1lIGZvcm1hdCBhcyBCYWNrYm9uZTogaHR0cDovL2JhY2tib25lanMub3JnLyNWaWV3LWRlbGVnYXRlRXZlbnRzXG4gICAgICovXG4gICAgZXZlbnRzOiB7XG4gICAgICAgICdjaGFuZ2UnOiAnX3JlcmVuZGVyU2VsZWN0aW9uJyxcbiAgICAgICAgJ2NsaWNrIC5zZWxlY3QzLWl0ZW0tcmVtb3ZlJzogJ19pdGVtUmVtb3ZlQ2xpY2tlZCcsXG4gICAgICAgICdjbGljayAuc2VsZWN0My1zZWxlY3RlZC1pdGVtJzogJ19pdGVtQ2xpY2tlZCcsXG4gICAgICAgICdmb2N1cyAuc2VsZWN0My1zZWxlY3RlZC1pdGVtJzogJ19mb2N1c2VkJyxcbiAgICAgICAgJ2tleXVwIC5zZWxlY3QzLW11bHRpcGxlLWlucHV0JzogJ19rZXlSZWxlYXNlZCcsXG4gICAgICAgICdwYXN0ZSAuc2VsZWN0My1tdWx0aXBsZS1pbnB1dCc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2V0VGltZW91dCh0aGlzLnNlYXJjaC5iaW5kKHRoaXMpLCAxMCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXBwbGllcyBmb2N1cyB0byB0aGUgaW5wdXQuXG4gICAgICovXG4gICAgZm9jdXM6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHRoaXMuX2dldElucHV0KCkuZm9jdXMoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgY29ycmVjdCBkYXRhIGZvciBhIGdpdmVuIHZhbHVlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBnZXQgdGhlIGRhdGEgZm9yLiBTaG91bGQgYmUgYW4gYXJyYXkgb2YgSURzLlxuICAgICAqXG4gICAgICogQHJldHVybiBUaGUgY29ycmVzcG9uZGluZyBkYXRhLiBXaWxsIGJlIGFuIGFycmF5IG9mIG9iamVjdHMgd2l0aCAnaWQnIGFuZCAndGV4dCcgcHJvcGVydGllcy5cbiAgICAgKiAgICAgICAgIE5vdGUgdGhhdCBpZiBubyBpdGVtcyBhcmUgZGVmaW5lZCwgdGhpcyBtZXRob2QgYXNzdW1lcyB0aGUgdGV4dCBsYWJlbHMgd2lsbCBiZSBlcXVhbFxuICAgICAqICAgICAgICAgdG8gdGhlIElEcy5cbiAgICAgKi9cbiAgICBnZXREYXRhRm9yVmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlLm1hcCh0aGlzLmdldEl0ZW1Gb3JJZC5iaW5kKHRoaXMpKS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkgeyByZXR1cm4gISFpdGVtOyB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgY29ycmVjdCB2YWx1ZSBmb3IgdGhlIGdpdmVuIGRhdGEuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBnZXQgdGhlIHZhbHVlIGZvci4gU2hvdWxkIGJlIGFuIGFycmF5IG9mIG9iamVjdHMgd2l0aCAnaWQnIGFuZCAndGV4dCdcbiAgICAgKiAgICAgICAgICAgICBwcm9wZXJ0aWVzLlxuICAgICAqXG4gICAgICogQHJldHVybiBUaGUgY29ycmVzcG9uZGluZyB2YWx1ZS4gV2lsbCBiZSBhbiBhcnJheSBvZiBJRHMuXG4gICAgICovXG4gICAgZ2V0VmFsdWVGb3JEYXRhOiBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgcmV0dXJuIGRhdGEubWFwKGZ1bmN0aW9uKGl0ZW0pIHsgcmV0dXJuIGl0ZW0uaWQ7IH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFuIGl0ZW0gZnJvbSB0aGUgc2VsZWN0aW9uLCBpZiBpdCBpcyBzZWxlY3RlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBpdGVtIFRoZSBpdGVtIHRvIHJlbW92ZS4gTWF5IGJlIGFuIGl0ZW0gd2l0aCAnaWQnIGFuZCAndGV4dCcgcHJvcGVydGllcyBvciBqdXN0IGFuIElELlxuICAgICAqL1xuICAgIHJlbW92ZTogZnVuY3Rpb24oaXRlbSkge1xuXG4gICAgICAgIHZhciBpZCA9ICgkLnR5cGUoaXRlbSkgPT09ICdvYmplY3QnID8gaXRlbS5pZCA6IGl0ZW0pO1xuXG4gICAgICAgIHZhciBpbmRleCA9IFNlbGVjdDMuZmluZEluZGV4QnlJZCh0aGlzLml0ZW1zLCBpZCk7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLl9kYXRhLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cblxuICAgICAgICBpbmRleCA9IHRoaXMuX3ZhbHVlLmluZGV4T2YoaWQpO1xuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5fdmFsdWUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpZCA9PT0gdGhpcy5faGlnaGxpZ2h0ZWRJdGVtSWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2hpZ2hsaWdodGVkSXRlbUlkID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBWYWxpZGF0ZXMgZGF0YSB0byBzZXQuIFRocm93cyBhbiBleGNlcHRpb24gaWYgdGhlIGRhdGEgaXMgaW52YWxpZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIHZhbGlkYXRlLiBTaG91bGQgYmUgYW4gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoICdpZCcgYW5kICd0ZXh0J1xuICAgICAqICAgICAgICAgICAgIHByb3BlcnRpZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIFRoZSB2YWxpZGF0ZWQgZGF0YS4gVGhpcyBtYXkgZGlmZmVyIGZyb20gdGhlIGlucHV0IGRhdGEuXG4gICAgICovXG4gICAgdmFsaWRhdGVEYXRhOiBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfSBlbHNlIGlmICgkLnR5cGUoZGF0YSkgPT09ICdhcnJheScpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLm1hcCh0aGlzLnZhbGlkYXRlSXRlbS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRGF0YSBmb3IgTXVsdGlTZWxlY3QzIGluc3RhbmNlIHNob3VsZCBiZSBhcnJheScpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFZhbGlkYXRlcyBhIHZhbHVlIHRvIHNldC4gVGhyb3dzIGFuIGV4Y2VwdGlvbiBpZiB0aGUgdmFsdWUgaXMgaW52YWxpZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gdmFsaWRhdGUuIFNob3VsZCBiZSBhbiBhcnJheSBvZiBJRHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIFRoZSB2YWxpZGF0ZWQgdmFsdWUuIFRoaXMgbWF5IGRpZmZlciBmcm9tIHRoZSBpbnB1dCB2YWx1ZS5cbiAgICAgKi9cbiAgICB2YWxpZGF0ZVZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9IGVsc2UgaWYgKCQudHlwZSh2YWx1ZSkgPT09ICdhcnJheScpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5ldmVyeShTZWxlY3QzLmlzVmFsaWRJZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVmFsdWUgY29udGFpbnMgaW52YWxpZCBJRHMnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVmFsdWUgZm9yIE11bHRpU2VsZWN0MyBpbnN0YW5jZSBzaG91bGQgYmUgYW4gYXJyYXknKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfYmFja3NwYWNlUHJlc3NlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuX2hpZ2hsaWdodGVkSXRlbUlkKSB7XG4gICAgICAgICAgICB0aGlzLl9kZWxldGVQcmVzc2VkKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fdmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLl9oaWdobGlnaHRJdGVtKHRoaXMuX3ZhbHVlLnNsaWNlKC0xKVswXSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX2RlbGV0ZVByZXNzZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmICh0aGlzLl9oaWdobGlnaHRlZEl0ZW1JZCkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmUodGhpcy5faGlnaGxpZ2h0ZWRJdGVtSWQpO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC50cmlnZ2VyKCdjaGFuZ2UnKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfZm9jdXNlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaG93RHJvcGRvd24pIHtcbiAgICAgICAgICAgIHRoaXMub3BlbigpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9nZXRJbnB1dDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuJCgnLnNlbGVjdDMtbXVsdGlwbGUtaW5wdXQ6bm90KC5zZWxlY3QzLXdpZHRoLWRldGVjdG9yKScpO1xuICAgIH0sXG5cbiAgICBfZ2V0SXRlbUlkOiBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIC8vIHJldHVybnMgdGhlIGl0ZW0gSUQgcmVsYXRlZCB0byBhbiBldmVudCB0YXJnZXQuXG4gICAgICAgIC8vIElEcyBjYW4gYmUgZWl0aGVyIG51bWJlcnMgb3Igc3RyaW5ncywgYnV0IGF0dHJpYnV0ZSB2YWx1ZXMgYXJlIGFsd2F5cyBzdHJpbmdzLCBzbyB3ZVxuICAgICAgICAvLyB3aWxsIGhhdmUgdG8gZmluZCBvdXQgd2hldGhlciB0aGUgaXRlbSBJRCBvdWdodCB0byBiZSBhIG51bWJlciBvciBzdHJpbmcgb3Vyc2VsdmVzLlxuICAgICAgICAvLyAkLmZuLmRhdGEoKSBpcyBhIGJpdCBvdmVyemVhbG91cyBmb3Igb3VyIGNhc2UsIGJlY2F1c2UgaXQgcmV0dXJucyBhIG51bWJlciB3aGVuZXZlciB0aGVcbiAgICAgICAgLy8gYXR0cmlidXRlIHZhbHVlIGNhbiBiZSBwYXJzZWQgYXMgYSBudW1iZXIuIGhvd2V2ZXIsIGl0IGlzIHBvc3NpYmxlIGFuIGl0ZW0gaGFkIGFuIElEXG4gICAgICAgIC8vIHdoaWNoIGlzIGEgc3RyaW5nIGJ1dCB3aGljaCBpcyBwYXJzZWFibGUgYXMgbnVtYmVyLCBpbiB3aGljaCBjYXNlIHdlIHZlcmlmeSBpZiB0aGUgSURcbiAgICAgICAgLy8gYXMgbnVtYmVyIGlzIGFjdHVhbGx5IGZvdW5kIGFtb25nIHRoZSBkYXRhIG9yIHJlc3VsdHMuIGlmIGl0IGlzbid0LCB3ZSBhc3N1bWUgaXQgd2FzXG4gICAgICAgIC8vIHN1cHBvc2VkIHRvIGJlIGEgc3RyaW5nIGFmdGVyIGFsbC4uLlxuXG4gICAgICAgIHZhciBpZCA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCdbZGF0YS1pdGVtLWlkXScpLmRhdGEoJ2l0ZW0taWQnKTtcbiAgICAgICAgaWYgKCQudHlwZShpZCkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoU2VsZWN0My5maW5kQnlJZCh0aGlzLmRhdGEsIGlkKSB8fCBTZWxlY3QzLmZpbmRCeUlkKHRoaXMucmVzdWx0cywgaWQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJycgKyBpZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfaGlnaGxpZ2h0SXRlbTogZnVuY3Rpb24oaWQpIHtcblxuICAgICAgICB0aGlzLl9oaWdobGlnaHRlZEl0ZW1JZCA9IGlkO1xuICAgICAgICB0aGlzLiQoJy5zZWxlY3QzLXNlbGVjdGVkLWl0ZW0nKS5yZW1vdmVDbGFzcygnaGlnaGxpZ2h0ZWQnKVxuICAgICAgICAgICAgLmZpbHRlcignW2RhdGEtaXRlbS1pZD0nICsgU2VsZWN0My5xdW90ZUNzc0F0dHIoaWQpICsgJ10nKS5hZGRDbGFzcygnaGlnaGxpZ2h0ZWQnKTtcblxuICAgICAgICBpZiAodGhpcy5oYXNLZXlib2FyZCkge1xuICAgICAgICAgICAgdGhpcy5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9pdGVtQ2xpY2tlZDogZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICB0aGlzLl9oaWdobGlnaHRJdGVtKHRoaXMuX2dldEl0ZW1JZChldmVudCkpO1xuICAgIH0sXG5cbiAgICBfaXRlbVJlbW92ZUNsaWNrZWQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdGhpcy5yZW1vdmUodGhpcy5fZ2V0SXRlbUlkKGV2ZW50KSk7XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBfa2V5UmVsZWFzZWQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIGlucHV0SGFzVGV4dCA9IHRoaXMuX2dldElucHV0KCkudmFsKCk7XG5cbiAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IFNlbGVjdDMuS2V5cy5FTlRFUiAmJiAhZXZlbnQuY3RybEtleSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaGlnaGxpZ2h0ZWRSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZCh0aGlzLmhpZ2hsaWdodGVkUmVzdWx0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IFNlbGVjdDMuS2V5cy5CQUNLU1BBQ0UgJiYgIWlucHV0SGFzVGV4dCkge1xuICAgICAgICAgICAgdGhpcy5fYmFja3NwYWNlUHJlc3NlZCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PT0gU2VsZWN0My5LZXlzLkRFTEVURSAmJiAhaW5wdXRIYXNUZXh0KSB7XG4gICAgICAgICAgICB0aGlzLl9kZWxldGVQcmVzc2VkKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5rZXlDb2RlID09PSBTZWxlY3QzLktleXMuRVNDQVBFKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3NlYXJjaCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fdXBkYXRlSW5wdXRXaWR0aCgpO1xuICAgIH0sXG5cbiAgICBfcmVyZW5kZXJTZWxlY3Rpb246IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHRoaXMuJCgnLnNlbGVjdDMtc2VsZWN0ZWQtaXRlbScpLnJlbW92ZSgpO1xuXG4gICAgICAgIHZhciAkaW5wdXQgPSB0aGlzLl9nZXRJbnB1dCgpO1xuICAgICAgICB0aGlzLl9kYXRhLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgJGlucHV0LmJlZm9yZSh0aGlzLnRlbXBsYXRlKCdtdWx0aVNlbGVjdEl0ZW0nLCAkLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0ZWQ6IChpdGVtLmlkID09PSB0aGlzLl9oaWdobGlnaHRlZEl0ZW1JZClcbiAgICAgICAgICAgIH0sIGl0ZW0pKSk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICBfc2VhcmNoOiBmdW5jdGlvbigpIHtcblxuICAgICAgICB0aGlzLnNlYXJjaCh0aGlzLl9nZXRJbnB1dCgpLnZhbCgpKTtcbiAgICB9LFxuXG4gICAgX3VwZGF0ZUlucHV0V2lkdGg6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciAkaW5wdXQgPSB0aGlzLl9nZXRJbnB1dCgpLCAkd2lkdGhEZXRlY3RvciA9IHRoaXMuJCgnLnNlbGVjdDMtd2lkdGgtZGV0ZWN0b3InKTtcbiAgICAgICAgJHdpZHRoRGV0ZWN0b3IudGV4dCgkaW5wdXQudmFsKCkgfHwgdGhpcy5fZGF0YS5sZW5ndGggJiYgdGhpcy5vcHRpb25zLnBsYWNlaG9sZGVyIHx8ICcnKTtcbiAgICAgICAgJGlucHV0LndpZHRoKCR3aWR0aERldGVjdG9yLndpZHRoKCkgKyAyMCk7XG4gICAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNdWx0aXBsZVNlbGVjdDM7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5cbnZhciBTZWxlY3QzID0gcmVxdWlyZSgnLi9zZWxlY3QzLWJhc2UnKTtcblxuLyoqXG4gKiBTaW5nbGVTZWxlY3QzIENvbnN0cnVjdG9yLlxuICpcbiAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgb2JqZWN0LiBBY2NlcHRzIGFsbCBvcHRpb25zIGZyb20gdGhlIFNlbGVjdDMgQmFzZSBDb25zdHJ1Y3Rvci5cbiAqL1xuZnVuY3Rpb24gU2luZ2xlU2VsZWN0MyhvcHRpb25zKSB7XG5cbiAgICBTZWxlY3QzLmNhbGwodGhpcywgb3B0aW9ucyk7XG59XG5cblNpbmdsZVNlbGVjdDMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTZWxlY3QzLnByb3RvdHlwZSk7XG5TaW5nbGVTZWxlY3QzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNpbmdsZVNlbGVjdDM7XG5cbi8qKlxuICogTWV0aG9kcy5cbiAqL1xuJC5leHRlbmQoU2luZ2xlU2VsZWN0My5wcm90b3R5cGUsIHtcblxuICAgIC8qKlxuICAgICAqIEV2ZW50cyBtYXAuXG4gICAgICpcbiAgICAgKiBGb2xsb3dzIHRoZSBzYW1lIGZvcm1hdCBhcyBCYWNrYm9uZTogaHR0cDovL2JhY2tib25lanMub3JnLyNWaWV3LWRlbGVnYXRlRXZlbnRzXG4gICAgICovXG4gICAgZXZlbnRzOiB7fSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGNvcnJlY3QgZGF0YSBmb3IgYSBnaXZlbiB2YWx1ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gZ2V0IHRoZSBkYXRhIGZvci4gU2hvdWxkIGJlIGFuIElELlxuICAgICAqXG4gICAgICogQHJldHVybiBUaGUgY29ycmVzcG9uZGluZyBkYXRhLiBXaWxsIGJlIGFuIG9iamVjdCB3aXRoICdpZCcgYW5kICd0ZXh0JyBwcm9wZXJ0aWVzLiBOb3RlIHRoYXRcbiAgICAgKiAgICAgICAgIGlmIG5vIGl0ZW1zIGFyZSBkZWZpbmVkLCB0aGlzIG1ldGhvZCBhc3N1bWVzIHRoZSB0ZXh0IGxhYmVsIHdpbGwgYmUgZXF1YWwgdG8gdGhlIElELlxuICAgICAqL1xuICAgIGdldERhdGFGb3JWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRJdGVtRm9ySWQodmFsdWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBjb3JyZWN0IHZhbHVlIGZvciB0aGUgZ2l2ZW4gZGF0YS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGdldCB0aGUgdmFsdWUgZm9yLiBTaG91bGQgYmUgYW4gb2JqZWN0IHdpdGggJ2lkJyBhbmQgJ3RleHQnXG4gICAgICogICAgICAgICAgICAgcHJvcGVydGllcyBvciBudWxsLlxuICAgICAqXG4gICAgICogQHJldHVybiBUaGUgY29ycmVzcG9uZGluZyB2YWx1ZS4gV2lsbCBiZSBhbiBJRCBvciBudWxsLlxuICAgICAqL1xuICAgIGdldFZhbHVlRm9yRGF0YTogZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgIHJldHVybiAoZGF0YSA/IGRhdGEuaWQgOiBudWxsKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVmFsaWRhdGVzIGRhdGEgdG8gc2V0LiBUaHJvd3MgYW4gZXhjZXB0aW9uIGlmIHRoZSBkYXRhIGlzIGludmFsaWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byB2YWxpZGF0ZS4gU2hvdWxkIGJlIGFuIG9iamVjdCB3aXRoICdpZCcgYW5kICd0ZXh0JyBwcm9wZXJ0aWVzIG9yIG51bGxcbiAgICAgKiAgICAgICAgICAgICB0byBpbmRpY2F0ZSBubyBpdGVtIGlzIHNlbGVjdGVkLlxuICAgICAqXG4gICAgICogQHJldHVybiBUaGUgdmFsaWRhdGVkIGRhdGEuIFRoaXMgbWF5IGRpZmZlciBmcm9tIHRoZSBpbnB1dCBkYXRhLlxuICAgICAqL1xuICAgIHZhbGlkYXRlRGF0YTogZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgIHJldHVybiAoZGF0YSA9PT0gbnVsbCA/IGRhdGEgOiB0aGlzLnZhbGlkYXRlSXRlbShkYXRhKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFZhbGlkYXRlcyBhIHZhbHVlIHRvIHNldC4gVGhyb3dzIGFuIGV4Y2VwdGlvbiBpZiB0aGUgdmFsdWUgaXMgaW52YWxpZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gdmFsaWRhdGUuIFNob3VsZCBiZSBudWxsIG9yIGEgdmFsaWQgSUQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIFRoZSB2YWxpZGF0ZWQgdmFsdWUuIFRoaXMgbWF5IGRpZmZlciBmcm9tIHRoZSBpbnB1dCB2YWx1ZS5cbiAgICAgKi9cbiAgICB2YWxpZGF0ZVZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCBTZWxlY3QzLmlzVmFsaWRJZCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVmFsdWUgZm9yIFNpbmdsZVNlbGVjdDMgaW5zdGFuY2Ugc2hvdWxkIGJlIGEgdmFsaWQgSUQgb3IgbnVsbCcpO1xuICAgICAgICB9XG4gICAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaW5nbGVTZWxlY3QzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXNjYXBlID0gcmVxdWlyZSgnLi9lc2NhcGUnKTtcblxudmFyIFNlbGVjdDMgPSByZXF1aXJlKCcuL3NlbGVjdDMtYmFzZScpO1xuXG4vKipcbiAqIERlZmF1bHQgc2V0IG9mIHRlbXBsYXRlcyB0byB1c2Ugd2l0aCBTZWxlY3QzLlxuICpcbiAqIE5vdGUgdGhhdCBldmVyeSB0ZW1wbGF0ZSBjYW4gYmUgZGVmaW5lZCBhcyBlaXRoZXIgYSBzdHJpbmcsIGEgZnVuY3Rpb24gcmV0dXJuaW5nIGEgc3RyaW5nIChsaWtlXG4gKiBIYW5kbGViYXJzIHRlbXBsYXRlcywgZm9yIGluc3RhbmNlKSBvciBhcyBhbiBvYmplY3QgY29udGFpbmluZyBhIHJlbmRlciBmdW5jdGlvbiAobGlrZSBIb2dhbi5qc1xuICogdGVtcGxhdGVzLCBmb3IgaW5zdGFuY2UpLlxuICovXG5TZWxlY3QzLlRlbXBsYXRlcyA9IHtcblxuICAgIC8qKlxuICAgICAqIFJlbmRlcnMgbXVsdGktc2VsZWN0aW9uIGlucHV0IGJveGVzLlxuICAgICAqXG4gICAgICogVGhlIHRlbXBsYXRlIGlzIGV4cGVjdGVkIHRvIGhhdmUgYXQgbGVhc3QgaGF2ZSBlbGVtZW50cyB3aXRoIHRoZSBmb2xsb3dpbmcgY2xhc3NlczpcbiAgICAgKiAnc2VsZWN0My1tdWx0aXBsZS1pbnB1dCcgLSBUaGUgYWN0dWFsIGlucHV0IGVsZW1lbnQgdGhhdCBhbGxvd3MgdGhlIHVzZXIgdG8gdHlwZSB0byBzZWFyY2hcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgbW9yZSBpdGVtcy4gV2hlbiBzZWxlY3RlZCBpdGVtcyBhcmUgYWRkZWQsIHRoZXkgYXJlIGluc2VydGVkXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHQgYmVmb3JlIHRoaXMgZWxlbWVudC5cbiAgICAgKiAnc2VsZWN0My13aWR0aC1kZXRlY3RvcicgLSBUaGlzIGVsZW1lbnQgaXMgb3B0aW9uYWwsIGJ1dCBpbXBvcnRhbnQgdG8gbWFrZSBzdXJlIHRoZVxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICcuc2VsZWN0My1tdWx0aXBsZS1pbnB1dCcgZWxlbWVudCB3aWxsIGZpdCBpbiB0aGUgY29udGFpbmVyLiBUaGVcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCBkZXRlY3RvciBhbHNvIGhhcyB0aGUgJ3NlbGVjdDItbXVsdGlwbGUtaW5wdXQnIGNsYXNzIG9uXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVycG9zZSB0byBiZSBhYmxlIHRvIGRldGVjdCB0aGUgd2lkdGggb2YgdGV4dCBlbnRlcmVkIGluIHRoZVxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0IGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIG9iamVjdCBjb250YWluaW5nIHRoZSBmb2xsb3dpbmcgcHJvcGVydHk6XG4gICAgICogICAgICAgICAgICAgICAgcGxhY2Vob2xkZXIgLSBTdHJpbmcgY29udGFpbmluZyB0aGUgcGxhY2Vob2xkZXIgdGV4dCB0byBkaXNwbGF5IGlmIG5vIGl0ZW1zXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmUgc2VsZWN0ZWQuIE1heSBiZSBlbXB0eSBpZiBubyBwbGFjZWhvbGRlciBpcyBkZWZpbmVkLlxuICAgICAqL1xuICAgIG11bHRpU2VsZWN0SW5wdXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwic2VsZWN0My1tdWx0aXBsZS1pbnB1dC1jb250YWluZXJcIj4nICtcbiAgICAgICAgICAgICAgICAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgYXV0b2NvbXBsZXRlPVwib2ZmXCIgYXV0b2NvcnJlY3Q9XCJvZmZcIiBhdXRvY2FwaXRhbGl6ZT1cIm9mZlwiICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAnY2xhc3M9XCJzZWxlY3QzLW11bHRpcGxlLWlucHV0XCIgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICdwbGFjZWhvbGRlcj1cIicgKyBlc2NhcGUob3B0aW9ucy5wbGFjZWhvbGRlcikgKyAnXCI+JyArXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwic2VsZWN0My1tdWx0aXBsZS1pbnB1dCBzZWxlY3QzLXdpZHRoLWRldGVjdG9yXCI+PC9zcGFuPicgK1xuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY2xlYXJmaXhcIj48L2Rpdj4nICtcbiAgICAgICAgICAgICc8L2Rpdj4nXG4gICAgICAgICk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlcnMgbXVsdGktc2VsZWN0aW9uIGlucHV0IGJveGVzLlxuICAgICAqXG4gICAgICogVGhlIHRlbXBsYXRlIGlzIGV4cGVjdGVkIHRvIGhhdmUgYSB0b3AtbGV2ZWwgZWxlbWVudCB3aXRoIHRoZSBjbGFzcyAnc2VsZWN0My1zZWxlY3RlZC1pdGVtJy5cbiAgICAgKiBUaGlzIGVsZW1lbnQgaXMgYWxzbyByZXF1aXJlZCB0byBoYXZlIGEgJ2RhdGEtaXRlbS1pZCcgYXR0cmlidXRlIHdpdGggdGhlIElEIHNldCB0byB0aGF0XG4gICAgICogcGFzc2VkIHRocm91Z2ggdGhlIG9wdGlvbnMgb2JqZWN0LlxuICAgICAqXG4gICAgICogQW4gZWxlbWVudCB3aXRoIHRoZSBjbGFzcyAnc2VsZWN0My1pdGVtLXJlbW92ZScgc2hvdWxkIGJlIHByZXNlbnQgd2hpY2gsIHdoZW4gY2xpY2tlZCwgd2lsbFxuICAgICAqIGNhdXNlIHRoZSBlbGVtZW50IHRvIGJlIHJlbW92ZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIG9iamVjdCBjb250YWluaW5nIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAgICAgKiAgICAgICAgICAgICAgICBoaWdobGlnaHRlZCAtIEJvb2xlYW4gd2hldGhlciB0aGlzIGl0ZW0gaXMgY3VycmVudGx5IGhpZ2hsaWdodGVkLlxuICAgICAqICAgICAgICAgICAgICAgIGlkIC0gSWRlbnRpZmllciBmb3IgdGhlIGl0ZW0uXG4gICAgICogICAgICAgICAgICAgICAgdGV4dCAtIFRleHQgbGFiZWwgd2hpY2ggdGhlIHVzZXIgc2Vlcy5cbiAgICAgKi9cbiAgICBtdWx0aVNlbGVjdEl0ZW06IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGV4dHJhQ2xhc3MgPSAob3B0aW9ucy5oaWdobGlnaHRlZCA/ICcgaGlnaGxpZ2h0ZWQnIDogJycpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwic2VsZWN0My1zZWxlY3RlZC1pdGVtJyArIGV4dHJhQ2xhc3MgKyAnXCIgJyArXG4gICAgICAgICAgICAgICAgICAnZGF0YS1pdGVtLWlkPVwiJyArIGVzY2FwZShvcHRpb25zLmlkKSArICdcIj4nICtcbiAgICAgICAgICAgICAgICBlc2NhcGUob3B0aW9ucy50ZXh0KSArXG4gICAgICAgICAgICAgICAgJzxhIGNsYXNzPVwic2VsZWN0My1pdGVtLXJlbW92ZVwiPicgK1xuICAgICAgICAgICAgICAgICAgICAnPGkgY2xhc3M9XCJmYSBmYS1yZW1vdmVcIj48L2k+JyArXG4gICAgICAgICAgICAgICAgJzwvYT4nICtcbiAgICAgICAgICAgICc8L3NwYW4+J1xuICAgICAgICApO1xuICAgIH1cblxufTtcbiJdfQ==
