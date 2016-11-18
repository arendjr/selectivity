/**
 * @license
 * Selectivity.js 3.0.0-alpha <https://arendjr.github.io/selectivity/>
 * Copyright (c) 2014-2016 Arend van Beelen jr.
 *           (c) 2016 Speakap BV
 * Available under MIT license <https://github.com/arendjr/selectivity/blob/master/LICENSE>
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.selectivity = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var root = _dereq_(6);

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;

},{"6":6}],2:[function(_dereq_,module,exports){
/**
 * The base implementation of `_.propertyOf` without support for deep paths.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyOf(object) {
  return function(key) {
    return object == null ? undefined : object[key];
  };
}

module.exports = basePropertyOf;

},{}],3:[function(_dereq_,module,exports){
var Symbol = _dereq_(1),
    isSymbol = _dereq_(14);

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = baseToString;

},{"1":1,"14":14}],4:[function(_dereq_,module,exports){
var basePropertyOf = _dereq_(2);

/** Used to map characters to HTML entities. */
var htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;'
};

/**
 * Used by `_.escape` to convert characters to HTML entities.
 *
 * @private
 * @param {string} chr The matched character to escape.
 * @returns {string} Returns the escaped character.
 */
var escapeHtmlChar = basePropertyOf(htmlEscapes);

