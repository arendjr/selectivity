#!/usr/bin/env node
/* eslint no-console: 0 */

'use strict';

var execSync = require('child_process').execSync;

var versionName = 'master';
var releasesDir = 'release';
var selectivityReleasePath = `${releasesDir}/selectivity`;
var masterReleasePath = `${selectivityReleasePath}-${versionName}`;
var npmReleasePath = `${selectivityReleasePath}-npm`;
var distPath = 'dist';

function remove(path) {
  execSync(`rm -rf ${path}`);
};

console.log('installing dependencies');
execSync('npm i');

console.log('cleaning existing files for master release');
remove(masterReleasePath);
remove(`${masterReleasePath}.tar.gz`);
remove(npmReleasePath);

console.log('cleaning existing dist files');
remove(distPath);

console.log('running "create-release" tool');
execSync(`tools/create-release.js ${versionName} --clean false`);

console.log('creating dist');
execSync(`mv ${npmReleasePath} ${distPath}`);

console.log('cleaning');
remove(masterReleasePath);
remove(`${masterReleasePath}.tar.gz`);