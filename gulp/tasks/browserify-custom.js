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

    var b = browserify({ debug: argv['source-map'] === true });

    if (typeof argv.modules !== 'string') {
        console.log(['No modules specified for custom build.',
                     '',
                     'Usage: gulp custom [options] --modules=<comma-separated-module-list>',
                     '',
                     'Options:',
                     '--derequire  Renames all calls to require() to avoid conflicts with build',
                     '             systems.',
                     '--minify     Minifies the bundle to reduce file size.'].join('\n'));
        process.exit(1);
    }

    argv.modules.split(',').forEach(function(module) {
        b.add('./src/select3-' + module + '.js');
        b.require('./src/select3-' + module + '.js');
    });

    glob.sync('vendor/*.js').forEach(function(file) {
        var basename = path.basename(file, '.js');
        b.external(basename);
    });

    b.plugin(collapse);

    return b.bundle()
        .on('error', function(error) {
            gutil.log(gutil.colors.red('Error creating bundle: ') + error.toString());
            this.end();
        })
        .pipe(source('select3-custom' + (argv.minify ? '.min' : '') + '.js'))
        .pipe(buffer())
        .pipe(replace(/require\(['"]jquery['"]\)/g, 'window.jQuery || window.Zepto'))
        .pipe(gulpif(argv.minify, uglify()))
        .pipe(gulpif(argv.derequire, derequire()))
        .pipe(gulp.dest('dist/'));
};
