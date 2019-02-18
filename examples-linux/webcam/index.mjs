import fs from "fs";
import nvk from "nvk";
import { performance } from "perf_hooks";
import glm from "gl-matrix"; const { vec3, mat4 } = glm;

import tolw from "tolw";

import {
  memoryCopy,
  createBuffer,
  copyBuffer,
  uploadBufferData,
  getMemoryTypeIndex
} from "./buffer";

Object.assign(global, nvk);

global.result = null;
global.device = new VkDevice();
global.instance = new VkInstance();
global.surface = new VkSurfaceKHR();
global.swapchain = null;
global.pipelineLayout = new VkPipelineLayout();
global.renderPass = new VkRenderPass();
global.pipeline = new VkPipeline();
global.cmdPool = new VkCommandPool();
global.queue = new VkQueue();
global.vertShaderModule = null;
global.fragShaderModule = null;
global.semaphoreImageAvailable = new VkSemaphore();
global.semaphoreRenderingDone = new VkSemaphore();

global.win = new VulkanWindow({
  width: 480,
  height: 320,
  title: "nvk webcam"
});

// file drop
win.ondrop = (e) => {
  console.log(e);
};

win.onfocus = (e) => {
  //if (e.focused) console.log("Focused!");
  //else console.log("Not focused!");
};
// win.focus();

global.ASSERT_VK_RESULT = result => {
  if (result !== VK_SUCCESS) throw new Error(`Vulkan assertion failed!`);
};

win.onresize = (e) => {
  recreateSwapchain();
  createTransforms();
};

win.onclose = (e) => {
  //console.log("Closed!", e);
};

/*setTimeout(() => {
  win.close();
}, 3e3);*/

let mousePressed = false;
win.onmousedown = (e) => {
  mousePressed = true;
};
win.onmouseup = (e) => {
  mousePressed = false;
};

let rotationX = 0;
let rotationVeloX = 0;
win.onmousemove = (e) => {
  if (mousePressed) {
    rotationVeloX = Math.max(Math.min(rotationVeloX - e.movementX, 128.0), -128.0)
  }
};

win.onmousewheel = (e) => {
  //console.log("onmousewheel", e);
};

win.onkeydown = (e) => {
  let {keyCode} = e;
  // up, down
  if (keyCode === 265) metallness = Math.max(0.0, Math.min(metallness + 0.1, 1.0));
  if (keyCode === 264) metallness = Math.max(0.0, Math.min(metallness - 0.1, 1.0));
  // left, right
  if (keyCode === 263) roughness = Math.max(0.01, Math.min(roughness - 0.05, 1.0));
  if (keyCode === 262) roughness = Math.max(0.01, Math.min(roughness + 0.05, 1.0));
  console.log(`Metallness:`, metallness, `Roughness:`, roughness);
};

win.onkeyup = (e) => {
  //console.log("onkeyup", e);
};

let vertSrc = readBinaryFile("./shaders/basic-vert.spv");
let fragSrc = readBinaryFile("./shaders/basic-frag.spv");

let depthImage = new VkImage();
let depthImageMemory = new VkDeviceMemory();
let depthImageView = null;

let vertexBuffer = new VkBuffer();
let vertexBufferMemory = new VkDeviceMemory();
let indexBuffer = new VkBuffer();
let indexBufferMemory = new VkDeviceMemory();
let uniformBuffer = new VkBuffer();
let uniformBufferMemory = new VkDeviceMemory();

let descriptorSetLayout = new VkDescriptorSetLayout();
let descriptorPool = new VkDescriptorPool();
let descriptorSet = new VkDescriptorSet();

let attributeDescriptions = [];
let swapchainImageCount = 0;
let swapchainImageViews = [];
let framebuffers = [];
let cmdBuffers = [];

let mModel = mat4.create();
let mView = mat4.create();
let mProjection = mat4.create();

let vLightPosition = vec3.fromValues(1.0, 3.0, 2.0);
let vCameraPosition = vec3.fromValues(2.0, 2.0, 2.0);

let ubo = new Float32Array(
  mModel.length +
  mView.length +
  mProjection.length +
  (vLightPosition.length + 1) +
  (vCameraPosition.length + 1) +
  4
);

let metallness = 0.0;
let roughness = 0.01;

let t0 = 0;
let frames = 0;

let mesh = {
  positions: null,
  indices: null
};

tolw.init(() => {
  let bin = readBinaryFile(`./assets/material_sphere.obj`);
  let obj = tolw.loadObj(bin);
  let { shapes, attrib } = obj;
  let vertices = [];
  let indices = [];
  let uniqueVertices = [];
  for (let shape of shapes) {
    for (let index of shape.mesh.indices) {
      let pos = {
        x: attrib.vertices[3 * index.vertex_index + 0],
        y: attrib.vertices[3 * index.vertex_index + 2],
        z: attrib.vertices[3 * index.vertex_index + 1]
      };
      let normal = {
        x: attrib.normals[3 * index.normal_index + 0],
        y: attrib.normals[3 * index.normal_index + 2],
        z: attrib.normals[3 * index.normal_index + 1]
      };
      let texCoord = {
        x: attrib.texcoords[2 * index.texcoord_index + 0],
        y: 1.0 - attrib.texcoords[2 * index.texcoord_index + 1]
      };
      vertices.push(
        pos.x, pos.y, pos.z,
        normal.x, normal.y, normal.z,
        texCoord.x, texCoord.y
      );
      indices.push(indices.length);
    };
  };
  mesh.positions = new Float32Array(vertices);
  mesh.indices = new Uint16Array(indices);
  init();
});

