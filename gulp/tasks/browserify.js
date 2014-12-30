'use strict';

var browserify = require('browserify');
var collapse = require('bundle-collapser/plugin');
var glob = require('glob');
var gulp = require('gulp');
var derequire = require('gulp-derequire');
var gulpif = require('gulp-if');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var path = require('path');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var argv = require('yargs').argv;

module.exports = function() {

    var b = browserify({ debug: argv['source-map'] !== false });

    b.add('./src/select3-full.js');

    glob.sync('vendor/*.js').forEach(function(file) {
        var basename = path.basename(file, '.js');
        b.external(basename);
    });

    if (argv.minify) {
        b.plugin(collapse);
    }

    return b.bundle()
        .on('error', function(error) {
            gutil.log(gutil.colors.red('Error building bundle: ') + error.toString());
            this.end();
        })
        .pipe(source('select3-full' + (argv.minify ? '.min' : '') + '.js'))
        .pipe(buffer())
        .pipe(replace(/require\(['"]jquery['"]\)/g, 'window.jQuery || window.Zepto'))
        .pipe(gulpif(argv.minify, uglify()))
        .pipe(gulpif(argv.derequire, derequire()))
        .pipe(gulp.dest('dist/'));
};
