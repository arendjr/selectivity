'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');

module.exports = function() {
    return gulp.src(['gulp/**/*.js', 'src/**/*.js', 'tests/**/*.js', '!src/selectivity-custom.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
};
