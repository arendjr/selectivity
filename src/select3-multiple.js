'use strict';

var $ = window.$;

var Select3 = require('./select3-core');

/**
 * MultipleSelect3 Constructor.
 *
 * @param options Options object. Accepts all options from the Select3 Core Constructor.
 */
function MultipleSelect3(options) {

    Select3.call(this, options);
}

MultipleSelect3.prototype = Object.create(Select3.prototype);
MultipleSelect3.prototype.constructor = MultipleSelect3;

/**
 * Methods.
 */
$.extend(MultipleSelect3.prototype, {


});

module.exports = MultipleSelect3;
