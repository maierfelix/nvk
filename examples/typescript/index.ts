import {
  VulkanWindow,
  VkResult,
  VkStructureType,
  VK_MAKE_VERSION,
  VK_API_VERSION_1_0,
  VkInstance,
  VkApplicationInfo,
  VkInstanceCreateInfo,
  vkCreateInstance
} from "../../generated/1.1.92/index";

let win = new VulkanWindow({
  width: 480,
  height: 320,
  title: "typescript-example"
});

let instance = new VkInstance();

let appInfo = new VkApplicationInfo({
  pApplicationName: "Hello!",
  applicationVersion: VK_MAKE_VERSION(1, 0, 0),
  pEngineName: "No Engine",
  engineVersion: VK_MAKE_VERSION(1, 0, 0),
  apiVersion: VK_API_VERSION_1_0
});

let validationLayers = [
  "VK_LAYER_LUNARG_core_validation",
  "VK_LAYER_LUNARG_standard_validation"
];
let instanceExtensions = win.getRequiredInstanceExtensions();

let instanceInfo = new VkInstanceCreateInfo();
instanceInfo.sType = VkStructureType.VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
instanceInfo.pApplicationInfo = appInfo;
instanceInfo.enabledLayerCount = validationLayers.length;
instanceInfo.ppEnabledLayerNames = validationLayers;
instanceInfo.enabledExtensionCount = instanceExtensions.length;
instanceInfo.ppEnabledExtensionNames = instanceExtensions;

let result = vkCreateInstance(instanceInfo, null, instance);
if (result !== VkResult.VK_SUCCESS) throw `Failed to create VkInstance!`;

setInterval(() => {
  win.pollEvents();
}, 1e3 / 60);
