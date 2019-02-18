import fs from "fs";
import nvk from "nvk";
import { performance } from "perf_hooks";
import glm from "gl-matrix"; const { vec3, mat4 } = glm;

import Cube from "./cube";
import Texture2D from "./texture-2d";

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
  title: "nvk cube"
});

global.ASSERT_VK_RESULT = result => {
  if (result !== VK_SUCCESS) throw new Error(`Vulkan assertion failed!`);
};

win.onresize = (e) => {
  recreateSwapchain();
  createTransforms();
};

let vertSrc = readBinaryFile("./shaders/cube-vert.spv");
let fragSrc = readBinaryFile("./shaders/cube-frag.spv");

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

let cube = new Cube();
let cubeMesh = cube.getMesh();
let cubeIndices = cube.getIndices();

let grassImage = new Texture2D().fromImagePath("./assets/grass-block.png");

let mModel = mat4.create();
let mView = mat4.create();
let mProjection = mat4.create();

let vCameraPosition = vec3.fromValues(4.0, 4.0, 4.0);
let vLightPosition = vec3.fromValues(1.0, 3.0, 2.0);

let ubo = new Float32Array(
  mModel.length +
  mView.length +
  mProjection.length +
  vLightPosition.length
);

let lastFrame = 0;

createTransforms();
createInstance();
createWindowSurface();
createPhysicalDevice();
createLogicalDevice();
createQueue();
createSwapchain();
createSwapchainImageViews();
createRenderPass();
createAttributeDescriptions();
createDescriptorSetLayout();
createGraphicsPipeline();
createFramebuffers();
createCommandPool();
createCommandBuffers();
uploadBuffers();
createDescriptorPool();
createDescriptorSet();
recordCommandBuffers();
createSemaphores();
drawLoop();

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
  createFramebuffers();
  createCommandPool();
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
  let appInfo = new VkApplicationInfo();
  appInfo.pApplicationName = "Hello!";
  appInfo.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
  appInfo.pEngineName = "No Engine";
  appInfo.engineVersion = VK_MAKE_VERSION(1, 0, 0);
  appInfo.apiVersion = VK_API_VERSION_1_0;

  // create info
  let createInfo = new VkInstanceCreateInfo();
  createInfo.pApplicationInfo = appInfo;

  let instanceExtensions = win.getRequiredInstanceExtensions();
  createInfo.enabledExtensionCount = instanceExtensions.length;
  createInfo.ppEnabledExtensionNames = instanceExtensions;
  createInfo.enabledLayerCount = 0;

  // validation layers
  let validationLayers = [];
  createInfo.enabledLayerCount = validationLayers.length;
  createInfo.ppEnabledLayerNames = validationLayers;

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
  swapchainInfo.clipped = VK_TRUE;
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
  let attachmentDescription = new VkAttachmentDescription();
  attachmentDescription.flags = 0;
  attachmentDescription.format = VK_FORMAT_B8G8R8A8_UNORM;
  attachmentDescription.samples = VK_SAMPLE_COUNT_1_BIT;
  attachmentDescription.loadOp = VK_ATTACHMENT_LOAD_OP_CLEAR;
  attachmentDescription.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
  attachmentDescription.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
  attachmentDescription.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
  attachmentDescription.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
  attachmentDescription.finalLayout = VK_IMAGE_LAYOUT_PRESENT_SRC_KHR;

  let attachmentReference = new VkAttachmentReference();
  attachmentReference.attachment = 0;
  attachmentReference.layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;

  let subpassDescription = new VkSubpassDescription();
  subpassDescription.pipelineBindPoint = VK_PIPELINE_BIND_POINT_GRAPHICS;
  subpassDescription.inputAttachmentCount = 0;
  subpassDescription.pInputAttachments = null;
  subpassDescription.colorAttachmentCount = 1;
  subpassDescription.pColorAttachments = [attachmentReference];
  subpassDescription.pResolveAttachments = null;
  subpassDescription.pDepthStencilAttachment = null;
  subpassDescription.preserveAttachmentCount = 0;
  subpassDescription.pPreserveAttachments = null;

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

  let renderPassInfo = new VkRenderPassCreateInfo();
  renderPassInfo.attachmentCount = 1;
  renderPassInfo.pAttachments = [attachmentDescription];
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
  attributeDescriptions[1].offset = 3 * cubeMesh.BYTES_PER_ELEMENT;
  // uvs
  attributeDescriptions[2].location = 2;
  attributeDescriptions[2].binding = 0;
  attributeDescriptions[2].format = VK_FORMAT_R32G32_SFLOAT;
  attributeDescriptions[2].offset = 6 * cubeMesh.BYTES_PER_ELEMENT;
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
  posVertexBindingDescr.stride = 8 * cubeMesh.BYTES_PER_ELEMENT;
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
  rasterizationInfo.frontFace = VK_FRONT_FACE_COUNTER_CLOCKWISE;
  rasterizationInfo.depthBiasEnable = false;
  rasterizationInfo.depthBiasConstantFactor = 0.0;
  rasterizationInfo.depthBiasClamp = 0.0;
  rasterizationInfo.depthBiasSlopeFactor = 0.0;
  rasterizationInfo.lineWidth = 1.0;

  let multisampleInfo = new VkPipelineMultisampleStateCreateInfo();
  multisampleInfo.rasterizationSamples = VK_SAMPLE_COUNT_1_BIT;
  multisampleInfo.minSampleShading = 1.0;
  multisampleInfo.pSampleMask = null;
  multisampleInfo.alphaToCoverageEnable = false;
  multisampleInfo.alphaToOneEnable = false;

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
  graphicsPipelineInfo.pDepthStencilState = null;
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
    let framebufferInfo = new VkFramebufferCreateInfo();
    framebufferInfo.renderPass = renderPass;
    framebufferInfo.attachmentCount = 1;
    framebufferInfo.pAttachments = [swapchainImageViews[ii]];
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
    data: cubeMesh,
    usage: VK_BUFFER_USAGE_VERTEX_BUFFER_BIT,
    buffer: vertexBuffer,
    bufferMemory: vertexBufferMemory
  });
  uploadBufferData({
    data: cubeIndices,
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
  grassImage.upload();
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

  let descriptorImageInfo = new VkDescriptorImageInfo();
  descriptorImageInfo.sampler = grassImage.sampler;
  descriptorImageInfo.imageView = grassImage.imageView;
  descriptorImageInfo.imageLayout = VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL;

  let writeDescriptorSetSampler = new VkWriteDescriptorSet();
  writeDescriptorSetSampler.dstSet = descriptorSet;
  writeDescriptorSetSampler.dstBinding = 1;
  writeDescriptorSetSampler.dstArrayElement = 0;
  writeDescriptorSetSampler.descriptorCount = 1;
  writeDescriptorSetSampler.descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
  writeDescriptorSetSampler.pImageInfo = [descriptorImageInfo];

  vkUpdateDescriptorSets(device, 2, [writeDescriptorSet, writeDescriptorSetSampler], 0, null);
};

function recordCommandBuffers() {
  let cmdBufferBeginInfo = new VkCommandBufferBeginInfo();
  cmdBufferBeginInfo.flags = VK_COMMAND_BUFFER_USAGE_SIMULTANEOUS_USE_BIT;
  cmdBufferBeginInfo.pInheritanceInfo = null;
  for (let ii = 0; ii < swapchainImageCount; ++ii) {
    let cmdBuffer = cmdBuffers[ii];
    result = vkBeginCommandBuffer(cmdBuffer, cmdBufferBeginInfo);
    ASSERT_VK_RESULT(result);

    let offset = new VkOffset2D();
    offset.x = 0;
    offset.y = 0;
    let extent = new VkExtent2D();
    extent.width = win.width;
    extent.height = win.height;
    let renderArea = new VkRect2D();
    renderArea.offset = offset;
    renderArea.extent = extent;

    let clearValue = new VkClearValue();

    let renderPassBeginInfo = new VkRenderPassBeginInfo();
    renderPassBeginInfo.renderPass = renderPass;
    renderPassBeginInfo.framebuffer = framebuffers[ii];
    renderPassBeginInfo.renderArea = renderArea;
    renderPassBeginInfo.clearValueCount = 1;
    renderPassBeginInfo.pClearValues = [clearValue];
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

    let scissorOffset = new VkOffset2D();
    scissorOffset.x = 0;
    scissorOffset.y = 0;
    let scissorExtent = new VkExtent2D();
    scissorExtent.width = win.width;
    scissorExtent.height = win.height;
    let scissor = new VkRect2D();
    scissor.offset = scissorOffset;
    scissor.extent = scissorExtent;
    vkCmdSetScissor(cmdBuffer, 0, 1, [scissor]);

    vkCmdDrawIndexed(cmdBuffer, cubeIndices.length, 1, 0, 0, 0);

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
  if (!win.shouldClose()) setTimeout(drawLoop, 0);
  let now = performance.now();
  let delta = (lastFrame - now) | 0;
  updateTransforms();
  drawFrame();
  win.pollEvents();
  win.title = `Vulkan ${delta}`;
  lastFrame = now;
};

function updateTransforms() {
  let now = performance.now();

  // light
  for (let ii = 0; ii < vLightPosition.length; ++ii) ubo[48 + ii] = vLightPosition[ii];
  // model
  mat4.identity(mModel);
  mat4.rotate(
    mModel,
    mModel,
    (now / 1e3) * (90 * Math.PI / 180),
    vec3.fromValues(0.0, 0.0, 1.0)
  );
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
