'use strict';

var gulp = require('./gulp')([
    'browserify',
    'browser-sync',
    'jshint',
    'less',
    'qt-creator',
    'unit-tests',
    'watch'
]);

gulp.task('default', ['browserify', 'less']);

gulp.task('dev', ['browserify', 'less', 'browser-sync', 'watch']);
