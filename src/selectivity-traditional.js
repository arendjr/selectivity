'use strict';

var $ = require('jquery');

var Selectivity = require('./selectivity-base');

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
    options.items = (options.query ? null : items);

    options.placeholder = options.placeholder || $el.data('placeholder') || '';

    options.data = data;

    var classes = ($el.attr('class') || 'selectivity-input').split(' ');
    if (classes.indexOf('selectivity-input') === -1) {
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
    return $div;
}

function bindTraditionalSelectEvents(selectivity) {
    var $el = selectivity.$el;
    $el.on('selectivity-selected', function(event) {
        var value = selectivity.value();
        $el.prev('select')
            .val($.type(value) === 'array' ? [event.item.id].concat(value) : event.item.id)
            .change();
    });
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

        selectivity.$el = createSelectivityNextToSelectElement($el, options);
        selectivity.$el[0].selectivity = selectivity;

        bindTraditionalSelectEvents(selectivity);
    }
});
