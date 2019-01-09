import fs from "fs";
import vk from "../../index";

Object.assign(global, vk);

let vertices = new Float32Array([
   0.0, -0.5,
   0.5,  0.5,
  -0.5,  0.5 
]);
let vertexBuffer = new VkBuffer();
let vertexBufferMemory = new VkDeviceMemory();

let posVertexBindingDescr = new VkVertexInputBindingDescription();
posVertexBindingDescr.binding = 0;
posVertexBindingDescr.stride = 2 * vertices.BYTES_PER_ELEMENT;
posVertexBindingDescr.inputRate = VK_VERTEX_INPUT_RATE_VERTEX;

let posVertexAttrDescr = new VkVertexInputAttributeDescription();
posVertexAttrDescr.location = 0;
posVertexAttrDescr.binding = 0;
posVertexAttrDescr.format = VK_FORMAT_R32G32_SFLOAT;
posVertexAttrDescr.offset = 0;

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

function createVertexBuffer(buffer, bufferMemory, byteLength) {
  let bufferInfo = new VkBufferCreateInfo();
  bufferInfo.sType = VK_STRUCTURE_TYPE_BUFFER_CREATE_INFO;
  bufferInfo.size = byteLength;
  bufferInfo.usage = VK_BUFFER_USAGE_VERTEX_BUFFER_BIT;
  bufferInfo.sharingMode = VK_SHARING_MODE_EXCLUSIVE;
  bufferInfo.queueFamilyIndexCount = 0;
  bufferInfo.pQueueFamilyIndices = null;
  result = vkCreateBuffer(device, bufferInfo, null, buffer);
  ASSERT_VK_RESULT(result);

  let memoryRequirements = new VkMemoryRequirements();
  vkGetBufferMemoryRequirements(device, buffer, memoryRequirements);

  let propertyFlag = (
    VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT |
    VK_MEMORY_PROPERTY_HOST_COHERENT_BIT
  );
  let memAllocInfo = new VkMemoryAllocateInfo();
  memAllocInfo.sType = VK_STRUCTURE_TYPE_MEMORY_ALLOCATE_INFO;
  memAllocInfo.allocationSize = memoryRequirements.size;
  memAllocInfo.memoryTypeIndex = getMemoryTypeIndex(memoryRequirements.memoryTypeBits, propertyFlag);

  result = vkAllocateMemory(device, memAllocInfo, null, bufferMemory);
  ASSERT_VK_RESULT(result);

  vkBindBufferMemory(device, buffer, bufferMemory, 0);

  let dataPtr = { $: 0n }; // BigInt, be careful!

  result = vkMapMemory(device, bufferMemory, 0, bufferInfo.size, 0, dataPtr);
  ASSERT_VK_RESULT(result);

  let verticesBuffer = createV8ArrayBufferFromMemory(dataPtr.$, bufferInfo.size);
  let verticesView = new Float32Array(verticesBuffer);
  for (let ii = 0; ii < vertices.length; ++ii) {
    verticesView[ii] = vertices[ii];
  };
  vkUnmapMemory(device, bufferMemory);

};

const vertSrc = getShaderFile("./shaders/triangle-vert.spv");
const fragSrc = getShaderFile("./shaders/triangle-frag.spv");

let result = null;

let device = new VkDevice();
let instance = new VkInstance();
let surface = new VkSurfaceKHR();
let swapchain = new VkSwapchainKHR();
let pipelineLayout = new VkPipelineLayout();
let renderPass = new VkRenderPass();
let pipeline = new VkPipeline();
let cmdPool = new VkCommandPool();
let queue = new VkQueue();
let semaphoreImageAvailable = new VkSemaphore();
let semaphoreRenderingAvailable = new VkSemaphore();

let amountOfLayers = { $: 0 };
vkEnumerateInstanceLayerProperties(amountOfLayers, null);
let layers = [...Array(amountOfLayers.$)].map(() => new VkLayerProperties());
vkEnumerateInstanceLayerProperties(amountOfLayers, layers);

let win = new VulkanWindow({
  width: 480,
  height: 320,
  title: "nvk triangle"
});

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

let instanceExtensions = win.getRequiredInstanceExtensions();
createInfo.enabledExtensionCount = instanceExtensions.length;
createInfo.ppEnabledExtensionNames = instanceExtensions;
createInfo.enabledLayerCount = 0;

// validation layers
let validationLayers = [
  "VK_LAYER_LUNARG_core_validation",
  "VK_LAYER_LUNARG_standard_validation"
];
createInfo.enabledLayerCount = validationLayers.length;
createInfo.ppEnabledLayerNames = validationLayers;

