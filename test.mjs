import util from "util";
import addon from "./generated/1.1.82.0/build/Release/addon.node";

const WIN_WIDTH = 800;
const WIN_HEIGHT = 600;

let enums = addon.getVulkanEnumerations();

Object.assign(global, addon);
Object.assign(global, enums);

let result = null;

let instance = new VkInstance();
let surface = new VkSurfaceKHR();
let swapchain = new VkSwapchainKHR();

let win = new VulkanWindow(WIN_WIDTH, WIN_HEIGHT);

console.log(win);

let instanceExtensions = win.getRequiredInstanceExtensions();
console.log("Instance extensions:", instanceExtensions);

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

createInfo.enabledExtensionCount = instanceExtensions.length;
createInfo.ppEnabledExtensionNames = instanceExtensions;
createInfo.enabledLayerCount = 0;

win.test(createInfo);

console.log(appInfo);
console.log(createInfo);

if ((result = vkCreateInstance(createInfo, null, instance)) !== VK_SUCCESS) {
  console.error("Error: Instance creation failed!", result);
} else {
  console.log("Created instance!");
}

if ((result = win.createSurface(instance, null, surface)) !== VK_SUCCESS) {
  console.error("Error: Surface creation failed!", result);
} else {
  console.log("Created surface!");
}

let deviceCount = { $:0 };
vkEnumeratePhysicalDevices(instance, deviceCount, null);
if (deviceCount.$ <= 0) console.error("Error: No render devices available!");
console.log("Physical device count:", deviceCount.$);

let devices = [...Array(deviceCount.$)].map(() => new VkPhysicalDevice());
result = vkEnumeratePhysicalDevices(instance, deviceCount, devices);
if (result !== VK_SUCCESS) console.error("Error: Physical device enumeration failed!");

// auto pick first found device
let physicalDevice = devices[0];
console.log("Using physical device:", physicalDevice);

let deviceFeatures = new VkPhysicalDeviceFeatures();
vkGetPhysicalDeviceFeatures(physicalDevice, deviceFeatures);
console.log("Physical device features:", deviceFeatures);

let deviceProperties = new VkPhysicalDeviceProperties();
vkGetPhysicalDeviceProperties(physicalDevice, deviceProperties);
console.log("Physical device properties:", deviceProperties);

console.log(`Using device: ${deviceProperties.deviceName}`);

let deviceMemoryProperties = new VkPhysicalDeviceMemoryProperties();
vkGetPhysicalDeviceMemoryProperties(physicalDevice, deviceMemoryProperties);

let queueFamilyCount = { $: 0 };
vkGetPhysicalDeviceQueueFamilyProperties(physicalDevice, queueFamilyCount, null);
console.log("Queue family count:", queueFamilyCount.$);

let queueFamilies = [...Array(queueFamilyCount.$)].map(() => new VkQueueFamilyProperties());
vkGetPhysicalDeviceQueueFamilyProperties(physicalDevice, queueFamilyCount, queueFamilies);

/*queueFamilies.map((queueFamily, index) => {
  console.log(`Graphics Queue Family ${index}`);
  console.log(`VK_QUEUE_GRAPHICS_BIT: ${(queueFamily.queueFlags & VK_QUEUE_GRAPHICS_BIT) !== 0}`);
  console.log(`VK_QUEUE_COMPUTE_BIT: ${(queueFamily.queueFlags & VK_QUEUE_COMPUTE_BIT) !== 0}`);
  console.log(`VK_QUEUE_TRANSFER_BIT: ${(queueFamily.queueFlags & VK_QUEUE_TRANSFER_BIT) !== 0}`);
  console.log(`VK_QUEUE_SPARSE_BINDING_BIT: ${(queueFamily.queueFlags & VK_QUEUE_SPARSE_BINDING_BIT) !== 0}`);
  console.log(`Count: ${queueFamily.queueCount}`);
  console.log(`TS valid bits: ${queueFamily.timestampValidBits}`);
});*/

let surfaceCapabilities = new VkSurfaceCapabilitiesKHR();
vkGetPhysicalDeviceSurfaceCapabilitiesKHR(physicalDevice, surface, surfaceCapabilities);
console.log("Surface capabilities:", surfaceCapabilities);