function init() {
  console.log(`Creating transforms..`);
  createTransforms();
  console.log(`Creating instance..`);
  createInstance();
  console.log(`Creating window surface..`);
  createWindowSurface();
  console.log(`Creating physical device..`);
  createPhysicalDevice();
  console.log(`Creating logical device..`);
  createLogicalDevice();
  console.log(`Creating queue..`);
  createQueue();
  console.log(`Creating swapchain..`);
  createSwapchain();
  console.log(`Creating swapchain image views..`);
  createSwapchainImageViews();
  console.log(`Creating renderpass..`);
  createRenderPass();
  console.log(`Creating attribute descriptions..`);
  createAttributeDescriptions();
  console.log(`Creating descriptor layout..`);
  createDescriptorSetLayout();
  console.log(`Creating graphics pipeline..`);
  createGraphicsPipeline();
  console.log(`Creating command pool..`);
  createCommandPool();
  console.log(`Creating depth resources..`);
  createDepthResources();
  console.log(`Creating framebuffers..`);
  createFramebuffers();
  console.log(`Creating command buffers..`);
  createCommandBuffers();
  console.log(`Uploading buffers..`);
  uploadBuffers();
  console.log(`Creating descriptor pool..`);
  createDescriptorPool();
  console.log(`Creating descriptor set..`);
  createDescriptorSet();
  console.log(`Recording command buffers..`);
  recordCommandBuffers();
  console.log(`Creating semaphores..`);
  createSemaphores();
  console.log(`Intializing draw loop..`);
  drawLoop();
};

function readBinaryFile(path) {
  return new Uint8Array(fs.readFileSync(path, null));
};

function createShaderModule(shaderSrc, shaderModule) {
  let shaderModuleInfo = new VkShaderModuleCreateInfo();
  shaderModuleInfo.pCode = shaderSrc;
  shaderModuleInfo.codeSize = shaderSrc.byteLength;
  result = vkCreateShaderModule(device, shaderModuleInfo, null, shaderModule);
  ASSERT_VK_RESULT(result);
  return shaderModule;
};

function recreateSwapchain() {
  let oldSwapchain = swapchain;
  createSurfaceCapabilities();
  vkDeviceWaitIdle(device);
  destroySwapchain();
  createSwapchain();
  createSwapchainImageViews();
  createRenderPass();
  //createGraphicsPipeline();
  createCommandPool();
  createDepthResources();
  createFramebuffers();
  createCommandBuffers();
  recordCommandBuffers();
  vkDestroySwapchainKHR(device, oldSwapchain, null);
};

function destroySwapchain() {
  vkFreeCommandBuffers(device, cmdPool, swapchainImageCount, cmdBuffers);
  cmdBuffers = [];
  vkDestroyCommandPool(device, cmdPool, null);
  for (let ii = 0; ii < swapchainImageCount; ++ii) {
    vkDestroyFramebuffer(device, framebuffers[ii], null);
  };
  framebuffers = [];
  //vkDestroyPipeline(device, pipeline, null);
  vkDestroyRenderPass(device, renderPass, null);
  for (let ii = 0; ii < swapchainImageCount; ++ii) {
    vkDestroyImageView(device, swapchainImageViews[ii], null);
  };
  swapchainImageViews = [];
  //vkDestroyPipelineLayout(device, pipelineLayout, null);
  //vkDestroyShaderModule(device, vertShaderModule, null);
  //vkDestroyShaderModule(device, fragShaderModule, null);
};

function createSurfaceCapabilities() {
  let surfaceCapabilities = new VkSurfaceCapabilitiesKHR();
  vkGetPhysicalDeviceSurfaceCapabilitiesKHR(physicalDevice, surface, surfaceCapabilities);
};

function createTransforms() {
  // view
  mat4.lookAt(
    mView,
    vCameraPosition,
    vec3.fromValues(0.0, 0.0, 0.0),
    vec3.fromValues(0.0, 0.0, 1.0)
  );
  for (let ii = 0; ii < mView.length; ++ii) ubo[16 + ii] = mView[ii];
  // projection
  mat4.perspective(
    mProjection,
    45.0 * Math.PI / 180,
    win.width / win.height,
    1.0,
    4096.0
  );
  mProjection[5] *= -1.0;
  for (let ii = 0; ii < mProjection.length; ++ii) ubo[32 + ii] = mProjection[ii];
};

function createInstance() {
  // app info
  let appInfo = new VkApplicationInfo({
    pApplicationName: "Hello!",
    applicationVersion: VK_MAKE_VERSION(1, 0, 0),
    pEngineName: "No Engine",
    engineVersion: VK_MAKE_VERSION(1, 0, 0),
    apiVersion: VK_API_VERSION_1_0
  });

  let validationLayers = [];
  let instanceExtensions = win.getRequiredInstanceExtensions();

  // create info
  let createInfo = new VkInstanceCreateInfo({
    pApplicationInfo: appInfo,
    enabledExtensionCount: instanceExtensions.length,
    ppEnabledExtensionNames: instanceExtensions,
    enabledLayerCount: validationLayers.length,
    ppEnabledLayerNames: validationLayers
  });

  result = vkCreateInstance(createInfo, null, instance);
  ASSERT_VK_RESULT(result);
};

function createWindowSurface() {
  result = win.createSurface(instance, null, surface);
  ASSERT_VK_RESULT(result);
};

function createPhysicalDevice() {
  let deviceCount = { $:0 };
  vkEnumeratePhysicalDevices(instance, deviceCount, null);
  if (deviceCount.$ <= 0) console.error("Error: No render devices available!");

  let devices = [...Array(deviceCount.$)].map(() => new VkPhysicalDevice());
  result = vkEnumeratePhysicalDevices(instance, deviceCount, devices);
  ASSERT_VK_RESULT(result);

  // auto pick first found device
  global.physicalDevice = devices[0];

  let deviceFeatures = new VkPhysicalDeviceFeatures();
  vkGetPhysicalDeviceFeatures(physicalDevice, deviceFeatures);

  let deviceProperties = new VkPhysicalDeviceProperties();
  vkGetPhysicalDeviceProperties(physicalDevice, deviceProperties);

  console.log(`Using device: ${deviceProperties.deviceName}`);

  let deviceMemoryProperties = new VkPhysicalDeviceMemoryProperties();
  vkGetPhysicalDeviceMemoryProperties(physicalDevice, deviceMemoryProperties);

  let queueFamilyCount = { $: 0 };
  vkGetPhysicalDeviceQueueFamilyProperties(physicalDevice, queueFamilyCount, null);

  let queueFamilies = [...Array(queueFamilyCount.$)].map(() => new VkQueueFamilyProperties());
  vkGetPhysicalDeviceQueueFamilyProperties(physicalDevice, queueFamilyCount, queueFamilies);

  createSurfaceCapabilities();

  let surfaceFormatCount = { $: 0 };
  vkGetPhysicalDeviceSurfaceFormatsKHR(physicalDevice, surface, surfaceFormatCount, null);
  let surfaceFormats = [...Array(surfaceFormatCount.$)].map(() => new VkSurfaceFormatKHR());
  vkGetPhysicalDeviceSurfaceFormatsKHR(physicalDevice, surface, surfaceFormatCount, surfaceFormats);

  let presentModeCount = { $: 0 };
  vkGetPhysicalDeviceSurfacePresentModesKHR(physicalDevice, surface, presentModeCount, null);
  let presentModes = new Int32Array(presentModeCount.$);
  vkGetPhysicalDeviceSurfacePresentModesKHR(physicalDevice, surface, presentModeCount, presentModes);

  let surfaceSupport = { $: false };
  vkGetPhysicalDeviceSurfaceSupportKHR(physicalDevice, 0, surface, surfaceSupport);
  if (!surfaceSupport) console.error(`No surface creation support!`);
};

