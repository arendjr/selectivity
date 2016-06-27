#!/usr/bin/env node
/*eslint no-console: "allow"*/

'use strict';

var execSync = require('child_process').execSync;
var fs = require('fs');
var yargs = require('yargs');

var argv = yargs
    .usage('Usage: tools/create-release.js <version>')
    .demand(1)
    .option('clean', {
        default: true,
        describe: 'Disable if you want to inspect the release directory afterwards.',
        type: 'boolean'
    })
    .option('publish', {
        default: false,
        describe: 'Publish the new release to NPM.',
        type: 'boolean'
    })
    .strict()
    .wrap(yargs.terminalWidth())
    .argv;

var version = argv._[0];
var tarballDir = 'release/selectivity-' + version;
var npmDir = 'release/selectivity-npm';

function createTarball() {

    console.log('Creating release tarball ' + version + '...');

    execSync('npm run build');

    execSync('cp build/selectivity-jquery.* ' + tarballDir);
    execSync('cp CHANGELOG.md LICENSE README.md ' + tarballDir);
    execSync('tar czf ' + tarballDir + '.tar.gz ' + tarballDir);
}

function createNpmPackage() {

    console.log('Creating NPM package ' + version + '...');

    execSync('cp -R CHANGELOG.md LICENSE README.md src/* ' + npmDir);

    execSync('mkdir ' + npmDir + '/styles');
    execSync('cp ' + tarballDir + '/*.css ' + npmDir + '/styles');

    var packageJson = require('../package.json');
    packageJson.main = './selectivity.js';
    packageJson.version = version;
    fs.writeFileSync(npmDir + '/package.json', JSON.stringify(packageJson, null, 2));

    if (argv.publish) {
        execSync('pushd ' + npmDir + '; npm publish .; popd');
    }
}

execSync('mkdir -p ' + tarballDir);
createTarball();

execSync('mkdir -p ' + npmDir);
createNpmPackage();

if (argv.clean) {
    execSync('rm -R ' + tarballDir);
    execSync('rm -R ' + npmDir);
}

console.log('OK');
