import fs from "fs";
import nunjucks from "nunjucks";

const H_TEMPLATE = fs.readFileSync(`handle-h.njk`, "utf-8");
const CPP_TEMPLATE = fs.readFileSync(`handle-cpp.njk`, "utf-8");

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
