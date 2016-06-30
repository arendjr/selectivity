'use strict';

var Selectivity = require('../selectivity');

var allowedOptions = {
    allowClear: 'boolean',
    backspaceHighlightsBeforeDelete: 'boolean',
    closeOnSelect: 'boolean',
    createTokenItem: 'function',
    dropdown: 'function|null',
    initSelection: 'function|null',
    inputListeners: 'array',
    items: 'array|null',
    matcher: 'function|null',
    placeholder: 'string',
    positionDropdown: 'function|null',
    query: 'function|null',
    readOnly: 'boolean',
    removeOnly: 'boolean',
    shouldOpenSubmenu: 'function',
    showSearchInputInDropdown: 'boolean',
    suppressWheelSelector: 'string|null',
    tabIndex: 'number',
    templates: 'object',
    tokenizer: 'function'
};

/**
 * Option listener that validates the options being set. This is useful during debugging to quickly
 * get notified if you're passing invalid options.
 */
Selectivity.OptionListeners.unshift(function(selectivity, options) {

    for (var key in options) {
        if (!options.hasOwnProperty(key)) {
            continue;
        }

        var value = options[key];
        var type = allowedOptions[key];
        if (type && !type.split('|').some(function(type) {
            if (type === 'null') {
                return value === null;
            } else if (type === 'array') {
                return Array.isArray(value);
            } else {
                return value !== null && value !== undefined && typeof value === type;
            }
        })) {
            throw new Error(key + ' must be of type ' + type);
        }
    }

});
