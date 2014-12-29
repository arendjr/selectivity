'use strict';

var gulp = require('./gulp')([
    'browserify',
    'browser-sync',
    'jshint',
    'qt-creator',
    'watch'
]);

gulp.task('default', ['browserify']);

gulp.task('dev', ['browserify', 'browser-sync', 'watch']);
