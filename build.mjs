import fs from "fs";
import { exec } from "child_process";

import pkg from "./package.json";

const platform = process.platform;
const v8Version = process.versions.v8;
const nodeVersion = process.versions.node;
const architecture = process.arch;

const vkVersion = process.env.npm_config_vkversion;
if (!vkVersion) throw `No specification version -vkversion specified!`;

const baseGeneratePath = pkg.config.GEN_OUT_DIR;
const generatePath = `${baseGeneratePath}/${vkVersion}`;

// generated/version/
if (!fs.existsSync(generatePath)) throw new Error(`Cannot find bindings for ${vkVersion} in ${generatePath}`);

console.log(`
Compiling bindings for version ${vkVersion}...
Platform: ${platform} | ${architecture}
Node: ${nodeVersion}
V8: ${v8Version}
`);

if (platform === "win32") {
  exec(`cd ${generatePath} && node-gyp configure --msvs_version 2015 && node-gyp build`, (err, stdout, stderr) => {
    if (err) throw err;
    if (stderr) console.warn(stderr);
    console.log(`Successfully compiled bindings for ${vkVersion}!`);
  });
}
