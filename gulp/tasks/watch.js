'use strict';

var reload = require('browser-sync').reload;
var gulp = require('gulp');

module.exports = function() {
    gulp.watch(['demos/*.html', 'dist/*.css'], reload);
    gulp.watch('src/**/*.js', ['browserify', reload]);
    gulp.watch('styles/**/*.less', ['less', reload]);
};
