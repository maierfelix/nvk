import fs from "fs";
import vk from "../../index";
import pngjs from "pngjs"; const { PNG } = pngjs;

Object.assign(global, vk);

function ASSERT_VK_RESULT(result) {
  if (result !== VK_SUCCESS) throw new Error(`Vulkan assertion failed: ${result}`);
};

function getShaderFile(path) {
  return new Uint8Array(fs.readFileSync(path, null));
};

function createShaderModule(shaderSrc) {
  let shaderModule = new VkShaderModule();
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

function getQueueFamilyIndex(flag) {
  let familyCount = { $:0 };
  vkGetPhysicalDeviceQueueFamilyProperties(physicalDevice, familyCount, null);
  let queueFamilies = [...Array(familyCount.$)].map(() => new VkQueueFamilyProperties());
  vkGetPhysicalDeviceQueueFamilyProperties(physicalDevice, familyCount, queueFamilies);
  for (let ii = 0; ii < queueFamilies.length; ++ii) {
    let queueFamily = queueFamilies[ii];
    if (queueFamily.queueCount > 0 && queueFamily.queueFlags & flag) return ii;
  };
  return -1;
};

let result = null;

let device = new VkDevice();
let instance = new VkInstance();
let pipelineLayout = new VkPipelineLayout();
let pipeline = new VkPipeline();
let fence = new VkFence();
let commandPool = new VkCommandPool();
let queue = new VkQueue();
let commandBuffer = new VkCommandBuffer();
let descriptorPool = new VkDescriptorPool();
let descriptorSet = new VkDescriptorSet();
let descriptorSetLayout = new VkDescriptorSetLayout();
let physicalDevice = null;

let width = 3200;
let height = 2400;
let workGroupSize = 32;

let pixelBuffer = new VkBuffer();
let pixelBufferMemory = new VkDeviceMemory();
let pixelBufferSize = width * height * 4;

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

  let deviceProperties = new VkPhysicalDeviceProperties();
  vkGetPhysicalDeviceProperties(physicalDevice, deviceProperties);
  console.log(`Using device: ${deviceProperties.deviceName}`);
}

/**  Create logical device **/
{
  console.log("Creating logical device..");
  let deviceQueueInfo = new VkDeviceQueueCreateInfo();
  deviceQueueInfo.queueFamilyIndex = getQueueFamilyIndex(VK_QUEUE_COMPUTE_BIT);
  deviceQueueInfo.queueCount = 1;
  deviceQueueInfo.pQueuePriorities = new Float32Array([1.0]);

  let deviceInfo = new VkDeviceCreateInfo();
  deviceInfo.queueCreateInfoCount = 1;
  deviceInfo.pQueueCreateInfos = [deviceQueueInfo];
  deviceInfo.enabledLayerCount = layers.length;
  deviceInfo.ppEnabledLayerNames = layers;
  deviceInfo.pEnabledFeatures = new VkPhysicalDeviceFeatures();

  result = vkCreateDevice(physicalDevice, deviceInfo, null, device);
  ASSERT_VK_RESULT(result);

  vkGetDeviceQueue(device, getQueueFamilyIndex(VK_QUEUE_COMPUTE_BIT), 0, queue);
}

/** Create pixel buffer **/
{
  console.log("Creating pixel buffer..");
  let bufferInfo = new VkBufferCreateInfo();
  bufferInfo.size = pixelBufferSize;
  bufferInfo.usage = VK_BUFFER_USAGE_STORAGE_BUFFER_BIT;
  bufferInfo.sharingMode = VK_SHARING_MODE_EXCLUSIVE;

  vkCreateBuffer(device, bufferInfo, null, pixelBuffer);

  let memoryRequirements = new VkMemoryRequirements();
  vkGetBufferMemoryRequirements(device, pixelBuffer, memoryRequirements);

  let propertyFlags = VK_MEMORY_PROPERTY_HOST_COHERENT_BIT | VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT;

  let memAllocInfo = new VkMemoryAllocateInfo();
  memAllocInfo.allocationSize = memoryRequirements.size;
  memAllocInfo.memoryTypeIndex = getMemoryTypeIndex(memoryRequirements.memoryTypeBits, propertyFlags);

  result = vkAllocateMemory(device, memAllocInfo, null, pixelBufferMemory);
  ASSERT_VK_RESULT(result);

  result = vkBindBufferMemory(device, pixelBuffer, pixelBufferMemory, 0);
  ASSERT_VK_RESULT(result);
}

