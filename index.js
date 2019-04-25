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

if (!vkVersion) vkVersion = pkg.config.POST_DEFAULT_BINDING_VERSION;

process.stdout.write(`(nvk) Using Vulkan v${vkVersion}\n`);

// gather disable-validation-checks flag
let disableValidationChecks = process.env.npm_config_disable_validation_checks;
// attempt npm version
disableValidationChecks = disableValidationChecks || null;
// attempt node argv
if (!disableValidationChecks) {
  process.argv.map(arg => {
    if (arg.match("disable-validation-checks")) {
      disableValidationChecks = true;
    }
  });
}

let {platform} = process;

// strictly dissallow older versions
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
    let addonNodePath = bindingsPath + dirname + `/${platform}/interfaces.js`;
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

if (disableValidationChecks) {
  module.exports = require(bindingsPath + `${vkVersion}/${platform}/interfaces-no-validation.js`);
} else {
  module.exports = require(bindingsPath + `${vkVersion}/${platform}/interfaces.js`);
}
