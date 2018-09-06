import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

const H_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/handle-h.njk`, "utf-8");
const CPP_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/handle-cpp.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

export default function(handle_name) {
  let vars = {
    handle_name
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
