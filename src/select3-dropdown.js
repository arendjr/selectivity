'use strict';

var $ = require('jquery');

var Select3 = require('./select3-base');

/**
 * Select3 Dropdown Constructor.
 *
 * @param options Options object. Should have the following properties:
 *                select3 - Select3 instance to show the dropdown for.
 */
function Select3Dropdown(options) {

    var select3 = options.select3;

    this.$el = $(select3.template('dropdown'));

    this.select3 = select3;

    this._closeProxy = this.close.bind(this);
    if (select3.options.closeOnSelect !== false) {
        select3.$el.on('select3-selecting', this._closeProxy);
    }

    this.addToDom();
    this.position();
    this.setupCloseHandler();

    this._delegateEvents();
}

/**
 * Methods.
 */
$.extend(Select3Dropdown.prototype, {

    /**
     * Convenience shortcut for this.$el.find(selector).
     */
    $: function(selector) {

        return this.$el.find(selector);
    },

    /**
     * Adds the dropdown to the DOM.
     */
    addToDom: function() {

        this.$el.appendTo(this.select3.$el[0].ownerDocument.body);
    },

    /**
     * Closes the dropdown.
     */
    close: function() {

        this.$el.remove();

        this.removeCloseHandler();

        this.select3.$el.off('select3-selecting', this._closeProxy)
                        .trigger('select3-close');
    },

    /**
     * Events map.
     *
     * Follows the same format as Backbone: http://backbonejs.org/#View-delegateEvents
     */
    events: {
        'click .select3-load-more': '_loadMoreClicked',
        'click .select3-result-item': '_resultClicked'
    },

    /**
     * Positions the dropdown inside the DOM.
     */
    position: function() {

        var $selectEl = this.select3.$el;
        var offset = $selectEl.offset();
        this.$el.offset({ left: offset.left, top: offset.top + $selectEl.height() })
                .width($selectEl.width());
    },

    /**
     * Removes the event handler to close the dropdown.
     */
    removeCloseHandler: function() {

        $('body').off('click', this._closeProxy);
    },

    /**
     * Sets up an event handler that will close the dropdown when the Select3 control loses focus.
     */
    setupCloseHandler: function() {

        $('body').on('click', this._closeProxy);
    },

    /**
     * Shows the results from a search query.
     *
     * @param results Array of result items.
     * @param options Options object. May contain the following properties:
     *                hasMore - Boolean whether more results can be fetched using the query()
     *                          function.
     */
    showResults: function(results, options) {

        options = options || {};

        var select3 = this.select3;
        var $resultsContainer = this.$('.select3-results-container');
        $resultsContainer.html(results.map(function(item) {
            return select3.template('resultItem', item);
        }).join(''));

        if (options.hasMore) {
            $resultsContainer.append(select3.template('loadMore'));
        }
    },

    /**
     * @private
     */
    _delegateEvents: function() {

        $.each(this.events, function(event, listener) {
            var index = event.indexOf(' ');
            var selector = event.slice(index + 1);
            event = event.slice(0, index);

            if ($.type(listener) === 'string') {
                listener = this[listener];
            }

            listener = listener.bind(this);

            this.$el.on(event, selector, listener);
        }.bind(this));
    },

    /**
     * @private
     */
    _loadMoreClicked: function() {

        // TODO
    },

    /**
     * @private
     */
    _resultClicked: function(event) {

        var select3 = this.select3;
        var id = select3._getItemId(event);
        var item = Select3.findById(select3.results, id);
        select3.$el.trigger($.Event('select3-selecting', { id: id, item: item }));

        return false;
    }

});

Select3.Dropdown = Select3Dropdown;

module.exports = Select3Dropdown;
