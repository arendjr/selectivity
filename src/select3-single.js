'use strict';

var $ = window.$;

var Select3 = require('./select3-base');

/**
 * SingleSelect3 Constructor.
 *
 * @param options Options object. Accepts all options from the Select3 Base Constructor.
 */
function SingleSelect3(options) {

    Select3.call(this, options);
}

SingleSelect3.prototype = Object.create(Select3.prototype);
SingleSelect3.prototype.constructor = SingleSelect3;

/**
 * Methods.
 */
$.extend(SingleSelect3.prototype, {


});

module.exports = SingleSelect3;
