import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

let ast = null;

const H_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/webkit-h.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

export default function(astReference) {
  ast = astReference;
  let vars = {};
  let out = {
    header: null
  };
  // cpp
  {
    let template = H_TEMPLATE;
    let output = nunjucks.renderString(template, vars);
    out.header = output;
  }
  return out;
};
