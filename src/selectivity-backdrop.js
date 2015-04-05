'use strict';

var $ = require('jquery');

var SelectivityDropdown = require('./selectivity-dropdown');

/**
 * Methods.
 */
$.extend(SelectivityDropdown.prototype, {

    /**
     * @inherit
     */
    removeCloseHandler: function() {

        if (this._$backdrop && !this.parentMenu) {
            this._$backdrop.remove();
            this._$backdrop = null;
        }
    },

    /**
     * @inherit
     */
    setupCloseHandler: function() {

        var $backdrop;
        if (this.parentMenu) {
            $backdrop = this.parentMenu._$backdrop;
        } else {
            $backdrop = $('<div>').addClass('selectivity-backdrop');

            $('body').append($backdrop);
        }

        $backdrop.on('click', this.close.bind(this));

        this._$backdrop = $backdrop;
    }

});
