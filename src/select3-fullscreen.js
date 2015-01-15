'use strict';

var $ = require('jquery');

var Select3 = require('./select3-base');

/**
 * Select3 Fullscreen Constructor.
 *
 * @param options Options object. Should have the following properties:
 *                select3 - Select3 instance to show the dropdown for.
 */
function Select3Fullscreen(options) {

    var select3 = options.select3;

    this.$el = $(select3.template('fullscreen', {
        dropdownCssClass: select3.options.dropdownCssClass,
        searchInputPlaceholder: select3.options.searchInputPlaceholder,
        showSearchInput: options.showSearchInput
    }));

    /**
     * Boolean indicating whether more results are available than currently displayed.
     */
    this.hasMore = false;

    /**
     * Original Select3 instance.
     */
    this.originalSelect3 = select3;

    /**
     * The results displayed in the dropdown.
     */
    this.results = [];

    /**
     * Select3 instance. May differ from the original Select3 instance when a new instance is
     * created to populate the '.select3-search-input-container' element.
     */
    this.select3 = select3;

    this.addToDom();
    this.position();

    if (options.showSearchInput) {
        select3.initSearchInput(this.$('.select3-search-input'));
    } else {
        var $searchInputContainer = this.$('.select3-search-input-container');
        $searchInputContainer.select3($.extend({}, select3.options, {
            placeholder: select3.options.searchInputPlaceholder,
            showDropdown: false,
            value: select3.value()
        })).on('change', function(event) {
            select3.value(event.value);

            this._rerenderResults(event);
        }.bind(this));

        this.select3 = $searchInputContainer[0].select3;

        $searchInputContainer.on('select3-searching', function(event) {
            select3.search(event.term);
            event.preventDefault();
        });
    }

    this.select3.focus();

    this._delegateEvents();

    this._positionResults();

    this.showLoading();

    select3.$el.trigger('select3-open');
}

/**
 * Methods.
 */
$.extend(Select3Fullscreen.prototype, {

    /**
     * Convenience shortcut for this.$el.find(selector).
     */
    $: function(selector) {

        return this.$el.find(selector);
    },

    /**
     * Adds the fullscreen selection to the DOM.
     */
    addToDom: function() {

        var body = this.select3.$el[0].ownerDocument.body;

        this._bodyOverflow = $(body).css('overflow');
        $(body).css('overflow', 'hidden');

        this.$el.appendTo(body);
    },

    /**
     * Closes the dropdown.
     */
    close: function() {

        this.$el.remove();

        $(this.select3.$el[0].ownerDocument.body).css('overflow', this._bodyOverflow);

        this.originalSelect3.$el.trigger('select3-close');
    },

    /**
     * Events map.
     *
     * Follows the same format as Backbone: http://backbonejs.org/#View-delegateEvents
     */
    events: {
        'click .select3-fullscreen-close': 'close',
        'click .select3-load-more': '_loadMoreClicked',
        'click .select3-result-item': '_resultClicked'
    },

    /**
     * Positions the dropdown inside the DOM.
     */
    position: function() {

        var select3 = this.select3;

        var positionDropdown = select3.options.positionDropdown || function() {};
        positionDropdown(this.$el, select3.$el);
    },

    /**
     * Shows a loading indicator in the dropdown.
     */
    showLoading: function() {

        var select3 = this.select3;
        this.$('.select3-results-container').html(select3.template('loading'));

        this.hasMore = false;
        this.results = [];
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

        this.originalSelect3.loadMore();

        this.select3.focus();
    },

    /**
     * @private
     */
    _positionResults: function() {

        var headerHeight = this.$('.select3-fullscreen-header').height();
        var searchInputHeight = this.$('.select3-search-input-container').height();
        this.$('.select3-results-container').css('top', headerHeight + searchInputHeight + 'px');
    },

    /**
     * @private
     */
    _renderItems: function(items) {

        var select3 = this.select3;
        return items.map(function(item) {
            var result = select3.template(item.id ? 'resultItem' : 'resultLabel', $.extend(item, {
                selected: ($.type(select3._value) === 'array' ? select3._value.indexOf(item.id) > -1
                                                              : select3._value === item.id)
            }));
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
    _rerenderResults: function(event) {

        var item = event.added || event.removed;

        if (item) {
            var quotedId = Select3.quoteCssAttr(item.id);
            var $resultItem = this.$('.select3-result-item[data-item-id=' + quotedId + ']');

            if (event.added) {
                $resultItem.addClass('selected');
            } else {
                $resultItem.removeClass('selected');
            }
        }

        this._positionResults();
    },

    /**
     * @private
     */
    _resultClicked: function(event) {

        this._selectItem(this.select3.getItemId(event));

        return false;
    },

    /**
     * @private
     */
    _selectItem: function(id) {

        var select3 = this.select3;
        var item = Select3.findNestedById(this.results, id);
        if (item) {
            var options = { id: id, item: item };
            if (select3.triggerEvent('select3-selecting', options)) {
                select3.triggerEvent('select3-selected', options);
            }
        }
    }

});

Select3.Dropdown = Select3Fullscreen;

module.exports = Select3Fullscreen;
