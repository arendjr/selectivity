'use strict';

var fs = require('fs');
var gulp = require('gulp');
var concat = require('gulp-concat');
var csso = require('gulp-csso');
var gulpif = require('gulp-if');
var sass = require('gulp-ruby-sass');
var autoprefixer = require('gulp-autoprefixer');
var gutil = require('gulp-util');

var argv = require('../argv');

module.exports = function() {

    var sassModules = ['variables', 'base'].concat(argv.modules);
    fs.writeFileSync('styles/selectivity-custom.sass', sassModules.map(function(module) {
        if (fs.existsSync('styles/selectivity/' + module + '.sass')) {
            return '@import \'selectivity/' + module + '\'\n';
        } else {
            return '';
        }
    }).join(''));

    return sass('styles/selectivity-custom.sass')
            .on('error', function(error) {
                gutil.log(gutil.colors.red('Error building CSS bundle: ') + error.toString());
            })
            .pipe(autoprefixer({ browsers: ['last 5 versions'], cascade: false }))
            .pipe(concat('selectivity-' + argv.bundleName + (argv.minify ? '.min' : '') + '.css'))
            .pipe(gulpif(argv.minify, csso()))
            .pipe(gulp.dest('dist/'));
};
