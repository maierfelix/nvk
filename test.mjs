import util from "util";
import addon from "./generated/1.1.82.0/build/Release/addon.node";

let enums = addon.getVulkanEnumerations();

Object.assign(global, addon);
Object.assign(global, enums);

let result = null;

let instance = new VkInstance();

{

  // app info
  let appInfo = new VkApplicationInfo();
  appInfo.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
  appInfo.pApplicationName = "Hello!";
  appInfo.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
  appInfo.pEngineName = "No Engine";
  appInfo.engineVersion = VK_MAKE_VERSION(1, 0, 0);
  appInfo.apiVersion = VK_API_VERSION_1_0;

  let extensions = [
    "VK_KHR_surface",
    "VK_KHR_win32_surface"
  ];

  // create info
  let createInfo = new VkInstanceCreateInfo();
  createInfo.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
  createInfo.pApplicationInfo = appInfo;
  //createInfo.enabledExtensionCount = extensions.length;
  //createInfo.ppEnabledExtensionNames = extensions;

  console.log(appInfo);
  console.log(createInfo);

  if (vkCreateInstance(createInfo, null, instance) !== VK_SUCCESS) {
    console.error("Error: Instance creation failed!");
  }
  console.log("Created vk instance!");

  let deviceCount = { $:0 };
  vkEnumeratePhysicalDevices(instance, deviceCount, null);
  if (deviceCount.$ <= 0) console.error("Error: No render devices available!");
  console.log("Took physical device count!", deviceCount.$);

  let devices = [...Array(deviceCount.$)].map(() => new VkPhysicalDevice());
  console.log(devices);
  result = vkEnumeratePhysicalDevices(instance, deviceCount, devices);
  if (result !== VK_SUCCESS) console.error("Physical device enumeration failed!");

  // auto pick first found device
  let device = devices[0];
  let deviceProperties = new VkPhysicalDeviceProperties();
  let deviceFeatures = new VkPhysicalDeviceFeatures();
  vkGetPhysicalDeviceProperties(device, deviceProperties);
  vkGetPhysicalDeviceFeatures(device, deviceFeatures);
  console.log(device);
  console.log(deviceProperties);
  console.log(deviceFeatures);

  let queueFamilyCount = { $: 0 };
  vkGetPhysicalDeviceQueueFamilyProperties(device, queueFamilyCount, null);
  console.log("Took queue family count!", queueFamilyCount.$);

  let queueFamilies = [...Array(queueFamilyCount.$)].map(() => new VkQueueFamilyProperties());
  vkGetPhysicalDeviceQueueFamilyProperties(device, queueFamilyCount, queueFamilies);

  console.log(queueFamilies);

  queueFamilies.map(props => {
    if (props.queueFlags & VK_QUEUE_GRAPHICS_BIT) {
      console.log("GRAPHICS");
    }
    if (props.queueFlags & VK_QUEUE_COMPUTE_BIT) {
      console.log("COMPUTE");
    }
    if (props.queueFlags & VK_QUEUE_TRANSFER_BIT) {
      console.log("TRANSFER");
    }
    if (props.queueFlags & VK_QUEUE_SPARSE_BINDING_BIT) {
      console.log("SPARSE");
    }
  });

}

console.log("end");

setInterval(() => { });
