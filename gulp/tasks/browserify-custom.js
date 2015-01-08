'use strict';

var browserify = require('browserify');
var collapse = require('bundle-collapser/plugin');
var fs = require('fs');
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

    var b = browserify({ debug: argv['source-map'] === true, standalone: 'Select3' });

    if (typeof argv.modules !== 'string') {
        console.log([
            'No modules specified for custom build.',
            '',
            'Usage: gulp custom [options] --modules=<comma-separated-module-list>',
            '',
            'Options:',
            '--derequire               Renames all calls to require() to avoid conflicts',
            '                          with build systems.',
            '--minify                  Minifies the bundle to reduce file size.',
            '--module-format=<format>  Specify the format of the output module, possible',
            '                          values are "commonjs", "amd", "hybrid" and "plain".'
        ].join('\n'));
        process.exit(1);
    }

    fs.writeFileSync('src/select3-custom.js', argv.modules.split(',').map(function(module) {
        return 'require("./select3-' + module + '");';
    }).join('') + 'module.exports=require("./select3-base");');

    b.add('./src/select3-custom.js');

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
