import * as linux from "./generated/1.1.108/linux";
import * as win32 from "./generated/1.1.108/win32";
import * as darwin from "./generated/1.1.108/darwin";

let nvk: any;
switch (process.platform) {
  case "linux":
    nvk = linux;
  break;
  case "win32":
    nvk = win32;
  break;
  case "darwin":
    nvk = darwin;
  break;
};

export default nvk;