let surfaceFormatCount = { $: 0 };
vkGetPhysicalDeviceSurfaceFormatsKHR(physicalDevice, surface, surfaceFormatCount, null);
let surfaceFormats = [...Array(surfaceFormatCount.$)].map(() => new VkSurfaceFormatKHR());
vkGetPhysicalDeviceSurfaceFormatsKHR(physicalDevice, surface, surfaceFormatCount, surfaceFormats);
console.log(surfaceFormats);

let presentModeCount = { $: 0 };
vkGetPhysicalDeviceSurfacePresentModesKHR(physicalDevice, surface, presentModeCount, null);
let presentModes = [...Array(presentModeCount.$)].map(() => 0);
vkGetPhysicalDeviceSurfacePresentModesKHR(physicalDevice, surface, presentModeCount, presentModes);
console.log(presentModes);

let logicalDevice = new VkDevice();

let deviceQueueInfo = new VkDeviceQueueCreateInfo();
deviceQueueInfo.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
deviceQueueInfo.queueFamilyIndex = 0;
deviceQueueInfo.queueCount = 1;

let deviceExtensions = [
  "VK_KHR_swapchain"
];

let deviceInfo = new VkDeviceCreateInfo();
deviceInfo.sType = VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO;
deviceInfo.queueCreateInfoCount = 1;
deviceInfo.pQueueCreateInfos = [deviceQueueInfo];
deviceInfo.enabledExtensionCount = deviceExtensions.length;
deviceInfo.ppEnabledExtensionNames = deviceExtensions;
deviceInfo.pEnabledFeatures = new VkPhysicalDeviceFeatures();

if ((result = vkCreateDevice(physicalDevice, deviceInfo, null, logicalDevice)) !== VK_SUCCESS) {
  console.error("Error: Failed to create logical device!");
} else {
  console.log("Created logical device!");
}

let queue = new VkQueue();
vkGetDeviceQueue(logicalDevice, 0, 0, queue);

let surfaceSupport = { $: false };
vkGetPhysicalDeviceSurfaceSupportKHR(physicalDevice, 0, surface, surfaceSupport);
if (!surfaceSupport) {
  console.error(`No surface creation support!`);
}

let imageExtent = new VkExtent2D();
imageExtent.width = WIN_WIDTH;
imageExtent.height = WIN_HEIGHT;

let swapchainInfo = new VkSwapchainCreateInfoKHR();
swapchainInfo.sType = VK_STRUCTURE_TYPE_SWAPCHAIN_CREATE_INFO_KHR;
swapchainInfo.surface = surface;
swapchainInfo.minImageCount = 3;
swapchainInfo.imageFormat = VK_FORMAT_B8G8R8A8_UNORM;
swapchainInfo.imageColorSpace = VK_COLOR_SPACE_SRGB_NONLINEAR_KHR;
swapchainInfo.imageExtent = imageExtent;
swapchainInfo.imageArrayLayers = 1;
swapchainInfo.imageUsage = VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT;
swapchainInfo.imageSharingMode = VK_SHARING_MODE_EXCLUSIVE;
swapchainInfo.queueFamilyIndexCount = 0;
swapchainInfo.preTransform = VK_SURFACE_TRANSFORM_IDENTITY_BIT_KHR;
swapchainInfo.compositeAlpha = VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR;
swapchainInfo.presentMode = VK_PRESENT_MODE_FIFO_KHR;
swapchainInfo.clipped = VK_TRUE;
swapchainInfo.oldSwapchain = VK_NULL_HANDLE;

if ((result = vkCreateSwapchainKHR(physicalDevice, swapchainInfo, null, swapchain))) {
  console.error(`Swapchain creation failed!`);
} else {
  console.log(`Created swapchain!`);
}

console.log(swapchainInfo);

/*
let ii = 0;
let presentFamily = 0;
let graphicsFamily = 0;
queueFamilies.map(queueFamily => {
  // set queue family index
  if (queueFamily.queueCount > 0 && queueFamily.queueFlags & VK_QUEUE_GRAPHICS_BIT) {
    graphicsFamily = ii++;
  }
  let presentSupport = { $: false };
  vkGetPhysicalDeviceSurfaceSupportKHR(physicalDevice, ii, surface, presentSupport);
  console.log(presentSupport);
  // set queue present index
  if (queueFamily.queueCount > 0 && presentSupport.$) {
    presentFamily = ii;
    //console.log("Present support at", ii, presentSupport);
  }
  if (graphicsFamily >= 0 && presentFamily >= 0) return;
});
console.log(presentFamily, graphicsFamily);
*/

console.log("end");

setInterval(() => { });
