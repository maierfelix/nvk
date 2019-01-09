import fs from "fs";
import vk from "../../index";

Object.assign(global, vk);

function ASSERT_VK_RESULT(result) {
  if (result !== VK_SUCCESS) throw new Error(`Vulkan assertion failed!`);
};

function getShaderFile(path) {
  return new Uint8Array(fs.readFileSync(path, null));
};

function createShaderModule(shaderSrc, shaderModule) {
  let shaderModuleInfo = new VkShaderModuleCreateInfo();
  shaderModuleInfo.sType = VK_STRUCTURE_TYPE_SHADER_MODULE_CREATE_INFO;
  shaderModuleInfo.pCode = shaderSrc;
  shaderModuleInfo.codeSize = shaderSrc.byteLength;
  result = vkCreateShaderModule(device, shaderModuleInfo, null, shaderModule);
  ASSERT_VK_RESULT(result);
  return shaderModule;
};

function getMemoryTypeIndex(typeFilter, propertyFlag) {
  let memoryProperties = new VkPhysicalDeviceMemoryProperties();
  vkGetPhysicalDeviceMemoryProperties(physicalDevice, memoryProperties);
  for (let ii = 0; ii < memoryProperties.memoryTypeCount; ++ii) {
    if (
      (typeFilter & (1 << ii)) &&
      (memoryProperties.memoryTypes[ii].propertyFlags & propertyFlag) === propertyFlag
    ) {
      return ii;
    }
  };
  return -1;
};

function getComputeQueueFamilyIndex() {
  let familyCount = { $:0 };
  vkGetPhysicalDeviceQueueFamilyProperties(physicalDevice, familyCount, null);
  let queueFamilies = [...Array(familyCount.$)].map(() => new VkQueueFamilyProperties());
  console.log(familyCount, queueFamilies);
  vkGetPhysicalDeviceQueueFamilyProperties(physicalDevice, familyCount, queueFamilies);
  for (let ii = 0; ii < queueFamilies.length; ++ii) {
    let queueFamily = queueFamilies[ii];
    for (let key in queueFamily) {
      console.log(key, queueFamily[key]);
    };
    console.log("#####");
  };
};

const vertSrc = getShaderFile("./shaders/triangle-vert.spv");
const fragSrc = getShaderFile("./shaders/triangle-frag.spv");

let result = null;

let device = new VkDevice();
let instance = new VkInstance();
let pipelineLayout = new VkPipelineLayout();
let pipeline = new VkPipeline();
let cmdPool = new VkCommandPool();
let queue = new VkQueue();
let vertexBuffer = new VkBuffer();
let vertexBufferMemory = new VkDeviceMemory();
let physicalDevice = null;

let pixel = new Uint8Array(4);

let width = 640;
let height = 480;
let buffer = new Uint8Array(width * height * pixel.byteLength);

let layers = ["VK_LAYER_LUNARG_standard_validation"];

/** Create instance **/
{
  console.log("Creating instance..");
  let appInfo = new VkApplicationInfo();
  appInfo.pApplicationName = "Compute!";
  appInfo.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
  appInfo.pEngineName = "No Engine";
  appInfo.engineVersion = VK_MAKE_VERSION(1, 0, 0);
  appInfo.apiVersion = VK_API_VERSION_1_0;

  let createInfo = new VkInstanceCreateInfo();
  createInfo.pApplicationInfo = appInfo;
  createInfo.enabledLayerCount = layers.length;
  createInfo.ppEnabledLayerNames = layers;

  result = vkCreateInstance(createInfo, null, instance);
  ASSERT_VK_RESULT(result);
}

/** Create physical device **/
{
  console.log("Creating physical device..");
  let deviceCount = { $:0 };
  vkEnumeratePhysicalDevices(instance, deviceCount, null);
  if (deviceCount.$ <= 0) console.error("Error: No supported devices available!");

  let devices = [...Array(deviceCount.$)].map(() => new VkPhysicalDevice());
  result = vkEnumeratePhysicalDevices(instance, deviceCount, devices);
  ASSERT_VK_RESULT(result);

  physicalDevice = devices[0];
}

/**  Create logical device **/
{
  console.log("Creating logical device..");
  let deviceQueueInfo = new VkDeviceQueueCreateInfo();
  deviceQueueInfo.queueFamilyIndex = getComputeQueueFamilyIndex();
  deviceQueueInfo.queueCount = 1;
  deviceQueueInfo.pQueuePriorities = new Float32Array([1.0, 1.0, 1.0, 1.0]);

  let deviceFeatures = new VkPhysicalDeviceFeatures();

  let deviceInfo = new VkDeviceCreateInfo();
  deviceInfo.queueCreateInfoCount = 1;
  deviceInfo.pQueueCreateInfos = [deviceQueueInfo];
  deviceInfo.enabledLayerCount = layers.length;
  deviceInfo.ppEnabledLayerNames = layers;
  deviceInfo.pEnabledFeatures = deviceFeatures;

  result = vkCreateDevice(physicalDevice, deviceInfo, null, device);
  ASSERT_VK_RESULT(result);
}

/** Create data buffer **/
{
  console.log("Creating data buffer..");
  let bufferInfo = new VkBufferCreateInfo();
  bufferInfo.size = buffer.byteLength;
  buffer.usage = VK_BUFFER_USAGE_STORAGE_BUFFER_BIT;
  buffer.sharingMode = VK_SHARING_MODE_EXCLUSIVE;
}
