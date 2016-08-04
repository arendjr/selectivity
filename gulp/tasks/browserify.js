'use strict';

var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var collapse = require('bundle-collapser/plugin');
var derequire = require('gulp-derequire');
var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var header = require('gulp-header');
var replace = require('gulp-replace');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');

var argv = require('../argv');

var LODASH_METHODS = ['debounce', 'escape', 'extend', 'isString'];

module.exports = function() {

    var b = browserify({ debug: argv['source-map'] === true, standalone: 'selectivity' });

    if (!argv.api) {
        throw new Error('No API specified! Run `gulp usage` for usage info.');
    }

    fs.writeFileSync(
        'src/selectivity-custom.js',
        argv.modules.map(function(module) {
            return 'require("./' + module + '");';
        }).join('') +
        (argv.api !== 'vanilla' ? 'require("./apis/' + argv.api + '");' : '') +
        (argv.exportGlobal ? 'window.Selectivity=require("./selectivity");' : '') +
        (argv.commonJs ? 'module.exports=require("./selectivity");' : '')
    );

    b.add('./src/selectivity-custom.js');

    ['jquery', 'react', 'react-dom/server'].forEach(function(lib) {
        b.external(lib);
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
        .pipe(source(
            (argv.bundleName ? 'selectivity-' + argv.bundleName : 'selectivity') +
            (argv.minify ? '.min' : '') + '.js'
        ))
        .pipe(buffer());

    if (argv.lodash) {
        stream = stream.pipe(replace(/require\(['"]lodash\/(\w+)['"]\)/g, 'window._.$1'));
    } else if (argv.api === 'jquery') {
        stream = stream.pipe(replace(/require\(['"]lodash\/extend['"]\)/g,
                                     'require("jquery").extend'));
    }

    stream = stream.pipe(replace(/require\(['"]jquery['"]\)/g, '(window.jQuery || window.Zepto)'));
    stream = stream.pipe(replace(/require\(['"]react['"]\)/g, 'window.React'));
    stream = stream.pipe(replace(/require\(['"]react-dom\/server['"]\)/g, 'window.ReactDOMServer'));

    if (argv.commonJs || argv.derequire) {
        stream = stream.pipe(derequire());
    }

    if (argv.commonJs) {
        stream = stream.pipe(replace(/window\.jQuery \|\| window\.Zepto/g, 'require("jquery")'));
        stream = stream.pipe(replace(/window\._/g, 'require("lodash")'));
        stream = stream.pipe(replace(/window\.ReactDOMServer/g, 'require("react-dom/server")'));
        stream = stream.pipe(replace(/window\.React/g, 'require("react")'));
    } else {
        stream = stream.pipe(replace(/var ReactDOMServer *= *window\.ReactDOMServer;/g, ''));
        stream = stream.pipe(replace(/var React *= *window\.React;/g, ''));
    }

    if (argv.minify) {
        stream = stream.pipe(uglify());
    } else {
        var buildCommand;
        if (argv.bundleName === 'custom') {
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
                buildDescription: (argv.bundleName === 'custom' ? ' (Custom Build)' : ''),
                licenseUrl: 'https://github.com/arendjr/selectivity/blob/master/LICENSE',
                projectUrl: 'https://arendjr.github.io/selectivity/',
                version: JSON.parse(fs.readFileSync('package.json', 'utf-8')).version
            }
        ));
    }

    return stream.pipe(gulp.dest('build/'));
};
