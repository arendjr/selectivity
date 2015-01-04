'use strict';

var $ = require('jquery');

var Select3Dropdown = require('./select3-dropdown');

var BACKDROP_Z_INDEX = 9998;
var FOREGROUND_Z_INDEX = 9999;

/**
 * Methods.
 */
$.extend(Select3Dropdown.prototype, {

    /**
     * @inherit
     */
    addToDom: function() {

        var $select3El = this.select3.$el;
        $select3El.css({ zIndex: FOREGROUND_Z_INDEX, position: 'relative' });
        this.$el.appendTo($select3El[0].ownerDocument.body).css('zIndex', FOREGROUND_Z_INDEX);
    },

    /**
     * @inherit
     */
    removeCloseHandler: function() {

        this._$backdrop.remove();
        this._$backdrop = null;
    },

    /**
     * @inherit
     */
    setupCloseHandler: function() {

        var $backdrop = $('<div>').addClass('.select3-backdrop').css({
            background: 'transparent',
            bottom: 0,
            left: 0,
            position: 'fixed',
            right: 0,
            top: 0,
            zIndex: BACKDROP_Z_INDEX
        }).on('click', this.close.bind(this));

        $('body').append($backdrop);

        this._$backdrop = $backdrop;
    }

});
