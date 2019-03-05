const fs = require("fs");
const path = require("path");
const pkg = require("./package.json");

function throwInvalidVkVersion() {
  process.stderr.write(`Invalid vulkan version specifier!\n`);
  throw `Exiting..`;
};

function getVkVersionFromArg(arg) {
  let split = arg.split("=");
  if (split.length === 2) {
    let version = split[1];
    if (version.split(".").length !== 3) {
      throwInvalidVkVersion();
    } else {
      return version;
    }
  } else {
    throwInvalidVkVersion();
  }
};

// we attach all vulkan enums, structs etc. to this object
let out = {};

// gather vk version
let vkVersion = process.env.npm_config_vkversion;
// attempt npm version
vkVersion = vkVersion || null;
// attempt node argv
if (!vkVersion) {
  process.argv.map(arg => {
    if (arg.match("vkversion=")) {
      vkVersion = getVkVersionFromArg(arg);
    }
  });
}

if (!vkVersion) throw `No vulkan version --vkversion specified!`;

let {platform} = process;

// strictly dissallow older versions
// TODO: make this less harsh?
if (pkg.config.OUTDATED.indexOf(vkVersion) > -1) {
  throw `${vkVersion} is outdated and no longer supported!
Please use v${pkg.config.POST_DEFAULT_BINDING_VERSION} from now on!`;
}

const releasePath = `${pkg.config.GEN_OUT_DIR}/${vkVersion}/${platform}/build/Release`;
const addonLocalPath = `${releasePath}/addon-${platform}.node`;
const addonPath = path.join(__dirname, addonLocalPath);
const bindingsPath = path.join(__dirname, `${pkg.config.GEN_OUT_DIR}/`);

// make sure the bindings exist
if (!fs.existsSync(addonPath)) {
  process.stderr.write(`Failed to load vulkan bindings v${vkVersion} from ${addonLocalPath}\n`);
  // show user available bindings
  process.stderr.write(`You may instead use one of the following bindings:\n`);
  fs.readdirSync(bindingsPath).forEach(dirname => {
    let addon = null;
    let addonNodePath = bindingsPath + dirname + `/${platform}/build/Release/addon-${platform}.node`;
    try {
      addon = require(addonNodePath);
    } catch (e) {

    }
    if (addon) process.stderr.write(`> ${dirname}\n`);
  });
  //process.stderr.write(`Make sure to generate and compile the bindings for ${vkVersion}\n`);
  throw `Exiting..`;
}

if (platform === "darwin") {
  process.env.VK_ICD_FILENAMES = path.join(__dirname, `${releasePath}/${pkg.config.MAC_ICD_PATH}`);
}

const addon = require(addonPath);
const enums = addon.getVulkanEnumerations();

Object.assign(out, addon);
Object.assign(out, enums);

module.exports = out;