function createLogicalDevice() {
  let deviceQueueInfo = new VkDeviceQueueCreateInfo();
  deviceQueueInfo.queueFamilyIndex = 0;
  deviceQueueInfo.queueCount = 1;
  deviceQueueInfo.pQueuePriorities = new Float32Array([1.0, 1.0, 1.0, 1.0]);

  let deviceExtensions = [
    VK_KHR_SWAPCHAIN_EXTENSION_NAME
  ];

  let usedFeatures = new VkPhysicalDeviceFeatures();
  usedFeatures.samplerAnisotropy = true;

  let deviceInfo = new VkDeviceCreateInfo();
  deviceInfo.queueCreateInfoCount = 1;
  deviceInfo.pQueueCreateInfos = [deviceQueueInfo];
  deviceInfo.enabledExtensionCount = deviceExtensions.length;
  deviceInfo.ppEnabledExtensionNames = deviceExtensions;
  deviceInfo.pEnabledFeatures = usedFeatures;

  result = vkCreateDevice(physicalDevice, deviceInfo, null, device);
  ASSERT_VK_RESULT(result);
};

function createQueue() {
  vkGetDeviceQueue(device, 0, 0, queue);
};

function createSwapchain() {
  let imageExtent = new VkExtent2D();
  imageExtent.width = win.width;
  imageExtent.height = win.height;

  let swapchainInfo = new VkSwapchainCreateInfoKHR();
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
  swapchainInfo.clipped = true;
  swapchainInfo.oldSwapchain = swapchain || null;

  swapchain = new VkSwapchainKHR();
  result = vkCreateSwapchainKHR(device, swapchainInfo, null, swapchain);
  ASSERT_VK_RESULT(result);
};

function createSwapchainImageViews() {
  let amountOfImagesInSwapchain = { $: 0 };
  vkGetSwapchainImagesKHR(device, swapchain, amountOfImagesInSwapchain, null);
  let swapchainImages = [...Array(amountOfImagesInSwapchain.$)].map(() => new VkImage());

  result = vkGetSwapchainImagesKHR(device, swapchain, amountOfImagesInSwapchain, swapchainImages);
  ASSERT_VK_RESULT(result);

  let imageViews = [...Array(amountOfImagesInSwapchain.$)].map(() => new VkImageView());
  for (let ii = 0; ii < amountOfImagesInSwapchain.$; ++ii) {
    let components = new VkComponentMapping();
    components.r = VK_COMPONENT_SWIZZLE_IDENTITY;
    components.g = VK_COMPONENT_SWIZZLE_IDENTITY;
    components.b = VK_COMPONENT_SWIZZLE_IDENTITY;
    components.a = VK_COMPONENT_SWIZZLE_IDENTITY;
    let subresourceRange = new VkImageSubresourceRange();
    subresourceRange.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
    subresourceRange.baseMipLevel = 0;
    subresourceRange.levelCount = 1;
    subresourceRange.baseArrayLayer = 0;
    subresourceRange.layerCount = 1;
    let imageViewInfo = new VkImageViewCreateInfo();
    imageViewInfo.image = swapchainImages[ii];
    imageViewInfo.viewType = VK_IMAGE_VIEW_TYPE_2D;
    imageViewInfo.format = VK_FORMAT_B8G8R8A8_UNORM;
    imageViewInfo.components = components;
    imageViewInfo.subresourceRange = subresourceRange;
    result = vkCreateImageView(device, imageViewInfo, null, imageViews[ii])
    ASSERT_VK_RESULT(result);
  };
  swapchainImageViews = imageViews;
  swapchainImageCount = amountOfImagesInSwapchain.$;
};

function createRenderPass() {
  let colorAttachment = new VkAttachmentDescription();
  colorAttachment.flags = 0;
  colorAttachment.format = VK_FORMAT_B8G8R8A8_UNORM;
  colorAttachment.samples = VK_SAMPLE_COUNT_1_BIT;
  colorAttachment.loadOp = VK_ATTACHMENT_LOAD_OP_CLEAR;
  colorAttachment.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
  colorAttachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
  colorAttachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
  colorAttachment.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
  colorAttachment.finalLayout = VK_IMAGE_LAYOUT_PRESENT_SRC_KHR;

  let depthAttachment = new VkAttachmentDescription();
  depthAttachment.format = VK_FORMAT_D32_SFLOAT_S8_UINT;
  depthAttachment.samples = VK_SAMPLE_COUNT_1_BIT;
  depthAttachment.loadOp = VK_ATTACHMENT_LOAD_OP_CLEAR;
  depthAttachment.storeOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
  depthAttachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
  depthAttachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
  depthAttachment.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
  depthAttachment.finalLayout = VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL;

  let colorAttachmentReference = new VkAttachmentReference();
  colorAttachmentReference.attachment = 0;
  colorAttachmentReference.layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;

  let depthAttachmentReference = new VkAttachmentReference();
  depthAttachmentReference.attachment = 1;
  depthAttachmentReference.layout = VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL;

  let colorAttachments = [colorAttachmentReference];

  let subpassDescription = new VkSubpassDescription();
  subpassDescription.pipelineBindPoint = VK_PIPELINE_BIND_POINT_GRAPHICS;
  subpassDescription.colorAttachmentCount = colorAttachments.length;
  subpassDescription.pColorAttachments = colorAttachments;
  subpassDescription.pDepthStencilAttachment = depthAttachmentReference;

  let subpassDependency = new VkSubpassDependency();
  subpassDependency.srcSubpass = VK_SUBPASS_EXTERNAL;
  subpassDependency.dstSubpass = 0;
  subpassDependency.srcStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
  subpassDependency.dstStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
  subpassDependency.srcAccessMask = 0;
  subpassDependency.dstAccessMask = (
    VK_ACCESS_COLOR_ATTACHMENT_READ_BIT |
    VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT
  );
  subpassDependency.dependencyFlags = 0;

  let attachments = [colorAttachment, depthAttachment];

  let renderPassInfo = new VkRenderPassCreateInfo();
  renderPassInfo.attachmentCount = attachments.length;
  renderPassInfo.pAttachments = attachments;
  renderPassInfo.subpassCount = 1;
  renderPassInfo.pSubpasses = [subpassDescription];
  renderPassInfo.dependencyCount = 1;
  renderPassInfo.pDependencies = [subpassDependency];

  result = vkCreateRenderPass(device, renderPassInfo, null, renderPass);
  ASSERT_VK_RESULT(result);
};

