'use strict';

var $ = require('jquery');
var isString = require('lodash/isString');

var Selectivity = require('../selectivity');

var EVENT_PROPERTIES = {
    'change': ['added', 'removed', 'value'],
    'selectivity-change': ['added', 'removed', 'value'],
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
 *                inputType - The input type to use. Default inputs include 'Multiple' and 'Single',
 *                            but you can add custom inputs to the Selectivity.Inputs map or just
 *                            specify one here as a function. The default value is 'Multiple' if
 *                            `multiple` is true and 'Single' otherwise.
 *                multiple - Boolean determining whether multiple items may be selected
 *                           (default: false). If true, the default `inputType` is set to
 *                           'Multiple'.
 *
 * @return If the given method returns a value, this method returns the value of that method
 *         executed on the first element in the set of matched elements.
 */
$.fn.selectivity = function selectivity(methodName, options) {

    var methodArgs = Array.prototype.slice.call(arguments, 1);
    var result;

    this.each(function() {
        var instance = this.selectivity;

        if (instance) {
            if (methodName === 'data') {
                methodName = (methodArgs.length ? 'setData' : 'getData');
            } else if (methodName === 'val' || methodName === 'value') {
                methodName = (methodArgs.length ? 'setValue' : 'getValue');
            } else if (!isString(methodName)) {
                methodArgs = [methodName];
                methodName = 'setOptions';
            }

            if ($.isFunction(instance[methodName])) {
                if (result === undefined) {
                    result = instance[methodName].apply(instance, methodArgs);
                }
            } else {
                throw new Error('Unknown method: ' + methodName);
            }
        } else if (isString(methodName)) {
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

            var Inputs = Selectivity.Inputs;
            var InputType = (options.inputType || (options.multiple ? 'Multiple' : 'Single'));
            if (!$.isFunction(InputType)) {
                if (Inputs[InputType]) {
                    InputType = Inputs[InputType];
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
};

Selectivity.patchEvents = patchEvents;

$.Selectivity = Selectivity;
