"use strict";

const gulp = require("./gulp")(["browser-sync", "rollup", "sass", "usage", "watch"]);

gulp.task("default", gulp.parallel("rollup", "sass"));

gulp.task("dev", gulp.series(gulp.parallel("rollup", "sass"), "browser-sync", "watch"));
