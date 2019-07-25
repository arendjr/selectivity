import Selectivity from "../selectivity";
import { assign } from "../util/object";

function defaultTokenizer(input, selection, createToken, options) {
    const createTokenItem =
        options.createTokenItem ||
        function(token) {
            return token ? { id: token, text: token } : null;
        };

    const allowDuplicates = options.allowDuplicates;
    const separators = options.tokenSeparators;
    const trim = options.trimSpaces;

    function hasToken(input) {
        return input
            ? separators.some(function(separator) {
                  return input.trim().indexOf(separator) > -1;
              })
            : false;
    }

    function takeToken(input) {
        const trimmedInput = trim ? input.trim() : input;
        for (let i = 0, length = trimmedInput.length; i < length; i++) {
            if (separators.indexOf(trimmedInput[i]) > -1) {
                const term = trimmedInput.slice(0, i);
                input = trimmedInput.slice(i + 1);
                return {
                    term: trim ? term.trim() : term,
                    input: trim ? input.trim() : input,
                };
            }
        }
        return {};
    }

    while (hasToken(input)) {
        const token = takeToken(input);
        if (token.term) {
            const item = createTokenItem(token.term);
            if (item && (allowDuplicates || !Selectivity.findById(selection, item.id))) {
                createToken(item);
            }
        }
        input = token.input;
    }

    return input;
}

/**
 * Option listener that provides a default tokenizer which is used when the tokenSeparators option
 * is specified.
 *
 * @param options Options object. In addition to the options supported in the multi-input
 *                implementation, this may contain the following property:
 *                tokenSeparators - Array of string separators which are used to separate the search
 *                                  string into tokens. If specified and the tokenizer property is
 *                                  not set, the tokenizer property will be set to a function which
 *                                  splits the search term into tokens separated by any of the given
 *                                  separators. The tokens will be converted into selectable items
 *                                  using the 'createTokenItem' function. The default tokenizer also
 *                                  filters out already selected items.
 */
Selectivity.OptionListeners.push(function(selectivity, options) {
    if (options.tokenSeparators) {
        options.allowedTypes = assign({ tokenSeparators: "array" }, options.allowedTypes);

        options.tokenizer = options.tokenizer || defaultTokenizer;
    }
});
