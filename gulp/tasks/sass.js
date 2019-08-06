"use strict";

const autoprefixer = require("autoprefixer");
const fs = require("fs");
const log = require("fancy-log");
const postcss = require("postcss");
const { promisify } = require("util");
const sass = require("node-sass");
const { yellow } = require("ansi-colors");

const argv = require("../argv");
const { browsersList } = require("../../package.json");

const renderSass = promisify(sass.render);
const writeFileAsync = promisify(fs.writeFile);

module.exports = async function() {
    const sassModules = ["variables", "base"].concat(argv.modules);

    return renderSass({
        data: sassModules
            .map(module => (fs.existsSync(`styles/${module}.sass`) ? `@import '${module}';` : ""))
            .join("\n"),
        includePaths: ["styles"],
        outputStyle: argv.minify ? "compressed" : "expanded",
    })
        .then(({ css }) =>
            postcss([autoprefixer({ cascade: false, overrideBrowserslist: browsersList })]).process(
                css,
                { from: undefined },
            ),
        )
        .then(result => {
            for (const warning of result.warnings()) {
                log(yellow("PostCSS: ") + warning.toString());
            }

            const fileName = `selectivity${argv.bundleName ? `-${argv.bundleName}` : ""}${
                argv.minify ? ".min" : ""
            }.css`;
            return writeFileAsync(`build/${fileName}`, result.css);
        });
};
