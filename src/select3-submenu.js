'use strict';

var $ = require('jquery');

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

Select3Submenu.prototype = Object.create(Select3Dropdown.prototype);
Select3Submenu.prototype.constructor = Select3Submenu;

$.extend(Select3Submenu.prototype, {

    /**
     * @inherit
     */
    close: function() {

        if (this.options.restoreOptions) {
            this.select3.setOptions(this.options.restoreOptions);
        }

        if (this.submenu) {
            this.submenu.close();
        }

        Select3Dropdown.prototype.close.call(this);

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
            Select3Dropdown.prototype.highlightNext.call(this);
        }
    },

    /**
     * @inherit
     */
    highlightPrevious: function() {

        if (this.submenu) {
            this.submenu.highlightPrevious();
        } else {
            Select3Dropdown.prototype.highlightPrevious.call(this);
        }
    },

    /**
     * @inherit
     */
    selectHighlight: function() {

        if (this.submenu) {
            this.submenu.selectHighlight();
        } else {
            Select3Dropdown.prototype.selectHighlight.call(this);
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
    showMoreResults: function(results, options) {

        if (this.submenu) {
            this.submenu.showMoreResults(results, options);
        } else {
            Select3Dropdown.prototype.showMoreResults.call(this, results, options);
        }
    },

    /**
     * @inherit
     */
    showResults: function(results, options) {

        if (this.submenu) {
            this.submenu.showResults(results, options);
        } else {
            Select3Dropdown.prototype.showResults.call(this, results, options);
        }
    },

    /**
     * @inherit
     */
    triggerClose: function() {

        if (this.parentMenu) {
            this.select3.$el.trigger('select3-close-submenu');
        } else {
            Select3Dropdown.prototype.triggerClose.call(this);
        }
    },

    /**
     * @inherit
     */
    triggerOpen: function() {

        if (this.parentMenu) {
            this.select3.$el.trigger('select3-open-submenu');
        } else {
            Select3Dropdown.prototype.triggerOpen.call(this);
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

        Select3Dropdown.prototype.highlight.call(this, item);

        if (item.submenu && !this.submenu) {
            var quotedId = Select3.quoteCssAttr(item.id);
            var $item = this.$('.select3-result-item[data-item-id=' + quotedId + ']');
            var $dropdownEl = this.$el;

            var Dropdown = this.select3.options.dropdown || Select3.Dropdown;
            if (Dropdown) {
                this.submenu = new Dropdown({
                    parentMenu: this,
                    position: function($el) {
                        var offset = $item.offset();
                        var width = $dropdownEl.width();
                        $el.css({
                            left: offset.left + width + 'px',
                            top: offset.top + 'px'
                        }).width(width);
                    },
                    restoreOptions: {
                        items: this.select3.items,
                        query: this.select3.options.query || null
                    },
                    select3: this.select3,
                    showSearchInput: item.submenu.showSearchInput
                });

                this.select3.setOptions({
                    items: item.submenu.items || null,
                    query: item.submenu.query || null
                });

                this.select3.search('');
            }
        }
    }

});

Select3.Dropdown = Select3Submenu;

module.exports = Select3Submenu;