function createAttributeDescriptions() {
  attributeDescriptions = [...Array(3)].map(() => new VkVertexInputAttributeDescription());
  // vertex
  attributeDescriptions[0].location = 0;
  attributeDescriptions[0].binding = 0;
  attributeDescriptions[0].format = VK_FORMAT_R32G32B32_SFLOAT;
  attributeDescriptions[0].offset = 0;
  // normal
  attributeDescriptions[1].location = 1;
  attributeDescriptions[1].binding = 0;
  attributeDescriptions[1].format = VK_FORMAT_R32G32B32_SFLOAT;
  attributeDescriptions[1].offset = 3 * mesh.positions.BYTES_PER_ELEMENT;
  // uvs
  attributeDescriptions[2].location = 2;
  attributeDescriptions[2].binding = 0;
  attributeDescriptions[2].format = VK_FORMAT_R32G32_SFLOAT;
  attributeDescriptions[2].offset = 6 * mesh.positions.BYTES_PER_ELEMENT;
};

function createDescriptorSetLayout() {
  let uboLayoutBinding = new VkDescriptorSetLayoutBinding();
  uboLayoutBinding.binding = 0;
  uboLayoutBinding.descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
  uboLayoutBinding.descriptorCount = 1;
  uboLayoutBinding.stageFlags = VK_SHADER_STAGE_VERTEX_BIT;
  uboLayoutBinding.pImmutableSamplers = null;

  let samplerLayoutBinding = new VkDescriptorSetLayoutBinding();
  samplerLayoutBinding.binding = 1;
  samplerLayoutBinding.descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
  samplerLayoutBinding.descriptorCount = 1;
  samplerLayoutBinding.stageFlags = VK_SHADER_STAGE_FRAGMENT_BIT;
  samplerLayoutBinding.pImmutableSamplers = null;

  let layoutInfo = new VkDescriptorSetLayoutCreateInfo();
  layoutInfo.bindingCount = 2;
  layoutInfo.pBindings = [uboLayoutBinding, samplerLayoutBinding];

  result = vkCreateDescriptorSetLayout(device, layoutInfo, null, descriptorSetLayout);
  ASSERT_VK_RESULT(result);
};

