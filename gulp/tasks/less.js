'use strict';

var fs = require('fs');
var gulp = require('gulp');
var concat = require('gulp-concat');
var csso = require('gulp-csso');
var gulpif = require('gulp-if');
var less = require('gulp-less');
var gutil = require('gulp-util');
var argv = require('yargs').argv;

var CustomBuildUtil = require('../custom-build-util');

module.exports = function() {

    CustomBuildUtil.checkOptions(argv);

    fs.writeFileSync('styles/select3-custom.less', argv.modules.map(function(module) {
        if (fs.existsSync('styles/select3-' + module + '.less')) {
            return '@import "select3-' + module + '";';
        } else {
            return '';
        }
    }).join(''));

    return gulp.src('styles/select3-custom.less')
            .pipe(less({ strictMath: true }))
            .on('error', function(error) {
                gutil.log(gutil.colors.red('Error building CSS bundle: ') + error.toString());
            })
            .pipe(concat('select3-' + argv['bundle-name'] + (argv.minify ? '.min' : '') + '.css'))
            .pipe(gulpif(argv.minify, csso()))
            .pipe(gulp.dest('dist/'));
};
