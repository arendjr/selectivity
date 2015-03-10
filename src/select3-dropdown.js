'use strict';

var $ = require('jquery');

var debounce = require('./lodash/debounce');

var Select3 = require('./select3-base');

/**
 * Select3 Dropdown Constructor.
 *
 * @param options Options object. Should have the following properties:
 *                select3 - Select3 instance to show the dropdown for.
 *                showSearchInput - Boolean whether a search input should be shown.
 */
function Select3Dropdown(options) {

    var select3 = options.select3;

    this.$el = $(select3.template('dropdown', {
        dropdownCssClass: select3.options.dropdownCssClass,
        searchInputPlaceholder: select3.options.searchInputPlaceholder,
        showSearchInput: options.showSearchInput
    }));

    /**
     * jQuery container to add the results to.
     */
    this.$results = this.$('.select3-results-container');

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

    this._scrolledProxy = debounce(this._scrolled.bind(this), 50);

    this._suppressMouseWheel();

    if (options.showSearchInput) {
        select3.initSearchInput(this.$('.select3-search-input'));
        select3.focus();
    }

    this._delegateEvents();

    this.showLoading();

    this.triggerOpen();
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

        this.select3.$el.off('select3-selecting', this._closeProxy);

        this.triggerClose();
    },

    /**
     * Events map.
     *
     * Follows the same format as Backbone: http://backbonejs.org/#View-delegateEvents
     */
    events: {
        'click .select3-load-more': '_loadMoreClicked',
        'click .select3-result-item': '_resultClicked',
        'mouseenter .select3-load-more': 'highlightLoadMore',
        'mouseenter .select3-result-item': '_resultHovered'
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

        this.select3.triggerEvent('select3-highlight', { item: item, id: item.id });
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
     * Positions the dropdown inside the DOM.
     */
    position: function() {

        var position = this.options.position;
        if (position) {
            position(this.$el, this.select3.$el);
        }

        this._scrolled();
    },

    /**
     * Removes the event handler to close the dropdown.
     */
    removeCloseHandler: function() {

        $('body').off('click', this._closeProxy);
    },

    /**
     * Renders an array of result items.
     *
     * @param items Array of result items.
     *
     * @return HTML-formatted string to display the result items.
     */
    renderItems: function(items) {

        var select3 = this.select3;
        return items.map(function(item) {
            var result = select3.template(item.id ? 'resultItem' : 'resultLabel', item);
            if (item.children) {
                result += select3.template('resultChildren', {
                    childrenHtml: this.renderItems(item.children)
                });
            }
            return result;
        }, this).join('');
    },

    /**
     * Selects the highlighted item.
     */
    selectHighlight: function() {

        if (this.highlightedResult) {
            this.selectItem(this.highlightedResult.id);
        } else if (this.loadMoreHighlighted) {
            this._loadMoreClicked();
        }
    },

    /**
     * Selects the item with the given ID.
     *
     * @param id ID of the item to select.
     */
    selectItem: function(id) {

        var select3 = this.select3;
        var item = Select3.findNestedById(select3.results, id);
        if (item) {
            var options = { id: id, item: item };
            if (select3.triggerEvent('select3-selecting', options)) {
                select3.triggerEvent('select3-selected', options);
            }
        }
    },

    /**
     * Sets up an event handler that will close the dropdown when the Select3 control loses focus.
     */
    setupCloseHandler: function() {

        $('body').on('click', this._closeProxy);
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

        options = options || {};

        this.$results.html(this.select3.template('error', {
            escape: options.escape !== false,
            message: message,
        }));

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

        this.$results.html(this.select3.template('loading'));

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

        var resultsHtml = this.renderItems(results);
        if (options.hasMore) {
            resultsHtml += this.select3.template('loadMore');
        } else {
            if (!resultsHtml && !options.add) {
                resultsHtml = this.select3.template('noResults', { term: options.term });
            }
        }

        if (options.add) {
            this.$('.select3-loading').replaceWith(resultsHtml);

            this.results = this.results.concat(results);
        } else {
            this.$results.html(resultsHtml);

            this.results = results;
        }

        this.hasMore = options.hasMore;

        if (!options.add || this.loadMoreHighlighted) {
            this._highlightFirstItem(results);
        }

        this.position();
    },

    /**
     * Triggers the 'select3-close' event.
     */
    triggerClose: function() {

        this.select3.$el.trigger('select3-close');
    },

    /**
     * Triggers the 'select3-open' event.
     */
    triggerOpen: function() {

        this.select3.$el.trigger('select3-open');
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

        this.$results.on('scroll touchmove touchend', this._scrolledProxy);
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
            this.highlight(firstItem);
        } else {
            this.highlightedResult = null;
            this.loadMoreHighlighted = false;
        }
    },

    /**
     * @private
     */
    _loadMoreClicked: function() {

        this.$('.select3-load-more').replaceWith(this.select3.template('loading'));

        this.select3.loadMore();

        this.select3.focus();

        return false;
    },

    /**
     * @private
     */
    _resultClicked: function(event) {

        this.selectItem(this.select3._getItemId(event));

        return false;
    },

    /**
     * @private
     */
    _resultHovered: function(event) {

        var id = this.select3._getItemId(event);
        var item = Select3.findNestedById(this.results, id);
        if (item) {
            this.highlight(item);
        }
    },

    /**
     * @private
     */
    _scrolled: function() {

        var $loadMore = this.$('.select3-load-more');
        if ($loadMore.length) {
            if ($loadMore[0].offsetTop - this.$results[0].scrollTop < this.$el.height()) {
                this._loadMoreClicked();
            }
        }
    },

    /**
     * @private
     */
    _scrollToHighlight: function(options) {

        var el;
        if (this.highlightedResult) {
            var quotedId = Select3.quoteCssAttr(this.highlightedResult.id);
            el = this.$('.select3-result-item[data-item-id=' + quotedId + ']')[0];
        } else if (this.loadMoreHighlighted) {
            el = this.$('.select3-load-more')[0];
        } else {
            return; // no highlight to scroll to
        }

        var rect = el.getBoundingClientRect(),
            containerRect = this.$results[0].getBoundingClientRect();

        if (rect.top < containerRect.top || rect.bottom > containerRect.bottom) {
            el.scrollIntoView(options.alignToTop);
        }
    },

    /**
     * @private
     */
    _suppressMouseWheel: function() {

        var suppressMouseWheelSelector = this.select3.options.suppressMouseWheelSelector;
        if (suppressMouseWheelSelector === null) {
            return;
        }

        var selector = suppressMouseWheelSelector || '.select3-results-container';
        this.$el.on('DOMMouseScroll mousewheel', selector, function(event) {

            // Thanks to Troy Alford:
            // http://stackoverflow.com/questions/5802467/prevent-scrolling-of-parent-element

            var $el = $(this),
                scrollTop = this.scrollTop,
                scrollHeight = this.scrollHeight,
                height = $el.height(),
                originalEvent = event.originalEvent,
                delta = (event.type === 'DOMMouseScroll' ? originalEvent.detail * -40
                                                         : originalEvent.wheelDelta),
                up = delta > 0;

            function prevent() {
                event.stopPropagation();
                event.preventDefault();
                event.returnValue = false;
                return false;
            }

            if (!up && -delta > scrollHeight - height - scrollTop) {
                // Scrolling down, but this will take us past the bottom.
                $el.scrollTop(scrollHeight);
                return prevent();
            } else if (up && delta > scrollTop) {
                // Scrolling up, but this will take us past the top.
                $el.scrollTop(0);
                return prevent();
            }
        });
    }

});

module.exports = Select3.Dropdown = Select3Dropdown;
