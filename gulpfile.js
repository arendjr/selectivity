'use strict';

var gulp = require('./gulp')([
    'browserify',
    'browser-sync',
    'sass',
    'unit-tests',
    'usage',
    'watch'
]);

gulp.task('default', ['browserify', 'sass']);

gulp.task('dev', ['browserify', 'sass', 'browser-sync', 'watch']);