/** Create descriptors **/
{
  console.log("Creating descriptors..");
  // layout
  console.log("  Creating layout..");
  let storageLayoutBinding = new VkDescriptorSetLayoutBinding();
  storageLayoutBinding.binding = 0;
  storageLayoutBinding.descriptorType = VK_DESCRIPTOR_TYPE_STORAGE_BUFFER;
  storageLayoutBinding.descriptorCount = 1;
  storageLayoutBinding.stageFlags = VK_SHADER_STAGE_COMPUTE_BIT;
  storageLayoutBinding.pImmutableSamplers = null;

  let layoutInfo = new VkDescriptorSetLayoutCreateInfo();
  layoutInfo.bindingCount = 1;
  layoutInfo.pBindings = [storageLayoutBinding];

  result = vkCreateDescriptorSetLayout(device, layoutInfo, null, descriptorSetLayout);
  ASSERT_VK_RESULT(result);

  // pool
  console.log("  Creating pool..");
  let descriptorPoolSize = new VkDescriptorPoolSize();
  descriptorPoolSize.type = VK_DESCRIPTOR_TYPE_STORAGE_BUFFER;
  descriptorPoolSize.descriptorCount = 1;

  let descriptorPoolInfo = new VkDescriptorPoolCreateInfo();
  descriptorPoolInfo.maxSets = 1;
  descriptorPoolInfo.poolSizeCount = 1;
  descriptorPoolInfo.pPoolSizes = [descriptorPoolSize];
  result = vkCreateDescriptorPool(device, descriptorPoolInfo, null, descriptorPool);
  ASSERT_VK_RESULT(result);

  // descriptorsets
  console.log("  Creating sets..");
  let descriptorSetAllocInfo = new VkDescriptorSetAllocateInfo();
  descriptorSetAllocInfo.descriptorPool = descriptorPool;
  descriptorSetAllocInfo.descriptorSetCount = 1;
  descriptorSetAllocInfo.pSetLayouts = [descriptorSetLayout];
  result = vkAllocateDescriptorSets(device, descriptorSetAllocInfo, [descriptorSet]);
  ASSERT_VK_RESULT(result);

  let bufferInfo = new VkDescriptorBufferInfo();
  bufferInfo.buffer = pixelBuffer;
  bufferInfo.offset = 0;
  bufferInfo.range = pixelBufferSize;

  let writeDescriptorSet = new VkWriteDescriptorSet();
  writeDescriptorSet.dstSet = descriptorSet;
  writeDescriptorSet.dstBinding = 0;
  writeDescriptorSet.descriptorCount = 1;
  writeDescriptorSet.descriptorType = VK_DESCRIPTOR_TYPE_STORAGE_BUFFER;
  writeDescriptorSet.pBufferInfo = [bufferInfo];

  vkUpdateDescriptorSets(device, 1, [writeDescriptorSet], 0, null);
}

