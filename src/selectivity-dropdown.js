'use strict';

var $ = require('jquery');


var _ = require('lodash')

var EventDelegator = require('./event-delegator');

var Selectivity = require('./selectivity-base');

/**
 * selectivity Dropdown Constructor.
 *
 * @param options Options object. Should have the following properties:
 *                selectivity - Selectivity instance to show the dropdown for.
 *                showSearchInput - Boolean whether a search input should be shown.
 */
function SelectivityDropdown(options) {

    var selectivity = options.selectivity;

    this.$el = $(selectivity.template('dropdown', {
        dropdownCssClass: selectivity.options.dropdownCssClass,
        searchInputPlaceholder: selectivity.options.searchInputPlaceholder,
        showSearchInput: options.showSearchInput
    }));

    /**
     * jQuery container to add the results to.
     */
    this.$results = this.$('.selectivity-results-container');

    /**
     * jQuery container for the search input.
     *
     * May be null as long as there is no visible search input. It is set by initSearchInput().
     */
    this.$searchInput = null;

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
     * Selectivity instance.
     */
    this.selectivity = selectivity;

    this._closed = false;

    this._closeProxy = this.close.bind(this);
    if (selectivity.options.closeOnSelect !== false) {
        selectivity.$el.on('selectivity-selecting', this._closeProxy);
    }

    this._lastMousePosition = {};

    this.addToDom();
    this.position();
    this.setupCloseHandler();

    this._suppressMouseWheel();

    if (options.showSearchInput) {
        selectivity.initSearchInput(this.$('.selectivity-search-input'));
        selectivity.focus();
    }

    EventDelegator.call(this);

    this.$results.on('scroll touchmove touchend', _.debounce(this._scrolled.bind(this), 50));

    this.showLoading();

    setTimeout(this.triggerOpen.bind(this), 1);
}

/**
 * Methods.
 */
