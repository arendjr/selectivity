'use strict';

var $ = require('jquery');

var Selectivity = require('./selectivity-base');
var MultipleSelectivity = require('./selectivity-multiple');

function isValidEmail(email) {

    var atIndex = email.indexOf('@');
    var dotIndex = email.lastIndexOf('.');
    var spaceIndex = email.indexOf(' ');
    return (atIndex > 0 && dotIndex > atIndex + 1 &&
            dotIndex < email.length - 2 && spaceIndex === -1);
}

function lastWord(token, length) {

    length = (length === undefined ? token.length : length);
    for (var i = length - 1; i >= 0; i--) {
        if ((/\s/).test(token[i])) {
            return token.slice(i + 1, length);
        }
    }
    return token.slice(0, length);
}

function stripEnclosure(token, enclosure) {

    if (token.slice(0, 1) === enclosure[0] && token.slice(-1) === enclosure[1]) {
        return token.slice(1, -1).trim();
    } else {
        return token.trim();
    }
}

function createEmailItem(token) {

    var email = lastWord(token);
    var name = token.slice(0, -email.length).trim();
    if (isValidEmail(email)) {
        email = stripEnclosure(stripEnclosure(email, '()'), '<>');
        name = stripEnclosure(name, '""').trim() || email;
        return { id: email, text: name };
    } else {
        return (token.trim() ? { id: token, text: token } : null);
    }
}

function emailTokenizer(input, selection, createToken) {

    function hasToken(input) {
        if (input) {
            for (var i = 0, length = input.length; i < length; i++) {
                switch (input[i]) {
                case ';':
                case ',':
                case '\n':
                    return true;
                case ' ':
                case '\t':
                    if (isValidEmail(lastWord(input, i))) {
                        return true;
                    }
                    break;
                case '"':
                    do { i++; } while(i < length && input[i] !== '"');
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
            case ' ':
            case '\t':
                if (isValidEmail(lastWord(input, i))) {
                    return { term: input.slice(0, i), input: input.slice(i + 1) };
                }
                break;
            case '"':
                do { i++; } while(i < length && input[i] !== '"');
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
            var item = createEmailItem(token.term);
            if (item && !(item.id && Selectivity.findById(selection, item.id))) {
                createToken(item);
            }
        }
        input = token.input;
    }

    return input;
}

/**
 * Emailselectivity Constructor.
 *
 * @param options Options object. Accepts all options from the MultipleSelectivity Constructor.
 */
function Emailselectivity(options) {

    MultipleSelectivity.call(this, options);
}

/**
 * Methods.
 */
var callSuper = Selectivity.inherits(Emailselectivity, MultipleSelectivity, {

    /**
     * @inherit
     */
    initSearchInput: function($input) {

        callSuper(this, 'initSearchInput', $input);

        $input.on('blur', function() {
            var term = $input.val();
            if (isValidEmail(lastWord(term))) {
                this.add(createEmailItem(term));
            }
        }.bind(this));
    },

    /**
     * @inherit
     *
     * Note that for the Email input type the option showDropdown is set to false and the tokenizer
     * option is set to a tokenizer specialized for email addresses.
     */
    setOptions: function(options) {

        options = $.extend({
            createTokenItem: createEmailItem,
            showDropdown: false,
            tokenizer: emailTokenizer
        }, options);

        callSuper(this, 'setOptions', options);
    }

});

module.exports = Selectivity.InputTypes.Email = Emailselectivity;
