import util from "util";
import addon from "./generated/1.1.82.0/build/Release/addon.node";

let enums = addon.getVulkanEnumerations();

Object.assign(global, addon);
Object.assign(global, enums);

let instance = new VkInstance();

let appInfo = new VkApplicationInfo();
appInfo.pApplicationName = "Vulkan!";

let bufferInfo = new VkBufferCreateInfo();
bufferInfo.pQueueFamilyIndices = [1];

let createInfo = new VkInstanceCreateInfo();
createInfo.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
createInfo.pApplicationInfo = appInfo;

let validationLayers = ["VK_LAYER_LUNARG_standard_validation"];
createInfo.enabledLayerCount = validationLayers.length;
createInfo.ppEnabledLayerNames = validationLayers;

// TODO: shorten API here
let rect = new VkRect2D();
rect.offset = new VkOffset2D();
rect.offset.x = 42;
rect.offset.y = 666;
rect.extent = new VkExtent2D();
rect.extent.width = 1980;
rect.extent.height = 1280;

/*let rect = new VkRect2D({
  offset: new VkOffset2D({ x: 42, y: 666 }),
  extent: new VkExtent2D({ x: 1980, y: 1280 })
});*/

let clearRect = new VkClearRect();
clearRect.rect = rect;

let physicalDeviceFeatures = new VkPhysicalDeviceFeatures();

let deviceQueueCreateInfo = new VkDeviceQueueCreateInfo();
deviceQueueCreateInfo.pQueuePriorities = [1.0];

let deviceCreateInfo = new VkDeviceCreateInfo();
deviceCreateInfo.pQueueCreateInfos = [deviceQueueCreateInfo];
deviceCreateInfo.pEnabledFeatures = physicalDeviceFeatures;
deviceCreateInfo.ppEnabledExtensionNames = [];

let imageMemoryBarrier = new VkImageMemoryBarrier();
imageMemoryBarrier.image = new VkImage();

console.log(instance);
console.log(appInfo);
console.log(bufferInfo);
console.log(createInfo);
console.log(rect);
console.log(rect.offset);
console.log(rect.extent);
console.log(clearRect);
console.log(deviceCreateInfo);
console.log(physicalDeviceFeatures);
console.log(imageMemoryBarrier);

console.log(appInfo.pApplicationName);
console.log(bufferInfo.pQueueFamilyIndices);
console.log(createInfo.pApplicationInfo);
console.log(createInfo.ppEnabledLayerNames);

{

  // app info
  let appInfo = new VkApplicationInfo();
  appInfo.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
  appInfo.pApplicationName = "Hello!";
  appInfo.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
  appInfo.pEngineName = "No Engine";
  appInfo.engineVersion = VK_MAKE_VERSION(1, 0, 0);
  appInfo.apiVersion = VK_API_VERSION_1_0;

  // create info
  let createInfo = new VkInstanceCreateInfo();
  createInfo.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
  createInfo.pApplicationInfo = appInfo;
  createInfo.enabledLayerCount = 0;

  console.log(appInfo);
  console.log(createInfo);

  if (vkCreateInstance(createInfo, null, instance) !== VK_SUCCESS) {
    console.error("Error: Instance creation failed!");
  }

  let deviceCount = { $:0 };
  vkEnumeratePhysicalDevices(instance, deviceCount, null);
  if (deviceCount.$ <= 0) console.error("Error: No render devices available!");
  console.log(deviceCount.$);

}

console.log("end");

setInterval(() => { });
