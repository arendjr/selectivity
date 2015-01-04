'use strict';

var gulp = require('./gulp')([
    'browserify-custom',
    'browserify-full',
    'browser-sync',
    'jshint',
    'qt-creator',
    'unit-tests',
    'watch'
]);

gulp.task('custom', ['browserify-custom']);

gulp.task('default', ['browserify-full']);

gulp.task('dev', ['browserify-full', 'browser-sync', 'watch']);
