'use strict';

var browserify = require('browserify');
var collapse = require('bundle-collapser/plugin');
var fs = require('fs');
var glob = require('glob');
var gulp = require('gulp');
var derequire = require('gulp-derequire');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var path = require('path');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var argv = require('yargs').argv;

var CustomBuildUtil = require('../custom-build-util');

module.exports = function() {

    CustomBuildUtil.checkOptions(argv);

    var b = browserify({ debug: argv['source-map'] === true, standalone: 'selectivity' });

    fs.writeFileSync('src/selectivity-custom.js', argv.modules.map(function(module) {
        return 'require("./selectivity-' + module + '");';
    }).join('') + 'module.exports=require("./selectivity-base");');

    b.add('./src/selectivity-custom.js');

    glob.sync('vendor/*.js').forEach(function(file) {
        var basename = path.basename(file, '.js');
        b.external(basename);
    });

    var lodashMethods = glob.sync('src/lodash/*.js').map(function(file) {
        return path.basename(file, '.js');
    });
    if (argv.lodash) {
        lodashMethods.forEach(function(method) {
            b.external('./lodash/' + method);
        });
    }

    b.plugin(collapse);

    var stream = b.bundle()
        .on('error', function(error) {
            gutil.log(gutil.colors.red('Error creating bundle: ') + error.toString());
            this.end();
        })
        .pipe(source('selectivity-' + argv.bundleName + (argv.minify ? '.min' : '') + '.js'))
        .pipe(buffer())
        .pipe(replace(/require\(['"]jquery['"]\)/g, 'window.jQuery || window.Zepto'));

    if (argv.lodash) {
        lodashMethods.forEach(function(method) {
            var regExp = new RegExp('require\\([\'"]\\./lodash/' + method + '[\'"]\\)', 'g');
            stream = stream.pipe(replace(regExp, 'window._.' + method));
        });
    }

    if (argv.commonJs || argv.derequire) {
        stream = stream.pipe(derequire());
    }

    if (argv.commonJs) {
        stream = stream.pipe(replace(/window\.jQuery \|\| window\.Zepto/g, 'require("jquery")'));
        stream = stream.pipe(replace(/window\._/g, 'require("lodash")'));
    }

    stream = stream.pipe(replace(/\/\*\s*hasModule\('(\w+)'\):(.*?)\*\//g, function(match, p1, p2) {
        return (argv.modules.indexOf(p1) > -1 ? p2 : '');
    }));

    if (argv.minify) {
        stream = stream.pipe(uglify());
    }

    return stream.pipe(gulp.dest('dist/'));
};
