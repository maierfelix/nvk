import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

import { getLunarVkVersion } from "../utils";

let ast = null;

const GYP_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/binding-gyp.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

export default function(astReference, vkVersion, incremental, vkIncludes) {
  ast = astReference;
  let INCREMENTAL = "";
  if (incremental) {
    INCREMENTAL += `
      "LinkTimeCodeGeneration": 1,
      "LinkIncremental": 0
    `;
  } else {
    INCREMENTAL += `
      "LinkTimeCodeGeneration": 2,
      "LinkIncremental": 1
    `;
  }
  let vars = {
    INCREMENTAL,
    VK_VERSION: getLunarVkVersion(vkVersion),
    VK_INCLUDES: vkIncludes.join(`,\n`)
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
