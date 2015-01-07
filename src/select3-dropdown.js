'use strict';

var $ = require('jquery');

var Select3 = require('./select3-base');

/**
 * Returns the index of the first element in the jQuery container $elements that matches the given
 * selector, or -1 if no elements match the selector.
 */
function findElementIndex($elements, selector) {

    for (var i = 0, length = $elements.length; i < length; i++) {
        if ($elements.eq(i).is(selector)) {
            return i;
        }
    }
    return -1;
}

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
        searchInputPlaceholder: select3.options.searchInputPlaceholder,
        showSearchInput: options.showSearchInput
    }));

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

    if (options.showSearchInput) {
        var $input = this.$('.select3-search-input');
        $input.focus();
        this._$input = $input;
    }

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
        'click .select3-result-item': '_resultClicked',
        'keydown .select3-search-input': '_keyHeld',
        'keyup .select3-search-input': '_keyReleased',
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

        this.select3.triggerEvent('select3-highlight', { item: item, val: item.id });
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
            var $results = this.$('.select3-result-item');
            var index = 0;
            var highlightedResult = this.highlightedResult;
            if (highlightedResult) {
                var quotedId = Select3.quoteCssAttr(highlightedResult.id);
                index = findElementIndex($results, '[data-item-id=' + quotedId + ']') + 1;
                if (index >= $results.length) {
                    if (this.hasMore) {
                        this.highlightLoadMore();
                        this._scrollToHighlight({ alignToTop: false });
                        return;
                    } else {
                        index = 0;
                    }
                }
            }

            var result = Select3.findNestedById(results, this.select3._getItemId($results[index]));
            if (result) {
                this.highlight(result);
                this._scrollToHighlight({ alignToTop: false });
            }
        }
    },

    /**
     * Highlights the previous result item.
     */
    highlightPrevious: function() {

        var results = this.results;
        if (results.length) {
            var $results = this.$('.select3-result-item');
            var index = $results.length - 1;
            var highlightedResult = this.highlightedResult;
            if (highlightedResult) {
                var quotedId = Select3.quoteCssAttr(highlightedResult.id);
                index = findElementIndex($results, '[data-item-id=' + quotedId + ']') - 1;
                if (index < 0) {
                    if (this.hasMore) {
                        this.highlightLoadMore();
                        this._scrollToHighlight({ alignToTop: true });
                        return;
                    } else {
                        index = $results.length - 1;
                    }
                }
            }

            var result = Select3.findNestedById(results, this.select3._getItemId($results[index]));
            if (result) {
                this.highlight(result);
                this._scrollToHighlight({ alignToTop: true });
            }
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
     * Shows more search results as a result of pagination.
     *
     * @param results Array of result items.
     * @param options Options object. May contain the following properties:
     *                hasMore - Boolean whether more results can be fetched using the query()
     *                          function.
     */
    showMoreResults: function(results, options) {

        options = options || {};

        var select3 = this.select3;
        var $loadMore = this.$('.select3-load-more');
        $loadMore.before(this._renderItems(results));

        if (!options.hasMore) {
            $loadMore.remove();
        }

        this.hasMore = options.hasMore;
        this.results = this.results.concat(results);

        if (this.loadMoreHighlighted && results.length) {
            this.highlight(results[0]);
        }
    },

    /**
     * Shows the results from a search query.
     *
     * @param results Array of result items.
     * @param options Options object. May contain the following properties:
     *                hasMore - Boolean whether more results can be fetched using the query()
     *                          function.
     *                term - The search term for which the results are displayed.
     */
    showResults: function(results, options) {

        options = options || {};

        var select3 = this.select3;
        var $resultsContainer = this.$('.select3-results-container');
        $resultsContainer.html(
            results.length ? this._renderItems(results)
                           : select3.template('noResults', { term: options.term })
        );

        if (options.hasMore) {
            $resultsContainer.append(select3.template('loadMore'));
        }

        this.hasMore = options.hasMore;
        this.results = results;

        if (results.length) {
            this.highlight(results[0]);
        } else {
            this.highlightedResult = null;
            this.loadMoreHighlighted = false;
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
    _keyHeld: function(event) {

        if (event.keyCode === Select3.Keys.DOWN_ARROW) {
            this.highlightNext();
        } else if (event.keyCode === Select3.Keys.UP_ARROW) {
            this.highlightPrevious();
        }
    },

    /**
     * @private
     */
    _keyReleased: function(event) {

        if (event.keyCode === Select3.Keys.ENTER && !event.ctrlKey) {
            this.clickHighlight();
            this._$input.val('');
        } else if (event.keyCode === Select3.Keys.ESCAPE) {
            this.close();
        } else if (event.keyCode === Select3.Keys.DOWN_ARROW ||
                   event.keyCode === Select3.Keys.UP_ARROW) {
            // handled in _keyHeld() because the response feels faster and it works with repeated
            // events if the user holds the key for a longer period
        } else {
            this.select3.search(this._$input.val());
        }

        return false;
    },

    /**
     * @private
     */
    _loadMoreClicked: function() {

        this.select3.loadMore();

        this.select3.focus();
    },

    /**
     * @private
     */
    _renderItems: function(items) {

        var select3 = this.select3;
        return items.map(function(item) {
            var result = select3.template(item.id ? 'resultItem' : 'resultLabel', item);
            if (item.children) {
                result += select3.template('resultChildren', {
                    childrenHtml: this._renderItems(item.children)
                });
            }
            return result;
        }.bind(this)).join('');
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
            containerRect = this.$('.select3-results-container')[0].getBoundingClientRect();

        if (rect.top < containerRect.top || rect.bottom > containerRect.bottom) {
            el.scrollIntoView(options.alignToTop);
        }
    },

    /**
     * @private
     */
    _selectItem: function(id) {

        var select3 = this.select3;
        var item = Select3.findNestedById(select3.results, id);
        if (item) {
            var options = { id: id, item: item };
            var event = $.Event('select3-selecting', options);
            select3.$el.trigger(event);

            if (!event.isDefaultPrevented()) {
                event = $.Event('select3-selected', options);
                select3.$el.trigger(event);
            }
        }
    }

});

Select3.Dropdown = Select3Dropdown;

module.exports = Select3Dropdown;
