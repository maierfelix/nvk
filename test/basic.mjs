import fs from "fs";
import addon from "../generated/1.1.82.0/build/Release/addon.node";

const WIN_WIDTH = 800;
const WIN_HEIGHT = 600;

const enums = addon.getVulkanEnumerations();

Object.assign(global, addon);
Object.assign(global, enums);

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

function getShaderFile(path) {
  return new Uint8Array(fs.readFileSync(path, null));
};

function createShaderModule(shaderSrc, shaderModule) {
  let shaderModuleInfo = new VkShaderModuleCreateInfo();
  shaderModuleInfo.sType = VK_STRUCTURE_TYPE_SHADER_MODULE_CREATE_INFO;
  shaderModuleInfo.pCode = shaderSrc;
  shaderModuleInfo.codeSize = shaderSrc.byteLength;
  if ((result = vkCreateShaderModule(device, shaderModuleInfo, null, shaderModule)) !== VK_SUCCESS) {
    console.error(`Failed to create shader module!`);
  } else {
    console.log(`Created shader module!`);
  }
  return shaderModule;
};

const vertSrc = getShaderFile("./test/basic-vert.spv");
const fragSrc = getShaderFile("./test/basic-frag.spv");

let amountOfLayers = { $: 0 };
vkEnumerateInstanceLayerProperties(amountOfLayers, null);
let layers = [...Array(amountOfLayers.$)].map(() => new VkLayerProperties());
vkEnumerateInstanceLayerProperties(amountOfLayers, layers);
console.log(`${amountOfLayers.$} layers available!`);

layers.map(layer => {
  console.log(layer.description, "|", layer.layerName);
});

let win = new VulkanWindow(WIN_WIDTH, WIN_HEIGHT);

console.log(win);

// app info
let appInfo = new VkApplicationInfo();
appInfo.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
appInfo.pApplicationName = "Hello!";
appInfo.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
appInfo.pEngineName = "No Engine";
appInfo.engineVersion = VK_MAKE_VERSION(1, 0, 0);
appInfo.apiVersion = VK_API_VERSION_1_0;
console.log("App info:", appInfo);

// create info
let createInfo = new VkInstanceCreateInfo();
createInfo.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
createInfo.pApplicationInfo = appInfo;

let instanceExtensions = win.getRequiredInstanceExtensions();
console.log("Instance extensions:", instanceExtensions);
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

if ((result = vkCreateDevice(physicalDevice, deviceInfo, null, device)) !== VK_SUCCESS) {
  console.error("Error: Failed to create logical device!");
} else {
  console.log("Created logical device!");
}

vkGetDeviceQueue(device, 0, 0, queue);

let surfaceSupport = { $: false };
vkGetPhysicalDeviceSurfaceSupportKHR(physicalDevice, 0, surface, surfaceSupport);
if (!surfaceSupport) {
  console.error(`No surface creation support!`);
} else {
  console.log("Surface creation supported!");
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
swapchainInfo.oldSwapchain = null;

if ((result = vkCreateSwapchainKHR(device, swapchainInfo, null, swapchain))) {
  console.error(`Swapchain creation failed!`);
} else {
  console.log(`Created swapchain!`);
}

let amountOfImagesInSwapchain = { $: 0 };
vkGetSwapchainImagesKHR(device, swapchain, amountOfImagesInSwapchain, null);
let swapchainImages = [...Array(amountOfImagesInSwapchain.$)].map(() => new VkImage());
if ((result = vkGetSwapchainImagesKHR(device, swapchain, amountOfImagesInSwapchain, swapchainImages)) !== VK_SUCCESS) {
  console.log("Error creating swapchain images!");
} else {
  console.log("Created swapchain images!");
}

//win.test(device, swapchain, swapchainImages);

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
  if ((result = vkCreateImageView(device, imageViewInfo, null, imageViews[ii])) !== VK_SUCCESS) {
    console.error(`Failed to create image views!`);
  } else {
    console.log(`Created image view ${ii} successfully!`);
  }
};

let vertShaderModule = createShaderModule(vertSrc, new VkShaderModule());
let fragShaderModule = createShaderModule(fragSrc, new VkShaderModule());

let shaderStageInfoVert = new VkPipelineShaderStageCreateInfo();
shaderStageInfoVert.sType = VK_STRUCTURE_TYPE_PIPELINE_SHADER_STAGE_CREATE_INFO;
shaderStageInfoVert.stage = VK_SHADER_STAGE_VERTEX_BIT;
shaderStageInfoVert.module = vertShaderModule;
shaderStageInfoVert.pName = "main";
shaderStageInfoVert.pSpecializationInfo = null;
console.log("Shader stage vert:", shaderStageInfoVert);

let shaderStageInfoFrag = new VkPipelineShaderStageCreateInfo();
shaderStageInfoFrag.sType = VK_STRUCTURE_TYPE_PIPELINE_SHADER_STAGE_CREATE_INFO;
shaderStageInfoFrag.stage = VK_SHADER_STAGE_FRAGMENT_BIT;
shaderStageInfoFrag.module = fragShaderModule;
shaderStageInfoFrag.pName = "main";
shaderStageInfoFrag.pSpecializationInfo = null;
console.log("Shader stage frag:", shaderStageInfoFrag);

