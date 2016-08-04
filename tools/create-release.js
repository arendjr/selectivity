#!/usr/bin/env node
/*eslint no-console: "allow"*/

'use strict';

var execSync = require('child_process').execSync;
var fs = require('fs');
var glob = require('glob');
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
var apis = ['jquery', 'react'];
var tarballDir = 'release/selectivity-' + version;
var npmDir = 'release/selectivity-npm';

function createTarball() {

    console.log('Creating release tarball ' + version + '...');

    execSync('npm run build');

    execSync('cp build/selectivity.* ' + tarballDir);
    apis.forEach(function(api) {
        execSync('cp build/selectivity-' + api + '.* ' + tarballDir);
    });
    execSync('cp CHANGELOG.md LICENSE README.md ' + tarballDir);
    execSync('tar czf ' + tarballDir + '.tar.gz ' + tarballDir);
}

function createNpmPackage() {

    console.log('Creating NPM package ' + version + '...');

    var allModules = glob.sync('src/**/*.js').map(function(filename) {
        return filename.slice(4, -3);
    }).filter(function(module) {
        return module.slice(-7) !== '-custom';
    });

    var allDirs = [];
    allModules.forEach(function(module) {
        var slashIndex = module.indexOf('/');
        if (slashIndex > -1) {
            var dir = module.slice(0, slashIndex);
            if (allDirs.indexOf(dir) === -1) {
                allDirs.push(dir);
            }
        }
    });

    execSync('cp -R CHANGELOG.md LICENSE README.md ' + allDirs.map(function(dir) {
        return 'src/' + dir;
    }).join(' ') + ' ' + allModules.filter(function(module) {
        return module.indexOf('/') === -1;
    }).map(function(module) {
        return 'src/' + module + '.js';
    }).join(' ') + ' ' + npmDir);

    execSync('mkdir ' + npmDir + '/styles');
    execSync('cp ' + tarballDir + '/*.css ' + npmDir + '/styles');

    apis.forEach(function(api) {
        fs.writeFileSync(
            npmDir + '/' + api + '.js',
            allModules.filter(function(module) {
                return module.indexOf('util/') !== 0 && !apis.some(function(otherApi) {
                    return otherApi !== api && module.indexOf('/' + otherApi) > -1;
                });
            }).map(function(module) {
                return 'require("./' + module + '");\n';
            }).join('') +
            'module.exports=require("./selectivity");\n'
        );
    });

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