function createGraphicsPipeline() {
  vertShaderModule = createShaderModule(vertSrc, new VkShaderModule());
  fragShaderModule = createShaderModule(fragSrc, new VkShaderModule());

  let posVertexBindingDescr = new VkVertexInputBindingDescription();
  posVertexBindingDescr.binding = 0;
  posVertexBindingDescr.stride = 8 * mesh.positions.BYTES_PER_ELEMENT;
  posVertexBindingDescr.inputRate = VK_VERTEX_INPUT_RATE_VERTEX;

  let shaderStageInfoVert = new VkPipelineShaderStageCreateInfo();
  shaderStageInfoVert.stage = VK_SHADER_STAGE_VERTEX_BIT;
  shaderStageInfoVert.module = vertShaderModule;
  shaderStageInfoVert.pName = "main";
  shaderStageInfoVert.pSpecializationInfo = null;

  let shaderStageInfoFrag = new VkPipelineShaderStageCreateInfo();
  shaderStageInfoFrag.stage = VK_SHADER_STAGE_FRAGMENT_BIT;
  shaderStageInfoFrag.module = fragShaderModule;
  shaderStageInfoFrag.pName = "main";
  shaderStageInfoFrag.pSpecializationInfo = null;

  let shaderStages = [shaderStageInfoVert, shaderStageInfoFrag];

  let vertexInputInfo = new VkPipelineVertexInputStateCreateInfo();
  vertexInputInfo.vertexBindingDescriptionCount = 1;
  vertexInputInfo.pVertexBindingDescriptions = [posVertexBindingDescr];
  vertexInputInfo.vertexAttributeDescriptionCount = attributeDescriptions.length;
  vertexInputInfo.pVertexAttributeDescriptions = attributeDescriptions;

  let inputAssemblyStateInfo = new VkPipelineInputAssemblyStateCreateInfo();
  inputAssemblyStateInfo.topology = VK_PRIMITIVE_TOPOLOGY_TRIANGLE_LIST;
  inputAssemblyStateInfo.primitiveRestartEnable = false;

  let viewport = new VkViewport();
  viewport.x = 0;
  viewport.y = 0;
  viewport.width = win.width;
  viewport.height = win.height;
  viewport.minDepth = 0.0;
  viewport.maxDepth = 1.0;

  let scissorOffset = new VkOffset2D();
  scissorOffset.x = 0;
  scissorOffset.y = 0;
  let scissorExtent = new VkExtent2D();
  scissorExtent.width = win.width;
  scissorExtent.height = win.height;
  let scissor = new VkRect2D();
  scissor.offset = scissorOffset;
  scissor.extent = scissorExtent;

  let viewportStateInfo = new VkPipelineViewportStateCreateInfo();
  viewportStateInfo.viewportCount = 1;
  viewportStateInfo.pViewports = [viewport];
  viewportStateInfo.scissorCount = 1;
  viewportStateInfo.pScissors = [scissor];

  let rasterizationInfo = new VkPipelineRasterizationStateCreateInfo();
  rasterizationInfo.depthClampEnable = false;
  rasterizationInfo.rasterizerDiscardEnable = false;
  rasterizationInfo.polygonMode = VK_POLYGON_MODE_FILL;
  rasterizationInfo.cullMode = VK_CULL_MODE_BACK_BIT;
  rasterizationInfo.frontFace = VK_FRONT_FACE_CLOCKWISE;
  rasterizationInfo.depthBiasEnable = false;
  rasterizationInfo.depthBiasConstantFactor = 0.0;
  rasterizationInfo.depthBiasClamp = 0.0;
  rasterizationInfo.depthBiasSlopeFactor = 0.0;
  rasterizationInfo.lineWidth = 1.0;

  let multisampleInfo = new VkPipelineMultisampleStateCreateInfo();
  multisampleInfo.rasterizationSamples = VK_SAMPLE_COUNT_1_BIT;
  multisampleInfo.sampleShadingEnable = false;
  multisampleInfo.minSampleShading = 1.0;
  multisampleInfo.pSampleMask = null;
  multisampleInfo.alphaToCoverageEnable = false;
  multisampleInfo.alphaToOneEnable = false;

  let depthStencilInfo = new VkPipelineDepthStencilStateCreateInfo();
  depthStencilInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_DEPTH_STENCIL_STATE_CREATE_INFO;
  depthStencilInfo.depthTestEnable = true;
  depthStencilInfo.depthWriteEnable = true;
  depthStencilInfo.depthCompareOp = VK_COMPARE_OP_LESS;
  depthStencilInfo.depthBoundsTestEnable = false;
  depthStencilInfo.stencilTestEnable = false;

  let colorBlendAttachment = new VkPipelineColorBlendAttachmentState();
  colorBlendAttachment.blendEnable = true;
  colorBlendAttachment.srcColorBlendFactor = VK_BLEND_FACTOR_SRC_ALPHA;
  colorBlendAttachment.dstColorBlendFactor = VK_BLEND_FACTOR_ONE_MINUS_SRC_ALPHA;
  colorBlendAttachment.colorBlendOp = VK_BLEND_OP_ADD;
  colorBlendAttachment.srcAlphaBlendFactor = VK_BLEND_FACTOR_ONE;
  colorBlendAttachment.dstAlphaBlendFactor = VK_BLEND_FACTOR_ZERO;
  colorBlendAttachment.alphaBlendOp = VK_BLEND_OP_ADD;
  colorBlendAttachment.colorWriteMask = (
    VK_COLOR_COMPONENT_R_BIT |
    VK_COLOR_COMPONENT_G_BIT |
    VK_COLOR_COMPONENT_B_BIT |
    VK_COLOR_COMPONENT_A_BIT
  );

  let colorBlendInfo = new VkPipelineColorBlendStateCreateInfo();
  colorBlendInfo.logicOpEnable = false;
  colorBlendInfo.logicOp = VK_LOGIC_OP_NO_OP;
  colorBlendInfo.attachmentCount = 1;
  colorBlendInfo.pAttachments = [colorBlendAttachment];
  colorBlendInfo.blendConstants = [0.0, 0.0, 0.0, 0.0];

  let dynamicStates = new Int32Array([
    VK_DYNAMIC_STATE_VIEWPORT,
    VK_DYNAMIC_STATE_SCISSOR
  ]);

  let pipelineDynamicStateInfo = new VkPipelineDynamicStateCreateInfo();
  pipelineDynamicStateInfo.dynamicStateCount = dynamicStates.length;
  pipelineDynamicStateInfo.pDynamicStates = dynamicStates;

  let pipelineLayoutInfo = new VkPipelineLayoutCreateInfo();
  pipelineLayoutInfo.setLayoutCount = 1;
  pipelineLayoutInfo.pSetLayouts = [descriptorSetLayout];
  pipelineLayoutInfo.pushConstantRangeCount = 0;

  result = vkCreatePipelineLayout(device, pipelineLayoutInfo, null, pipelineLayout);
  ASSERT_VK_RESULT(result);

  let graphicsPipelineInfo = new VkGraphicsPipelineCreateInfo();
  graphicsPipelineInfo.stageCount = shaderStages.length;
  graphicsPipelineInfo.pStages = shaderStages;
  graphicsPipelineInfo.pVertexInputState = vertexInputInfo;
  graphicsPipelineInfo.pInputAssemblyState = inputAssemblyStateInfo;
  graphicsPipelineInfo.pTessellationState = null;
  graphicsPipelineInfo.pViewportState = viewportStateInfo;
  graphicsPipelineInfo.pRasterizationState = rasterizationInfo;
  graphicsPipelineInfo.pMultisampleState = multisampleInfo;
  graphicsPipelineInfo.pDepthStencilState = depthStencilInfo;
  graphicsPipelineInfo.pColorBlendState = colorBlendInfo;
  graphicsPipelineInfo.pDynamicState = pipelineDynamicStateInfo;
  graphicsPipelineInfo.layout = pipelineLayout;
  graphicsPipelineInfo.renderPass = renderPass;
  graphicsPipelineInfo.subpass = 0;
  graphicsPipelineInfo.basePipelineHandle = null;
  graphicsPipelineInfo.basePipelineIndex = -1;

  result = vkCreateGraphicsPipelines(device, null, 1, [graphicsPipelineInfo], null, [pipeline]);
  ASSERT_VK_RESULT(result);
};

function createFramebuffers() {
  framebuffers = [...Array(swapchainImageCount)].map(() => new VkFramebuffer());
  for (let ii = 0; ii < swapchainImageCount; ++ii) {
    let attachments = [
      swapchainImageViews[ii],
      depthImageView
    ];
    let framebufferInfo = new VkFramebufferCreateInfo();
    framebufferInfo.renderPass = renderPass;
    framebufferInfo.attachmentCount = attachments.length;
    framebufferInfo.pAttachments = attachments;
    framebufferInfo.width = win.width;
    framebufferInfo.height = win.height;
    framebufferInfo.layers = 1;
    result = vkCreateFramebuffer(device, framebufferInfo, null, framebuffers[ii]);
    ASSERT_VK_RESULT(result);
  };
};

