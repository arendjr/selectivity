'use strict';

var $ = require('jquery');

var Selectivity = require('./selectivity-base');

function replaceSelectElement($el, options) {

    var value = (options.multiple ? [] : null);

    var mapOptions = function() {
        var $this = $(this);
        if ($this.is('option')) {
            var id = $this.attr('value') || $this.text();
            if ($this.prop('selected')) {
                if (options.multiple) {
                    value.push(id);
                } else {
                    value = id;
                }
            }

            return {
                id: id,
                text: $this.attr('label') || $this.text()
            };
        } else {
            return {
                text: $this.attr('label'),
                children: $this.children('option,optgroup').map(mapOptions).get()
            };
        }
    };

    options.allowClear = ('allowClear' in options ? options.allowClear : !$el.prop('required'));

    options.items = $el.children('option,optgroup').map(mapOptions).get();

    options.placeholder = options.placeholder || $el.data('placeholder') || '';

    options.value = value;

    var $div = $('<div>').attr({
        'class': $el.attr('class'),
        'id': $el.attr('id'),
        'name': $el.attr('name'),
        'style': $el.attr('style')
    });
    $el.replaceWith($div);
    return $div;
}

/**
 * Option listener providing support for converting traditional <select> boxes into Selectivity
 * instances.
 */
Selectivity.OptionListeners.push(function(selectivity, options) {

    var $el = selectivity.$el;
    if ($el.is('select')) {
        if ($el.attr('autofocus')) {
            setTimeout(function() {
                selectivity.focus();
            }, 1);
        }

        selectivity.$el = replaceSelectElement($el, options);
        selectivity.$el[0].selectivity = selectivity;
    }
});