/** Create compute pipeline **/
{
  let compShaderSrc = getShaderFile("./shaders/mandelbrot.spv");
  let compShaderModule = createShaderModule(compShaderSrc);

  let shaderStageCompInfo = new VkPipelineShaderStageCreateInfo();
  shaderStageCompInfo.stage = VK_SHADER_STAGE_COMPUTE_BIT;
  shaderStageCompInfo.module = compShaderModule;
  shaderStageCompInfo.pName = "main";
  shaderStageCompInfo.pSpecializationInfo = null;

  let pipelineLayoutInfo = new VkPipelineLayoutCreateInfo();
  pipelineLayoutInfo.setLayoutCount = 1;
  pipelineLayoutInfo.pSetLayouts = [descriptorSetLayout];

  result = vkCreatePipelineLayout(device, pipelineLayoutInfo, null, pipelineLayout);
  ASSERT_VK_RESULT(result);

  let computePipelineInfo = new VkComputePipelineCreateInfo();
  computePipelineInfo.stage = shaderStageCompInfo;
  computePipelineInfo.layout = pipelineLayout;

  result = vkCreateComputePipelines(device, null, 1, [computePipelineInfo], null, [pipeline]);
  ASSERT_VK_RESULT(result);
}

/** Create command buffers **/
{
  console.log("Creating command buffers..");
  let cmdPoolInfo = new VkCommandPoolCreateInfo();
  cmdPoolInfo.flags = 0;
  cmdPoolInfo.queueFamilyIndex = getQueueFamilyIndex(VK_QUEUE_COMPUTE_BIT);

  result = vkCreateCommandPool(device, cmdPoolInfo, null, commandPool);
  ASSERT_VK_RESULT(result);

  let cmdBufferAllocInfo = new VkCommandBufferAllocateInfo();
  cmdBufferAllocInfo.commandPool = commandPool;
  cmdBufferAllocInfo.commandBufferCount = 1;
  cmdBufferAllocInfo.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;

  result = vkAllocateCommandBuffers(device, cmdBufferAllocInfo, [commandBuffer]);
  ASSERT_VK_RESULT(result);

  // transition
  console.log("  Creating transition..");
  let cmdBufferBeginInfo = new VkCommandBufferBeginInfo();
  cmdBufferBeginInfo.flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT;

  result = vkBeginCommandBuffer(commandBuffer, cmdBufferBeginInfo);
  ASSERT_VK_RESULT(result);

  vkCmdBindPipeline(commandBuffer, VK_PIPELINE_BIND_POINT_COMPUTE, pipeline);
  vkCmdBindDescriptorSets(commandBuffer, VK_PIPELINE_BIND_POINT_COMPUTE, pipelineLayout, 0, 1, [descriptorSet], 0, null);

  vkCmdDispatch(commandBuffer, (width / workGroupSize) | 0, (height / workGroupSize) | 0, 1);

  result = vkEndCommandBuffer(commandBuffer);
  ASSERT_VK_RESULT(result);

  // execution
  console.log("  Executing command buffers..");
  let submitInfo = new VkSubmitInfo();
  submitInfo.commandBufferCount = 1;
  submitInfo.pCommandBuffers = [commandBuffer];

  let fenceInfo = new VkFenceCreateInfo();

  result = vkCreateFence(device, fenceInfo, null, fence);
  ASSERT_VK_RESULT(result);

  result = vkQueueSubmit(queue, 1, [submitInfo], fence);
  ASSERT_VK_RESULT(result);

  result = vkWaitForFences(device, 1, [fence], VK_TRUE, 60 * 1e9);
  ASSERT_VK_RESULT(result);

}

/** Read back **/
{
  console.log("Reading back..");
  let dataPtr = { $: 0n };
  vkMapMemory(device, pixelBufferMemory, 0, pixelBufferSize, 0, dataPtr);
  let data = createV8ArrayBufferFromMemory(dataPtr.$, pixelBufferSize);
  let view = new Float32Array(data);
  let png = new PNG({
    width,
    height,
    filterType: 4
  });
  for (let ii = 0; ii < view.length; ii += 4) {
    png.data[ii + 0] = 255 * view[ii + 0];
    png.data[ii + 1] = 255 * view[ii + 1];
    png.data[ii + 2] = 255 * view[ii + 2];
    png.data[ii + 3] = 255 * view[ii + 3];
  };
  png.pack().pipe(fs.createWriteStream("mandelbrot.png"));
  //vkUnmapMemory(device, pixelBufferMemory);
}

console.log("Done!");
