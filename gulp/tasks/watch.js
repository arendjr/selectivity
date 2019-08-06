"use strict";

const gulp = require("gulp");
const { reload } = require("browser-sync");

module.exports = function() {
    gulp.watch(["demos/*.html", "build/*.css"], reload);
    gulp.watch("src/**/*.js", gulp.series("rollup", reload));
    gulp.watch("styles/**/*.sass", gulp.series("sass", reload));
};
