"use strict";

const gulp = require("gulp");

module.exports = function(tasks) {
    for (const name of tasks) {
        gulp.task(name, require(`./tasks/${name}`));
    }

    return gulp;
};
