import * as linuxNVK from "./generated/1.1.108/linux";
import * as darwinNVK from "./generated/1.1.108/darwin";
import * as win32NVK from "./generated/1.1.108/win32";

let nvk: any;
switch (process.platform) {
    case "linux":
        nvk = linuxNVK;
        break;
    case "win32":
        nvk = win32NVK;
        break;
    case "darwin":
        nvk = darwinNVK;
        break;
    default:
        throw 'This os is not supported by nvk';
}
export default nvk;