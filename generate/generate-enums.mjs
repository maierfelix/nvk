import fs from "fs";
import nunjucks from "nunjucks";

const H_TEMPLATE = fs.readFileSync(`enums-h.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

export default function(enums) {
  let vars = {
    enums
  };
  let out = {
    source: null
  };
  // h
  {
    let template = H_TEMPLATE;
    let output = nunjucks.renderString(template, vars);
    out.source = output;
  }
  return out;
};
