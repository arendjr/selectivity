"use strict";

const { argv } = require("yargs");
const { execSync } = require("child_process");
const glob = require("glob");

const tests = glob.sync(`tests/unit/${argv.test || "**/*"}.js`);
if (tests.length === 0) {
    console.log(`Unknown test: ${argv.test}`);
    console.log(
        `Available tests:\n  ${glob
            .sync("tests/unit/**/*.js")
            .map(path => path.slice(11, -3))
            .join("\n  ")}`,
    );
    process.exit(1);
}

for (const test of tests) {
    try {
        execSync(`node ${test} | node_modules/.bin/faucet`, {
            cwd: process.cwd(),
            env: process.env,
            stdio: "inherit",
        });
    } catch (exception) {
        process.exit(exception.status);
    }
}
