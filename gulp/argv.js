"use strict";

const glob = require("glob");
const yargs = require("yargs");

const APIS = glob
    .sync("src/apis/*.js")
    .map(file => file.slice(9, -3))
    .concat(["vanilla"]);

const MODULE_BLACKLIST = ["event-listener", "selectivity"];

const argv = yargs
    .usage("Usage: gulp [tasks] [options]")
    .option("api", {
        choices: APIS,
        default: "vanilla",
        describe: "API to expose",
        type: "string",
    })
    .option("bundle-name", {
        default: "custom",
        describe: "Name of the bundle to create.",
        type: "string",
    })
    .option("common-js", {
        default: false,
        describe:
            "Use CommonJS require() calls for loading dependencies rather than expecting " +
            "their globals on the window object.",
        type: "boolean",
    })
    .option("lodash", {
        default: false,
        describe: "Make lodash an external dependency, making Selectivity itself even smaller.",
        type: "boolean",
    })
    .option("exclude-modules", {
        default: "",
        describe:
            "Comma-separated list of modules to exclude. See the README.md for a list of " +
            "supported modules.",
        type: "string",
    })
    .option("export-global", {
        default: false,
        describe: "Export the Selectivity object to the global window object.",
        type: "boolean",
    })
    .option("minify", {
        default: false,
        describe: "Minifies the bundle to reduce file size.",
        type: "boolean",
    })
    .option("modules", {
        default: "all",
        describe:
            "Comma-separated list of modules to build. See the README.md for a list of " +
            "supported modules.",
        type: "string",
    })
    .option("react-libs", {
        default: false,
        describe:
            "Make all React-related libraries external dependencies, to prevent duplicate copies " +
            "of prop-types.",
        type: "boolean",
    })
    .option("source-map", {
        default: false,
        describe: "Adds a source map to the build for debugging.",
        type: "boolean",
    })
    .strict()
    .wrap(yargs.terminalWidth()).argv;

const excludedModules = argv.excludeModules ? argv.excludeModules.split(",") : [];

argv.modules =
    argv.modules === "all"
        ? glob
              .sync("src/**/*.js")
              .map(file => file.slice(4, -3))
              .filter(
                  module =>
                      !MODULE_BLACKLIST.includes(module) &&
                      !excludedModules.includes(module) &&
                      !module.startsWith("apis/") &&
                      !module.startsWith("util/") &&
                      !APIS.some(api => argv.api !== api && module.startsWith(`plugins/${api}`)),
              )
        : argv.modules.split(",");

module.exports = argv;
