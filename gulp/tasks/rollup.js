"use strict";

const babelPlugin = require("rollup-plugin-babel");
const commonjs = require("rollup-plugin-commonjs");
const { cyan, magenta, red } = require("ansi-colors");
const fs = require("fs");
const log = require("fancy-log");
const prettyHrtime = require("pretty-hrtime");
const { reload } = require("browser-sync");
const replace = require("rollup-plugin-replace");
const resolve = require("rollup-plugin-node-resolve");
const rollup = require("rollup");
const { terser } = require("rollup-plugin-terser");
const virtual = require("rollup-plugin-virtual");

const argv = require("../argv");

const LODASH_METHODS = ["assign", "debounce", "escape", "isString"];

function buildAndWatchRollupBundle(bundleName, inputOptions, outputOptions) {
    return new Promise(resolve => {
        let resolved = false;
        let startTime = process.hrtime();

        const watcher = rollup.watch({
            ...inputOptions,
            output: outputOptions,
        });
        watcher.on("event", event => {
            switch (event.code) {
                case "END": {
                    const timeSpent = prettyHrtime(process.hrtime(startTime));
                    if (resolved) {
                        log(`Rebuilt '${cyan(bundleName)}' bundle in ${magenta(timeSpent)}`);
                        reload();
                    } else {
                        log(`Built '${cyan(bundleName)}' bundle in ${magenta(timeSpent)}`);
                        resolve();
                        resolved = true;
                    }
                    break;
                }
                case "ERROR":
                case "FATAL":
                    log(red(`Error building ${bundleName} bundle: `) + event.error.toString());
                    if (event.code === "FATAL") {
                        process.exit(1);
                    }
                    break;
                case "START":
                    startTime = process.hrtime();
                    break;
            }
        });
    });
}

async function buildRollupBundle(bundleName, inputOptions, outputOptions) {
    if (argv.watch) {
        return buildAndWatchRollupBundle(bundleName, inputOptions, outputOptions);
    }

    const startTime = process.hrtime();

    const bundle = await rollup.rollup(inputOptions);
    await bundle.write(outputOptions);

    const timeSpent = prettyHrtime(process.hrtime(startTime));
    log(`Built '${cyan(bundleName)}' bundle in ${magenta(timeSpent)}`);
}

function getBanner() {
    let buildCommand;
    if (argv.bundleName === "custom") {
        buildCommand = ["gulp"].concat(process.argv.slice(2)).join(" ");
    }

    const copyrightLines = fs
        .readFileSync("LICENSE", "utf-8")
        .split("\n")
        .filter(line => line.includes("(c)"))
        .map(line => ` * ${line}`)
        .join("\n");

    const licenseUrl = "https://github.com/arendjr/selectivity/blob/master/LICENSE";
    const projectUrl = "https://arendjr.github.io/selectivity/";
    const { version } = JSON.parse(fs.readFileSync("package.json", "utf-8"));

    return `/**
 * @license
 * Selectivity.js ${version}${argv.bundleName === "custom" ? " (Custom Build)" : ""} <${projectUrl}>
 * ${buildCommand ? `Build: ${buildCommand}` : ""}
${copyrightLines}
 * Available under MIT license <${licenseUrl}>
 */`;
}

function getExternals() {
    const externals = ["jquery", "react", "react-dom"];

    if (argv.lodash) {
        externals.push(...LODASH_METHODS.map(method => `lodash/${method}`));
    } else if (argv.api === "jquery") {
        externals.push("lodash/assign");
    }
    if (argv.reactLibs) {
        externals.push("prop-types");
    }

    return externals;
}

function getIndexSource() {
    return `import Selectivity from "./src/selectivity";
${argv.modules.map(module => `import "./src/${module}";`).join("\n")}
${argv.api !== "vanilla" ? `import "./src/apis/${argv.api}";` : ""}
${argv.exportGlobal ? "window.Selectivity=Selectivity;" : ""}
${argv.commonJs ? "module.exports=Selectivity;" : ""}`;
}

function getReplacements() {
    const replacements = { "process.env.NODE_ENV": argv.minify ? '"production"' : '"development"' };

    if (argv.lodash) {
        for (const method of LODASH_METHODS) {
            replacements[
                `import ${method} from "lodash/${method}"`
            ] = `import { ${method} } from "lodash"`;
        }
    } else if (argv.api === "jquery") {
        replacements['import assign from "lodash/assign"'] =
            'import { extend as assign } from "jquery"';
    }

    return replacements;
}

module.exports = function() {
    if (!argv.api) {
        throw new Error("No API specified! Run `gulp usage` for usage info.");
    }

    const inputOptions = {
        external: getExternals(),
        input: "index",
        plugins: [
            replace({
                delimiters: ["", ""],
                values: getReplacements(),
            }),
            virtual({ index: getIndexSource() }),
            resolve(),
            babelPlugin({ sourceType: "unambiguous" }),
            commonjs({ sourceMap: argv.sourceMap }),
            argv.minify && terser({ sourcemap: argv.sourceMap }),
        ],
    };

    const outputOptions = {
        banner: getBanner(),
        dir: "build",
        entryFileNames: `selectivity${argv.bundleName ? `-${argv.bundleName}` : ""}${
            argv.minify ? ".min" : ""
        }.js`,
        format: argv.commonJs ? "cjs" : "iife",
        globals: {
            jquery: "$",
            lodash: "_",
            react: "React",
            "react-dom": "ReactDOM",
            ...LODASH_METHODS.reduce((globals, method) => {
                globals[`lodash/${method}`] = `_.${method}`;
                return globals;
            }, {}),
        },
        sourcemap: argv.sourceMap,
    };

    return buildRollupBundle("base", inputOptions, outputOptions);
};
