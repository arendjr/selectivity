'use strict';

var Dropdown = require('../dropdown');
var Selectivity = require('../selectivity');

var findResultItem = require('../util/find-result-item');

/**
 * Extended dropdown that supports submenus.
 */
function SubmenuPlugin(selectivity, options) {

    /**
     * Optional parent dropdown menu from which this dropdown was opened.
     */
    this.parentMenu = options.parentMenu;

    Dropdown.call(this, selectivity, options);

    this._closeSubmenuTimeout = 0;

    this._openSubmenuTimeout = 0;
}

var callSuper = Selectivity.inherits(SubmenuPlugin, Dropdown, {

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
     * @param options Optional options object. May contain the following properties:
     *                delay - If true, indicates any submenu should not be opened until after some
     *                        delay.
     *                openSubmenu - If false, no submenu will be automatically opened for the
     *                              highlighted item.
     *                reason - The reason why the result item is being highlighted. See
     *                         Dropdown#highlight().
     */
    highlight: function(item, options) {

        options = options || {};
        var reason = options.reason || 'unspecified';

        if (options.delay) {
            callSuper(this, 'highlight', item);

            clearTimeout(this._openSubmenuTimeout);
            this._openSubmenuTimeout = setTimeout(this._doHighlight.bind(this, item, reason), 300);
        } else if (this.submenu) {
            if (this.highlightedResult && this.highlightedResult.id === item.id) {
                this._doHighlight(item, reason);
            } else {
                clearTimeout(this._closeSubmenuTimeout);
                this._closeSubmenuTimeout = setTimeout(
                    this._closeSubmenuAndHighlight.bind(this, item, reason), 100
                );
            }
        } else {
            if (this.parentMenu && this.parentMenu._closeSubmenuTimeout) {
                clearTimeout(this.parentMenu._closeSubmenuTimeout);
                this.parentMenu._closeSubmenuTimeout = 0;
            }

            if (options.openSubmenu === false) {
                callSuper(this, 'highlight', item);
            } else {
                this._doHighlight(item, reason);
            }
        }
    },

    /**
     * @inherit
     */
    search: function(term) {

        if (this.submenu) {
            var searchInput = this.$('.selectivity-search-input');
            if (searchInput && searchInput === document.activeElement) {
                this.submenu.close();
            } else {
                this.submenu.search(term);
                return;
            }
        }

        callSuper(this, 'search', term);
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
    showResults: function(results, options) {

        // makes sure any result item with a submenu that's not explicitly
        // set as selectable becomes unselectable
        function setSelectable(item) {
            if (item.children) {
                item.children.forEach(setSelectable);
            }
            if (item.submenu) {
                item.selectable = !!item.selectable;
            }
        }

        if (this.submenu && options.dropdown !== this) {
            this.submenu.showResults(results, options);
        } else {
            results.forEach(setSelectable);
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
    _closeSubmenuAndHighlight: function(item, reason) {

        if (this.submenu) {
            this.submenu.close();
        }

        this._doHighlight(item, reason);
    },

    /**
     * @private
     */
    _doHighlight: function(item, reason) {

        callSuper(this, 'highlight', item);

        var options = this.selectivity.options;
        if ((!item.submenu || this.submenu) ||
            (options.shouldOpenSubmenu && options.shouldOpenSubmenu(item, reason) === false)) {
            return;
        }

        var Dropdown = options.dropdown || Selectivity.Dropdown;
        if (Dropdown) {
            var resultItems = this.el.querySelectorAll('.selectivity-result-item');
            var resultItem = findResultItem(resultItems, item.id);
            var dropdownEl = this.el;

            this.submenu = new Dropdown(this.selectivity, {
                highlightFirstItem: !item.selectable,
                items: item.submenu.items || null,
                parentMenu: this,
                position: function(el, selectEl) {
                    if (item.submenu.positionDropdown) {
                        item.submenu.positionDropdown(el, selectEl, resultItem, dropdownEl);
                    } else {
                        var rect = dropdownEl.getBoundingClientRect();
                        var left = rect.right;
                        var width = rect.width;
                        if (left + width > document.body.clientWidth && rect.left - width > 0) {
                            // Open the submenu on the left-hand side if there's no sufficient
                            // space on the right side.
                            // Use a little margin to prevent awkward-looking overlaps.
                            left = rect.left - width + 10;
                        }

                        el.style.left = left + 'px';
                        el.style.top = resultItem.getBoundingClientRect().top + 'px';
                        el.style.width = width + 'px';
                    }
                },
                query: item.submenu.query || null,
                showSearchInput: item.submenu.showSearchInput
            });

            this.submenu.search('');
        }
    }

});

Selectivity.Dropdown = SubmenuPlugin;

module.exports = SubmenuPlugin;
