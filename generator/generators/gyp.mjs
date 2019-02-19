/**

  Generates a binding.gyp to compile the generated bindings

**/
import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

import {
  warn,
  getLunarVkSDKPath,
  resolveLunarVkSDKPath
} from "../utils";

let ast = null;

const GYP_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/binding-gyp.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

export default async function(astReference, vkVersion, incremental, vkIncludes) {
  ast = astReference;
  let INCREMENTAL = "";
  let VK_SDK_PATH = getLunarVkSDKPath();
  if (incremental) {
    INCREMENTAL += `
      "LinkTimeCodeGeneration": 1,
      "LinkIncremental": 0
    `;
  } else {
    INCREMENTAL += `
      "LinkTimeCodeGeneration": 1,
      "LinkIncremental": 1
    `;
  }
  // x.x.x
  let sdkPath = resolveLunarVkSDKPath(vkVersion);
  let sdkVersionPath = VK_SDK_PATH + `/` + vkVersion;
  if (!fs.existsSync(sdkPath)) {
    warn(`Unable to find Vulkan SDK for ${vkVersion}! Please make sure you installed the corresponding SDK version to build the bindings`);
    warn(`Building the generated bindings might fail`);
  }
  else if (sdkVersionPath !== sdkPath && (sdkVersionPath + `.0` !== sdkPath)) {
    warn(`Using fallback SDK at ${sdkPath}`);
  }
  let vars = {
    INCREMENTAL,
    VK_INCLUDES: vkIncludes.join(`,\n`),
    VK_SDK_PATH: sdkPath
  };
  let out = {
    gyp: null
  };
  // binding.gyp
  {
    let template = GYP_TEMPLATE;
    let output = nunjucks.renderString(template, vars);
    out.gyp = output;
  }
  return out;
};
