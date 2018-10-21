const fs = require("fs");
const path = require("path");
const pkg = require("./package.json");

// we attach all vulkan enums, structs etc. to this object
let out = {};

// gather vk version from arguments
const vkVersion = process.env.npm_config_vkversion;
if (!vkVersion) throw `No vulkan version --vkversion specified!`;

const addonLocalPath = `${pkg.config.GEN_OUT_DIR}/${vkVersion}/build/Release/addon.node`;
const addonPath = path.join(__dirname, addonLocalPath);
const bindingsPath = path.join(__dirname, `${pkg.config.GEN_OUT_DIR}/`);

// make sure the bindings exist
if (!fs.existsSync(addonPath)) {
  process.stderr.write(`Failed to load vulkan bindings v${vkVersion} from ${addonLocalPath}\n`);
  // show user available bindings
  process.stderr.write(`You may instead use one of the following bindings:\n`);
  fs.readdirSync(bindingsPath).forEach(dirname => {
    process.stderr.write(`> ${dirname}\n`);
  });
  process.stderr.write(`Make sure to generate and compile the bindings for ${vkVersion}\n`);
  throw `Exiting..`;
}

const addon = require(addonPath);
const enums = addon.getVulkanEnumerations();

Object.assign(out, addon);
Object.assign(out, enums);

module.exports = out;
