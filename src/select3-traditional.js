'use strict';

var $ = require('jquery');

var Select3 = require('./select3-base');

/**
 * Option listener providing support for converting traditional <select> boxes into Select3
 * instances.
 */
function listener(select3, options) {

    var $el = select3.$el;
    if ($el.is('select')) {
        if ($el.attr('autofocus')) {
            setTimeout(function() {
                select3.focus();
            }, 1);
        }

        select3.$el = replaceSelectElement($el, options);
    }
}

function replaceSelectElement($el, options) {

    var mapOptions = function() {
        var $this = $(this);
        if ($this.is('option')) {
            return {
                id: $this.attr('value') || $this.text(),
                text: $this.attr('label') || $this.text()
            };
        } else {
            return {
                text: $this.attr('label'),
                children: $this.children('option,optgroup').map(mapOptions).get()
            };
        }
    };

    options.allowClear = options.hasOwnProperty('allowClear') ? options.allowClear
                                                              : !$el.prop('required');

    options.items = $el.children('option,optgroup').map(mapOptions).get();

    options.placeholder = options.placeholder || $el.data('data-placeholder') || '';

    var $div = $('<div>');
    $div.attr({
        'class': $el.attr('class'),
        'id': $el.attr('id'),
        'name': $el.attr('name'),
        'style': $el.attr('style')
    });
    $el.replaceWith($div);
    return $div;
}

Select3.OptionListeners.push(listener);