$.extend(SelectivityDropdown.prototype, EventDelegator.prototype, {

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

        var $next;
        var $anchor = this.selectivity.$el;
        while (($next = $anchor.next('.selectivity-dropdown')).length) {
            $anchor = $next;
        }
        this.$el.insertAfter($anchor);
    },

    /**
     * Closes the dropdown.
     */
    close: function() {

        if (!this._closed) {
            this._closed = true;

            this.$el.remove();

            this.removeCloseHandler();

            this.selectivity.$el.off('selectivity-selecting', this._closeProxy);

            this.triggerClose();
        }
    },

    /**
     * Events map.
     *
     * Follows the same format as Backbone: http://backbonejs.org/#View-delegateEvents
     */
    events: {
        'click .selectivity-load-more': '_loadMoreClicked',
        'click .selectivity-result-item': '_resultClicked',
        'mouseenter .selectivity-load-more': '_loadMoreHovered',
        'mouseenter .selectivity-result-item': '_resultHovered'
    },

    /**
     * Applies focus to the input.
     */
    focus: function() {

        if (this.$searchInput) {
            this.$searchInput.focus();
        }
    },

    /**
     * Highlights a result item.
     *
     * @param item The item to highlight.
     */
    highlight: function(item) {

        if (this.loadMoreHighlighted) {
            this.$('.selectivity-load-more').removeClass('highlight');
        }

        this.$('.selectivity-result-item').removeClass('highlight')
            .filter('[data-item-id=' + Selectivity.quoteCssAttr(item.id) + ']')
            .addClass('highlight');

        this.highlightedResult = item;
        this.loadMoreHighlighted = false;

        this.selectivity.triggerEvent('selectivity-highlight', { item: item, id: item.id });
    },

    /**
     * Highlights the load more link.
     *
     * @param item The item to highlight.
     */
    highlightLoadMore: function() {

        this.$('.selectivity-result-item').removeClass('highlight');

        this.$('.selectivity-load-more').addClass('highlight');

        this.highlightedResult = null;
        this.loadMoreHighlighted = true;
    },

    /**
     * Initializes the search input element.
     *
     * Sets the $searchInput property, invokes all search input listeners and attaches the default
     * action of searching when something is typed.
     *
     * @param $input jQuery container for the input element.
     */
    initSearchInput: function($input) {

        this.$searchInput = $input;

        this.selectivity.searchInputListeners.forEach(function(listener) {
            listener(this, $input);
        }.bind(this));

        $input.on('keyup', function(event) {
            if (!event.isDefaultPrevented()) {
                this.search();
            }
        }.bind(this));
    },

    /**
     * Loads a follow-up page with results after a search.
     *
     * This method should only be called after a call to search() when the callback has indicated
     * more results are available.
     */
    loadMore: function() {

        this.options.query({
            callback: function(response) {
                if (response && response.results) {
                    this._showResults(
                        Selectivity.processItems(response.results),
                        { add: true, hasMore: !!response.more }
                    );
                } else {
                    throw new Error('callback must be passed a response object');
                }
            }.bind(this),
            error: function() {
                this._showResults([], { add: true });
            }.bind(this),
            offset: this.results.length,
            selectivity: this.selectivity,
            term: this.term
        });
    },

    /**
     * Positions the dropdown inside the DOM.
     */
    position: function() {

        var position = this.options.position;
        if (position) {
            position(this.$el, this.selectivity.$el);
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

        var selectivity = this.selectivity;
        return items.map(function(item) {
            var result = selectivity.template(item.id ? 'resultItem' : 'resultLabel', item);
            if (item.children) {
                result += selectivity.template('resultChildren', {
                    childrenHtml: this.renderItems(item.children)
                });
            }
            return result;
        }, this).join('');
    },

    /**
     * Searches for results based on the term given or the term entered in the search input.
     *
     * If an items array has been passed with the options to the Selectivity instance, a local
     * search will be performed among those items. Otherwise, the query function specified in the
     * options will be used to perform the search. If neither is defined, nothing happens.
     *
     * @param term Optional term to search for. If ommitted, the value of the search input element
     *             is used as term.
     */
    search: function(term) {

        var self = this;
        function setResults(results, resultOptions) {
            self._showResults(results, $.extend({ term: term }, resultOptions));
        }

        if (term === undefined) {
            term = (self.$searchInput ? self.$searchInput.val() : '');
        }

        if (self.options.items) {
            term = Selectivity.transformText(term);
            var matcher = self.selectivity.matcher;
            setResults(self.options.items.map(function(item) {
                return matcher(item, term);
            }).filter(function(item) {
                return !!item;
            }));
        } else if (self.options.query) {
            self.options.query({
                callback: function(response) {
                    if (response && response.results) {
                        setResults(
                            Selectivity.processItems(response.results),
                            { hasMore: !!response.more }
                        );
                    } else {
                        throw new Error('callback must be passed a response object');
                    }
                },
                error: self.showError.bind(self),
                offset: 0,
                selectivity: self.selectivity,
                term: term
            });
        }

        self.term = term;
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

        var item = Selectivity.findNestedById(this.results, id);
        if (item) {
            var options = { id: id, item: item };
            if (this.selectivity.triggerEvent('selectivity-selecting', options)) {
                this.selectivity.triggerEvent('selectivity-selected', options);
            }
        }
    },

    /**
     * Sets up an event handler that will close the dropdown when the Selectivity control loses
     * focus.
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

        this.$results.html(this.selectivity.template('error', {
            escape: options.escape !== false,
            message: message
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

        this.$results.html(this.selectivity.template('loading'));

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
            resultsHtml += this.selectivity.template('loadMore');
        } else {
            if (!resultsHtml && !options.add) {
                resultsHtml = this.selectivity.template('noResults', { term: options.term });
            }
        }

        if (options.add) {
            this.$('.selectivity-loading').replaceWith(resultsHtml);

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
     * Triggers the 'selectivity-close' event.
     */
    triggerClose: function() {

        this.selectivity.$el.trigger('selectivity-close');
    },

    /**
     * Triggers the 'selectivity-open' event.
     */
    triggerOpen: function() {

        this.selectivity.$el.trigger('selectivity-open');
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

        this.$('.selectivity-load-more').replaceWith(this.selectivity.template('loading'));

        this.loadMore();

        this.selectivity.focus();

        return false;
    },

    /**
     * @private
     */
    _loadMoreHovered: function(event) {

        if (event.screenX === undefined || event.screenX !== this._lastMousePosition.x ||
            event.screenY === undefined || event.screenY !== this._lastMousePosition.y) {
            this.highlightLoadMore();

            this._recordMousePosition(event);
        }
    },

    /**
     * @private
     */
    _recordMousePosition: function(event) {

        this._lastMousePosition = { x: event.screenX, y: event.screenY };
    },

    /**
     * @private
     */
    _resultClicked: function(event) {

        this.selectItem(this.selectivity._getItemId(event));

        return false;
    },

    /**
     * @private
     */
    _resultHovered: function(event) {

        if (event.screenX === undefined || event.screenX !== this._lastMousePosition.x ||
            event.screenY === undefined || event.screenY !== this._lastMousePosition.y) {
            var id = this.selectivity._getItemId(event);
            var item = Selectivity.findNestedById(this.results, id);
            if (item) {
                this.highlight(item);
            }

            this._recordMousePosition(event);
        }
    },

    /**
     * @private
     */
    _scrolled: function() {

        var $loadMore = this.$('.selectivity-load-more');
        if ($loadMore.length) {
            if ($loadMore[0].offsetTop - this.$results[0].scrollTop < this.$el.height()) {
                this._loadMoreClicked();
            }
        }
    },

    /**
     * @private
     */
    _showResults: function(results, options) {

        this.showResults(this.selectivity.filterResults(results), options || {});
    },

    /**
     * @private
     */
    _suppressMouseWheel: function() {

        var suppressMouseWheelSelector = this.selectivity.options.suppressMouseWheelSelector;
        if (suppressMouseWheelSelector === null) {
            return;
        }

        var selector = suppressMouseWheelSelector || '.selectivity-results-container';
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

            if (scrollHeight > height) {
                if (!up && -delta > scrollHeight - height - scrollTop) {
                    // Scrolling down, but this will take us past the bottom.
                    $el.scrollTop(scrollHeight);
                    return prevent();
                } else if (up && delta > scrollTop) {
                    // Scrolling up, but this will take us past the top.
                    $el.scrollTop(0);
                    return prevent();
                }
            }
        });
    }

});

module.exports = Selectivity.Dropdown = SelectivityDropdown;
