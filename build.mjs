import fs from "fs";
import { spawn } from "child_process";

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

  let cmd = `cd ${generatePath} && node-gyp configure --msvs_version 2015 && node-gyp build`;

  let shell = spawn(cmd, { shell: true, stdio: "inherit" }, { stdio: "pipe" });
  shell.on("exit", function (error) {

    if (error) {
      console.log(`\x1b[31m%s\x1b[0m`, `\nFailed to compile bindings for ${vkVersion}! Code: ${error}`);
    } else {
      console.log(`\nSuccessfully compiled bindings for ${vkVersion}!`);
    }

  });

} else {
  console.error(`Error: Your platform isn't supported!`);
}
