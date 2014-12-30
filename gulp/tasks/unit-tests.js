'use strict';

var gulp = require('gulp');
var nodeunit = require('gulp-nodeunit');
var argv = require('yargs').argv;

module.exports = function() {

    return gulp.src('./tests/unit/' + (argv.test || '**/*') + '.js')
        .pipe(nodeunit());
};
