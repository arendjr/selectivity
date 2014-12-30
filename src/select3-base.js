'use strict';

var $ = window.$;

/**
 * Select3 Base Constructor.
 *
 * You will never use this constructor directly. Instead, you use $(selector).select3(options) to
 * create an instance of either MultipleSelect3 or SingleSelect3. This class defines all
 * functionality that is common between both.
 *
 * @param options Options object. Accepts the same options as the setOptions method(), in addition
 *                to the following:
 *                multiple - Boolean determining whether multiple items may be selected
 *                           (default: false).
 */
function Select3(options) {

    this.setOptions(options);
}

/**
 * Methods.
 */
$.extend(Select3.prototype, {

    /**
     * Sets one or more options on this Select3 instance.
     *
     * @param options Options object. May contain one or more of the following properties:
     *                query - Function to use for fetching items.
     *                templates - Object with instance-specific templates to override the global
     *                            templates assigned to Select3.Templates.
     */
    setOptions: function(options) {

        this.options = options;

        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                var value = options[key];
                switch (key) {
                case 'templates':
                    this.templates = $.extend({}, Select3.Templates, this.templates, value);
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
    }
});

/**
 * Mapping with templates to use for rendering select boxes and dropdowns. See select3-templates.js
 * for a useful set of default templates, as well as for documentation of the individual templates.
 */
Select3.Templates = {};

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
 *                documentation for the respective methods to see which options they accept.
 *
 * @return If the given method returns a value, this method returns the value of that method
 *         executed on the first element in the set of matched elements.
 */
$.fn.select3 = function(methodName, options) {

    var result;

    this.each(function() {
        var $this = $(this);
        var instance = $this.data('Select3');
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
                options = methodName;
                if (options.multiple) {
                    instance = new (require('./select3-multiple'))(options);
                } else {
                    instance = new (require('./select3-single'))(options);
                }
                $this.data('Select3', instance);
            }
        }
    });

    return result;
};

module.exports = Select3;
