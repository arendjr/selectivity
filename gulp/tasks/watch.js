'use strict';

var reload = require('browser-sync').reload;
var gulp = require('gulp');

module.exports = function() {
    gulp.watch(['demos/*.html', 'build/*.css'], reload);
    gulp.watch('src/**/*.js', ['browserify', reload]);
    gulp.watch('styles/**/*.sass', ['sass', reload]);
};