let shaderStages = [shaderStageInfoVert, shaderStageInfoFrag];

let vertexInputInfo = new VkPipelineVertexInputStateCreateInfo();
vertexInputInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_VERTEX_INPUT_STATE_CREATE_INFO;
vertexInputInfo.vertexBindingDescriptionCount = 0;
vertexInputInfo.pVertexBindingDescriptions = null;
vertexInputInfo.vertexAttributeDescriptionCount = 0;
vertexInputInfo.pVertexAttributeDescriptions = null;
console.log("Vertex input info:", vertexInputInfo);

let inputAssemblyStateInfo = new VkPipelineInputAssemblyStateCreateInfo();
inputAssemblyStateInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_INPUT_ASSEMBLY_STATE_CREATE_INFO;
inputAssemblyStateInfo.topology = VK_PRIMITIVE_TOPOLOGY_TRIANGLE_LIST;
inputAssemblyStateInfo.primitiveRestartEnable = false;
console.log("Input assembly state:", inputAssemblyStateInfo);

let viewport = new VkViewport();
viewport.x = 0;
viewport.y = 0;
viewport.width = WIN_WIDTH;
viewport.height = WIN_HEIGHT;
viewport.minDepth = 0.0;
viewport.maxDepth = 1.0;
console.log("Viewport:", viewport);

let scissorOffset = new VkOffset2D();
scissorOffset.x = 0;
scissorOffset.y = 0;
let scissorExtent = new VkExtent2D();
scissorExtent.width = WIN_WIDTH;
scissorExtent.height = WIN_HEIGHT;
let scissor = new VkRect2D();
scissor.offset = scissorOffset;
scissor.extent = scissorExtent;
console.log("Scissor:", scissor);

let viewportStateInfo = new VkPipelineViewportStateCreateInfo();
viewportStateInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_VIEWPORT_STATE_CREATE_INFO;
viewportStateInfo.viewportCount = 1;
viewportStateInfo.pViewports = [viewport];
viewportStateInfo.scissorCount = 1;
viewportStateInfo.pScissors = [scissor];
console.log("Viewport state info:", viewportStateInfo);

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
console.log("Rasterization info:", rasterizationInfo);

let multisampleInfo = new VkPipelineMultisampleStateCreateInfo();
multisampleInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_MULTISAMPLE_STATE_CREATE_INFO;
multisampleInfo.rasterizationSamples = VK_SAMPLE_COUNT_1_BIT;
multisampleInfo.minSampleShading = false;
multisampleInfo.pSampleMask = null;
multisampleInfo.alphaToCoverageEnable = false;
multisampleInfo.alphaToOneEnable = false;
console.log("Multisample info:", multisampleInfo);

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
console.log("Color blend attachment:", colorBlendAttachment);

let colorBlendInfo = new VkPipelineColorBlendStateCreateInfo();
colorBlendInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_COLOR_BLEND_STATE_CREATE_INFO;
colorBlendInfo.logicOpEnable = false;
colorBlendInfo.logicOp = VK_LOGIC_OP_NO_OP;
colorBlendInfo.attachmentCount = 1;
colorBlendInfo.pAttachments = [colorBlendAttachment];
colorBlendInfo.blendConstants = [0.0, 0.0, 0.0, 0.0];
console.log("Color blend info:", colorBlendInfo);

let pipelineLayoutInfo = new VkPipelineLayoutCreateInfo();
pipelineLayoutInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_LAYOUT_CREATE_INFO;
pipelineLayoutInfo.setLayoutCount = 0;
pipelineLayoutInfo.pushConstantRangeCount = 0;

if ((result = vkCreatePipelineLayout(device, pipelineLayoutInfo, null, pipelineLayout)) !== VK_SUCCESS) {
  console.error(`Failed to create pipeline layout!`);
} else {
  console.log("Created pipeline layout!");
}

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
console.log("Attachment description:", attachmentDescription);

let attachmentReference = new VkAttachmentReference();
attachmentReference.attachment = 0;
attachmentReference.layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;
console.log("Attachment reference:", attachmentReference);

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
console.log("Subpass description:", subpassDescription);

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
console.log("Renderpass info:", renderPassInfo);

if ((result = vkCreateRenderPass(device, renderPassInfo, null, renderPass)) !== VK_SUCCESS) {
  console.error(`Failed to create render pass!`);
} else {
  console.log("Created render pass!");
}

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
console.log("Graphics pipeline info:", graphicsPipelineInfo);

if ((result = vkCreateGraphicsPipelines(device, null, 1, [graphicsPipelineInfo], null, [pipeline])) !== VK_SUCCESS) {
  console.log(`Failed to create graphics pipeline!`);
} else {
  console.log("Created graphics pipeline!");
}

