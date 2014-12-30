'use strict';

var $ = require('jquery');

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
     * Array of items from which to select. If set, this will be an array of objects with 'id' and
     * 'text' properties.
     *
     * If given, all items are expected to be available locally and all selection operations operate
     * on this local array only. If null, items are not available locally, and a query function
     * should be provided to fetch remote data.
     */
    this.items = null;

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
}

/**
 * Methods.
 */
$.extend(Select3.prototype, {

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

            this.$el.trigger('change');
        }
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
            if (item && Select3.isValidID(item.id)) {
                return item;
            } else if (Select3.isValidID(item)) {
                return { id: item, text: '' + item };
            } else {
                throw new Error('items array contains invalid items');
            }
        }

        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                var value = options[key];
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

        var self = this;
        if ($.type(newValue) === 'undefined') {
            return self._value;
        } else {
            newValue = self.validateValue(newValue);

            self._value = newValue;

            if (self.options.initSelection) {
                self.options.initSelection(newValue, function(data) {
                    if (self._value === newValue) {
                        self._data = self.validateData(data);

                        self.$el.trigger('change');
                    }
                });
            } else {
                self._data = self.getDataForValue(newValue);

                self.$el.trigger('change');
            }
        }
    }

});

/**
 * Mapping with templates to use for rendering select boxes and dropdowns. See select3-templates.js
 * for a useful set of default templates, as well as for documentation of the individual templates.
 */
Select3.Templates = {};

/**
 * Checks whether a value can be used as a valid ID for selection items. Only numbers and strings
 * are accepted to be used as IDs.
 *
 * @param id The value to check whether it is a valid ID.
 *
 * @return true if the value is a valid ID, false otherwise.
 */
Select3.isValidID = function(id) {

    var type = $.type(id);
    return type === 'number' || type === 'string';
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
