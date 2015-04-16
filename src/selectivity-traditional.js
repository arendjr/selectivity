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
    $el.replaceWith($div);
    return $div;
}

function bindTraditionalSelectEvents(selectivity) {

    var $el = selectivity.$el;

    $el.on('selectivity-init', function(event, mode) {

            $el.append(selectivity.template('selectCompliance', {name: $el.attr('data-name'), mode: mode}))
              .removeAttr('data-name');
        })
        .on('change', function(event) {

            var data = selectivity._data;
            var $select = $el.find('select');

            if (data instanceof Array) {

                event = event || {};

                if (event.added) {
                    $select.append(selectivity.template('selectOptionCompliance', event.added));
                } else if (event.removed) {
                    var quotedId = Selectivity.quoteCssAttr(event.removed.id);

                    $select.find('[value=' + quotedId + ']').remove();
                }
            } else {
                if (data) {
                    $select.html(selectivity.template('selectOptionCompliance', data));
                } else {
                    $select.empty();
                }
            }
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

        selectivity.$el = replaceSelectElement($el, options);
        selectivity.$el[0].selectivity = selectivity;

        bindTraditionalSelectEvents(selectivity);
    }
});
