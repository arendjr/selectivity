'use strict';

var assign = require('lodash/assign');

var MultipleInput = require('./multiple');
var Selectivity = require('../selectivity');

function isValidName(name) {
    return /^[a-zA-Z'\-\s]+$/.test(name);
}

function lastFullName(token, length) {
    length = length === undefined ? token.length : length;
    for (var i = length - 1; i >= 0; i--) {
        if (/,|;|\n|\t/.test(token[i])) {
            return token.slice(i + 1, length);
        }
    }
    return token.slice(0, length);
}

function createNameItem(token) {
    var name = lastFullName(token);
    return name.trim() ? { id: name, text: name } : null;
}

function nameTokenizer(input, selection, createToken) {
    function hasToken(input) {
        if (input) {
            for (var i = 0, length = input.length; i < length; i++) {
                switch (input[i]) {
                    case ';':
                    case ',':
                    case '\n':
                        return true;
                    case '\t':
                        if (isValidName(lastFullName(input, i))) {
                            return true;
                        }
                        break;
                    default:
                        continue;
                }
            }
        }
        return false;
    }

    function takeToken(input) {
        for (var i = 0, length = input.length; i < length; i++) {
            switch (input[i]) {
                case ';':
                case ',':
                case '\n':
                    return { term: input.slice(0, i), input: input.slice(i + 1) };
                case '\t':
                    if (isValidName(lastFullName(input, i))) {
                        return { term: input.slice(0, i), input: input.slice(i + 1) };
                    }
                    break;
                default:
                    continue;
            }
        }
        return {};
    }

    while (hasToken(input)) {
        var token = takeToken(input);
        if (token.term) {
            var item = createNameItem(token.term);
            if (item && !(item.id && Selectivity.findById(selection, item.id))) {
                createToken(item);
            }
        }
        input = token.input;
    }

    return input;
}

/**
 * NameInput Constructor.
 *
 * @param options Options object. Accepts all options from the MultipleInput Constructor.
 */
function NameInput(options) {
    MultipleInput.call(
        this,
        assign(
            {
                createTokenItem: createNameItem,
                showDropdown: false,
                tokenizer: nameTokenizer
            },
            options
        )
    );

    this.events.on('blur', function() {
        var input = this.input;
        if (input && isValidName(lastFullName(input.value))) {
            this.add(createNameItem(input.value));
        }
    });
}

Selectivity.inherits(NameInput, MultipleInput);

module.exports = Selectivity.Inputs.Name = NameInput;
