'use strict';

var $ = require('jquery');

var Selectivity = require('../selectivity');

var EVENT_PROPERTIES = {
    'change': ['added', 'removed', 'value'],
    'selectivity-highlight': ['id', 'item'],
    'selectivity-selected': ['id', 'item'],
    'selectivity-selecting': ['id', 'item']
};

// create event listeners that will copy the custom properties from the native events
// to the jQuery events, so jQuery users can use them seamlessly
function patchEvents($el) {

    $.each(EVENT_PROPERTIES, function(eventName, properties) {
        $el.on(eventName, function(event) {
            if (event.originalEvent) {
                properties.forEach(function(propertyName) {
                    event[propertyName] = event.originalEvent[propertyName];
                });
            }
        });
    });
}

/**
 * Create a new Selectivity instance or invoke a method on an instance.
 *
 * @param methodName Optional name of a method to call. If omitted, a Selectivity instance is
 *                   created for each element in the set of matched elements. If an element in the
 *                   set already has a Selectivity instance, the result is the same as if the
 *                   setOptions() method is called. If a method name is given, the options
 *                   parameter is ignored and any additional parameters are passed to the given
 *                   method.
 * @param options Options object to pass to the constructor or the setOptions() method. In case
 *                a new instance is being created, the following properties are used:
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

    var methodArgs = Array.prototype.slice.call(arguments, 1);
    var result;

    this.each(function() {
        var instance = this.selectivity;

        if (instance) {
            if (typeof methodName !== 'string') {
                methodArgs = [methodName];
                methodName = 'setOptions';
            }

            if (typeof instance[methodName] === 'function') {
                if (result === undefined) {
                    result = instance[methodName].apply(instance, methodArgs);
                }
            } else {
                throw new Error('Unknown method: ' + methodName);
            }
        } else if (typeof methodName === 'string') {
            if (methodName !== 'destroy') {
                throw new Error('Cannot call method on element without Selectivity instance');
            }
        } else {
            options = $.extend({}, methodName, { element: this });

            // this is a one-time hack to facilitate the "traditional" plugin, because
            // the plugin is not able to hook this early into creation of the instance
            var $this = $(this);
            if ($this.is('select') && $this.prop('multiple')) {
                options.multiple = true;
            }

            var InputTypes = Selectivity.InputTypes;
            var InputType = (options.inputType || (options.multiple ? 'Multiple' : 'Single'));
            if (typeof InputType !== 'function') {
                if (InputTypes[InputType]) {
                    InputType = InputTypes[InputType];
                } else {
                    throw new Error('Unknown Selectivity input type: ' + InputType);
                }
            }

            this.selectivity = new InputType(options);
            $this = $(this.selectivity.el);

            patchEvents($this);

            if (result === undefined) {
                result = $this;
            }
        }
    });

    return (result === undefined ? this : result);
}

Selectivity.patchEvents = patchEvents;

selectivity.Selectivity = Selectivity;

$.fn.selectivity = selectivity;

module.exports = Selectivity;
