#!/usr/bin/env node
/* eslint no-console: 0 */
"use strict";

const { execSync } = require("child_process");
const fs = require("fs");
const glob = require("glob");
const yargs = require("yargs");

const argv = yargs
    .usage("Usage: tools/create-release.js <version>")
    .demand(1)
    .option("clean", {
        default: true,
        describe: "Disable if you want to inspect the release directory afterwards.",
        type: "boolean",
    })
    .option("publish", {
        default: false,
        describe: "Publish the new release to NPM.",
        type: "boolean",
    })
    .strict()
    .wrap(yargs.terminalWidth()).argv;

const version = argv._[0];
const apis = ["jquery", "react"];
const tarballDir = `release/selectivity-${version}`;
const npmDir = "release/selectivity-npm";

function createTarball() {
    console.log(`Creating release tarball ${version}...`);

    execSync("npm run build");

    execSync(`cp build/selectivity.* ${tarballDir}`);
    for (const api of apis) {
        execSync(`cp build/selectivity-${api}.* ${tarballDir}`);
    }
    execSync(`cp CHANGELOG.md LICENSE README.md ${tarballDir}`);
    execSync(`tar czf ${tarballDir}.tar.gz ${tarballDir}`);
}

function createNpmPackage() {
    console.log(`Creating NPM package ${version}...`);

    const allModules = glob.sync("src/**/*.js").map(filename => filename.slice(4, -3));

    const allDirs = [];
    for (const module of allModules) {
        const slashIndex = module.indexOf("/");
        if (slashIndex > -1) {
            const dir = module.slice(0, slashIndex);
            if (allDirs.indexOf(dir) === -1) {
                allDirs.push(dir);
            }
        }
    }

    execSync(
        `cp -R CHANGELOG.md LICENSE README.md ${allDirs
            .map(dir => `src/${dir}`)
            .join(" ")} ${allModules
            .filter(module => module.includes("/"))
            .map(module => `src/${module}.js`)
            .join(" ")} ${npmDir}`,
    );

    execSync(`mkdir ${npmDir}/styles`);
    execSync(`cp ${tarballDir}/*.css ${npmDir}/styles`);

    for (const api of apis) {
        fs.writeFileSync(
            `${npmDir}/${api}.js`,
            `${allModules
                .filter(
                    module =>
                        !module.startsWith("util/") &&
                        !apis.some(otherApi => otherApi !== api && module.includes(`/${otherApi}`)),
                )
                .map(module => `require("./${module}");\n`)
                .join("")}module.exports=require("./selectivity");\n`,
        );
    }

    const packageJson = require("../package.json");
    packageJson.main = "./selectivity.js";
    packageJson.version = version;
    fs.writeFileSync(`${npmDir}/package.json`, JSON.stringify(packageJson, null, 2));

    if (argv.publish) {
        execSync(`cd ${npmDir}; npm publish .; cd ../..`);
    }
}

execSync(`mkdir -p ${tarballDir}`);
createTarball();

execSync(`mkdir -p ${npmDir}`);
createNpmPackage();

if (argv.clean) {
    execSync(`rm -R ${tarballDir}`);
    execSync(`rm -R ${npmDir}`);
}

console.log("OK");
