import fs from "fs";
import nunjucks from "nunjucks";
import toposort from "toposort";
import pkg from "../../package.json";

const H_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/index-h.njk`, "utf-8");
const CPP_TEMPLATE = fs.readFileSync(`${pkg.config.TEMPLATE_DIR}/index-cpp.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

function removeDuplicates(array, condition) {
  let out = array.filter((item, index, self) =>
    index === self.findIndex((t) => condition(item, t))
  );
  array.length = 0;
  out.map(item => { array.push(item); });
};

function generateIncludes(includes) {
  let out = [];
  removeDuplicates(
    includes,
    (item, t) => t.name === item.name && t.include === item.include
  );
  includes = includes.map(item => [item.name, item.include]);
  out = toposort(includes).reverse();
  return out;
};

export default function(includes, calls) {
  let vars = {
    calls,
    includes: generateIncludes(includes)
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
