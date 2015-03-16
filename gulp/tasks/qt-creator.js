'use strict';

var fs = require('fs');
var glob = require('glob');
var gutil = require('gulp-util');
var _ = require('lodash');

var PROJECT_NAME = 'selectivity';
var EXCLUDE_DIRS = ['.git/', 'node_modules/', PROJECT_NAME];
var FILENAME = PROJECT_NAME + '.files';

module.exports = function() {
    var files = glob.sync('**/*');
    var lines = _.reject(files, function(file) {
        return (_.any(EXCLUDE_DIRS, function(excludeDir) {
            return file.slice(0, excludeDir.length) === excludeDir;
        }) || file === FILENAME || fs.lstatSync(file).isDirectory());
    });
    fs.writeFileSync(FILENAME, lines.join('\n'));
    gutil.log('File', gutil.colors.magenta(FILENAME), 'created.');
};
