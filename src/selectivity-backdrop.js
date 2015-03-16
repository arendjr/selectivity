'use strict';

var $ = require('jquery');

var SelectivityDropdown = require('./selectivity-dropdown');

var BACKDROP_Z_INDEX = 9998;
var FOREGROUND_Z_INDEX = 9999;

/**
 * Methods.
 */
$.extend(SelectivityDropdown.prototype, {

    /**
     * @inherit
     */
    addToDom: function() {

        var $selectivityEl = this.selectivity.$el;
        $selectivityEl.css({ zIndex: FOREGROUND_Z_INDEX, position: 'relative' });
        this.$el.appendTo($selectivityEl[0].ownerDocument.body).css('zIndex', FOREGROUND_Z_INDEX);
    },

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
            $backdrop = $('<div>').addClass('.selectivity-backdrop').css({
                background: 'transparent',
                bottom: 0,
                left: 0,
                position: 'fixed',
                right: 0,
                top: 0,
                zIndex: BACKDROP_Z_INDEX
            });

            $('body').append($backdrop);
        }

        $backdrop.on('click', this.close.bind(this));

        this._$backdrop = $backdrop;
    }

});
