import addon from "../build/Release/addon.node";

class VulkanRenderingContext {
  constructor(opts) {
    let {width, height, title} = opts;
    let window = this.setup(width, height);
    this.width = width;
    this.height = height;
    this.title = title;
    this.window = window;
  }
};

(function buildFunctions() {
  let search = "FN_";
  for (let key in addon) {
    if (key.substr(0, search.length) !== search) continue;
    let name = key.substr(search.length, key.length);
    VulkanRenderingContext.prototype[name] = addon[key];
  };
})();

export default VulkanRenderingContext;
