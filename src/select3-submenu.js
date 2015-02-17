'use strict';

var Select3 = require('./select3-base');
var Select3Dropdown = require('./select3-dropdown');

/**
 * Extended dropdown that supports submenus.
 */
function Select3Submenu(options) {

    /**
     * Optional parent dropdown menu from which this dropdown was opened.
     */
    this.parentMenu = options.parentMenu;

    Select3Dropdown.call(this, options);

    this._closeSubmenuTimeout = 0;
}

var callSuper = Select3.inherits(Select3Submenu, Select3Dropdown, {

    /**
     * @inherit
     */
    close: function() {

        if (this.options.restoreOptions) {
            this.select3.setOptions(this.options.restoreOptions);
        }
        if (this.options.restoreResults) {
            this.select3.results = this.options.restoreResults;
        }

        if (this.submenu) {
            this.submenu.close();
        }

        callSuper(this, 'close');

        if (this.parentMenu) {
            this.parentMenu.submenu = null;
            this.parentMenu = null;
        }
    },

    /**
     * @inherit
     */
    highlight: function(item) {

        if (this.submenu) {
            if (!this.highlightedResult || this.highlightedResult.id !== item.id) {
                if (this._closeSubmenuTimeout) {
                    clearTimeout(this._closeSubmenuTimeout);
                }
                this._closeSubmenuTimeout = setTimeout(
                    this._closeSubmenuAndHighlight.bind(this, item), 100
                );
                return;
            }
        } else {
            if (this.parentMenu && this.parentMenu._closeSubmenuTimeout) {
                clearTimeout(this.parentMenu._closeSubmenuTimeout);
                this.parentMenu._closeSubmenuTimeout = 0;
            }
        }

        this._doHighlight(item);
    },

    /**
     * @inherit
     */
    highlightNext: function() {

        if (this.submenu) {
            this.submenu.highlightNext();
        } else {
            callSuper(this, 'highlightNext');
        }
    },

    /**
     * @inherit
     */
    highlightPrevious: function() {

        if (this.submenu) {
            this.submenu.highlightPrevious();
        } else {
            callSuper(this, 'highlightPrevious');
        }
    },

    /**
     * @inherit
     */
    selectHighlight: function() {

        if (this.submenu) {
            this.submenu.selectHighlight();
        } else {
            callSuper(this, 'selectHighlight');
        }
    },

    /**
     * @inherit
     */
    selectItem: function(id) {

        var select3 = this.select3;
        var item = Select3.findNestedById(select3.results, id);
        if (item && !item.submenu) {
            var options = { id: id, item: item };
            if (select3.triggerEvent('select3-selecting', options)) {
                select3.triggerEvent('select3-selected', options);
            }
        }
    },

    /**
     * @inherit
     */
    showResults: function(results, options) {

        if (this.submenu) {
            this.submenu.showResults(results, options);
        } else {
            callSuper(this, 'showResults', results, options);
        }
    },

    /**
     * @inherit
     */
    triggerClose: function() {

        if (this.parentMenu) {
            this.select3.$el.trigger('select3-close-submenu');
        } else {
            callSuper(this, 'triggerClose');
        }
    },

    /**
     * @inherit
     */
    triggerOpen: function() {

        if (this.parentMenu) {
            this.select3.$el.trigger('select3-open-submenu');
        } else {
            callSuper(this, 'triggerOpen');
        }
    },

    /**
     * @private
     */
    _closeSubmenuAndHighlight: function(item) {

        if (this.submenu) {
            this.submenu.close();
        }

        this._doHighlight(item);
    },

    /**
     * @private
     */
    _doHighlight: function(item) {

        callSuper(this, 'highlight', item);

        if (item.submenu && !this.submenu) {
            var select3 = this.select3;
            var Dropdown = select3.options.dropdown || Select3.Dropdown;
            if (Dropdown) {
                var quotedId = Select3.quoteCssAttr(item.id);
                var $item = this.$('.select3-result-item[data-item-id=' + quotedId + ']');
                var $dropdownEl = this.$el;

                this.submenu = new Dropdown({
                    parentMenu: this,
                    position: item.submenu.positionDropdown || function($el) {
                        var offset = $item.offset();
                        var width = $dropdownEl.width();
                        $el.css({
                            left: offset.left + width + 'px',
                            top: offset.top + 'px'
                        }).width(width);
                    },
                    restoreOptions: {
                        items: select3.items,
                        query: select3.options.query || null
                    },
                    restoreResults: select3.results,
                    select3: select3,
                    showSearchInput: item.submenu.showSearchInput
                });

                select3.setOptions({
                    items: item.submenu.items || null,
                    query: item.submenu.query || null
                });

                select3.search('');
            }
        }
    }

});

Select3.Dropdown = Select3Submenu;

Select3.findNestedById = function(array, id) {

    for (var i = 0, length = array.length; i < length; i++) {
        var item = array[i], result;
        if (item.id === id) {
            result = item;
        } else if (item.children) {
            result = Select3.findNestedById(item.children, id);
        } else if (item.submenu && item.submenu.items) {
            result = Select3.findNestedById(item.submenu.items, id);
        }
        if (result) {
            return result;
        }
    }
    return null;
};

module.exports = Select3Submenu;
