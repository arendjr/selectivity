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

module.exports = function() {

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
