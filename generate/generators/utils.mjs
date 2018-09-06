import fs from "fs";
import nunjucks from "nunjucks";
import pkg from "../../package.json";

const H_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/utils-h.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

export default function(VK_VERSION) {
  let vars = {};
  let out = {
    header: null
  };
  // utils.h
  {
    let template = H_TEMPLATE;
    let output = nunjucks.renderString(template, vars);
    out.header = output;
  }
  return out;
};
