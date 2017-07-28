'use strict';

var _ = require('lodash');
var glob = require('glob');
var yargs = require('yargs');

var APIS = glob
    .sync('src/apis/*.js')
    .map(function(file) {
        return file.slice(9, -3);
    })
    .concat(['vanilla']);

var MODULE_BLACKLIST = ['event-listener', 'selectivity', 'selectivity-custom'];

var argv = yargs
    .usage('Usage: gulp [tasks] [options]')
    .option('api', {
        choices: APIS,
        default: 'vanilla',
        describe: 'API to expose',
        type: 'string'
    })
    .option('bundle-name', {
        default: 'custom',
        describe: 'Name of the bundle to create.',
        type: 'string'
    })
    .option('common-js', {
        default: false,
        describe:
            'Use CommonJS require() calls for loading dependencies rather than expecting ' +
            'their globals on the window object.',
        type: 'boolean'
    })
    .option('lodash', {
        default: false,
        describe: 'Make lodash an external dependency, making Selectivity itself even smaller.',
        type: 'boolean'
    })
    .option('derequire', {
        default: false,
        describe: 'Renames all calls to require() to avoid conflicts with build systems.',
        type: 'boolean'
    })
    .option('exclude-modules', {
        default: '',
        describe:
            'Comma-separated list of modules to exclude. See the README.md for a list of ' +
            'supported modules.',
        type: 'string'
    })
    .option('export-global', {
        default: false,
        describe: 'Export the Selectivity object to the global window object.',
        type: 'boolean'
    })
    .option('minify', {
        default: false,
        describe: 'Minifies the bundle to reduce file size.',
        type: 'boolean'
    })
    .option('modules', {
        default: 'all',
        describe:
            'Comma-separated list of modules to build. See the README.md for a list of ' +
            'supported modules.',
        type: 'string'
    })
    .option('react-libs', {
        default: false,
        describe:
            'Make all React-related libraries external dependencies, to prevent duplicate copies ' +
            'of prop-types.',
        type: 'boolean'
    })
    .option('source-map', {
        default: false,
        describe: 'Adds a source map to the build for debugging.',
        type: 'boolean'
    })
    .option('test', {
        default: '',
        describe:
            'Specify the name of a specific test to execute in combination with ' +
            '`gulp unit-tests`.',
        type: 'string'
    })
    .strict()
    .wrap(yargs.terminalWidth()).argv;

var excludedModules = argv.excludeModules ? argv.excludeModules.split(',') : [];

argv.modules =
    argv.modules === 'all'
        ? glob
              .sync('src/**/*.js')
              .map(function(file) {
                  return file.slice(4, -3);
              })
              .filter(function(module) {
                  return (
                      !_.includes(MODULE_BLACKLIST, module) &&
                      !_.includes(excludedModules, module) &&
                      !_.startsWith(module, 'apis/') &&
                      !_.startsWith(module, 'util/') &&
                      !_.some(APIS, function(api) {
                          return argv.api !== api && _.startsWith(module, 'plugins/' + api);
                      })
                  );
              })
        : argv.modules.split(',');

module.exports = argv;
