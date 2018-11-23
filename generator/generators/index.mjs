import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

import { getSortedIncludes } from "../utils";

let ast = null;

const H_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/index-h.njk`, "utf-8");
const CPP_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/index-cpp.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

export default function(astReference, includes, calls) {
  ast = astReference;
  let vars = {
    calls,
    includes
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
