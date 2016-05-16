'use strict';

var faucet = require('faucet');
var gulp = require('gulp');
var tape = require('gulp-tape');
var argv = require('yargs').argv;

module.exports = function() {

    return gulp.src('./tests/unit/' + (argv.test || '**/*') + '.js')
        .pipe(tape({ reporter: faucet() }));
};
