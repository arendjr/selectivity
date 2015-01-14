'use strict';

module.exports = {

    checkUsage: function(argv) {

        if (typeof argv.modules !== 'string') {
            console.log([
                'No modules specified for build.',
                '',
                'Usage: gulp [options] --modules=<comma-separated-module-list>',
                '',
                'Options:',
                '--bundle-name=<name>      Name of the bundle to create. Default is "custom".',
                '--derequire               Renames all calls to require() to avoid conflicts',
                '                          with build systems.',
                '--minify                  Minifies the bundle to reduce file size.',
                '--source-map              Adds a source map to the build for debugging.',
                '',
                'For a list of supported modules, see the README.md.'
            ].join('\n'));
            process.exit(1);
        }
    }

};
