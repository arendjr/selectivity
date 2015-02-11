'use strict';

var glob = require('glob');

function showUsage() {

    console.log([
        'Usage: gulp [options]',
        '',
        'Options:',
        '--bundle-name=<name>      Name of the bundle to create. Default is "custom".',
        '--derequire               Renames all calls to require() to avoid conflicts',
        '                          with build systems.',
        '--minify                  Minifies the bundle to reduce file size.',
        '--modules=<module-list>   Comma-separated list of modules to build. Default is',
        '                          "all".',
        '--source-map              Adds a source map to the build for debugging.',
        '',
        'For a list of supported modules, see the README.md.'
    ].join('\n'));
    process.exit(1);
}

module.exports = {

    checkOptions: function(argv) {

        if (!argv['bundle-name']) {
            argv['bundle-name'] = 'custom';
        }

        if (argv.modules === undefined || argv.modules === 'all') {
            argv.modules = glob.sync('src/select3-*.js').map(function(file) {
                return file.slice(12, -3);
            }).filter(function(module) {
                return module !== 'base' && module !== 'custom';
            });
        } else if (typeof argv.modules === 'string') {
            argv.modules = argv.modules.split(',');
        } else if (argv.modules instanceof Array) {
            // already processed
        } else {
            showUsage();
        }
    }

};
