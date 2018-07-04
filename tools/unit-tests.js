'use strict';

var argv = require('yargs').argv;
var execSync = require('child_process').execSync;
var glob = require('glob');

var tests = glob.sync('tests/unit/' + (argv.test || '**/*') + '.js');
if (tests.length === 0) {
    console.log('Unknown test: ' + argv.test);
    console.log(
        'Available tests:\n  ' +
            glob
                .sync('tests/unit/**/*.js')
                .map(function(path) {
                    return path.slice(11, -3);
                })
                .join('\n  ')
    );
    process.exit(1);
}

tests.forEach(function(test) {
    try {
        execSync('node ' + test + ' | node_modules/.bin/faucet', {
            cwd: process.cwd(),
            env: process.env,
            stdio: 'inherit'
        });
    } catch (exception) {
        process.exit(exception.status);
    }
});