result = vkCreateInstance(createInfo, null, instance);
ASSERT_VK_RESULT(result);

result = win.createSurface(instance, null, surface);
ASSERT_VK_RESULT(result);

let deviceCount = { $:0 };
vkEnumeratePhysicalDevices(instance, deviceCount, null);
if (deviceCount.$ <= 0) console.error("Error: No render devices available!");

let devices = [...Array(deviceCount.$)].map(() => new VkPhysicalDevice());
result = vkEnumeratePhysicalDevices(instance, deviceCount, devices);
ASSERT_VK_RESULT(result);

// auto pick first found device
let physicalDevice = devices[0];

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

let surfaceFormatCount = { $: 0 };
vkGetPhysicalDeviceSurfaceFormatsKHR(physicalDevice, surface, surfaceFormatCount, null);
let surfaceFormats = [...Array(surfaceFormatCount.$)].map(() => new VkSurfaceFormatKHR());
vkGetPhysicalDeviceSurfaceFormatsKHR(physicalDevice, surface, surfaceFormatCount, surfaceFormats);

let presentModeCount = { $: 0 };
vkGetPhysicalDeviceSurfacePresentModesKHR(physicalDevice, surface, presentModeCount, null);
let presentModes = [...Array(presentModeCount.$)].map(() => 0);
vkGetPhysicalDeviceSurfacePresentModesKHR(physicalDevice, surface, presentModeCount, presentModes);

let deviceQueueInfo = new VkDeviceQueueCreateInfo();
deviceQueueInfo.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
deviceQueueInfo.queueFamilyIndex = 0;
deviceQueueInfo.queueCount = 1;
deviceQueueInfo.pQueuePriorities = new Float32Array([1.0, 1.0, 1.0, 1.0]);

let deviceExtensions = [
  VK_KHR_SWAPCHAIN_EXTENSION_NAME
];

let deviceInfo = new VkDeviceCreateInfo();
deviceInfo.sType = VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO;
deviceInfo.queueCreateInfoCount = 1;
deviceInfo.pQueueCreateInfos = [deviceQueueInfo];
deviceInfo.enabledExtensionCount = deviceExtensions.length;
deviceInfo.ppEnabledExtensionNames = deviceExtensions;
deviceInfo.pEnabledFeatures = new VkPhysicalDeviceFeatures();

result = vkCreateDevice(physicalDevice, deviceInfo, null, device);
ASSERT_VK_RESULT(result);

vkGetDeviceQueue(device, 0, 0, queue);

let surfaceSupport = { $: false };
vkGetPhysicalDeviceSurfaceSupportKHR(physicalDevice, 0, surface, surfaceSupport);
if (!surfaceSupport) console.error(`No surface creation support!`);

let imageExtent = new VkExtent2D();
imageExtent.width = win.width;
imageExtent.height = win.height;

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
swapchainInfo.oldSwapchain = null;

result = vkCreateSwapchainKHR(device, swapchainInfo, null, swapchain);
ASSERT_VK_RESULT(result);

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
  imageViewInfo.sType = VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO;
  imageViewInfo.image = swapchainImages[ii];
  imageViewInfo.viewType = VK_IMAGE_VIEW_TYPE_2D;
  imageViewInfo.format = VK_FORMAT_B8G8R8A8_UNORM;
  imageViewInfo.components = components;
  imageViewInfo.subresourceRange = subresourceRange;

  result = vkCreateImageView(device, imageViewInfo, null, imageViews[ii])
  ASSERT_VK_RESULT(result);
};

let vertShaderModule = createShaderModule(vertSrc, new VkShaderModule());
let fragShaderModule = createShaderModule(fragSrc, new VkShaderModule());

let shaderStageInfoVert = new VkPipelineShaderStageCreateInfo();
shaderStageInfoVert.sType = VK_STRUCTURE_TYPE_PIPELINE_SHADER_STAGE_CREATE_INFO;
shaderStageInfoVert.stage = VK_SHADER_STAGE_VERTEX_BIT;
shaderStageInfoVert.module = vertShaderModule;
shaderStageInfoVert.pName = "main";
shaderStageInfoVert.pSpecializationInfo = null;

let shaderStageInfoFrag = new VkPipelineShaderStageCreateInfo();
shaderStageInfoFrag.sType = VK_STRUCTURE_TYPE_PIPELINE_SHADER_STAGE_CREATE_INFO;
shaderStageInfoFrag.stage = VK_SHADER_STAGE_FRAGMENT_BIT;
shaderStageInfoFrag.module = fragShaderModule;
shaderStageInfoFrag.pName = "main";
shaderStageInfoFrag.pSpecializationInfo = null;

