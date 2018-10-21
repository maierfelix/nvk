import fs from "fs";
import ncp from "ncp";
import { spawn } from "child_process";

import pkg from "./package.json";

const platform = process.platform;
const v8Version = process.versions.v8;
const nodeVersion = process.versions.node;
const architecture = process.arch;

ncp.limit = 16;

const vkVersion = process.env.npm_config_vkversion;
if (!vkVersion) throw `No vulkan version --vkversion specified!`;

const msvsVersion = process.env.npm_config_msvsversion || "";

const baseGeneratePath = pkg.config.GEN_OUT_DIR;
const generatePath = `${baseGeneratePath}/${vkVersion}`;

const unitPlatform = (
  platform === "win32" ? "win" :
  platform === "darwin" ? "mac" :
  "unknown"
);

// generated/version/
if (!fs.existsSync(generatePath)) {
  process.stderr.write(`Cannot find bindings for ${vkVersion} in ${generatePath}\n`);
  throw `Exiting..`;
}

// build
// build/release
let buildDir = `./generated/${vkVersion}/build/`;
let buildReleaseDir = buildDir + "Release/";
if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir);
if (!fs.existsSync(buildReleaseDir)) fs.mkdirSync(buildReleaseDir);

process.stdout.write(`
Compiling bindings for version ${vkVersion}...
Platform: ${platform} | ${architecture}
Node: ${nodeVersion}
V8: ${v8Version}
`);

function copyFiles() {
  process.stdout.write(`\nCopying files..\n`);
  return new Promise(resolve => {
    // copy files into release folder
    let baseDir = `./lib/${unitPlatform}/${architecture}`;
    let targetDir = `./generated/${vkVersion}/build/Release`;
    let files = [
      [`${baseDir}/GLEW/glew32.dll`, targetDir],
      [`${baseDir}/GLFW/glfw3.dll`, targetDir],
      [`${baseDir}/CEF/`, targetDir],
      [`./src/`, `./generated/${vkVersion}/src`],
      [`./initial.html`, targetDir]
    ];
    let counter = 0;
    files.map(entry => {
      let source = entry[0];
      let target = entry[1];
      // copy single files
      let fileName = source.replace(/^.*[\\\/]/, "");
      let isFile = fileName.length > 0;
      if (isFile) target += "/" + fileName;
      // copy
      ncp(source, target, error => {
        process.stdout.write(`Copying ${source} -> ${target}\n`);
        if (error) {
          process.stderr.write(`Failed to copy ${source} -> ${target}\n`);
          throw error;
        }
      });
      if (counter++ >= files.length - 1) {
        process.stdout.write("Done!\n");
        resolve(true);
      }
    });
  });
};

function buildFiles() {
  process.stdout.write(`\nCompiling bindings..\n`);
  return new Promise(resolve => {
    // win32
    if (platform === "win32") {
      let cmd = `cd ${generatePath} && node-gyp configure --msvs_version ${msvsVersion} && node-gyp build`;
      let shell = spawn(cmd, { shell: true, stdio: "inherit" }, { stdio: "pipe" });
      shell.on("exit", error => {
        if (!error) process.stdout.write("Done!\n");
        resolve(!error);
      });
    // unknown
    } else {
      process.stderr.write(`Error: Your platform isn't supported!\n`);
      resolve(false);
    }
  });
};

(async function run() {
  await copyFiles();
  let buildSuccess = await buildFiles();
  if (buildSuccess) {
    process.stdout.write(`\nSuccessfully compiled bindings for ${vkVersion}!\n`);
  } else {
    process.stderr.write(`\nFailed to compile bindings for ${vkVersion}!`);
  }
})();
