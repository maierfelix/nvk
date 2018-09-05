import fs from "fs";
import nunjucks from "nunjucks";

const PKG_TEMPLATE = fs.readFileSync(`./templates/package-json.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

export default function(VK_VERSION) {
  let vars = {
    VK_VERSION
  };
  let out = {
    json: null
  };
  // package.json
  {
    let template = PKG_TEMPLATE;
    let output = nunjucks.renderString(template, vars);
    out.json = output;
  }
  return out;
};