let shaderStages = [shaderStageInfoVert, shaderStageInfoFrag];

let vertexInputInfo = new VkPipelineVertexInputStateCreateInfo();
vertexInputInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_VERTEX_INPUT_STATE_CREATE_INFO;
vertexInputInfo.vertexBindingDescriptionCount = 1;
vertexInputInfo.pVertexBindingDescriptions = [posVertexBindingDescr];
vertexInputInfo.vertexAttributeDescriptionCount = 1;
vertexInputInfo.pVertexAttributeDescriptions = [posVertexAttrDescr];

let inputAssemblyStateInfo = new VkPipelineInputAssemblyStateCreateInfo();
inputAssemblyStateInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_INPUT_ASSEMBLY_STATE_CREATE_INFO;
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
viewportStateInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_VIEWPORT_STATE_CREATE_INFO;
viewportStateInfo.viewportCount = 1;
viewportStateInfo.pViewports = [viewport];
viewportStateInfo.scissorCount = 1;
viewportStateInfo.pScissors = [scissor];

let rasterizationInfo = new VkPipelineRasterizationStateCreateInfo();
rasterizationInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_RASTERIZATION_STATE_CREATE_INFO;
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
multisampleInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_MULTISAMPLE_STATE_CREATE_INFO;
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
colorBlendInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_COLOR_BLEND_STATE_CREATE_INFO;
colorBlendInfo.logicOpEnable = false;
colorBlendInfo.logicOp = VK_LOGIC_OP_NO_OP;
colorBlendInfo.attachmentCount = 1;
colorBlendInfo.pAttachments = [colorBlendAttachment];
colorBlendInfo.blendConstants = [0.0, 0.0, 0.0, 0.0];

let pipelineLayoutInfo = new VkPipelineLayoutCreateInfo();
pipelineLayoutInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_LAYOUT_CREATE_INFO;
pipelineLayoutInfo.setLayoutCount = 0;
pipelineLayoutInfo.pushConstantRangeCount = 0;

result = vkCreatePipelineLayout(device, pipelineLayoutInfo, null, pipelineLayout);
ASSERT_VK_RESULT(result);

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
renderPassInfo.sType = VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO;
renderPassInfo.attachmentCount = 1;
renderPassInfo.pAttachments = [attachmentDescription];
renderPassInfo.subpassCount = 1;
renderPassInfo.pSubpasses = [subpassDescription];
renderPassInfo.dependencyCount = 1;
renderPassInfo.pDependencies = [subpassDependency];

result = vkCreateRenderPass(device, renderPassInfo, null, renderPass);
ASSERT_VK_RESULT(result);

let graphicsPipelineInfo = new VkGraphicsPipelineCreateInfo();
graphicsPipelineInfo.sType = VK_STRUCTURE_TYPE_GRAPHICS_PIPELINE_CREATE_INFO;
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
graphicsPipelineInfo.pDynamicState = null;
graphicsPipelineInfo.layout = pipelineLayout;
graphicsPipelineInfo.renderPass = renderPass;
graphicsPipelineInfo.subpass = 0;
graphicsPipelineInfo.basePipelineHandle = null;
graphicsPipelineInfo.basePipelineIndex = -1;

result = vkCreateGraphicsPipelines(device, null, 1, [graphicsPipelineInfo], null, [pipeline]);
ASSERT_VK_RESULT(result);

let framebuffers = [...Array(amountOfImagesInSwapchain.$)].map(() => new VkFramebuffer());
for (let ii = 0; ii < amountOfImagesInSwapchain.$; ++ii) {
  let framebufferInfo = new VkFramebufferCreateInfo();
  framebufferInfo.sType = VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO;
  framebufferInfo.renderPass = renderPass;
  framebufferInfo.attachmentCount = 1;
  framebufferInfo.pAttachments = [imageViews[ii]];
  framebufferInfo.width = win.width;
  framebufferInfo.height = win.height;
  framebufferInfo.layers = 1;
  result = vkCreateFramebuffer(device, framebufferInfo, null, framebuffers[ii]);
  ASSERT_VK_RESULT(result);
};

let cmdPoolInfo = new VkCommandPoolCreateInfo();
cmdPoolInfo.flags = 0;
cmdPoolInfo.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
cmdPoolInfo.queueFamilyIndex = 0;

