'use strict';

var Selectivity = require('./selectivity-base');
var SelectivityDropdown = require('./selectivity-dropdown');

var findResultItem = require('../util/find-result-item');
var getPosition = require('../util/get-position');

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
    search: function(term) {

        if (this.submenu) {
            this.submenu.search(term);
        } else {
            callSuper(this, 'search', term);
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

        var item = Selectivity.findNestedById(this.results, id);
        if (item && !item.disabled && !item.submenu) {
            var options = { id: id, item: item };
            if (this.selectivity.triggerEvent('selectivity-selecting', options)) {
                this.selectivity.triggerEvent('selectivity-selected', options);
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
            this.selectivity.triggerEvent('selectivity-close-submenu');
        } else {
            callSuper(this, 'triggerClose');
        }
    },

    /**
     * @inherit
     */
    triggerOpen: function() {

        if (this.parentMenu) {
            this.selectivity.triggerEvent('selectivity-open-submenu');
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
                var resultItems = this.el.querySelectorAll('.selectivity-result-item');
                var resultItem = findResultItem(resultItems, item.id);
                var dropdownEl = this.el;

                this.submenu = new Dropdown({
                    items: item.submenu.items || null,
                    parentMenu: this,
                    position: item.submenu.positionDropdown || function(el) {
                        var dropdownPosition = getPosition(dropdownEl);
                        var width = dropdownEl.clientWidth;
                        el.style.left = dropdownPosition.left + width + 'px';
                        el.style.top = getPosition(resultItem).top + dropdownPosition.top + 'px';
                        el.style.width = width + 'px';
                    },
                    query: item.submenu.query || null,
                    selectivity: selectivity,
                    showSearchInput: item.submenu.showSearchInput
                });

                this.submenu.search('');
            }
        }
    }

});

Selectivity.Dropdown = SelectivitySubmenu;

module.exports = SelectivitySubmenu;