function createCommandPool() {
  let cmdPoolInfo = new VkCommandPoolCreateInfo();
  cmdPoolInfo.flags = 0;
  cmdPoolInfo.queueFamilyIndex = 0;

  result = vkCreateCommandPool(device, cmdPoolInfo, null, cmdPool);
  ASSERT_VK_RESULT(result);
};

function createDepthResources() {
  let depthFormat = VK_FORMAT_D32_SFLOAT_S8_UINT;
  createImage({
    width: win.width,
    height: win.height,
    format: depthFormat,
    tiling: VK_IMAGE_TILING_OPTIMAL,
    usage: VK_IMAGE_USAGE_DEPTH_STENCIL_ATTACHMENT_BIT,
    properties: VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT,
    image: depthImage,
    imageMemory: depthImageMemory
  });
  depthImageView = createImageView({
    image: depthImage,
    format: depthFormat,
    aspectFlags: VK_IMAGE_ASPECT_DEPTH_BIT
  });
  transitionImageLayout({
    image: depthImage,
    format: VK_FORMAT_D32_SFLOAT_S8_UINT,
    oldImageLayout: VK_IMAGE_LAYOUT_UNDEFINED,
    newImageLayout: VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL
  });
};

function createImage({ width, height, format, tiling, usage, properties, image, imageMemory } = opts) {
  let imageExtent = new VkExtent3D();
  imageExtent.width = win.width;
  imageExtent.height = win.height;
  imageExtent.depth = 1;
  let imageInfo = new VkImageCreateInfo();
  imageInfo.sType = VK_STRUCTURE_TYPE_IMAGE_CREATE_INFO;
  imageInfo.imageType = VK_IMAGE_TYPE_2D;
  imageInfo.extent = imageExtent;
  imageInfo.mipLevels = 1;
  imageInfo.arrayLayers = 1;
  imageInfo.format = format;
  imageInfo.tiling = tiling;
  imageInfo.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
  imageInfo.usage = usage;
  imageInfo.samples = VK_SAMPLE_COUNT_1_BIT;
  imageInfo.sharingMode = VK_SHARING_MODE_EXCLUSIVE;

  result = vkCreateImage(device, imageInfo, null, image);
  ASSERT_VK_RESULT(result);

  let memRequirements = new VkMemoryRequirements();
  vkGetImageMemoryRequirements(device, image, memRequirements);

  let allocInfo = new VkMemoryAllocateInfo();
  allocInfo.sType = VK_STRUCTURE_TYPE_MEMORY_ALLOCATE_INFO;
  allocInfo.allocationSize = memRequirements.size;
  allocInfo.memoryTypeIndex = getMemoryTypeIndex(memRequirements.memoryTypeBits, properties);

  result = vkAllocateMemory(device, allocInfo, null, imageMemory);
  ASSERT_VK_RESULT(result);

  vkBindImageMemory(device, image, imageMemory, 0);
};

export function transitionImageLayout({ image, format, oldImageLayout, newImageLayout } = opts) {
  let cmdBufferAllocInfo = new VkCommandBufferAllocateInfo();
  cmdBufferAllocInfo.commandPool = cmdPool;
  cmdBufferAllocInfo.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
  cmdBufferAllocInfo.commandBufferCount = 1;

  let cmdBuffer = new VkCommandBuffer();
  result = vkAllocateCommandBuffers(device, cmdBufferAllocInfo, [cmdBuffer]);
  ASSERT_VK_RESULT(result);

  let cmdBufferBeginInfo = new VkCommandBufferBeginInfo();
  cmdBufferBeginInfo.flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT;
  cmdBufferBeginInfo.pInheritanceInfo = null;

  result = vkBeginCommandBuffer(cmdBuffer, cmdBufferBeginInfo);
  ASSERT_VK_RESULT(result);

  let subresourceRange = new VkImageSubresourceRange();
  subresourceRange.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
  subresourceRange.baseMipLevel = 0;
  subresourceRange.levelCount = 1;
  subresourceRange.baseArrayLayer = 0;
  subresourceRange.layerCount = 1;

  if (newImageLayout == VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL) {
    subresourceRange.aspectMask = VK_IMAGE_ASPECT_DEPTH_BIT;
    if (format == VK_FORMAT_D32_SFLOAT_S8_UINT || format == VK_FORMAT_D24_UNORM_S8_UINT) {
      subresourceRange.aspectMask |= VK_IMAGE_ASPECT_STENCIL_BIT;
    }
  }

  let srcAccessMask = 0;
  let dstAccessMask = 0;
  let srcStage = 0;
  let dstStage = 0;
  if (
    (oldImageLayout === VK_IMAGE_LAYOUT_UNDEFINED) &&
    (newImageLayout === VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL)
  ) {
    srcAccessMask = 0;
    dstAccessMask = VK_ACCESS_TRANSFER_WRITE_BIT;
    srcStage = VK_PIPELINE_STAGE_TOP_OF_PIPE_BIT;
    dstStage = VK_PIPELINE_STAGE_TRANSFER_BIT;
  }
  else if (
    (oldImageLayout === VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL) &&
    (newImageLayout === VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL)
  ) {
    srcAccessMask = VK_ACCESS_TRANSFER_WRITE_BIT;
    dstAccessMask = VK_ACCESS_SHADER_READ_BIT;
    srcStage = VK_PIPELINE_STAGE_TRANSFER_BIT;
    dstStage = VK_PIPELINE_STAGE_FRAGMENT_SHADER_BIT;
  }
  else if (
    (oldImageLayout === VK_IMAGE_LAYOUT_UNDEFINED) &&
    (newImageLayout === VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL)
  ) {
    srcAccessMask = 0;
    dstAccessMask = VK_ACCESS_DEPTH_STENCIL_ATTACHMENT_READ_BIT | VK_ACCESS_DEPTH_STENCIL_ATTACHMENT_WRITE_BIT;
    srcStage = VK_PIPELINE_STAGE_TOP_OF_PIPE_BIT;
    dstStage = VK_PIPELINE_STAGE_EARLY_FRAGMENT_TESTS_BIT;
  }

  let imageMemoryBarrier = new VkImageMemoryBarrier();
  imageMemoryBarrier.srcAccessMask = srcAccessMask;
  imageMemoryBarrier.dstAccessMask = dstAccessMask;
  imageMemoryBarrier.oldLayout = oldImageLayout;
  imageMemoryBarrier.newLayout = newImageLayout;
  imageMemoryBarrier.srcQueueFamilyIndex = VK_QUEUE_FAMILY_IGNORED;
  imageMemoryBarrier.dstQueueFamilyIndex = VK_QUEUE_FAMILY_IGNORED;
  imageMemoryBarrier.image = image;
  imageMemoryBarrier.subresourceRange = subresourceRange;

  vkCmdPipelineBarrier(
    cmdBuffer,
    srcStage, dstStage,
    0,
    0, null,
    0, null,
    1, [imageMemoryBarrier]
  );

  result = vkEndCommandBuffer(cmdBuffer);
  ASSERT_VK_RESULT(result);

  let submitInfo = new VkSubmitInfo();
  submitInfo.waitSemaphoreCount = 0;
  submitInfo.pWaitSemaphores = null;
  submitInfo.pWaitDstStageMask = null;
  submitInfo.commandBufferCount = 1;
  submitInfo.pCommandBuffers = [cmdBuffer];
  submitInfo.signalSemaphoreCount = 0;
  submitInfo.pSignalSemaphores = null;

  vkQueueSubmit(queue, 1, [submitInfo], null);
  vkQueueWaitIdle(queue);
};

