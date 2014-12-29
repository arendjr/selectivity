'use strict';

var reload = require('browser-sync').reload;
var gulp = require('gulp');

module.exports = function() {
    gulp.watch('*.html', reload);
    gulp.watch('src/**/*.js', ['browserify', reload]);
};
