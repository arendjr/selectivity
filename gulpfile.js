'use strict';

var gulp = require('./gulp')([
    'browserify',
    'browser-sync',
    'sass',
    'jshint',
    'qt-creator',
    'unit-tests',
    'watch'
]);

gulp.task('default', ['browserify', 'sass']);

gulp.task('dev', ['browserify', 'sass', 'browser-sync', 'watch']);

gulp.task('help', function() {
    require('./gulp/custom-build-util').showUsage();
});