function createImageView({ image, format, aspectFlags } = opts) {
  let subresourceRange = new VkImageSubresourceRange();
  subresourceRange.aspectMask = aspectFlags;
  subresourceRange.baseMipLevel = 0;
  subresourceRange.levelCount = 1;
  subresourceRange.baseArrayLayer = 0;
  subresourceRange.layerCount = 1;
  let viewInfo = new VkImageViewCreateInfo();
  viewInfo.sType = VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO;
  viewInfo.image = image;
  viewInfo.viewType = VK_IMAGE_VIEW_TYPE_2D;
  viewInfo.format = format;
  viewInfo.subresourceRange = subresourceRange;

  let imageView = new VkImageView();
  result = vkCreateImageView(device, viewInfo, null, imageView);
  ASSERT_VK_RESULT(result);
  return imageView;
};

function createCommandBuffers() {
  let cmdBufferAllocInfo = new VkCommandBufferAllocateInfo();
  cmdBufferAllocInfo.commandPool = cmdPool;
  cmdBufferAllocInfo.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
  cmdBufferAllocInfo.commandBufferCount = swapchainImageCount;
  cmdBuffers = [...Array(swapchainImageCount)].map(() => new VkCommandBuffer());

  result = vkAllocateCommandBuffers(device, cmdBufferAllocInfo, cmdBuffers);
  ASSERT_VK_RESULT(result);
};

function uploadBuffers() {
  uploadBufferData({
    data: mesh.positions,
    usage: VK_BUFFER_USAGE_VERTEX_BUFFER_BIT,
    buffer: vertexBuffer,
    bufferMemory: vertexBufferMemory
  });
  uploadBufferData({
    data: mesh.indices,
    usage: VK_BUFFER_USAGE_INDEX_BUFFER_BIT,
    buffer: indexBuffer,
    bufferMemory: indexBufferMemory
  });
  createBuffer({
    size: ubo.byteLength,
    usage: VK_BUFFER_USAGE_UNIFORM_BUFFER_BIT,
    buffer: uniformBuffer,
    bufferMemory: uniformBufferMemory,
    propertyFlags: VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT
  });
};

function createDescriptorPool() {
  let descriptorPoolSize = new VkDescriptorPoolSize();
  descriptorPoolSize.type = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
  descriptorPoolSize.descriptorCount = 1;

  let samplerDescriptorPoolSize = new VkDescriptorPoolSize();
  samplerDescriptorPoolSize.type = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
  samplerDescriptorPoolSize.descriptorCount = 1;

  let descriptorPoolInfo = new VkDescriptorPoolCreateInfo();
  descriptorPoolInfo.maxSets = 1;
  descriptorPoolInfo.poolSizeCount = 2;
  descriptorPoolInfo.pPoolSizes = [descriptorPoolSize, samplerDescriptorPoolSize];
  result = vkCreateDescriptorPool(device, descriptorPoolInfo, null, descriptorPool);
  ASSERT_VK_RESULT(result);
};

function createDescriptorSet() {
  let descriptorSetAllocInfo = new VkDescriptorSetAllocateInfo();
  descriptorSetAllocInfo.descriptorPool = descriptorPool;
  descriptorSetAllocInfo.descriptorSetCount = 1;
  descriptorSetAllocInfo.pSetLayouts = [descriptorSetLayout];
  result = vkAllocateDescriptorSets(device, descriptorSetAllocInfo, [descriptorSet]);
  ASSERT_VK_RESULT(result);

  let bufferInfo = new VkDescriptorBufferInfo();
  bufferInfo.buffer = uniformBuffer;
  bufferInfo.offset = 0;
  bufferInfo.range = ubo.byteLength;

  let writeDescriptorSet = new VkWriteDescriptorSet();
  writeDescriptorSet.dstSet = descriptorSet;
  writeDescriptorSet.dstBinding = 0;
  writeDescriptorSet.dstArrayElement = 0;
  writeDescriptorSet.descriptorCount = 1;
  writeDescriptorSet.descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
  writeDescriptorSet.pBufferInfo = [bufferInfo];

  vkUpdateDescriptorSets(device, 1, [writeDescriptorSet], 0, null);
};

