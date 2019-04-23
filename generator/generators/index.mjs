/**

  Generates C++ link code

**/
import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

import {
  warn,
  getSortedIncludes,
  getPlatformRelevantIncludes
} from "../utils";

let ast = null;

const H_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/index-h.njk`, "utf-8");
const CPP_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/index-cpp.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

export default function(astReference, includes, calls, includeMemoryLayouts) {
  ast = astReference;
  if (includeMemoryLayouts) {
    warn(`Including memoryLayouts in build for later bootstrapping..`);
  } else {
    warn(`Excluding memoryLayouts from build, to reduce package size. Make sure that the module got recompiled, before publishing!`);
  }
  let vars = {
    calls,
    includes,
    getPlatformRelevantIncludes: () => {
      return getPlatformRelevantIncludes(ast);
    },
    includeMemoryLayouts
  };
  let out = {
    header: null,
    source: null
  };
  // h
  {
    let template = H_TEMPLATE;
    let output = nunjucks.renderString(template, vars);
    out.header = output;
  }
  // cpp
  {
    let template = CPP_TEMPLATE;
    let output = nunjucks.renderString(template, vars);
    out.source = output;
  }
  return out;
};
