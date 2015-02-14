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
        dropdownCssClass: select3.options.dropdownCssClass,
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

        var positionDropdown = this.options.position || function($el, $selectEl) {
            var offset = $selectEl.offset();
            $el.css({ left: offset.left + 'px', top: offset.top + $selectEl.height() + 'px' })
               .width($selectEl.width());
        };

        positionDropdown(this.$el, this.select3.$el);
    },

    /**
     * Removes the event handler to close the dropdown.
     */
    removeCloseHandler: function() {

        $('body').off('click', this._closeProxy);
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
     * Shows a loading indicator in the dropdown.
     */
    showLoading: function() {

        var select3 = this.select3;
        this.$('.select3-results-container').html(select3.template('loading'));

        this.hasMore = false;
        this.results = [];

        this.highlightedResult = null;
        this.loadMoreHighlighted = false;
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

        var $loadMore = this.$('.select3-load-more');
        $loadMore.before(this._renderItems(results));

        if (!options.hasMore) {
            $loadMore.remove();
        }

        this.hasMore = options.hasMore;
        this.results = this.results.concat(results);

        if (this.loadMoreHighlighted) {
            this._highlightFirstItem(results);
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
                           : options.hasMore ? ''
                                             : select3.template('noResults', { term: options.term })
        );

        if (options.hasMore) {
            $resultsContainer.append(select3.template('loadMore'));
        }

        this.hasMore = options.hasMore;
        this.results = results;

        this._highlightFirstItem(results);
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

        debugger;

        this.select3.loadMore();

        this.select3.focus();

        return false;
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

Select3.Dropdown = Select3Dropdown;

module.exports = Select3Dropdown;