function recordCommandBuffers() {
  let cmdBufferBeginInfo = new VkCommandBufferBeginInfo();
  cmdBufferBeginInfo.flags = VK_COMMAND_BUFFER_USAGE_SIMULTANEOUS_USE_BIT;
  cmdBufferBeginInfo.pInheritanceInfo = null;
  for (let ii = 0; ii < swapchainImageCount; ++ii) {
    let cmdBuffer = cmdBuffers[ii];
    result = vkBeginCommandBuffer(cmdBuffer, cmdBufferBeginInfo);
    ASSERT_VK_RESULT(result);

    let renderArea = new VkRect2D({
      offset: new VkOffset2D({ x: 0, y: 0 }),
      extent: new VkExtent2D({ width: win.width, height: win.height })
    });

    let colorClear = new VkClearValue();
    let clearColorValue = new VkClearColorValue();
    clearColorValue.float32 = [0.1, 0.1, 0.1, 1.0];
    colorClear.color = clearColorValue;

    let depthClear = new VkClearValue();
    let clearDepthStencilValue = new VkClearDepthStencilValue();
    clearDepthStencilValue.depth = 1.0;
    clearDepthStencilValue.stencil = 0.0;
    depthClear.depthStencil = clearDepthStencilValue;

    let renderPassBeginInfo = new VkRenderPassBeginInfo();
    renderPassBeginInfo.renderPass = renderPass;
    renderPassBeginInfo.framebuffer = framebuffers[ii];
    renderPassBeginInfo.renderArea = renderArea;
    renderPassBeginInfo.clearValueCount = 2;
    renderPassBeginInfo.pClearValues = [colorClear, depthClear];
    vkCmdBeginRenderPass(cmdBuffer, renderPassBeginInfo, VK_SUBPASS_CONTENTS_INLINE);

    vkCmdBindPipeline(cmdBuffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline);

    vkCmdBindVertexBuffers(cmdBuffer, 0, 1, [vertexBuffer], new BigUint64Array([0n]));
    vkCmdBindIndexBuffer(cmdBuffer, indexBuffer, 0, VK_INDEX_TYPE_UINT16);
    vkCmdBindDescriptorSets(cmdBuffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipelineLayout, 0, 1, [descriptorSet], 0, null);

    let viewport = new VkViewport();
    viewport.x = 0;
    viewport.y = 0;
    viewport.width = win.width;
    viewport.height = win.height;
    viewport.minDepth = 0.0;
    viewport.maxDepth = 1.0;
    vkCmdSetViewport(cmdBuffer, 0, 1, [viewport]);

    let scissor = new VkRect2D();
    let scissorOffset = new VkOffset2D();
    let scissorExtent = new VkExtent2D();
    scissor.offset = scissorOffset;
    scissor.extent = scissorExtent;
    scissorOffset.x = 0;
    scissorOffset.y = 0;
    scissorExtent.width = win.width;
    scissorExtent.height = win.height;
    scissor.offset = scissorOffset;
    scissor.extent = scissorExtent;
    vkCmdSetScissor(cmdBuffer, 0, 1, [scissor]);

    vkCmdDrawIndexed(cmdBuffer, mesh.indices.length, 1, 0, 0, 0);

    vkCmdEndRenderPass(cmdBuffer);

    result = vkEndCommandBuffer(cmdBuffer);
    ASSERT_VK_RESULT(result);
  };
};

function createSemaphores() {
  let semaphoreInfo = new VkSemaphoreCreateInfo();

  result = vkCreateSemaphore(device, semaphoreInfo, null, semaphoreImageAvailable);
  ASSERT_VK_RESULT(result);
  result = vkCreateSemaphore(device, semaphoreInfo, null, semaphoreRenderingDone);
  ASSERT_VK_RESULT(result);
};

function drawLoop() {
  // fps
  if (!win.shouldClose()) setTimeout(drawLoop, 0);
  let t = performance.now();
  if ((t - t0) > 1.0 || frames === 0) {
    let fps = Math.floor((frames / (t - t0)) * 1e3);
    win.title = `FPS: ${fps}`;
    t0 = t;
    frames = 0;
  }
  frames++;
  updateTransforms();
  drawFrame();
  win.pollEvents();
};

function updateTransforms() {
  let now = performance.now();

  // light
  for (let ii = 0; ii < vLightPosition.length; ++ii) ubo[48 + ii] = vLightPosition[ii];
  // camera
  for (let ii = 0; ii < vCameraPosition.length; ++ii) ubo[52 + ii] = vCameraPosition[ii];

  //let gg = (Math.sin(performance.now() * 0.001) + 1.0) / 2.0;
  ubo[56] = metallness;
  ubo[57] = roughness;

  // model
  mat4.identity(mModel);
  mat4.rotate(
    mModel,
    mModel,
    (60 + rotationX) * Math.PI / 180,
    vec3.fromValues(0.0, 0.0, 1.0)
  );
  rotationX += (!mousePressed ? 0.25 : 0.0) + rotationVeloX * 0.1;
  rotationVeloX *= 0.9;
  for (let ii = 0; ii < mModel.length; ++ii) ubo[0 + ii] = mModel[ii];

  // upload
  let dataPtr = { $: 0n };
  vkMapMemory(device, uniformBufferMemory, 0, ubo.byteLength, 0, dataPtr);
  memoryCopy(dataPtr.$, ubo, ubo.byteLength);
  vkUnmapMemory(device, uniformBufferMemory);
};

function drawFrame() {
  let imageIndex = { $: 0 };
  result = vkAcquireNextImageKHR(device, swapchain, Number.MAX_SAFE_INTEGER, semaphoreImageAvailable, null, imageIndex);
  ASSERT_VK_RESULT(result);

  let waitStageMask = new Int32Array([
    VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT
  ]);

  let submitInfo = new VkSubmitInfo();
  submitInfo.waitSemaphoreCount = 1;
  submitInfo.pWaitSemaphores = [semaphoreImageAvailable];
  submitInfo.pWaitDstStageMask = waitStageMask;
  submitInfo.commandBufferCount = 1;
  submitInfo.pCommandBuffers = [cmdBuffers[imageIndex.$]];
  submitInfo.signalSemaphoreCount = 1;
  submitInfo.pSignalSemaphores = [semaphoreRenderingDone];

  result = vkQueueSubmit(queue, 1, [submitInfo], null);
  ASSERT_VK_RESULT(result);

  let presentInfo = new VkPresentInfoKHR();
  presentInfo.waitSemaphoreCount = 1;
  presentInfo.pWaitSemaphores = [semaphoreRenderingDone];
  presentInfo.swapchainCount = 1;
  presentInfo.pSwapchains = [swapchain];
  presentInfo.pImageIndices = new Uint32Array([imageIndex.$]);
  presentInfo.pResults = null;

  result = vkQueuePresentKHR(queue, presentInfo);
  if (result === VK_SUBOPTIMAL_KHR || result === VK_ERROR_OUT_OF_DATE_KHR) {
    win.onresize();
  } else {
    ASSERT_VK_RESULT(result);
  }
};
