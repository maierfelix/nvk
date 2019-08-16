/**

  Generates C++ binding code for vulkan structs

**/
import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

import {
  warn
} from "../utils.mjs";

let ast = null;

const H_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/memoryLayouts.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

export default function(astReference, data) {
  ast = astReference;
  let {
    structs
  } = data;
  let vars = { structs };
  let out = null;
  // memoryLayouts
  let template = H_TEMPLATE;
  let output = nunjucks.renderString(template, vars);
  return output;
};