result = vkCreateCommandPool(device, cmdPoolInfo, null, cmdPool);
ASSERT_VK_RESULT(result);

let cmdBufferAllocInfo = new VkCommandBufferAllocateInfo();
cmdBufferAllocInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
cmdBufferAllocInfo.commandPool = cmdPool;
cmdBufferAllocInfo.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
cmdBufferAllocInfo.commandBufferCount = amountOfImagesInSwapchain.$;

let cmdBuffers = [...Array(amountOfImagesInSwapchain.$)].map(() => new VkCommandBuffer());

result = vkAllocateCommandBuffers(device, cmdBufferAllocInfo, cmdBuffers);
ASSERT_VK_RESULT(result);

let cmdBufferBeginInfo = new VkCommandBufferBeginInfo();
cmdBufferBeginInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
cmdBufferBeginInfo.flags = VK_COMMAND_BUFFER_USAGE_SIMULTANEOUS_USE_BIT;
cmdBufferBeginInfo.pInheritanceInfo = null;

createVertexBuffer(vertexBuffer, vertexBufferMemory, vertices.byteLength);

for (let ii = 0; ii < cmdBuffers.length; ++ii) {
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
  renderPassBeginInfo.sType = VK_STRUCTURE_TYPE_RENDER_PASS_BEGIN_INFO;
  renderPassBeginInfo.renderPass = renderPass;
  renderPassBeginInfo.framebuffer = framebuffers[ii];
  renderPassBeginInfo.renderArea = renderArea;
  renderPassBeginInfo.clearValueCount = 1;
  renderPassBeginInfo.pClearValues = [clearValue];
  vkCmdBeginRenderPass(cmdBuffer, renderPassBeginInfo, VK_SUBPASS_CONTENTS_INLINE);

  vkCmdBindPipeline(cmdBuffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline);

  vkCmdBindVertexBuffers(cmdBuffer, 0, 1, [vertexBuffer], [0]);

  vkCmdDraw(cmdBuffer, 3, 1, 0, 0);

  vkCmdEndRenderPass(cmdBuffer);

  result = vkEndCommandBuffer(cmdBuffer);
  ASSERT_VK_RESULT(result);
};

let semaphoreInfo = new VkSemaphoreCreateInfo();
semaphoreInfo.sType = VK_STRUCTURE_TYPE_SEMAPHORE_CREATE_INFO;

result = vkCreateSemaphore(device, semaphoreInfo, null, semaphoreImageAvailable);
ASSERT_VK_RESULT(result);
result = vkCreateSemaphore(device, semaphoreInfo, null, semaphoreRenderingAvailable);
ASSERT_VK_RESULT(result);

function drawFrame() {

  let imageIndex = { $: 0 };
  vkAcquireNextImageKHR(device, swapchain, Number.MAX_SAFE_INTEGER, semaphoreImageAvailable, null, imageIndex);

  let waitStageMask = new Int32Array([
    VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT
  ]);

  let submitInfo = new VkSubmitInfo();
  submitInfo.sType = VK_STRUCTURE_TYPE_SUBMIT_INFO;
  submitInfo.waitSemaphoreCount = 1;
  submitInfo.pWaitSemaphores = [semaphoreImageAvailable];
  submitInfo.pWaitDstStageMask = waitStageMask;
  submitInfo.commandBufferCount = 1;
  submitInfo.pCommandBuffers = [cmdBuffers[imageIndex.$]];
  submitInfo.signalSemaphoreCount = 1;
  submitInfo.pSignalSemaphores = [semaphoreRenderingAvailable];

  result = vkQueueSubmit(queue, 1, [submitInfo], null);
  ASSERT_VK_RESULT(result);

  let presentInfo = new VkPresentInfoKHR();
  presentInfo.sType = VK_STRUCTURE_TYPE_PRESENT_INFO_KHR;
  presentInfo.waitSemaphoreCount = 1;
  presentInfo.pWaitSemaphores = [semaphoreRenderingAvailable];
  presentInfo.swapchainCount = 1;
  presentInfo.pSwapchains = [swapchain];
  presentInfo.pImageIndices = new Uint32Array([imageIndex.$]);
  presentInfo.pResults = null;

  result = vkQueuePresentKHR(queue, presentInfo);
  ASSERT_VK_RESULT(result);

};

console.log("drawing..");
(function drawLoop() {
  if (!win.shouldClose()) setTimeout(drawLoop, 0);
  drawFrame();
  win.pollEvents();
})();
