export function memoryCopy(dstPtr, srcData, byteLen) {
  let dstBuffer = createV8ArrayBufferFromMemory(dstPtr, byteLen);
  let srcBuffer = srcData.buffer;
  let dstView = new Uint8Array(dstBuffer);
  let srcView = new Uint8Array(srcBuffer);
  for (let ii = 0; ii < byteLen; ++ii) dstView[ii] = srcView[ii];
};

export function createBuffer(opts = {}) {
  let {
    size,
    usage,
    buffer,
    bufferMemory,
    propertyFlags
  } = opts;

  let bufferInfo = new VkBufferCreateInfo();
  bufferInfo.size = size;
  bufferInfo.usage = usage;
  bufferInfo.sharingMode = VK_SHARING_MODE_EXCLUSIVE;
  bufferInfo.queueFamilyIndexCount = 0;
  bufferInfo.pQueueFamilyIndices = null;

  result = vkCreateBuffer(device, bufferInfo, null, buffer);
  ASSERT_VK_RESULT(result);

  let memoryRequirements = new VkMemoryRequirements();
  vkGetBufferMemoryRequirements(device, buffer, memoryRequirements);

  let memAllocInfo = new VkMemoryAllocateInfo();
  memAllocInfo.allocationSize = memoryRequirements.size;
  memAllocInfo.memoryTypeIndex = getMemoryTypeIndex(memoryRequirements.memoryTypeBits, propertyFlags);

  result = vkAllocateMemory(device, memAllocInfo, null, bufferMemory);
  ASSERT_VK_RESULT(result);

  vkBindBufferMemory(device, buffer, bufferMemory, 0);
};

export function copyBuffer(opts = {}) {
  let {
    srcBuffer,
    dstBuffer,
    byteLength
  } = opts;

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

  let bufferCopy = new VkBufferCopy();
  bufferCopy.srcOffset = 0;
  bufferCopy.dstOffset = 0;
  bufferCopy.size = byteLength;

  vkCmdCopyBuffer(cmdBuffer, srcBuffer, dstBuffer, 1, [bufferCopy]);

  result = vkEndCommandBuffer(cmdBuffer);
  ASSERT_VK_RESULT(result);

  let submitInfo = new VkSubmitInfo();
  submitInfo.commandBufferCount = 1;
  submitInfo.pCommandBuffers = [cmdBuffer];

  result = vkQueueSubmit(queue, 1, [submitInfo], null);
  ASSERT_VK_RESULT(result);

  vkQueueWaitIdle(queue);
};

export function uploadBufferData(opts = {}) {
  let {
    data,
    usage,
    buffer,
    bufferMemory
  } = opts;

  let size = data.byteLength;

  let stagingBuffer = new VkBuffer();
  let stagingBufferMemory = new VkDeviceMemory();

  createBuffer({
    size: size,
    usage: VK_BUFFER_USAGE_TRANSFER_SRC_BIT,
    buffer: stagingBuffer,
    bufferMemory: stagingBufferMemory,
    propertyFlags: VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT
  });

  let dataPtr = { $: 0n };
  vkMapMemory(device, stagingBufferMemory, 0, size, 0, dataPtr);
  memoryCopy(dataPtr.$, data, data.byteLength);
  vkUnmapMemory(device, stagingBufferMemory);

  createBuffer({
    size: size,
    usage: usage | VK_BUFFER_USAGE_TRANSFER_DST_BIT,
    buffer: buffer,
    bufferMemory: bufferMemory,
    propertyFlags: VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT
  });

  copyBuffer({
    srcBuffer: stagingBuffer,
    dstBuffer: buffer,
    byteLength: data.byteLength
  });
};

export function getMemoryTypeIndex(typeFilter, propertyFlag) {
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