module.exports = escapeHtmlChar;

},{"2":2}],5:[function(_dereq_,module,exports){
(function (global){
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(_dereq_,module,exports){
var freeGlobal = _dereq_(5);

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;

},{"5":5}],7:[function(_dereq_,module,exports){
var isObject = _dereq_(11),
    now = _dereq_(15),
    toNumber = _dereq_(16);

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

module.exports = debounce;

},{"11":11,"15":15,"16":16}],8:[function(_dereq_,module,exports){
var escapeHtmlChar = _dereq_(4),
    toString = _dereq_(17);

/** Used to match HTML entities and HTML characters. */
var reUnescapedHtml = /[&<>"'`]/g,
    reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

/**
 * Converts the characters "&", "<", ">", '"', "'", and "\`" in `string` to
 * their corresponding HTML entities.
 *
 * **Note:** No other characters are escaped. To escape additional
 * characters use a third-party library like [_he_](https://mths.be/he).
 *
 * Though the ">" character is escaped for symmetry, characters like
 * ">" and "/" don't need escaping in HTML and have no special meaning
 * unless they're part of a tag or unquoted attribute value. See
 * [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
 * (under "semi-related fun fact") for more details.
 *
 * Backticks are escaped because in IE < 9, they can break out of
 * attribute values or HTML comments. See [#59](https://html5sec.org/#59),
 * [#102](https://html5sec.org/#102), [#108](https://html5sec.org/#108), and
 * [#133](https://html5sec.org/#133) of the
 * [HTML5 Security Cheatsheet](https://html5sec.org/) for more details.
 *
 * When working with HTML you should always
 * [quote attribute values](http://wonko.com/post/html-escaping) to reduce
 * XSS vectors.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escape('fred, barney, & pebbles');
 * // => 'fred, barney, &amp; pebbles'
 */
function escape(string) {
  string = toString(string);
  return (string && reHasUnescapedHtml.test(string))
    ? string.replace(reUnescapedHtml, escapeHtmlChar)
    : string;
}

module.exports = escape;

},{"17":17,"4":4}],9:[function(_dereq_,module,exports){
/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;

},{}],10:[function(_dereq_,module,exports){
var isObject = _dereq_(11);

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array and weak map constructors,
  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

module.exports = isFunction;

},{"11":11}],11:[function(_dereq_,module,exports){
/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = isObject;

},{}],12:[function(_dereq_,module,exports){
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],13:[function(_dereq_,module,exports){
var isArray = _dereq_(9),
    isObjectLike = _dereq_(12);

/** `Object#toString` result references. */
var stringTag = '[object String]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' ||
    (!isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag);
}

module.exports = isString;

},{"12":12,"9":9}],14:[function(_dereq_,module,exports){
var isObjectLike = _dereq_(12);

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

module.exports = isSymbol;

},{"12":12}],15:[function(_dereq_,module,exports){
/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
function now() {
  return Date.now();
}

module.exports = now;

},{}],16:[function(_dereq_,module,exports){
var isFunction = _dereq_(10),
    isObject = _dereq_(11),
    isSymbol = _dereq_(14);

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = isFunction(value.valueOf) ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = toNumber;

},{"10":10,"11":11,"14":14}],17:[function(_dereq_,module,exports){
var baseToString = _dereq_(3);

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

module.exports = toString;

},{"3":3}],18:[function(_dereq_,module,exports){
'use strict';

var $ = (window.jQuery || window.Zepto);
var isString = _dereq_(13);

var Selectivity = _dereq_(35);

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
            if (!isString(methodName)) {
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

},{"13":13,"35":35,"jquery":"jquery"}],19:[function(_dereq_,module,exports){
'use strict';

var extend = (window.jQuery || window.Zepto).extend;

var EventListener = _dereq_(20);
var getItemSelector = _dereq_(38);
var matchesSelector = _dereq_(40);
var parseElement = _dereq_(41);
var removeElement = _dereq_(42);
var stopPropagation = _dereq_(43);
var toggleClass = _dereq_(44);

var Selectivity = _dereq_(35);

var HIGHLIGHT_CLASS = 'highlight';
var HIGHLIGHT_SELECTOR = '.' + HIGHLIGHT_CLASS;
var LOAD_MORE_SELECTOR = '.selectivity-load-more';
var RESULT_ITEM_SELECTOR = '.selectivity-result-item';

var SCROLL_EVENTS = ['scroll', 'touchend', 'touchmove'];

function findClosestElementMatchingSelector(el, selector) {

    while (el && !matchesSelector(el, selector)) {
        el = el.parentElement;
    }
    return el || null;
}

/**
 * Selectivity Dropdown Constructor.
 *
 * @param selectivity Selectivity instance to which the dropdown belongs.
 * @param options Options object. Should have the following properties:
 *                highlightFirstItem - Set to false if you don't want the first item to be
 *                                     automatically highlighted (optional).
 *                items - Array of items to display.
 *                position - Callback for positioning the dropdown.
 *                query - Callback to fetch the items to display.
 *                showSearchInput - Boolean whether a search input should be shown.
 */
function SelectivityDropdown(selectivity, options) {

    this.el = parseElement(selectivity.template('dropdown', {
        dropdownCssClass: selectivity.options.dropdownCssClass,
        searchInputPlaceholder: selectivity.options.searchInputPlaceholder,
        showSearchInput: options.showSearchInput
    }));

    /**
     * DOM element to add the results to.
     */
    this.resultsContainer = this.$('.selectivity-results-container');

    /**
     * Boolean indicating whether more results are available than currently displayed in the
     * dropdown.
     */
    this.hasMore = false;

    /**
     * The currently highlighted result item.
     */
    this.highlightedResult = null;

    /**
     * Boolean whether the load more link is currently highlighted.
     */
    this.loadMoreHighlighted = false;

    /**
     * Options passed to the dropdown constructor.
     */
    this.options = options;

    /**
     * The results displayed in the dropdown.
     */
    this.results = [];

    /**
     * Selectivity instance.
     */
    this.selectivity = selectivity;

    this._closed = false;
    this._lastMousePosition = {};

    this.close = this.close.bind(this);
    this.position = this.position.bind(this);

    if (selectivity.options.closeOnSelect !== false) {
        selectivity.events.on('selectivity-selecting', this.close);
    }

    this.addToDom();
    this.showLoading();

    if (options.showSearchInput) {
        selectivity.initInput(this.$('.selectivity-search-input'));
        selectivity.focus();
    }

    var events = {};
    events['click ' + LOAD_MORE_SELECTOR] = this._loadMoreClicked;
    events['click ' + RESULT_ITEM_SELECTOR] = this._resultClicked;
    events['mouseenter ' + LOAD_MORE_SELECTOR] = this._loadMoreHovered;
    events['mouseenter ' + RESULT_ITEM_SELECTOR] = this._resultHovered;

    this.events = new EventListener(this.el, this);
    this.events.on(events);

    this._attachScrollListeners();
    this._suppressWheel();

    setTimeout(this.triggerOpen.bind(this), 1);
}

/**
 * Methods.
 */
extend(SelectivityDropdown.prototype, {

    /**
     * Convenience shortcut for this.el.querySelector(selector).
     */
    $: function(selector) {

        return this.el.querySelector(selector);
    },

    /**
     * Adds the dropdown to the DOM.
     */
    addToDom: function() {

        this.selectivity.el.appendChild(this.el);
    },

    /**
     * Closes the dropdown.
     */
    close: function() {

        if (!this._closed) {
            this._closed = true;

            removeElement(this.el);

            this.selectivity.events.off('selectivity-selecting', this.close);

            this.triggerClose();

            this._removeScrollListeners();
        }
    },

    /**
     * Highlights a result item.
     *
     * @param item The item to highlight.
     * @param options Optional options object that may contain the following property:
     *                reason - The reason why the result item is being highlighted. Possible
     *                         values: 'current_value', 'first_result', 'hovered'.
     */
    highlight: function(item, options) {

        toggleClass(this.$(HIGHLIGHT_SELECTOR), HIGHLIGHT_CLASS, false);
        toggleClass(this.$(getItemSelector(RESULT_ITEM_SELECTOR, item.id)), HIGHLIGHT_CLASS, true);

        this.highlightedResult = item;
        this.loadMoreHighlighted = false;

        this.selectivity.triggerEvent('selectivity-highlight', {
            item: item,
            id: item.id,
            reason: options && options.reason || 'unspecified'
        });
    },

    /**
     * Highlights the load more link.
     *
     * @param item The item to highlight.
     */
    highlightLoadMore: function() {

        toggleClass(this.$(HIGHLIGHT_SELECTOR), HIGHLIGHT_CLASS, false);
        toggleClass(this.$(LOAD_MORE_SELECTOR), HIGHLIGHT_CLASS, true);

        this.highlightedResult = null;
        this.loadMoreHighlighted = true;
    },

    /**
     * Loads a follow-up page with results after a search.
     *
     * This method should only be called after a call to search() when the callback has indicated
     * more results are available.
     */
    loadMore: function() {

        removeElement(this.$(LOAD_MORE_SELECTOR));
        this.resultsContainer.innerHTML += this.selectivity.template('loading');

        this.options.query({
            callback: function(response) {
                if (response && response.results) {
                    this._showResults(
                        Selectivity.processItems(response.results),
                        { add: true, hasMore: !!response.more }
                    );
                } else {
                    throw new Error('callback must be passed a response object');
                }
            }.bind(this),
            error: this._showResults.bind(this, [], { add: true }),
            offset: this.results.length,
            selectivity: this.selectivity,
            term: this.term
        });
    },

    /**
     * Positions the dropdown inside the DOM.
     */
    position: function() {

        var position = this.options.position;
        if (position) {
            position(this.el, this.selectivity.el);
        }

        this._scrolled();
    },

    /**
     * Renders an array of result items.
     *
     * @param items Array of result items.
     *
     * @return HTML-formatted string to display the result items.
     */
    renderItems: function(items) {

        var selectivity = this.selectivity;
        return items.map(function(item) {
            var result = selectivity.template(item.id ? 'resultItem' : 'resultLabel', item);
            if (item.children) {
                result += selectivity.template('resultChildren', {
                    childrenHtml: this.renderItems(item.children)
                });
            }
            return result;
        }, this).join('');
    },

    /**
     * Searches for results based on the term given or the term entered in the search input.
     *
     * If an items array has been passed with the options to the Selectivity instance, a local
     * search will be performed among those items. Otherwise, the query function specified in the
     * options will be used to perform the search. If neither is defined, nothing happens.
     *
     * @param term Term to search for.
     */
    search: function(term) {

        term = term || '';
        this.term = term;

        if (this.options.items) {
            term = Selectivity.transformText(term);
            var matcher = this.selectivity.matcher;
            this._showResults(this.options.items.map(function(item) {
                return matcher(item, term);
            }).filter(function(item) {
                return !!item;
            }), { term: term });
        } else if (this.options.query) {
            this.options.query({
                callback: function(response) {
                    if (response && response.results) {
                        this._showResults(
                            Selectivity.processItems(response.results),
                            { hasMore: !!response.more, term: term }
                        );
                    } else {
                        throw new Error('callback must be passed a response object');
                    }
                }.bind(this),
                error: this.showError.bind(this),
                offset: 0,
                selectivity: this.selectivity,
                term: term
            });
        }
    },

    /**
     * Selects the highlighted item.
     */
    selectHighlight: function() {

        if (this.highlightedResult) {
            this.selectItem(this.highlightedResult.id);
        } else if (this.loadMoreHighlighted) {
            this.loadMore();
        }
    },

    /**
     * Selects the item with the given ID.
     *
     * @param id ID of the item to select.
     */
    selectItem: function(id) {

        var item = Selectivity.findNestedById(this.results, id);
        if (item && !item.disabled && item.selectable !== false) {
            var options = { id: id, item: item };
            if (this.selectivity.triggerEvent('selectivity-selecting', options)) {
                this.selectivity.triggerEvent('selectivity-selected', options);
            }
        }
    },

    /**
     * Shows an error message.
     *
     * @param message Error message to display.
     * @param options Options object. May contain the following property:
     *                escape - Set to false to disable HTML-escaping of the message. Useful if you
     *                         want to set raw HTML as the message, but may open you up to XSS
     *                         attacks if you're not careful with escaping user input.
     */
    showError: function(message, options) {

        this.resultsContainer.innerHTML = this.selectivity.template('error', {
            escape: !options || options.escape !== false,
            message: message
        });

        this.hasMore = false;
        this.results = [];

        this.highlightedResult = null;
        this.loadMoreHighlighted = false;

        this.position();
    },

    /**
     * Shows a loading indicator in the dropdown.
     */
    showLoading: function() {

        this.resultsContainer.innerHTML = this.selectivity.template('loading');

        this.hasMore = false;
        this.results = [];

        this.highlightedResult = null;
        this.loadMoreHighlighted = false;

        this.position();
    },

    /**
     * Shows the results from a search query.
     *
     * @param results Array of result items.
     * @param options Options object. May contain the following properties:
     *                add - True if the results should be added to any already shown results.
     *                hasMore - Boolean whether more results can be fetched using the query()
     *                          function.
     *                term - The search term for which the results are displayed.
     */
    showResults: function(results, options) {

        if (options.add) {
            removeElement(this.$('.selectivity-loading'));
        } else {
            this.resultsContainer.innerHTML = '';
        }

        var resultsHtml = this.renderItems(results);
        if (options.hasMore) {
            resultsHtml += this.selectivity.template('loadMore');
        } else if (!resultsHtml && !options.add) {
            resultsHtml = this.selectivity.template('noResults', { term: options.term });
        }
        this.resultsContainer.innerHTML += resultsHtml;

        this.results = (options.add ? this.results.concat(results) : results);

        this.hasMore = options.hasMore;

        var value = this.selectivity.value();
        if (value && !Array.isArray(value)) {
            var item = Selectivity.findNestedById(results, value);
            if (item) {
                this.highlight(item, { reason: 'current_value' });
            }
        } else if (this.options.highlightFirstItem !== false &&
                   (!options.add || this.loadMoreHighlighted)) {
            this._highlightFirstItem(results);
        }

        this.position();
    },

    /**
     * Triggers the 'selectivity-close' event.
     */
    triggerClose: function() {

        this.selectivity.triggerEvent('selectivity-close');
    },

    /**
     * Triggers the 'selectivity-open' event.
     */
    triggerOpen: function() {

        this.selectivity.triggerEvent('selectivity-open');
    },

    /**
     * @private
     */
    _attachScrollListeners: function() {

        for (var i = 0; i < SCROLL_EVENTS.length; i++) {
            window.addEventListener(SCROLL_EVENTS[i], this.position, true);
        }
        window.addEventListener('resize', this.position);
    },

    /**
     * @private
     */
    _highlightFirstItem: function(results) {

        function findFirstItem(results) {
            for (var i = 0, length = results.length; i < length; i++) {
                var result = results[i];
                if (result.id) {
                    return result;
                } else if (result.children) {
                    var item = findFirstItem(result.children);
                    if (item) {
                        return item;
                    }
                }
            }
        }

        var firstItem = findFirstItem(results);
        if (firstItem) {
            this.highlight(firstItem, { reason: 'first_result' });
        } else {
            this.highlightedResult = null;
            this.loadMoreHighlighted = false;
        }
    },

    /**
     * @private
     */
    _loadMoreClicked: function(event) {

        this.loadMore();

        stopPropagation(event);
    },

    /**
     * @private
     */
    _loadMoreHovered: function(event) {

        if (event.screenX === undefined || event.screenX !== this._lastMousePosition.x ||
            event.screenY === undefined || event.screenY !== this._lastMousePosition.y) {
            this.highlightLoadMore();

            this._recordMousePosition(event);
        }
    },

    /**
     * @private
     */
    _recordMousePosition: function(event) {

        this._lastMousePosition = { x: event.screenX, y: event.screenY };
    },

    /**
     * @private
     */
    _removeScrollListeners: function() {

        for (var i = 0; i < SCROLL_EVENTS.length; i++) {
            window.removeEventListener(SCROLL_EVENTS[i], this.position, true);
        }
        window.removeEventListener('resize', this.position);
    },

    /**
     * @private
     */
    _resultClicked: function(event) {

        this.selectItem(this.selectivity.getRelatedItemId(event));

        stopPropagation(event);
    },

    /**
     * @private
     */
    _resultHovered: function(event) {

        if (!event.screenX || event.screenX !== this._lastMousePosition.x ||
            !event.screenY || event.screenY !== this._lastMousePosition.y) {
            var id = this.selectivity.getRelatedItemId(event);
            var item = Selectivity.findNestedById(this.results, id);
            if (item && !item.disabled) {
                this.highlight(item, { reason: 'hovered' });
            }

            this._recordMousePosition(event);
        }
    },

    /**
     * @private
     */
    _scrolled: function() {

        var el = this.$(LOAD_MORE_SELECTOR);
        if (el && el.offsetTop - this.resultsContainer.scrollTop < this.el.clientHeight) {
            this.loadMore();
        }
    },

    /**
     * @private
     */
    _showResults: function(results, options) {

        this.showResults(
            this.selectivity.filterResults(results),
            extend({ dropdown: this }, options)
        );
    },

    /**
     * @private
     */
    _suppressWheel: function() {

        var suppressWheelSelector = this.selectivity.options.suppressWheelSelector;
        if (suppressWheelSelector === null) {
            return;
        }

        var selector = suppressWheelSelector || '.selectivity-results-container';
        this.events.on('wheel', selector, function(event) {
            // Thanks to Troy Alford:
            // http://stackoverflow.com/questions/5802467/prevent-scrolling-of-parent-element

            var delta = (event.deltaMode === 0 ? event.deltaY : event.deltaY * 40);
            var el = findClosestElementMatchingSelector(event.target, selector);
            var height = el.clientHeight;
            var scrollHeight = el.scrollHeight;
            var scrollTop = el.scrollTop;

            function prevent() {
                stopPropagation(event);
                event.preventDefault();
            }

            if (scrollHeight > height) {
                if (delta < -scrollTop) {
                    // Scrolling up, but this will take us past the top.
                    el.scrollTop = 0;
                    prevent();
                } else if (delta > scrollHeight - height - scrollTop) {
                    // Scrolling down, but this will take us past the bottom.
                    el.scrollTop = scrollHeight;
                    prevent();
                }
            }
        });
    }

});

module.exports = Selectivity.Dropdown = SelectivityDropdown;

},{"20":20,"35":35,"38":38,"40":40,"41":41,"42":42,"43":43,"44":44,"lodash/extend":"lodash/extend"}],20:[function(_dereq_,module,exports){
'use strict';

var extend = (window.jQuery || window.Zepto).extend;
var isString = _dereq_(13);

var matchesSelector = _dereq_(40);

var CAPTURED_EVENTS = ['blur', 'focus', 'mouseenter', 'mouseleave', 'scroll'];

/**
 * Listens to events dispatched to an element or its children.
 *
 * @param el The element to listen to.
 * @param context Optional context in which to execute the callbacks.
 */
function EventListener(el, context) {

    this.context = context || null;

    this.el = el;

    this.events = {};

    this._onEvent = this._onEvent.bind(this);
}

extend(EventListener.prototype, {

    /**
     * Destructor.
     *
     * Removes all event listeners and cleans up all references.
     */
    destruct: function() {

        Object.keys(this.events).forEach(function(eventName) {
            var useCapture = CAPTURED_EVENTS.indexOf(eventName) > -1;
            this.el.removeEventListener(eventName, this._onEvent, useCapture);
        }, this);

        this.context = null;
        this.el = null;
        this.events = null;
    },

    /**
     * Stops listening to an event.
     *
     * The arguments are the same as for on(), but when no callback is given, all callbacks for the
     * given event and class are discarded.
     */
    off: function(eventName, selector, callback) {

        if (!isString(selector)) {
            callback = selector;
            selector = '';
        }

        if (callback) {
            var events = this.events[eventName][selector];
            for (var i = 0; i < events.length; i++) {
                if (events[i] === callback) {
                    events.splice(i, 1);
                    i--;
                }
            }
        } else {
            this.events[eventName][selector] = [];
        }
    },

    /**
     * Starts listening to an event.
     *
     * @param eventName Name of the event to listen to, in lower-case.
     * @param selector Optional CSS selector. If given, only events inside a child element matching
     *                 the selector are caught.
     * @param callback Callback to invoke when the event is caught.
     *
     * Alternatively, the arguments may be provided using a map to start listening to multiple
     * events at once. Here, the keys of the map are eventNames and the values are callbacks.
     * Selectors may be specified by separating them from the event name with a space. For example:
     *
     *     .on({
     *         'blur': this._blurred,
     *         'click .some-input': this._inputClicked,
     *     })
     */
    on: function(eventName, selector, callback) {

        if (!isString(eventName)) {
            var eventsMap = eventName;
            for (var key in eventsMap) {
                if (eventsMap.hasOwnProperty(key)) {
                    var split = key.split(' ');
                    if (split.length > 1) {
                        this.on(split[0], split[1], eventsMap[key]);
                    } else {
                        this.on(split[0], eventsMap[key]);
                    }
                }
            }
            return;
        }

        if (!isString(selector)) {
            callback = selector;
            selector = '';
        }

        if (!this.events.hasOwnProperty(eventName)) {
            var useCapture = CAPTURED_EVENTS.indexOf(eventName) > -1;
            this.el.addEventListener(eventName, this._onEvent, useCapture);

            this.events[eventName] = {};
        }

        if (!this.events[eventName].hasOwnProperty(selector)) {
            this.events[eventName][selector] = [];
        }

        if (this.events[eventName][selector].indexOf(callback) < 0) {
            this.events[eventName][selector].push(callback);
        }
    },

    _onEvent: function(event) {

        var isPropagationStopped = false;
        var stopPropagation = event.stopPropagation;
        event.stopPropagation = function() {
            stopPropagation.call(event);
            isPropagationStopped = true;
        };

        var context = this.context;
        function callAll(callbacks) {
            for (var i = 0; i < callbacks.length; i++) {
                callbacks[i].call(context, event);
            }
        }

        var target = event.target;
        var events = this.events[event.type.toLowerCase()];
        while (target && target !== this.el && !isPropagationStopped) {
            for (var selector in events) {
                if (selector && events.hasOwnProperty(selector) &&
                    matchesSelector(target, selector)) {
                    callAll(events[selector]);
                }
            }
            target = target.parentElement;
        }

        if (!isPropagationStopped && events.hasOwnProperty('')) {
            callAll(events['']);
        }
    }

});

module.exports = EventListener;

},{"13":13,"40":40,"lodash/extend":"lodash/extend"}],21:[function(_dereq_,module,exports){
'use strict';

var extend = (window.jQuery || window.Zepto).extend;

var MultipleInput = _dereq_(22);
var Selectivity = _dereq_(35);

function isValidEmail(email) {

    var atIndex = email.indexOf('@');
    if (atIndex === -1 || email.indexOf(' ') > -1) {
        return false; // email needs to have an '@', and may not contain any spaces
    }

    var dotIndex = email.lastIndexOf('.');
    if (dotIndex === -1) {
        // no dot is fine, as long as the '@' is followed by at least two more characters
        return atIndex < email.length - 2;
    }

    // but if there is a dot after the '@', it must be followed by at least two more characters
    return (dotIndex > atIndex ? dotIndex < email.length - 2 : true);
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

    if (token.charAt(0) === enclosure[0] && token.slice(-1) === enclosure[1]) {
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
                    do {
                        i++;
                    } while (i < length && input[i] !== '"');
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
                do {
                    i++;
                } while (i < length && input[i] !== '"');
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
 * EmailInput Constructor.
 *
 * @param options Options object. Accepts all options from the MultipleInput Constructor.
 */
function EmailInput(options) {

    MultipleInput.call(this, extend({
        createTokenItem: createEmailItem,
        showDropdown: false,
        tokenizer: emailTokenizer
    }, options));

    this.events.on('blur', function() {
        var input = this.input;
        if (input && isValidEmail(lastWord(input.value))) {
            this.add(createEmailItem(input.value));
        }
    });
}

Selectivity.inherits(EmailInput, MultipleInput);

module.exports = Selectivity.Inputs.Email = EmailInput;

},{"22":22,"35":35,"lodash/extend":"lodash/extend"}],22:[function(_dereq_,module,exports){
'use strict';

var extend = (window.jQuery || window.Zepto).extend;
var isString = _dereq_(13);

var Selectivity = _dereq_(35);
var getItemSelector = _dereq_(38);
var getKeyCode = _dereq_(39);
var parseElement = _dereq_(41);
var removeElement = _dereq_(42);
var stopPropagation = _dereq_(43);
var toggleClass = _dereq_(44);

var KEY_BACKSPACE = 8;
var KEY_DELETE = 46;
var KEY_ENTER = 13;

var INPUT_SELECTOR = '.selectivity-multiple-input';
var SELECTED_ITEM_SELECTOR = '.selectivity-multiple-selected-item';

var hasTouch = 'ontouchstart' in window;

/**
 * MultipleInput Constructor.
 */
function MultipleInput(options) {

    Selectivity.call(this, extend({
        // dropdowns for multiple-value inputs should open below the select box,
        // unless there is not enough space below, but there is space enough above, then it should
        // open upwards
        positionDropdown: function(el, selectEl) {
            var rect = selectEl.getBoundingClientRect();
            var dropdownHeight = el.clientHeight;
            var openUpwards = (rect.bottom + dropdownHeight > window.innerHeight &&
                               rect.top - dropdownHeight > 0);

            extend(el.style, {
                left: rect.left + 'px',
                top: (openUpwards ? rect.top - dropdownHeight : rect.bottom) + 'px',
                width: rect.width + 'px'
            });
        },

        showSearchInputInDropdown: false
    }, options));

    this.el.innerHTML = this.template('multipleSelectInput', { enabled: this.enabled });

    this._highlightedItemId = null;

    this.initInput(this.$(INPUT_SELECTOR + ':not(.selectivity-width-detector)'));

    this.rerenderSelection();

    var events = {
        'change': this.rerenderSelection,
        'click': this._clicked,
        'selectivity-selected': this._resultSelected
    };
    events['change ' + INPUT_SELECTOR] = stopPropagation;
    events['click ' + SELECTED_ITEM_SELECTOR] = this._itemClicked;
    events['click ' + SELECTED_ITEM_SELECTOR + '-remove'] = this._itemRemoveClicked;
    events['keydown ' + INPUT_SELECTOR] = this._keyHeld;
    events['keyup ' + INPUT_SELECTOR] = this._keyReleased;
    events['paste ' + INPUT_SELECTOR] = this._onPaste;

    this.events.on(events);
}

/**
 * Methods.
 */
var callSuper = Selectivity.inherits(MultipleInput, Selectivity, {

    /**
     * Adds an item to the selection, if it's not selected yet.
     *
     * @param item The item to add. May be an item with 'id' and 'text' properties or just an ID.
     */
    add: function(item) {

        var itemIsId = Selectivity.isValidId(item);
        var id = (itemIsId ? item : this.validateItem(item) && item.id);

        if (this._value.indexOf(id) === -1) {
            this._value.push(id);

            if (itemIsId && this.options.initSelection) {
                this.options.initSelection([id], function(data) {
                    if (this._value.indexOf(id) > -1) {
                        item = this.validateItem(data[0]);
                        this._data.push(item);

                        this.triggerChange({ added: item });
                    }
                }.bind(this));
            } else {
                if (itemIsId) {
                    item = this.getItemForId(id);
                }
                this._data.push(item);

                this.triggerChange({ added: item });
            }
        }

        this.input.value = '';
    },

    /**
     * Clears the data and value.
     */
    clear: function() {

        this.data([]);
    },

    /**
     * @inherit
     */
    filterResults: function(results) {

        return results.filter(function(item) {
            return !Selectivity.findById(this._data, item.id);
        }, this);
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

        return value.map(this.getItemForId, this).filter(function(item) {
            return !!item;
        });
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

        return data.map(function(item) {
            return item.id;
        });
    },

    /**
     * Removes an item from the selection, if it is selected.
     *
     * @param item The item to remove. May be an item with 'id' and 'text' properties or just an ID.
     */
    remove: function(item) {

        var id = item.id || item;

        var removedItem;
        var index = Selectivity.findIndexById(this._data, id);
        if (index > -1) {
            removedItem = this._data[index];
            this._data.splice(index, 1);
        }

        if (this._value[index] !== id) {
            index = this._value.indexOf(id);
        }
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
     * Re-renders the selection.
     *
     * Normally the UI is automatically updated whenever the selection changes, but you may want to
     * call this method explicitly if you've updated the selection with the triggerChange option set
     * to false.
     */
    rerenderSelection: function(event) {

        event = event || {};

        if (event.added) {
            this._renderSelectedItem(event.added);

            this._scrollToBottom();
        } else if (event.removed) {
            removeElement(this.$(getItemSelector(SELECTED_ITEM_SELECTOR, event.removed.id)));
        } else {
            var el;
            while ((el = this.$(SELECTED_ITEM_SELECTOR))) {
                removeElement(el);
            }

            this._data.forEach(this._renderSelectedItem, this);

            this._updateInputWidth();
        }

        if (event.added || event.removed) {
            if (this.dropdown) {
                this.dropdown.showResults(this.filterResults(this.dropdown.results), {
                    hasMore: this.dropdown.hasMore
                });
            }

            if (!hasTouch) {
                this.focus();
            }
        }

        this.positionDropdown();

        this._updatePlaceholder();
    },

    /**
     * @inherit
     */
    search: function() {

        if (this.options.tokenizer) {
            var term = this.options.tokenizer(this.input.value, this._data,
                                              this.add.bind(this), this.options);

            if (isString(term) && term !== this.input.value) {
                this.input.value = term;
            }
        }

        if (this.dropdown) {
            callSuper(this, 'search');
        }
    },

    /**
     * @inherit
     */
    setOptions: function(options) {

        var wasEnabled = this.enabled;

        callSuper(this, 'setOptions', options);

        if (wasEnabled !== this.enabled) {
            this.el.innerHTML = this.template('multipleSelectInput', { enabled: this.enabled });
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
        } else if (Array.isArray(data)) {
            return data.map(this.validateItem, this);
        } else {
            throw new Error('Data for MultiSelectivity instance should be an array');
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
        } else if (Array.isArray(value)) {
            if (value.every(Selectivity.isValidId)) {
                return value;
            } else {
                throw new Error('Value contains invalid IDs');
            }
        } else {
            throw new Error('Value for MultiSelectivity instance should be an array');
        }
    },

    /**
     * @private
     */
    _backspacePressed: function() {

        if (this.options.backspaceHighlightsBeforeDelete) {
            if (this._highlightedItemId) {
                this._deletePressed();
            } else if (this._value.length) {
                this._highlightItem(this._value.slice(-1)[0]);
            }
        } else if (this._value.length) {
            this.remove(this._value.slice(-1)[0]);
        }
    },

    /**
     * @private
     */
    _clicked: function(event) {

        if (this.enabled) {
            if (this.options.showDropdown !== false) {
                this.open();
            } else {
                this.focus();
            }

            stopPropagation(event);
        }
    },

    /**
     * @private
     */
    _createToken: function() {

        var term = this.input.value;
        var createTokenItem = this.options.createTokenItem;

        if (term && createTokenItem) {
            var item = createTokenItem(term);
            if (item) {
                this.add(item);
            }
        }
    },

    /**
     * @private
     */
    _deletePressed: function() {

        if (this._highlightedItemId) {
            this.remove(this._highlightedItemId);
        }
    },

    /**
     * @private
     */
    _highlightItem: function(id) {

        this._highlightedItemId = id;

        this.el.querySelectorAll(SELECTED_ITEM_SELECTOR).forEach(function(el) {
            toggleClass(el, 'highlighted', el.getAttribute('data-item-id') === id);
        });

        if (!hasTouch) {
            this.focus();
        }
    },

    /**
     * @private
     */
    _itemClicked: function(event) {

        if (this.enabled) {
            this._highlightItem(this.getRelatedItemId(event));
        }
    },

    /**
     * @private
     */
    _itemRemoveClicked: function(event) {

        this.remove(this.getRelatedItemId(event));

        this._updateInputWidth();

        stopPropagation(event);
    },

    /**
     * @private
     */
    _keyHeld: function(event) {

        this._originalValue = this.input.value;

        if (getKeyCode(event) === KEY_ENTER && !event.ctrlKey) {
            event.preventDefault();
        }
    },

    /**
     * @private
     */
    _keyReleased: function(event) {

        var inputHadText = !!this._originalValue;
        var keyCode = getKeyCode(event);

        if (keyCode === KEY_ENTER && !event.ctrlKey) {
            this._createToken();
        } else if (keyCode === KEY_BACKSPACE && !inputHadText) {
            this._backspacePressed();
        } else if (keyCode === KEY_DELETE && !inputHadText) {
            this._deletePressed();
        }

        this._updateInputWidth();
    },

    /**
     * @private
     */
    _onPaste: function() {

        setTimeout(function() {
            this.search();

            this._createToken();
        }.bind(this), 10);
    },

    /**
     * @private
     */
    _renderSelectedItem: function(item) {

        var el = parseElement(this.template('multipleSelectedItem', extend({
            highlighted: (item.id === this._highlightedItemId),
            removable: !this.options.readOnly
        }, item)));

        this.input.parentNode.insertBefore(el, this.input);
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

        var inputContainer = this.$(INPUT_SELECTOR + '-container');
        inputContainer.scrollTop = inputContainer.clientHeight;
    },

    /**
     * @private
     */
    _updateInputWidth: function() {

        if (this.enabled) {
            var widthDetector = this.$('.selectivity-width-detector');
            widthDetector.textContent = (this.input.value ||
                                         !this._data.length && this.options.placeholder || '');
            this.input.style.width = widthDetector.clientWidth + 20 + 'px';

            this.positionDropdown();
        }
    },

    /**
     * @private
     */
    _updatePlaceholder: function() {

        var placeholder = (!this._data.length && this.options.placeholder || '');
        if (this.enabled) {
            this.input.setAttribute('placeholder', placeholder);
        } else {
            this.$('.selectivity-placeholder').textContent = placeholder;
        }
    }

});

module.exports = Selectivity.Inputs.Multiple = MultipleInput;

},{"13":13,"35":35,"38":38,"39":39,"41":41,"42":42,"43":43,"44":44,"lodash/extend":"lodash/extend"}],23:[function(_dereq_,module,exports){
'use strict';

var extend = (window.jQuery || window.Zepto).extend;

var Selectivity = _dereq_(35);
var stopPropagation = _dereq_(43);

/**
 * SingleInput Constructor.
 */
function SingleInput(options) {

    Selectivity.call(this, extend({
        // dropdowns for single-value inputs should open below the select box,
        // unless there is not enough space below, in which case the dropdown should be moved up
        // just enough so it fits in the window, but never so much that it reaches above the top
        positionDropdown: function(el, selectEl) {
            var rect = selectEl.getBoundingClientRect();
            var dropdownTop = rect.bottom;

            var deltaUp = Math.min(
                Math.max(dropdownTop + el.clientHeight - window.innerHeight, 0),
                rect.top + rect.height
            );

            extend(el.style, {
                left: rect.left + 'px',
                top: dropdownTop - deltaUp + 'px',
                width: rect.width + 'px'
            });
        }
    }, options));

    this.el.innerHTML = this.template('singleSelectInput', this.options);

    this.rerenderSelection();

    if (options.showSearchInputInDropdown === false) {
        this.initInput(this.$('.selectivity-single-select-input'), { search: false });
    }

    this.events.on({
        'change': this.rerenderSelection,
        'click': this._clicked,
        'click .selectivity-search-input': stopPropagation,
        'click .selectivity-single-selected-item-remove': this._itemRemoveClicked,
        'focus .selectivity-single-select-input': this._focused,
        'selectivity-selected': this._resultSelected
    });
}

/**
 * Methods.
 */
var callSuper = Selectivity.inherits(SingleInput, Selectivity, {

    /**
     * Clears the data and value.
     */
    clear: function() {

        this.data(null);
    },

    /**
     * @inherit
     *
     * @param options Optional options object. May contain the following property:
     *                keepFocus - If true, the focus will remain on the input.
     */
    close: function(options) {

        this._closing = true;

        callSuper(this, 'close');

        if (options && options.keepFocus && this.input) {
            this.input.focus();
        }

        this._closing = false;
    },

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
     * Re-renders the selection.
     *
     * Normally the UI is automatically updated whenever the selection changes, but you may want to
     * call this method explicitly if you've updated the selection with the triggerChange option set
     * to false.
     */
    rerenderSelection: function() {

        var template = (this._data ? 'singleSelectedItem' : 'singleSelectPlaceholder');
        var options = (this._data ? extend({
            removable: this.options.allowClear && !this.options.readOnly
        }, this._data) : { placeholder: this.options.placeholder });

        this.$('.selectivity-single-result-container').innerHTML = this.template(template, options);
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

        if (value === null || Selectivity.isValidId(value)) {
            return value;
        } else {
            throw new Error('Value for SingleSelectivity instance should be a valid ID or null');
        }
    },

    /**
     * @private
     */
    _clicked: function() {

        if (this.enabled) {
            if (this.dropdown) {
                this.close({ keepFocus: true });
            } else if (this.options.showDropdown !== false) {
                this.open();
            }
        }
    },

    /**
     * @private
     */
    _focused: function() {

        if (this.enabled && !this._closing && !this._opening &&
            this.options.showDropdown !== false) {
            this.open();
        }
    },

    /**
     * @private
     */
    _itemRemoveClicked: function(event) {

        this.data(null);

        stopPropagation(event);
    },

    /**
     * @private
     */
    _resultSelected: function(event) {

        this.data(event.item);

        this.close({ keepFocus: true });
    }

});

module.exports = Selectivity.Inputs.Single = SingleInput;

},{"35":35,"43":43,"lodash/extend":"lodash/extend"}],24:[function(_dereq_,module,exports){
'use strict';

var escape = _dereq_(8);

var Selectivity = _dereq_(35);

/**
 * Localizable elements of the Selectivity Templates.
 *
 * Be aware that these strings are added straight to the HTML output of the templates, so any
 * non-safe strings should be escaped.
 */
module.exports = Selectivity.Locale = {

    loading: 'Loading...',
    loadMore: 'Load more...',
    noResults: 'No results found',

    ajaxError: function(term) {
        if (term) {
            return 'Failed to fetch results for <b>' + escape(term) + '</b>';
        } else {
            return 'Failed to fetch results';
        }
    },

    needMoreCharacters: function(numCharacters) {
        return 'Enter ' + numCharacters + ' more characters to search';
    },

    noResultsForTerm: function(term) {
        return 'No results for <b>' + escape(term) + '</b>';
    }

};

},{"35":35,"8":8}],25:[function(_dereq_,module,exports){
'use strict';

var debounce = _dereq_(7);

var Selectivity = _dereq_(35);
var Locale = _dereq_(24);

function addUrlParam(url, key, value) {
    return url + (url.indexOf('?') > -1 ? '&' : '?') + key + '=' + encodeURIComponent(value);
}

function pick(object, keys) {
    var result = {};
    keys.forEach(function(key) {
        if (object[key] !== undefined) {
            result[key] = object[key];
        }
    });
    return result;
}

function doFetch(ajax, queryOptions) {

    var fetch = ajax.fetch || window.fetch;
    var term = queryOptions.term;

    var url = (typeof ajax.url === 'function' ? ajax.url(queryOptions) : ajax.url);
    if (ajax.params) {
        var params = ajax.params(term, queryOptions.offset || 0);
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                url = addUrlParam(url, key, params[key]);
            }
        }
    }

    var init = pick(ajax, ['body', 'cache', 'credentials', 'headers', 'integrity', 'method', 'mode',
                           'redirect', 'referrer', 'referrerPolicy']);

    fetch(url, init, queryOptions)
        .then(function(response) {
            if (response.ok) {
                return response.json();
            } else if (Array.isArray(response) || response.results) {
                return response;
            } else {
                throw new Error('Unexpected AJAX response');
            }
        })
        .then(function(response) {
            if (Array.isArray(response)) {
                queryOptions.callback({ results: response, more: false });
            } else {
                queryOptions.callback({ results: response.results, more: !!response.more });
            }
        })
        .catch(function(error) {
            var formatError = ajax.formatError || Locale.ajaxError;
            queryOptions.error(formatError(term, error), { escape: false });
        });
}

/**
 * Option listener that implements a convenience query function for performing AJAX requests.
 */
Selectivity.OptionListeners.unshift(function(selectivity, options) {

    var ajax = options.ajax;
    if (ajax && ajax.url) {
        var fetch = (ajax.quietMillis ? debounce(doFetch, ajax.quietMillis) : doFetch);

        options.query = function(queryOptions) {
            var numCharsNeeded = ajax.minimumInputLength - queryOptions.term.length;
            if (numCharsNeeded > 0) {
                queryOptions.error(Locale.needMoreCharacters(numCharsNeeded));
                return;
            }

            fetch(ajax, queryOptions);
        };
    }
});

},{"24":24,"35":35,"7":7}],26:[function(_dereq_,module,exports){
'use strict';

var Selectivity = _dereq_(35);

var latestQueryNum = 0;

/**
 * Option listener that will discard any callbacks from the query function if another query has
 * been called afterwards. This prevents responses from remote sources arriving out-of-order.
 */
Selectivity.OptionListeners.push(function(selectivity, options) {

    var query = options.query;
    if (query && !query._async) {
        options.query = function(queryOptions) {
            latestQueryNum++;
            var queryNum = latestQueryNum;

            var callback = queryOptions.callback;
            var error = queryOptions.error;
            queryOptions.callback = function() {
                if (queryNum === latestQueryNum) {
                    callback.apply(null, arguments);
                }
            };
            queryOptions.error = function() {
                if (queryNum === latestQueryNum) {
                    error.apply(null, arguments);
                }
            };
            query(queryOptions);
        };
        options.query._async = true;
    }
});

},{"35":35}],27:[function(_dereq_,module,exports){
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

var Selectivity = _dereq_(35);
var previousTransform = Selectivity.transformText;

/**
 * Extended version of the transformText() function that simplifies diacritics to their latin1
 * counterparts.
 *
 * Note that if all query functions fetch their results from a remote server, you may not need this
 * function, because it makes sense to remove diacritics server-side in such cases.
 */
Selectivity.transformText = function(string) {
    var result = '';
    for (var i = 0, length = string.length; i < length; i++) {
        var character = string[i];
        result += DIACRITICS[character] || character;
    }
    return previousTransform(result);
};

},{"35":35}],28:[function(_dereq_,module,exports){
'use strict';

var $ = (window.jQuery || window.Zepto);

var Selectivity = _dereq_(35);

/**
 * Option listener that implements a convenience query function for performing AJAX requests.
 */
Selectivity.OptionListeners.unshift(function(selectivity, options) {

    var ajax = options.ajax;
    if (ajax && ajax.url && !ajax.fetch && $.Deferred) {
        ajax.fetch = function(url, init) {
            return $.ajax(url, {
                cache: (init.cache !== 'no-cache'),
                headers: init.headers || null,
                method: init.method || 'GET',
                xhrFields: (init.credentials === 'include' ? { withCredentials: true } : null)
            }).then(function(data) {
                return { results: $.map(data, function(result) {
                    return result;
                }), more: false };
            }, function(jqXHR, textStatus, errorThrown) {
                throw new Error('AJAX request returned: ' + textStatus +
                                (errorThrown ? ', ' + errorThrown : ''));
            });
        };
    }
});

},{"35":35,"jquery":"jquery"}],29:[function(_dereq_,module,exports){
'use strict';

var $ = (window.jQuery || window.Zepto);

var Selectivity = _dereq_(35);

function createSelectivityNextToSelectElement($el, options) {

    var data = (options.multiple ? [] : null);

    var mapOptions = function() {
        var $this = $(this);
        if ($this.is('option')) {
            var text = $this.text();
            var id = $this.attr('value');
            if (id === undefined) {
                id = text;
            }
            if ($this.prop('selected')) {
                var item = { id: id, text: text };
                if (options.multiple) {
                    data.push(item);
                } else {
                    data = item;
                }
            }

            return {
                id: id,
                text: $this.attr('label') || text
            };
        } else {
            return {
                text: $this.attr('label'),
                children: $this.children('option,optgroup').map(mapOptions).get()
            };
        }
    };

    options.allowClear = ('allowClear' in options ? options.allowClear : !$el.prop('required'));

    var items = $el.children('option,optgroup').map(mapOptions).get();
    options.data = data;

    options.items = (options.query ? null : items);

    options.placeholder = options.placeholder || $el.data('placeholder') || '';

    options.tabIndex = (options.tabIndex === undefined ? $el.attr('tabindex') || 0
                                                       : options.tabIndex);

    var classes = ($el.attr('class') || 'selectivity-input').split(' ');
    if (classes.indexOf('selectivity-input') < 0) {
        classes.push('selectivity-input');
    }

    var $div = $('<div>').attr({
        'id': $el.attr('id'),
        'class': classes.join(' '),
        'style': $el.attr('style'),
        'data-name': $el.attr('name')
    });
    $div.insertAfter($el);
    $el.hide();
    return $div[0];
}

function bindTraditionalSelectEvents(selectivity) {
    var $el = $(selectivity.el);
    $el.on('change', function(event) {
        var value = event.originalEvent.value;
        $el.prev('select').val($.type(value) === 'array' ? value.slice(0) : value).trigger(event);
    });
}

/**
 * Option listener providing support for converting traditional <select> boxes into Selectivity
 * instances.
 */
Selectivity.OptionListeners.push(function(selectivity, options) {

    var $el = $(selectivity.el);
    if ($el.is('select')) {
        if ($el.attr('autofocus')) {
            setTimeout(function() {
                selectivity.focus();
            }, 1);
        }

        selectivity.el = createSelectivityNextToSelectElement($el, options);
        selectivity.el.selectivity = selectivity;

        Selectivity.patchEvents($el);

        bindTraditionalSelectEvents(selectivity);
    }
});

},{"35":35,"jquery":"jquery"}],30:[function(_dereq_,module,exports){
'use strict';

var Selectivity = _dereq_(35);
var findResultItem = _dereq_(37);
var getKeyCode = _dereq_(39);

var KEY_BACKSPACE = 8;
var KEY_DOWN_ARROW = 40;
var KEY_ENTER = 13;
var KEY_ESCAPE = 27;
var KEY_TAB = 9;
var KEY_UP_ARROW = 38;

/**
 * Search input listener providing keyboard support for navigating the dropdown.
 */
function listener(selectivity, input) {

    var keydownCanceled = false;
    var closeSubmenu = null;

    /**
     * Moves a dropdown's highlight to the next or previous result item.
     *
     * @param delta Either 1 to move to the next item, or -1 to move to the previous item.
     */
    function moveHighlight(dropdown, delta) {

        var results = dropdown.results;
        if (!results.length) {
            return;
        }

        var resultItems = dropdown.el.querySelectorAll('.selectivity-result-item');

        function scrollToHighlight() {
            var el;
            if (dropdown.highlightedResult) {
                el = findResultItem(resultItems, dropdown.highlightedResult.id);
            } else if (dropdown.loadMoreHighlighted) {
                el = dropdown.$('.selectivity-load-more');
            }

            if (el) {
                el.scrollIntoView(delta < 0);
            }
        }

        if (dropdown.submenu) {
            moveHighlight(dropdown.submenu, delta);
            return;
        }

        var defaultIndex = (delta > 0 ? 0 : resultItems.length - 1);
        var index = defaultIndex;
        var highlightedResult = dropdown.highlightedResult;
        if (highlightedResult) {
            var highlightedResultItem = findResultItem(resultItems, highlightedResult.id);
            index = resultItems.indexOf(highlightedResultItem) + delta;
            if (delta > 0 ? index >= resultItems.length : index < 0) {
                if (dropdown.hasMore) {
                    dropdown.highlightLoadMore();
                    scrollToHighlight();
                    return;
                } else {
                    index = defaultIndex;
                }
            }
        }

        var resultItem = resultItems[index];
        var result = Selectivity.findNestedById(results, selectivity.getRelatedItemId(resultItem));
        if (result) {
            dropdown.highlight(result, { delay: !!result.submenu });
            scrollToHighlight();
        }
    }

    function keyHeld(event) {

        var dropdown = selectivity.dropdown;
        if (dropdown) {
            var keyCode = getKeyCode(event);
            if (keyCode === KEY_BACKSPACE) {
                if (!input.value) {
                    if (dropdown.submenu) {
                        var submenu = dropdown.submenu;
                        while (submenu.submenu) {
                            submenu = submenu.submenu;
                        }
                        closeSubmenu = submenu;
                    }

                    event.preventDefault();
                    keydownCanceled = true;
                }
            } else if (keyCode === KEY_DOWN_ARROW) {
                moveHighlight(dropdown, 1);
            } else if (keyCode === KEY_UP_ARROW) {
                moveHighlight(dropdown, -1);
            } else if (keyCode === KEY_TAB) {
                setTimeout(function() {
                    selectivity.close();
                }, 1);
            } else if (keyCode === KEY_ENTER) {
                event.preventDefault(); // don't submit forms on keydown
            }
        }
    }

    function keyReleased(event) {

        function open() {
            if (selectivity.options.showDropdown !== false) {
                selectivity.open();
            }
        }

        var dropdown = selectivity.dropdown;
        var keyCode = getKeyCode(event);
        if (keydownCanceled) {
            event.preventDefault();
            keydownCanceled = false;

            if (closeSubmenu) {
                closeSubmenu.close();
                selectivity.focus();
                closeSubmenu = null;
            }
        } else if (keyCode === KEY_BACKSPACE) {
            if (!dropdown && selectivity.options.allowClear) {
                selectivity.clear();
            }
        } else if (keyCode === KEY_ENTER && !event.ctrlKey) {
            if (dropdown) {
                dropdown.selectHighlight();
            } else if (selectivity.options.showDropdown !== false) {
                open();
            }

            event.preventDefault();
        } else if (keyCode === KEY_ESCAPE) {
            selectivity.close();

            event.preventDefault();
        } else if (keyCode === KEY_DOWN_ARROW || keyCode === KEY_UP_ARROW) {
            // handled in keyHeld() because the response feels faster and it works with repeated
            // events if the user holds the key for a longer period
            // still, we issue an open() call here in case the dropdown was not yet open...
            open();

            event.preventDefault();
        } else {
            open();
        }
    }

    input.addEventListener('keydown', keyHeld);
    input.addEventListener('keyup', keyReleased);
}

Selectivity.InputListeners.push(listener);

},{"35":35,"37":37,"39":39}],31:[function(_dereq_,module,exports){
'use strict';

var Selectivity = _dereq_(35);

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

},{"35":35}],32:[function(_dereq_,module,exports){
'use strict';

var Dropdown = _dereq_(19);
var Selectivity = _dereq_(35);

var findResultItem = _dereq_(37);

/**
 * Extended dropdown that supports submenus.
 */
function SubmenuPlugin(selectivity, options) {

    /**
     * Optional parent dropdown menu from which this dropdown was opened.
     */
    this.parentMenu = options.parentMenu;

    Dropdown.call(this, selectivity, options);

    this._closeSubmenuTimeout = 0;

    this._openSubmenuTimeout = 0;
}

var callSuper = Selectivity.inherits(SubmenuPlugin, Dropdown, {

    /**
     * @inherit
     */
    close: function() {

        if (this.submenu) {
            this.submenu.close();
        }

        callSuper(this, 'close');

        if (this.parentMenu) {
            this.parentMenu.submenu = null;
            this.parentMenu = null;
        }

        clearTimeout(this._closeSubmenuTimeout);
        clearTimeout(this._openSubmenuTimeout);
    },

    /**
     * @inherit
     *
     * @param options Optional options object. May contain the following properties:
     *                delay - If true, indicates any submenu should not be opened until after some
     *                        delay.
     *                openSubmenu - If false, no submenu will be automatically opened for the
     *                              highlighted item.
     *                reason - The reason why the result item is being highlighted. See
     *                         Dropdown#highlight().
     */
    highlight: function(item, options) {

        options = options || {};
        var reason = options.reason || 'unspecified';

        if (options.delay) {
            callSuper(this, 'highlight', item);

            clearTimeout(this._openSubmenuTimeout);
            this._openSubmenuTimeout = setTimeout(this._doHighlight.bind(this, item, reason), 300);
        } else if (this.submenu) {
            if (this.highlightedResult && this.highlightedResult.id === item.id) {
                this._doHighlight(item, reason);
            } else {
                clearTimeout(this._closeSubmenuTimeout);
                this._closeSubmenuTimeout = setTimeout(
                    this._closeSubmenuAndHighlight.bind(this, item, reason), 100
                );
            }
        } else {
            if (this.parentMenu && this.parentMenu._closeSubmenuTimeout) {
                clearTimeout(this.parentMenu._closeSubmenuTimeout);
                this.parentMenu._closeSubmenuTimeout = 0;
            }

            if (options.openSubmenu === false) {
                callSuper(this, 'highlight', item);
            } else {
                this._doHighlight(item, reason);
            }
        }
    },

    /**
     * @inherit
     */
    search: function(term) {

        if (this.submenu) {
            var searchInput = this.$('.selectivity-search-input');
            if (searchInput && searchInput === document.activeElement) {
                this.submenu.close();
            } else {
                this.submenu.search(term);
                return;
            }
        }

        callSuper(this, 'search', term);
    },

    /**
     * @inherit
     */
    selectHighlight: function() {

        if (this.submenu) {
            this.submenu.selectHighlight();
        } else {
            callSuper(this, 'selectHighlight');
        }
    },

    /**
     * @inherit
     */
    showResults: function(results, options) {

        // makes sure any result item with a submenu that's not explicitly
        // set as selectable becomes unselectable
        function setSelectable(item) {
            if (item.children) {
                item.children.forEach(setSelectable);
            }
            if (item.submenu) {
                item.selectable = !!item.selectable;
            }
        }

        if (this.submenu && options.dropdown !== this) {
            this.submenu.showResults(results, options);
        } else {
            results.forEach(setSelectable);
            callSuper(this, 'showResults', results, options);
        }
    },

    /**
     * @inherit
     */
    triggerClose: function() {

        if (this.parentMenu) {
            this.selectivity.triggerEvent('selectivity-close-submenu');
        } else {
            callSuper(this, 'triggerClose');
        }
    },

    /**
     * @inherit
     */
    triggerOpen: function() {

        if (this.parentMenu) {
            this.selectivity.triggerEvent('selectivity-open-submenu');
        } else {
            callSuper(this, 'triggerOpen');
        }
    },

    /**
     * @private
     */
    _closeSubmenuAndHighlight: function(item, reason) {

        if (this.submenu) {
            this.submenu.close();
        }

        this._doHighlight(item, reason);
    },

    /**
     * @private
     */
    _doHighlight: function(item, reason) {

        callSuper(this, 'highlight', item);

        var options = this.selectivity.options;
        if ((!item.submenu || this.submenu) ||
            (options.shouldOpenSubmenu && options.shouldOpenSubmenu(item, reason) === false)) {
            return;
        }

        var Dropdown = options.dropdown || Selectivity.Dropdown;
        if (Dropdown) {
            var resultItems = this.el.querySelectorAll('.selectivity-result-item');
            var resultItem = findResultItem(resultItems, item.id);
            var dropdownEl = this.el;

            this.submenu = new Dropdown(this.selectivity, {
                highlightFirstItem: !item.selectable,
                items: item.submenu.items || null,
                parentMenu: this,
                position: function(el, selectEl) {
                    if (item.submenu.positionDropdown) {
                        item.submenu.positionDropdown(el, selectEl, resultItem, dropdownEl);
                    } else {
                        var rect = dropdownEl.getBoundingClientRect();
                        var left = rect.right;
                        var width = rect.width;
                        if (left + width > document.body.clientWidth && rect.left - width > 0) {
                            // Open the submenu on the left-hand side if there's no sufficient
                            // space on the right side.
                            // Use a little margin to prevent awkward-looking overlaps.
                            left = rect.left - width + 10;
                        }

                        el.style.left = left + 'px';
                        el.style.top = resultItem.getBoundingClientRect().top + 'px';
                        el.style.width = width + 'px';
                    }
                },
                query: item.submenu.query || null,
                showSearchInput: item.submenu.showSearchInput
            });

            this.submenu.search('');
        }
    }

});

Selectivity.Dropdown = SubmenuPlugin;

module.exports = SubmenuPlugin;

},{"19":19,"35":35,"37":37}],33:[function(_dereq_,module,exports){
'use strict';

var extend = (window.jQuery || window.Zepto).extend;

var Selectivity = _dereq_(35);

function defaultTokenizer(input, selection, createToken, options) {

    var createTokenItem = options.createTokenItem || function(token) {
        return token ? { id: token, text: token } : null;
    };

    var separators = options.tokenSeparators;

    function hasToken(input) {
        return input ? separators.some(function(separator) {
            return input.indexOf(separator) > -1;
        }) : false;
    }

    function takeToken(input) {
        for (var i = 0, length = input.length; i < length; i++) {
            if (separators.indexOf(input[i]) > -1) {
                return { term: input.slice(0, i), input: input.slice(i + 1) };
            }
        }
        return {};
    }

    while (hasToken(input)) {
        var token = takeToken(input);
        if (token.term) {
            var item = createTokenItem(token.term);
            if (item && !Selectivity.findById(selection, item.id)) {
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
        options.allowedTypes = extend({ tokenSeparators: 'array' }, options.allowedTypes);

        options.tokenizer = options.tokenizer || defaultTokenizer;
    }
});

},{"35":35,"lodash/extend":"lodash/extend"}],34:[function(_dereq_,module,exports){
_dereq_(19);_dereq_(21);_dereq_(22);_dereq_(23);_dereq_(24);_dereq_(25);_dereq_(26);_dereq_(27);_dereq_(28);_dereq_(29);_dereq_(30);_dereq_(31);_dereq_(32);_dereq_(33);_dereq_(36);_dereq_(18);
},{"18":18,"19":19,"21":21,"22":22,"23":23,"24":24,"25":25,"26":26,"27":27,"28":28,"29":29,"30":30,"31":31,"32":32,"33":33,"36":36}],35:[function(_dereq_,module,exports){
'use strict';

var extend = (window.jQuery || window.Zepto).extend;
var isString = _dereq_(13);

var EventListener = _dereq_(20);
var toggleClass = _dereq_(44);

/**
 * Selectivity Base Constructor.
 *
 * You will never use this constructor directly. Instead, you use $(selector).selectivity(options)
 * to create an instance of either MultipleSelectivity or SingleSelectivity. This class defines all
 * functionality that is common between both.
 *
 * @param options Options object. Accepts the same options as the setOptions method(), in addition
 *                to the following ones:
 *                data - Initial selection data to set. This should be an array of objects with 'id'
 *                       and 'text' properties. This option is mutually exclusive with 'value'.
 *                element - The DOM element to which to attach the Selectivity instance. This
 *                          property is set by the API wrapper.
 *                value - Initial value to set. This should be an array of IDs. This property is
 *                        mutually exclusive with 'data'.
 */
function Selectivity(options) {

    /**
     * Reference to the currently open dropdown.
     */
    this.dropdown = null;

    /**
     * DOM element to which this instance is attached.
     */
    this.el = options.element;

    /**
     * Whether the input is enabled.
     *
     * This is false when the option readOnly is false or the option removeOnly is false.
     */
    this.enabled = true;

    /**
     * DOM element for the input.
     *
     * May be null as long as there is no visible input. It is set by initInput().
     */
    this.input = null;

    /**
     * Array of input listeners.
     *
     * Custom listeners can be specified in the options object.
     */
    this.inputListeners = Selectivity.InputListeners;

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
    this.matcher = Selectivity.matcher;

    /**
     * Options passed to the Selectivity instance or set through setOptions().
     */
    this.options = {};

    /**
     * Mapping of templates.
     *
     * Custom templates can be specified in the options object.
     */
    this.templates = extend({}, Selectivity.Templates);

    /**
     * The last used search term.
     */
    this.term = '';

    this.setOptions(options);

    if (options.value) {
        this.value(options.value, { triggerChange: false });
    } else {
        this.data(options.data || null, { triggerChange: false });
    }

    this.el.setAttribute('tabindex', options.tabIndex || 0);

    this.events = new EventListener(this.el, this);
    this.events.on({
        'blur': this._blur,
        'mouseenter': this._mouseenter,
        'mouseleave': this._mouseleave,
        'selectivity-close': this._closed
    });
}

/**
 * Methods.
 */
extend(Selectivity.prototype, {

    /**
     * Convenience shortcut for this.el.querySelector(selector).
     */
    $: function(selector) {

        return this.el.querySelector(selector);
    },

    /**
     * Closes the dropdown.
     */
    close: function() {

        var dropdown = this.dropdown;
        if (dropdown) {
            setTimeout(function() {
                dropdown.close();
            }, 1);

            this.dropdown = null;
        }
    },

    /**
     * Sets or gets the selection data.
     *
     * The selection data contains both IDs and text labels. If you only want to set or get the IDs,
     * you should use the value() method.
     *
     * @param newData Optional new data to set. For a MultipleSelectivity instance the data must be
     *                an array of objects with 'id' and 'text' properties, for a SingleSelectivity
     *                instance the data must be a single such object or null to indicate no item is
     *                selected.
     * @param options Optional options object. May contain the following property:
     *                triggerChange - Set to false to suppress the "change" event being triggered.
     *                                Note this will also cause the UI to not update automatically;
     *                                so you may want to call rerenderSelection() manually when
     *                                using this option.
     *
     * @return If newData is omitted, this method returns the current data.
     */
    data: function(newData, options) {

        options = options || {};

        if (newData === undefined) {
            return this._data;
        } else {
            newData = this.validateData(newData);

            this._data = newData;
            this._value = this.getValueForData(newData);

            if (options.triggerChange !== false) {
                this.triggerChange();
            }
        }
    },

    /**
     * Destroys the Selectivity instance.
     */
    destroy: function() {

        this.events.destruct();

        var el = this.el;
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
        el.selectivity = null;
    },

    /**
     * Filters the results to be displayed in the dropdown.
     *
     * The default implementation simply returns the results unfiltered, but the MultipleSelectivity
     * class overrides this method to filter out any items that have already been selected.
     *
     * @param results Array of items with 'id' and 'text' properties.
     *
     * @return The filtered array.
     */
    filterResults: function(results) {

        return results;
    },

    /**
     * Applies focus to the input.
     */
    focus: function() {

        this._focusing = true;

        if (this.input) {
            this.input.focus();
        }

        this._focusing = false;
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
            return Selectivity.findNestedById(items, id);
        } else {
            return { id: id, text: '' + id };
        }
    },

    /**
     * Returns the item ID related to an element or event target.
     *
     * @param elementOrEvent The DOM element or event to get the item ID for.
     *
     * @return Item ID or null if no ID could be found.
     */
    getRelatedItemId: function(elementOrEvent) {

        var el = elementOrEvent.target || elementOrEvent;
        while (el) {
            if (el.hasAttribute('data-item-id')) {
                break;
            }
            el = el.parentNode;
        }

        if (!el) {
            return null;
        }

        var id = el.getAttribute('data-item-id');

        // IDs can be either numbers or strings, but attribute values are always strings, so we
        // will have to find out whether the item ID ought to be a number or string ourselves.
        if (Selectivity.findById(this._data || [], id)) {
            return id;
        } else {
            var dropdown = this.dropdown;
            while (dropdown) {
                if (Selectivity.findNestedById(dropdown.results, id)) {
                    return id;
                }
                // FIXME: reference to submenu plugin doesn't belong in base
                dropdown = dropdown.submenu;
            }
            var number = parseInt(id, 10);
            return ('' + number === id ? number : id);
        }
    },

    /**
     * Initializes the input element.
     *
     * Sets the input property, invokes all input listeners and (by default) attaches the action of
     * searching when something is typed.
     *
     * @param input Input element.
     * @param options Optional options object. May contain the following property:
     *                search - If false, no event handlers are setup to initiate searching when the
     *                         user types in the input field. This is useful if you want to use the
     *                         input only to handle keyboard support.
     */
    initInput: function(input, options) {

        this.input = input;

        var selectivity = this;
        this.inputListeners.forEach(function(listener) {
            listener(selectivity, input, options);
        });

        if (!options || options.search !== false) {
            input.addEventListener('keyup', function(event) {
                if (!event.defaultPrevented) {
                    selectivity.search();
                }
            });
        }
    },

    /**
     * Opens the dropdown.
     */
    open: function() {

        if (this._opening || this.dropdown || !this.triggerEvent('selectivity-opening')) {
            return;
        }

        this._opening = true;

        var Dropdown = this.options.dropdown || Selectivity.Dropdown;
        if (Dropdown) {
            this.dropdown = new Dropdown(this, {
                items: this.items,
                position: this.options.positionDropdown,
                query: this.options.query,
                showSearchInput: (this.options.showSearchInputInDropdown !== false)
            });
        }

        this.search('');

        this.focus();

        toggleClass(this.el, 'open', true);

        this._opening = false;
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
     * Searches for results based on the term given or the term entered in the search input.
     *
     * If an items array has been passed with the options to the Selectivity instance, a local
     * search will be performed among those items. Otherwise, the query function specified in the
     * options will be used to perform the search. If neither is defined, nothing happens.
     *
     * @param term Optional term to search for. If omitted, the value of the search input element
     *             is used as term.
     */
    search: function(term) {

        if (term === undefined) {
            term = (this.input ? this.input.value : '');
        }

        this.open();

        if (this.dropdown) {
            this.dropdown.search(term);
        }
    },

    /**
     * Sets one or more options on this Selectivity instance.
     *
     * @param options Options object. May contain one or more of the following properties:
     *                closeOnSelect - Set to false to keep the dropdown open after the user has
     *                                selected an item. This is useful if you want to allow the user
     *                                to quickly select multiple items. The default value is true.
     *                dropdown - Custom dropdown implementation to use for this instance.
     *                initSelection - Function to map values by ID to selection data. This function
     *                                receives two arguments, 'value' and 'callback'. The value is
     *                                the current value of the selection, which is an ID or an array
     *                                of IDs depending on the input type. The callback should be
     *                                invoked with an object or array of objects, respectively,
     *                                containing 'id' and 'text' properties.
     *                inputListeners - Array of search input listeners. By default, the global
     *                                 array Selectivity.InputListeners is used.
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
     *                          item - The item that should match the search term.
     *                          term - The search term. Note that for performance reasons, the term
     *                                 has always been already processed using
     *                                 Selectivity.transformText().
     *                          The method should return the item if it matches, and null otherwise.
     *                          If the item has a children array, the matcher is expected to filter
     *                          those itself (be sure to only return the filtered array of children
     *                          in the returned item and not to modify the children of the item
     *                          argument).
     *                placeholder - Placeholder text to display when the element has no focus and
     *                              no selected items.
     *                positionDropdown - Function to position the dropdown. Receives two arguments:
     *                                   dropdownEl - The element to be positioned.
     *                                   selectEl - The element of the Selectivity instance, that
     *                                              you can position the dropdown to.
     *                                   The default implementation positions the dropdown element
     *                                   under the Selectivity's element and gives it the same
     *                                   width.
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
     *                        selectivity - The Selectivity instance the query function is used on.
     *                        term - The search term the user is searching for. Unlike with the
     *                               matcher function, the term has not been processed using
     *                               Selectivity.transformText().
     *                readOnly - If true, disables any modification of the input.
     *                removeOnly - If true, disables any modification of the input except removing
     *                             of selected items.
     *                shouldOpenSubmenu - Function to call that will decide whether a submenu should
     *                                    be opened. Receives two parameters:
     *                                    item - The currently highlighted result item.
     *                                    reason - The reason why the item is being highlighted.
     *                                             See Dropdown#highlight() for possible values.
     *                showDropdown - Set to false if you don't want to use any dropdown (you can
     *                               still open it programmatically using open()).
     *                showSearchInputInDropdown - Set to false to remove the search input used in
     *                                            dropdowns. The default is true for single-value
     *                                            inputs.
     *                templates - Object with instance-specific templates to override the global
     *                            templates assigned to Selectivity.Templates.
     */
    setOptions: function(options) {

        options = options || {};

        Selectivity.OptionListeners.forEach(function(listener) {
            listener(this, options);
        }.bind(this));

        for (var key in options) {
            if (!options.hasOwnProperty(key)) {
                continue;
            }

            var value = options[key];

            switch (key) {
            case 'items':
                this.items = (value ? Selectivity.processItems(value) : null);
                break;

            case 'matcher':
                this.matcher = value;
                break;

            case 'inputListeners':
                this.inputListeners = value;
                break;

            case 'templates':
                extend(this.templates, value);
                break;
            }
        }

        extend(this.options, options);

        this.enabled = (!this.options.readOnly && !this.options.removeOnly);
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
        if (!template) {
            throw new Error('Unknown template: ' + templateName);
        }

        if (typeof template === 'function') {
            return template(options);
        } else if (template.render) {
            return template.render(options);
        } else {
            return template.toString();
        }
    },

    /**
     * Triggers the change event.
     *
     * The event object at least contains the following property:
     * value - The new value of the Selectivity instance.
     *
     * @param Optional additional options added to the event object.
     */
    triggerChange: function(options) {

        this.triggerEvent('change', extend({ value: this._value }, options));
    },

    /**
     * Triggers an event on the instance's element.
     *
     * @param eventName Name of the event to trigger.
     * @param data Optional event data to be added to the event object.
     *
     * @return Whether the default action of the event may be executed, ie. returns false if
     *         preventDefault() has been called.
     */
    triggerEvent: function(eventName, data) {

        var event = document.createEvent('Event');
        event.initEvent(eventName, /* bubbles: */ false, /* cancelable: */ true);
        extend(event, data);
        this.el.dispatchEvent(event);
        return !event.defaultPrevented;
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

        if (item && Selectivity.isValidId(item.id) && isString(item.text)) {
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
     * Note that if neither the items option nor the initSelection option have been set, Selectivity
     * will have no way to determine what text labels should be used with the given IDs in which
     * case it will assume the text is equal to the ID. This is useful if you're working with tags,
     * or selecting e-mail addresses for instance, but may not always be what you want.
     *
     * @param newValue Optional new value to set. For a MultipleSelectivity instance the value must
     *                 be an array of IDs, for a SingleSelectivity instance the value must be a
     *                 single ID (a string or a number) or null to indicate no item is selected.
     * @param options Optional options object. May contain the following property:
     *                triggerChange - Set to false to suppress the "change" event being triggered.
     *                                Note this will also cause the UI to not update automatically;
     *                                so you may want to call rerenderSelection() manually when
     *                                using this option.
     *
     * @return If newValue is omitted, this method returns the current value.
     */
    value: function(newValue, options) {

        options = options || {};

        if (newValue === undefined) {
            return this._value;
        } else {
            newValue = this.validateValue(newValue);

            this._value = newValue;

            if (this.options.initSelection) {
                this.options.initSelection(newValue, function(data) {
                    if (this._value === newValue) {
                        this._data = this.validateData(data);

                        if (options.triggerChange !== false) {
                            this.triggerChange();
                        }
                    }
                }.bind(this));
            } else {
                this._data = this.getDataForValue(newValue);

                if (options.triggerChange !== false) {
                    this.triggerChange();
                }
            }
        }
    },

    /**
     * @private
     */
    _blur: function() {

        if (!this._focusing && !this.el.classList.contains('hover')) {
            // Without the timeout it appears clicks on result items are not always properly
            // handled, especially when the user doesn't click exactly on the text of the result
            // item. I don't understand really why that happens, or why the timeout has to be so
            // large, but after trial and error, this now seems to work reliably...
            setTimeout(this.close.bind(this), 166);
        }
    },

    /**
     * @private
     */
    _closed: function() {

        this.dropdown = null;

        toggleClass(this.el, 'open', false);
    },

    /**
     * @private
     */
    _mouseleave: function() {

        toggleClass(this.el, 'hover', false);
    },

    /**
     * @private
     */
    _mouseenter: function() {

        toggleClass(this.el, 'hover', true);
    }

});

/**
 * Dropdown class to use for displaying dropdowns.
 *
 * The default implementation of a dropdown is defined in the selectivity-dropdown module.
 */
Selectivity.Dropdown = null;

/**
 * Array of input listeners.
 *
 * Input listeners are invoked when initInput() is called (typically right after the input is
 * created). Every listener receives three arguments:
 *
 * selectivity - The Selectivity instance.
 * input - DOM element of the input.
 * options - Options that were passed to initInput().
 *
 * An example of a search input listener is the selectivity-keyboard module.
 */
Selectivity.InputListeners = [];

/**
 * Mapping of input types.
 */
Selectivity.Inputs = {};

/**
 * Array of option listeners.
 *
 * Option listeners are invoked when setOptions() is called. Every listener receives two arguments:
 *
 * selectivity - The Selectivity instance.
 * options - The options that are about to be set. The listener may modify this options object.
 *
 * An example of an option listener is the selectivity-traditional module.
 */
Selectivity.OptionListeners = [];

/**
 * Mapping with templates to use for rendering select boxes and dropdowns. See
 * selectivity-templates.js for a useful set of default templates, as well as for documentation of
 * the individual templates.
 */
Selectivity.Templates = {};

/**
 * Finds an item in the given array with the specified ID.
 *
 * @param array Array to search in.
 * @param id ID to search for.
 *
 * @return The item in the array with the given ID, or null if the item was not found.
 */
Selectivity.findById = function(array, id) {

    var index = Selectivity.findIndexById(array, id);
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
Selectivity.findIndexById = function(array, id) {

    for (var i = 0, length = array.length; i < length; i++) {
        if (array[i].id === id) {
            return i;
        }
    }
    return -1;
};

/**
 * Finds an item in the given array with the specified ID. Items in the array may contain 'children'
 * properties which in turn will be searched for the item.
 *
 * @param array Array to search in.
 * @param id ID to search for.
 *
 * @return The item in the array with the given ID, or null if the item was not found.
 */
Selectivity.findNestedById = function(array, id) {

    for (var i = 0, length = array.length; i < length; i++) {
        var item = array[i], result;
        if (item.id === id) {
            result = item;
        } else if (item.children) {
            result = Selectivity.findNestedById(item.children, id);
        } else if (item.submenu && item.submenu.items) {
            // FIXME: reference to submenu plugin doesn't belong in base
            result = Selectivity.findNestedById(item.submenu.items, id);
        }
        if (result) {
            return result;
        }
    }
    return null;
};

/**
 * Utility method for inheriting another class.
 *
 * @param SubClass Constructor function of the subclass.
 * @param SuperClass Constructor function of the superclass.
 * @param prototype Object with methods you want to add to the subclass prototype.
 *
 * @return A utility function for calling the methods of the superclass. This function receives two
 *         arguments: The this object on which you want to execute the method and the name of the
 *         method. Any arguments past those are passed to the superclass method.
 */
Selectivity.inherits = function(SubClass, SuperClass, prototype) {

    SubClass.prototype = extend(
        Object.create(SuperClass.prototype),
        { constructor: SubClass },
        prototype
    );

    return function(self, methodName) {
        SuperClass.prototype[methodName].apply(self, Array.prototype.slice.call(arguments, 2));
    };
};

/**
 * Checks whether a value can be used as a valid ID for selection items. Only numbers and strings
 * are accepted to be used as IDs.
 *
 * @param id The value to check whether it is a valid ID.
 *
 * @return true if the value is a valid ID, false otherwise.
 */
Selectivity.isValidId = function(id) {

    return typeof id === 'number' || isString(id);
};

/**
 * Decides whether a given item matches a search term. The default implementation simply
 * checks whether the term is contained within the item's text, after transforming them using
 * transformText().
 *
 * @param item The item that should match the search term.
 * @param term The search term. Note that for performance reasons, the term has always been already
 *             processed using transformText().
 *
 * @return true if the text matches the term, false otherwise.
 */
Selectivity.matcher = function(item, term) {

    var result = null;
    if (Selectivity.transformText(item.text).indexOf(term) > -1) {
        result = item;
    } else if (item.children) {
        var matchingChildren = item.children.map(function(child) {
            return Selectivity.matcher(child, term);
        }).filter(function(child) {
            return !!child;
        });
        if (matchingChildren.length) {
            result = { id: item.id, text: item.text, children: matchingChildren };
        }
    }
    return result;
};

/**
 * Helper function for processing items.
 *
 * @param item The item to process, either as object containing 'id' and 'text' properties or just
 *             as ID. The 'id' property of an item is optional if it has a 'children' property
 *             containing an array of items.
 *
 * @return Object containing 'id' and 'text' properties.
 */
Selectivity.processItem = function(item) {

    if (Selectivity.isValidId(item)) {
        return { id: item, text: '' + item };
    } else if (item &&
               (Selectivity.isValidId(item.id) || item.children) && isString(item.text)) {
        if (item.children) {
            item.children = Selectivity.processItems(item.children);
        }

        return item;
    } else {
        throw new Error('invalid item');
    }
};

/**
 * Helper function for processing an array of items.
 *
 * @param items Array of items to process. See processItem() for details about a single item.
 *
 * @return Array with items.
 */
Selectivity.processItems = function(items) {

    if (Array.isArray(items)) {
        return items.map(Selectivity.processItem);
    } else {
        throw new Error('invalid items');
    }
};

/**
 * Transforms text in order to find matches. The default implementation casts all strings to
 * lower-case so that any matches found will be case-insensitive.
 *
 * @param string The string to transform.
 *
 * @return The transformed string.
 */
Selectivity.transformText = function(string) {

    return string.toLowerCase();
};

module.exports = Selectivity;

},{"13":13,"20":20,"44":44,"lodash/extend":"lodash/extend"}],36:[function(_dereq_,module,exports){
'use strict';

var escape = _dereq_(8);

var Selectivity = _dereq_(35);
var Locale = _dereq_(24);

/**
 * Default set of templates to use with Selectivity.js.
 *
 * Template can be defined as either a string, a function returning a string (like Handlebars
 * templates, for instance), an object containing a render function (like Hogan.js templates, fo
 * instance) or as a function returning a DOM element.
 *
 * Every template must return a single root element.
 */
Selectivity.Templates = {

    /**
     * Renders the dropdown.
     *
     * The template is expected to have at least one element with the class
     * 'selectivity-results-container', which is where all results will be added to.
     *
     * @param options Options object containing the following properties:
     *                dropdownCssClass - Optional CSS class to add to the top-level element.
     *                searchInputPlaceholder - Optional placeholder text to display in the search
     *                                         input in the dropdown.
     *                showSearchInput - Boolean whether a search input should be shown. If true,
     *                                  an input element with the 'selectivity-search-input' is
     *                                  expected.
     */
    dropdown: function(options) {
        var extraClass = (options.dropdownCssClass ? ' ' + options.dropdownCssClass : ''),
            searchInput = '';
        if (options.showSearchInput) {
            extraClass += ' has-search-input';

            var placeholder = options.searchInputPlaceholder;
            searchInput = (
                '<div class="selectivity-search-input-container">' +
                    '<input type="text" class="selectivity-search-input"' +
                            (placeholder ? ' placeholder="' + escape(placeholder) + '"'
                                         : '') + '>' +
                '</div>'
            );
        }
        return (
            '<div class="selectivity-dropdown' + extraClass + '">' +
                searchInput +
                '<div class="selectivity-results-container"></div>' +
            '</div>'
        );
    },

    /**
     * Renders an error message in the dropdown.
     *
     * @param options Options object containing the following properties:
     *                escape - Boolean whether the message should be HTML-escaped.
     *                message - The message to display.
     */
    error: function(options) {
        return (
            '<div class="selectivity-error">' +
                (options.escape ? escape(options.message) : options.message) +
            '</div>'
        );
    },

    /**
     * Renders a loading indicator in the dropdown.
     *
     * This template is expected to have an element with a 'selectivity-loading' class which may be
     * replaced with actual results.
     */
    loading: function() {
        return '<div class="selectivity-loading">' + Locale.loading + '</div>';
    },

    /**
     * Load more indicator.
     *
     * This template is expected to have an element with a 'selectivity-load-more' class which, when
     * clicked, will load more results.
     */
    loadMore: function() {
        return '<div class="selectivity-load-more">' + Locale.loadMore + '</div>';
    },

    /**
     * Renders multi-selection input boxes.
     *
     * The template is expected to have at least have elements with the following classes:
     * 'selectivity-multiple-input-container' - The element containing all the selected items and
     *                                          the input for selecting additional items.
     * 'selectivity-multiple-input' - The actual input element that allows the user to type to
     *                                search for more items. When selected items are added, they are
     *                                inserted right before this element.
     * 'selectivity-width-detector' - This element is optional, but important to make sure the
     *                                '.selectivity-multiple-input' element will fit in the
     *                                container. The width detector also has the
     *                                'select2-multiple-input' class on purpose to be able to detect
     *                                the width of text entered in the input element.
     *
     * @param options Options object containing the following property:
     *                enabled - Boolean whether the input is enabled.
     */
    multipleSelectInput: function(options) {
        return (
            '<div class="selectivity-multiple-input-container">' +
                (options.enabled ? '<input type="text" autocomplete="off" autocorrect="off" ' +
                                          'autocapitalize="off" ' +
                                          'class="selectivity-multiple-input">' +
                                   '<span class="selectivity-multiple-input ' +
                                                'selectivity-width-detector"></span>'
                                 : '<div class="selectivity-multiple-input ' +
                                               'selectivity-placeholder"></div>') +
                '<div class="selectivity-clearfix"></div>' +
            '</div>'
        );
    },

    /**
     * Renders a selected item in multi-selection input boxes.
     *
     * The template is expected to have a top-level element with the class
     * 'selectivity-multiple-selected-item'. This element is also required to have a 'data-item-id'
     * attribute with the ID set to that passed through the options object.
     *
     * An element with the class 'selectivity-multiple-selected-item-remove' should be present
     * which, when clicked, will cause the element to be removed.
     *
     * @param options Options object containing the following properties:
     *                highlighted - Boolean whether this item is currently highlighted.
     *                id - Identifier for the item.
     *                removable - Boolean whether a remove icon should be displayed.
     *                text - Text label which the user sees.
     */
    multipleSelectedItem: function(options) {
        var extraClass = (options.highlighted ? ' highlighted' : '');
        return (
            '<span class="selectivity-multiple-selected-item' + extraClass + '" ' +
                  'data-item-id="' + escape(options.id) + '">' +
                (options.removable ? '<a class="selectivity-multiple-selected-item-remove">' +
                                         '<i class="fa fa-remove"></i>' +
                                     '</a>'
                                   : '') +
                escape(options.text) +
            '</span>'
        );
    },

    /**
     * Renders a message there are no results for the given query.
     *
     * @param options Options object containing the following property:
     *                term - Search term the user is searching for.
     */
    noResults: function(options) {
        return (
            '<div class="selectivity-error">' +
                (options.term ? Locale.noResultsForTerm(options.term) : Locale.noResults) +
            '</div>'
        );
    },

    /**
     * Renders a container for item children.
     *
     * The template is expected to have an element with the class 'selectivity-result-children'.
     *
     * @param options Options object containing the following property:
     *                childrenHtml - Rendered HTML for the children.
     */
    resultChildren: function(options) {
        return '<div class="selectivity-result-children">' + options.childrenHtml + '</div>';
    },

    /**
     * Render a result item in the dropdown.
     *
     * The template is expected to have a top-level element with the class
     * 'selectivity-result-item'. This element is also required to have a 'data-item-id' attribute
     * with the ID set to that passed through the options object.
     *
     * @param options Options object containing the following properties:
     *                id - Identifier for the item.
     *                text - Text label which the user sees.
     *                disabled - Truthy if the item should be disabled.
     *                submenu - Truthy if the result item has a menu with subresults.
     */
    resultItem: function(options) {
        return (
            '<div class="selectivity-result-item' + (options.disabled ? ' disabled' : '') + '"' +
                ' data-item-id="' + escape(options.id) + '">' +
                escape(options.text) +
                (options.submenu ? '<i class="selectivity-submenu-icon fa fa-chevron-right"></i>'
                                 : '') +
            '</div>'
        );
    },

    /**
     * Render a result label in the dropdown.
     *
     * The template is expected to have a top-level element with the class
     * 'selectivity-result-label'.
     *
     * @param options Options object containing the following properties:
     *                text - Text label.
     */
    resultLabel: function(options) {
        return '<div class="selectivity-result-label">' + escape(options.text) + '</div>';
    },

    /**
     * Renders single-select input boxes.
     *
     * The template is expected to have at least one element with the class
     * 'selectivity-single-result-container' which is the element containing the selected item or
     * the placeholder.
     */
    singleSelectInput: (
        '<div class="selectivity-single-select">' +
            '<input type="text" class="selectivity-single-select-input">' +
            '<div class="selectivity-single-result-container"></div>' +
            '<i class="fa fa-sort-desc selectivity-caret"></i>' +
        '</div>'
    ),

    /**
     * Renders the placeholder for single-select input boxes.
     *
     * The template is expected to have a top-level element with the class
     * 'selectivity-placeholder'.
     *
     * @param options Options object containing the following property:
     *                placeholder - The placeholder text.
     */
    singleSelectPlaceholder: function(options) {
        return (
            '<div class="selectivity-placeholder">' +
                escape(options.placeholder) +
            '</div>'
        );
    },

    /**
     * Renders the selected item in single-select input boxes.
     *
     * The template is expected to have a top-level element with the class
     * 'selectivity-single-selected-item'. This element is also required to have a 'data-item-id'
     * attribute with the ID set to that passed through the options object.
     *
     * @param options Options object containing the following properties:
     *                id - Identifier for the item.
     *                removable - Boolean whether a remove icon should be displayed.
     *                text - Text label which the user sees.
     */
    singleSelectedItem: function(options) {
        return (
            '<span class="selectivity-single-selected-item" ' +
                  'data-item-id="' + escape(options.id) + '">' +
                (options.removable ? '<a class="selectivity-single-selected-item-remove">' +
                                         '<i class="fa fa-remove"></i>' +
                                     '</a>'
                                   : '') +
                escape(options.text) +
            '</span>'
        );
    },

    /**
     * Renders select-box inside single-select input that was initialized on
     * traditional <select> element.
     *
     * @param options Options object containing the following properties:
     *                name - Name of the <select> element.
     *                mode - Mode in which select exists, single or multiple.
     */
    selectCompliance: function(options) {
        var mode = options.mode;
        var name = options.name;
        if (mode === 'multiple' && name.slice(-2) !== '[]') {
            name += '[]';
        }
        return (
            '<select name="' + name + '"' + (mode === 'multiple' ? ' multiple' : '') + '></select>'
        );
    },

    /**
     * Renders the selected item in compliance <select> element as <option>.
     *
     * @param options Options object containing the following properties
     *                id - Identifier for the item.
     *                text - Text label which the user sees.
     */
    selectOptionCompliance: function(options) {
        return (
            '<option value="' + escape(options.id) + '" selected>' +
                escape(options.text) +
            '</option>'
        );
    }

};

},{"24":24,"35":35,"8":8}],37:[function(_dereq_,module,exports){
'use strict';

/**
 * Returns a result item with a given item ID.
 *
 * @param resultItems Array of DOM elements representing result items.
 * @param itemId ID of the item to return.
 *
 * @param DOM element of the result item with the given item ID, or null if not found.
 */
module.exports = function(resultItems, itemId) {

    for (var i = 0, length = resultItems.length; i < length; i++) {
        var resultItem = resultItems[i];
        var resultId = resultItem.getAttribute('data-item-id');
        if ((typeof itemId === 'number' ? parseInt(resultId, 10) : resultId) === itemId) {
            return resultItem;
        }
    }
    return null;
};

},{}],38:[function(_dereq_,module,exports){
'use strict';

/**
 * Returns the CSS selector for selecting a specific item by ID.
 *
 * @param selector Generic CSS selector to identify items.
 * @param id ID of the item to select.
 */
module.exports = function(selector, id) {

    var quotedId = '"' + ('' + id).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    return selector + '[data-item-id=' + quotedId + ']';
};

},{}],39:[function(_dereq_,module,exports){
'use strict';

/**
 * Returns the keyCode value of the given event.
 */
module.exports = function(event) {

    return event.which || event.keyCode || 0;
};

},{}],40:[function(_dereq_,module,exports){
'use strict';

/**
 * Returns whether the given element matches the given selector.
 */
module.exports = function(el, selector) {

    var method = el.matches || el.webkitMatchesSelector ||
                 el.mozMatchesSelector || el.msMatchesSelector;
    return method.call(el, selector);
};

},{}],41:[function(_dereq_,module,exports){
'use strict';

/**
 * Parses an HTML string and returns the resulting DOM element.
 *
 * @param html HTML representation of the element to parse.
 */
module.exports = function(html) {

    var div = document.createElement('div');
    div.innerHTML = html;
    return div.firstChild;
};

},{}],42:[function(_dereq_,module,exports){
'use strict';

/**
 * Removes a DOM element.
 *
 * @param el The element to remove.
 */
module.exports = function(el) {

    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
};

},{}],43:[function(_dereq_,module,exports){
'use strict';

/**
 * Stops event propagation.
 *
 * @param event The event to stop from propagating.
 */
module.exports = function(event) {

    event.stopPropagation();
};

},{}],44:[function(_dereq_,module,exports){
'use strict';

/**
 * Toggles a CSS class on an element.
 *
 * @param el The element on which to toggle the CSS class.
 * @param className The CSS class to toggle.
 * @param force If true, the class is added. If false, the class is removed.
 */
module.exports = function(el, className, force) {

    if (el) {
        el.classList[force ? 'add' : 'remove'](className);
    }
};

},{}]},{},[34])(34)
});