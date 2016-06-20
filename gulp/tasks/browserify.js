'use strict';

var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var collapse = require('bundle-collapser/plugin');
var derequire = require('gulp-derequire');
var fs = require('fs');
var glob = require('glob');
var gulp = require('gulp');
var gutil = require('gulp-util');
var header = require('gulp-header');
var path = require('path');
var replace = require('gulp-replace');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');

var argv = require('../argv');

var LODASH_METHODS = ['debounce', 'escape', 'extend', 'isString'];

module.exports = function() {

    var b = browserify({ debug: argv['source-map'] === true, standalone: 'selectivity' });

    if (!argv.api) {
        throw new Error('No API specified! Run `gulp usage` for usage info.');
    } else if (argv.api !== 'jquery' && argv.modules.indexOf('plugins/traditional') > -1) {
        throw new Error('The `traditional` plugin is only compatible with the jQuery API!');
    }

    fs.writeFileSync('src/selectivity-custom.js', argv.modules.map(function(module) {
        return 'require("./' + module + '");';
    }).join('') + 'module.exports=require("./apis/' + argv.api + '");');

    b.add('./src/selectivity-custom.js');

    glob.sync('vendor/*.js').forEach(function(file) {
        var basename = path.basename(file, '.js');
        b.external(basename);
    });

    if (argv.lodash) {
        b.external(LODASH_METHODS.map(function(method) {
            return 'lodash/' + method;
        }));
    } else if (argv.api === 'jquery') {
        b.external(['lodash/extend']);
    }

    b.plugin(collapse);

    var stream = b.bundle()
        .on('error', function(error) {
            gutil.log(gutil.colors.red('Error creating bundle: ') + error.toString());
            this.end();
        })
        .pipe(source('selectivity-' + argv.bundleName + (argv.minify ? '.min' : '') + '.js'))
        .pipe(buffer());

    if (argv.lodash) {
        stream = stream.pipe(replace(/require\(['"]lodash\/(\w+)['"]\)/g, 'window._.$1'));
    } else if (argv.api === 'jquery') {
        stream = stream.pipe(replace(/require\(['"]lodash\/extend['"]\)/g,
                                     'require("jquery").extend'));
    }

    stream = stream.pipe(replace(/require\(['"]jquery['"]\)/g, '(window.jQuery || window.Zepto)'));

    if (argv.commonJs || argv.derequire) {
        stream = stream.pipe(derequire());
    }

    if (argv.commonJs) {
        stream = stream.pipe(replace(/window\.jQuery \|\| window\.Zepto/g, 'require("jquery")'));
        stream = stream.pipe(replace(/window\._/g, 'require("lodash")'));
    }

    if (argv.minify) {
        stream = stream.pipe(uglify());
    } else {
        var buildCommand;
        if (argv.bundleName !== 'full') {
            buildCommand = ['gulp'].concat(process.argv.slice(2)).join(' ');
        }

        var copyrightLines = fs.readFileSync('LICENSE', 'utf-8').split('\n').filter(function(line) {
            return line.indexOf('(c)') > -1;
        }).map(function(line) {
            return ' * ' + line + '\n';
        }).join('');

        stream = stream.pipe(header(
            '/**\n' +
            ' * @license\n' +
            ' * Selectivity.js ${version}${buildDescription} <${projectUrl}>\n' +
            (buildCommand ? ' * Build: `${buildCommand}`\n' : '') +
            copyrightLines +
            ' * Available under MIT license <${licenseUrl}>\n' +
            ' */\n',
            {
                buildCommand: buildCommand,
                buildDescription: (argv.bundleName === 'full' ? '' : ' (Custom Build)'),
                licenseUrl: 'https://github.com/arendjr/selectivity/blob/master/LICENSE',
                projectUrl: 'https://arendjr.github.io/selectivity/',
                version: JSON.parse(fs.readFileSync('package.json', 'utf-8')).version
            }
        ));
    }

    return stream.pipe(gulp.dest('dist/'));
};
