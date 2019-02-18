/**

  Generates C++ binding code for vulkan handles

**/
import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

let ast = null;

const H_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/handle-h.njk`, "utf-8");
const CPP_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/handle-cpp.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

export default function(astReference, handle) {
  ast = astReference;
  let vars = {
    handle,
    handle_name: handle.name
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
