'use strict';

var $ = require('jquery');

var Select3 = require('./select3-base');
var Select3Dropdown = require('./select3-dropdown');

/**
 * Extended dropdown that supports submenus.
 */
function Select3Submenu(options) {

    Select3Dropdown.call(this, options);
}

Select3Submenu.prototype = Object.create(Select3Dropdown.prototype);
Select3Submenu.prototype.constructor = Select3Submenu;

$.extend(Select3Submenu.prototype, {



});

/**
 * Extension of processItems(), to allow items with neither an ID nor any children as long as they
 * define a submenu.
 */
var processItem = Select3.processItem;
Select3.processItem = function(item) {

    if (item && $.type(item.submenu) === 'object' && $.type(item.text) === 'string') {
        return item;
    } else {
        return processItem(item);
    }
};
