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
     * The results displayed in the dropdown.
     */
    this.results = [];

    /**
     * Select3 instance.
     */
    this.select3 = select3;

    this._closeProxy = this.close.bind(this);
    if (select3.options.closeOnSelect !== false) {
        select3.$el.on('select3-selecting', this._closeProxy);
    }

    this.addToDom();
    this.position();
    this.setupCloseHandler();

    this._delegateEvents();

    select3.$el.trigger('select3-open');
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
     * Emulates a click on the highlighted item.
     */
    clickHighlight: function() {

        if (this.highlightedResult) {
            this._selectItem(this.highlightedResult.id);
        } else if (this.loadMoreHighlighted) {
            this._loadMoreClicked();
        }
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
     * Highlights a result item.
     *
     * @param item The item to highlight.
     */
    highlight: function(item) {

        if (this.loadMoreHighlighted) {
            this.$('.select3-load-more').removeClass('highlight');
        }

        this.$('.select3-result-item').removeClass('highlight')
            .filter('[data-item-id=' + Select3.quoteCssAttr(item.id) + ']').addClass('highlight');

        this.highlightedResult = item;
        this.loadMoreHighlighted = false;

        this.select3.triggerEvent('select2-highlight', { item: item, val: item.id });
    },

    /**
     * Highlights the load more link.
     *
     * @param item The item to highlight.
     */
    highlightLoadMore: function() {

        this.$('.select3-result-item').removeClass('highlight');
        this.$('.select3-load-more').addClass('highlight');

        this.highlightedResult = null;
        this.loadMoreHighlighted = true;
    },

    /**
     * Highlights the next result item.
     */
    highlightNext: function() {

        var results = this.results;
        if (results.length) {
            var index = 0;
            var highlightedResult = this.highlightedResult;
            if (highlightedResult) {
                index = Select3.findIndexById(results, highlightedResult.id) + 1;
                if (index >= results.length) {
                    if (this.hasMore) {
                        this.highlightLoadMore();
                        return;
                    } else {
                        index = 0;
                    }
                }
            }

            this.highlight(results[index]);
        }
    },

    /**
     * Highlights the previous result item.
     */
    highlightPrevious: function() {

        var results = this.results;
        if (results.length) {
            var index = results.length - 1;
            var highlightedResult = this.highlightedResult;
            if (highlightedResult) {
                index = Select3.findIndexById(results, highlightedResult.id) - 1;
                if (index < 0) {
                    if (this.hasMore) {
                        this.highlightLoadMore();
                        return;
                    } else {
                        index = results.length - 1;
                    }
                }
            }

            this.highlight(results[index]);
        }
    },

    /**
     * Positions the dropdown inside the DOM.
     */
    position: function() {

        var $selectEl = this.select3.$el;
        var offset = $selectEl.offset();
        this.$el.css({ left: offset.left + 'px', top: offset.top + $selectEl.height() + 'px' })
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

        this.hasMore = options.hasMore;
        this.results = results;

        if (results.length) {
            this.highlight(results[0]);
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

        this._selectItem(this.select3._getItemId(event));

        return false;
    },

    /**
     * @private
     */
    _selectItem: function(id) {

        var select3 = this.select3;
        var item = Select3.findById(select3.results, id);

        var options = { id: id, item: item };
        var event = $.Event('select3-selecting', options);
        select3.$el.trigger(event);

        if (!event.isDefaultPrevented()) {
            event = $.Event('select3-selected', options);
            select3.$el.trigger(event);
        }
    }

});

Select3.Dropdown = Select3Dropdown;

module.exports = Select3Dropdown;
