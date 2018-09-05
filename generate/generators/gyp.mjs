import fs from "fs";
import nunjucks from "nunjucks";

const GYP_TEMPLATE = fs.readFileSync(`./templates/binding-gyp.njk`, "utf-8");

nunjucks.configure({ autoescape: true });

export default function(VK_VERSION, VK_INCLUDES) {
  let vars = {
    VK_VERSION,
    VK_INCLUDES: VK_INCLUDES.join(`,\n`)
  };
  let out = {
    gyp: null
  };
  // binding.gyp
  {
    let template = GYP_TEMPLATE;
    let output = nunjucks.renderString(template, vars);
    out.gyp = output;
  }
  return out;
};