let framebuffers = [...Array(amountOfImagesInSwapchain.$)].map(() => new VkFramebuffer());
for (let ii = 0; ii < amountOfImagesInSwapchain.$; ++ii) {
  let framebufferInfo = new VkFramebufferCreateInfo();
  framebufferInfo.sType = VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO;
  framebufferInfo.renderPass = renderPass;
  framebufferInfo.attachmentCount = 1;
  framebufferInfo.pAttachments = [imageViews[ii]];
  framebufferInfo.width = WIN_WIDTH;
  framebufferInfo.height = WIN_HEIGHT;
  framebufferInfo.layers = 1;
  if ((result = vkCreateFramebuffer(device, framebufferInfo, null, framebuffers[ii])) !== VK_SUCCESS) {
    console.error(`Failed to create framebuffer ${ii}!`);
  } else {
    console.log(`Created framebuffer ${ii}!`);
  }
};

console.log("########");

let cmdPoolInfo = new VkCommandPoolCreateInfo();
cmdPoolInfo.flags = 0;
cmdPoolInfo.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
cmdPoolInfo.queueFamilyIndex = 0;

if ((result = vkCreateCommandPool(device, cmdPoolInfo, null, cmdPool)) !== VK_SUCCESS) {
  console.error(`Failed to create command pool!`);
} else {
  console.log(`Created command pool!`);
}

let cmdBufferAllocInfo = new VkCommandBufferAllocateInfo();
cmdBufferAllocInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
cmdBufferAllocInfo.commandPool = cmdPool;
cmdBufferAllocInfo.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
cmdBufferAllocInfo.commandBufferCount = amountOfImagesInSwapchain.$;
console.log("cmdBufferAllocInfo:", cmdBufferAllocInfo);

let cmdBuffers = [...Array(amountOfImagesInSwapchain.$)].map(() => new VkCommandBuffer());
console.log("cmdBuffers:", cmdBuffers);

if ((result = vkAllocateCommandBuffers(device, cmdBufferAllocInfo, cmdBuffers)) !== VK_SUCCESS) {
  console.error(`Failed to allocate commandBuffers!`);
} else {
  console.log(`Allocated commandBuffers!`);
}

let cmdBufferBeginInfo = new VkCommandBufferBeginInfo();
cmdBufferBeginInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
cmdBufferBeginInfo.flags = VK_COMMAND_BUFFER_USAGE_SIMULTANEOUS_USE_BIT;
cmdBufferBeginInfo.pInheritanceInfo = null;
console.log("cmdBufferBeginInfo:", cmdBufferBeginInfo);

for (let ii = 0; ii < cmdBuffers.length; ++ii) {
  let cmdBuffer = cmdBuffers[ii];
  result = vkBeginCommandBuffer(cmdBuffer, cmdBufferBeginInfo);
  if (result !== VK_SUCCESS) console.error(`Failed to begin command buffer recording!`, result);

  let offset = new VkOffset2D();
  offset.x = 0;
  offset.y = 0;
  let extent = new VkExtent2D();
  extent.width = WIN_WIDTH;
  extent.height = WIN_HEIGHT;
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
  vkCmdDraw(cmdBuffer, 3, 1, 0, 0);
  vkCmdEndRenderPass(cmdBuffer);

  result = vkEndCommandBuffer(cmdBuffer);
  if (result !== VK_SUCCESS) console.error(`Failed to end command buffer recording!`);
};

console.log(`Finished cmd buffer recordings!`);

let semaphoreInfo = new VkSemaphoreCreateInfo();
semaphoreInfo.sType = VK_STRUCTURE_TYPE_SEMAPHORE_CREATE_INFO;

result = vkCreateSemaphore(device, semaphoreInfo, null, semaphoreImageAvailable);
if (result !== VK_SUCCESS) console.error(`Failed to create semaphore semaphoreImageAvailable!`);
result = vkCreateSemaphore(device, semaphoreInfo, null, semaphoreRenderingAvailable);
if (result !== VK_SUCCESS) console.error(`Failed to create semaphore semaphoreRenderingAvailable!`);

function drawFrame() {
  win.pollEvents();
  let imageIndex = { $: 0 };
  vkAcquireNextImageKHR(device, swapchain, Number.MAX_SAFE_INTEGER, semaphoreImageAvailable, null, imageIndex);

  let waitStageMask = new Uint32Array([
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
  if (result !== VK_SUCCESS) console.error(`Queue submit failed!`);

  let presentInfo = new VkPresentInfoKHR();
  presentInfo.sType = VK_STRUCTURE_TYPE_PRESENT_INFO_KHR;
  presentInfo.waitSemaphoreCount = 1;
  presentInfo.pWaitSemaphores = [semaphoreRenderingAvailable];
  presentInfo.swapchainCount = 1;
  presentInfo.pSwapchains = [swapchain];
  presentInfo.pImageIndices = new Int32Array([imageIndex.$]);
  presentInfo.pResults = null;

  result = vkQueuePresentKHR(queue, presentInfo);
  if (result !== VK_SUCCESS) console.error(`Queue present failed!`);

};

drawFrame();

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
