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
var targetDir = 'release/selectivity-' + version;

function createTarball() {

    console.log('Creating release tarball ' + version + '...');

    execSync('npm run build');

    execSync('cp build/selectivity-jquery.* ' + targetDir);
    execSync('cp CHANGELOG.md LICENSE README.md ' + targetDir);
    execSync('tar czf ' + targetDir + '.tar.gz ' + targetDir);
}

function createNpmPackage() {

    console.log('Creating NPM package ' + version + '...');

    execSync('cp -R LICENSE src/* ' + targetDir);

    var packageJson = require('../package.json');
    packageJson.main = './selectivity.js';
    packageJson.version = version;
    fs.writeFileSync(targetDir + '/package.json', JSON.stringify(packageJson, null, 2));

    if (argv.publish) {
        execSync('pushd ' + targetDir + '; npm publish .; popd');
    }
}

execSync('mkdir -p ' + targetDir);

createTarball();

execSync('rm -R ' + targetDir + '/*');
createNpmPackage();

if (argv.clean) {
    execSync('rm -R ' + targetDir);
}

console.log('OK');
