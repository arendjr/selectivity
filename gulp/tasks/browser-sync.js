'use strict';

var browserSync = require('browser-sync');

module.exports = function(callback) {
    browserSync({ server: { baseDir: './' }, open: false }, callback);
};
