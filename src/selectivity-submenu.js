'use strict';

var Selectivity = require('./selectivity-base');
var SelectivityDropdown = require('./selectivity-dropdown');

/**
 * Extended dropdown that supports submenus.
 */
function SelectivitySubmenu(options) {

    /**
     * Optional parent dropdown menu from which this dropdown was opened.
     */
    this.parentMenu = options.parentMenu;

    SelectivityDropdown.call(this, options);

    this._closeSubmenuTimeout = 0;

    this._openSubmenuTimeout = 0;
}

var callSuper = Selectivity.inherits(SelectivitySubmenu, SelectivityDropdown, {

    /**
     * @inherit
     */
    close: function() {

        if (this.options.restoreOptions) {
            this.selectivity.setOptions(this.options.restoreOptions);
        }
        if (this.options.restoreResults) {
            this.selectivity.results = this.options.restoreResults;
        }

        if (this.submenu) {
            this.submenu.close();
        }

        callSuper(this, 'close');

        if (this.parentMenu) {
            this.parentMenu.submenu = null;
            this.parentMenu = null;
        }

        clearTimeout(this._closeSubmenuTimeout);
        clearTimeout(this._openSubmenuTimeout);
    },

    /**
     * @inherit
     *
     * @param options Optional options object. May contain the following property:
     *                delay - If true, indicates any submenu should not be opened until after some
     *                        delay.
     */
    highlight: function(item, options) {

        if (options && options.delay) {
            callSuper(this, 'highlight', item);

            clearTimeout(this._openSubmenuTimeout);
            this._openSubmenuTimeout = setTimeout(this._doHighlight.bind(this, item), 300);
        } else if (this.submenu) {
            if (this.highlightedResult && this.highlightedResult.id === item.id) {
                this._doHighlight(item);
            } else {
                clearTimeout(this._closeSubmenuTimeout);
                this._closeSubmenuTimeout = setTimeout(
                    this._closeSubmenuAndHighlight.bind(this, item), 100
                );
            }
        } else {
            if (this.parentMenu && this.parentMenu._closeSubmenuTimeout) {
                clearTimeout(this.parentMenu._closeSubmenuTimeout);
                this.parentMenu._closeSubmenuTimeout = 0;
            }

            this._doHighlight(item);
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

        var selectivity = this.selectivity;
        var item = Selectivity.findNestedById(selectivity.results, id);
        if (item && !item.submenu) {
            var options = { id: id, item: item };
            if (selectivity.triggerEvent('selectivity-selecting', options)) {
                selectivity.triggerEvent('selectivity-selected', options);
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
            this.selectivity.$el.trigger('selectivity-close-submenu');
        } else {
            callSuper(this, 'triggerClose');
        }
    },

    /**
     * @inherit
     */
    triggerOpen: function() {

        if (this.parentMenu) {
            this.selectivity.$el.trigger('selectivity-open-submenu');
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
            var selectivity = this.selectivity;
            var Dropdown = selectivity.options.dropdown || Selectivity.Dropdown;
            if (Dropdown) {
                var quotedId = Selectivity.quoteCssAttr(item.id);
                var $item = this.$('.selectivity-result-item[data-item-id=' + quotedId + ']');
                var $dropdownEl = this.$el;

                this.submenu = new Dropdown({
                    parentMenu: this,
                    position: item.submenu.positionDropdown || function($el) {
                        var dropdownPosition = $dropdownEl.position();
                        var width = $dropdownEl.width();
                        $el.css({
                            left: dropdownPosition.left + width + 'px',
                            top: $item.position().top + dropdownPosition.top + 'px'
                        }).width(width);
                    },
                    restoreOptions: {
                        items: selectivity.items,
                        query: selectivity.options.query || null
                    },
                    restoreResults: selectivity.results,
                    selectivity: selectivity,
                    showSearchInput: item.submenu.showSearchInput
                });

                selectivity.setOptions({
                    items: item.submenu.items || null,
                    query: item.submenu.query || null
                });

                selectivity.search('');
            }
        }
    }

});

Selectivity.Dropdown = SelectivitySubmenu;

Selectivity.findNestedById = function(array, id) {

    for (var i = 0, length = array.length; i < length; i++) {
        var item = array[i], result;
        if (item.id === id) {
            result = item;
        } else if (item.children) {
            result = Selectivity.findNestedById(item.children, id);
        } else if (item.submenu && item.submenu.items) {
            result = Selectivity.findNestedById(item.submenu.items, id);
        }
        if (result) {
            return result;
        }
    }
    return null;
};

module.exports = SelectivitySubmenu;
