import fs from "fs";
import pngjs from "pngjs"; const { PNG } = pngjs;

import {
  memoryCopy,
  createBuffer,
  copyBuffer,
  uploadBufferData,
  getMemoryTypeIndex
} from "./buffer";

class Texture2D {
  constructor(opts = {}) {
    this.width = 0;
    this.height = 0;
    this.data = null;
    this.image = new VkImage();
    this.sampler = new VkSampler();
    this.imageView = new VkImageView();
    this.imageMemory = new VkDeviceMemory();
    this.imageLayout = VK_IMAGE_LAYOUT_PREINITIALIZED;
  }
};

Texture2D.prototype.fromImagePath = function(path) {
  let buffer = fs.readFileSync(path);
  let img = PNG.sync.read(buffer);
  let data = new Uint8Array(img.data);
  this.data = data;
  this.width = img.width;
  this.height = img.height;
  return this;
};

Texture2D.prototype.upload = function() {
  let {
    data,
    image,
    imageView,
    imageMemory,
    imageLayout
  } = this;
  let byteLength = data.byteLength;

  let stagingBuffer = new VkBuffer();
  let stagingBufferMemory = new VkDeviceMemory();
  createBuffer({
    size: byteLength,
    usage: VK_BUFFER_USAGE_TRANSFER_SRC_BIT,
    buffer: stagingBuffer,
    bufferMemory: stagingBufferMemory,
    propertyFlags: VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT
  });

  let dataPtr = { $: 0n };
  vkMapMemory(device, stagingBufferMemory, 0, byteLength, 0, dataPtr);
  memoryCopy(dataPtr.$, data, byteLength);
  vkUnmapMemory(device, stagingBufferMemory);

  let imageExtent = new VkExtent3D();
  imageExtent.width = this.width;
  imageExtent.height = this.height;
  imageExtent.depth = 1;

  let imageInfo = new VkImageCreateInfo();
  imageInfo.imageType = VK_IMAGE_TYPE_2D;
  imageInfo.format = VK_FORMAT_R8G8B8A8_UNORM;
  imageInfo.extent = imageExtent;
  imageInfo.mipLevels = 1;
  imageInfo.arrayLayers = 1;
  imageInfo.samples = VK_SAMPLE_COUNT_1_BIT;
  imageInfo.tiling = VK_IMAGE_TILING_OPTIMAL;
  imageInfo.usage = VK_IMAGE_USAGE_TRANSFER_DST_BIT | VK_IMAGE_USAGE_SAMPLED_BIT;
  imageInfo.sharingMode = VK_SHARING_MODE_EXCLUSIVE;
  imageInfo.queueFamilyIndexCount = 0;
  imageInfo.pQueueFamilyIndices = null;
  imageInfo.initialLayout = imageLayout;

  result = vkCreateImage(device, imageInfo, null, image);
  ASSERT_VK_RESULT(result);

  let memoryRequirements = new VkMemoryRequirements();
  vkGetImageMemoryRequirements(device, image, memoryRequirements);

  let memoryTypeIndex = getMemoryTypeIndex(
    memoryRequirements.memoryTypeBits,
    VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT
  );
 
  let memoryAllocateInfo = new VkMemoryAllocateInfo();
  memoryAllocateInfo.allocationSize = memoryRequirements.size;
  memoryAllocateInfo.memoryTypeIndex = memoryTypeIndex;

  result = vkAllocateMemory(device, memoryAllocateInfo, null, imageMemory);
  ASSERT_VK_RESULT(result);

  vkBindImageMemory(device, image, imageMemory, 0);

  this.setLayout(VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL);
  this.transferBufferToImage(stagingBuffer);
  this.setLayout(VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL);

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
  imageViewInfo.image = this.image;
  imageViewInfo.viewType = VK_IMAGE_VIEW_TYPE_2D;
  imageViewInfo.format = VK_FORMAT_R8G8B8A8_UNORM;
  imageViewInfo.components = components;
  imageViewInfo.subresourceRange = subresourceRange;

  result = vkCreateImageView(device, imageViewInfo, null, imageView);
  ASSERT_VK_RESULT(result);

  let samplerInfo = new VkSamplerCreateInfo();
  samplerInfo.magFilter = VK_FILTER_NEAREST;
  samplerInfo.minFilter = VK_FILTER_NEAREST;
  samplerInfo.mipmapMode = VK_SAMPLER_MIPMAP_MODE_LINEAR;
  samplerInfo.addressModeU = VK_SAMPLER_ADDRESS_MODE_REPEAT;
  samplerInfo.addressModeV = VK_SAMPLER_ADDRESS_MODE_REPEAT;
  samplerInfo.addressModeW = VK_SAMPLER_ADDRESS_MODE_REPEAT;
  samplerInfo.mipLodBias = 0;
  samplerInfo.anisotropyEnable = true;
  samplerInfo.maxAnisotropy = 16;
  samplerInfo.compareEnable = false;
  samplerInfo.compareOp = VK_COMPARE_OP_ALWAYS;
  samplerInfo.minLod = 0;
  samplerInfo.maxLod = 0;
  samplerInfo.borderColor = VK_BORDER_COLOR_INT_OPAQUE_BLACK;
  samplerInfo.unnormalizedCoordinates = false;

  result = vkCreateSampler(device, samplerInfo, null, this.sampler);
  ASSERT_VK_RESULT(result);

};

Texture2D.prototype.setLayout = function(imageLayout) {
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

  let srcAccessMask = 0;
  let dstAccessMask = 0;
  let srcStage = 0;
  let dstStage = 0;
  if (
    (imageLayout === VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL) &&
    (this.imageLayout === VK_IMAGE_LAYOUT_PREINITIALIZED)
  ) {
    srcAccessMask = 0;
    dstAccessMask = VK_ACCESS_TRANSFER_WRITE_BIT;
    srcStage = VK_PIPELINE_STAGE_TOP_OF_PIPE_BIT;
    dstStage = VK_PIPELINE_STAGE_TRANSFER_BIT;
  } else if (
    (imageLayout === VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL) &&
    (this.imageLayout === VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL)
  ) {
    srcAccessMask = VK_ACCESS_TRANSFER_WRITE_BIT;
    dstAccessMask = VK_ACCESS_SHADER_READ_BIT;
    srcStage = VK_PIPELINE_STAGE_TRANSFER_BIT;
    dstStage = VK_PIPELINE_STAGE_FRAGMENT_SHADER_BIT;
  }

  let imageMemoryBarrier = new VkImageMemoryBarrier();
  imageMemoryBarrier.srcAccessMask = srcAccessMask;
  imageMemoryBarrier.dstAccessMask = dstAccessMask;
  imageMemoryBarrier.oldLayout = this.imageLayout;
  imageMemoryBarrier.newLayout = imageLayout;
  imageMemoryBarrier.srcQueueFamilyIndex = VK_QUEUE_FAMILY_IGNORED;
  imageMemoryBarrier.dstQueueFamilyIndex = VK_QUEUE_FAMILY_IGNORED;
  imageMemoryBarrier.image = this.image;
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

  this.imageLayout = imageLayout;
};

Texture2D.prototype.transferBufferToImage = function(buffer) {
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

  let imageSubresource = new VkImageSubresourceLayers();
  imageSubresource.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
  imageSubresource.mipLevel = 0;
  imageSubresource.baseArrayLayer = 0;
  imageSubresource.layerCount = 1;

  let imageOffset = new VkOffset3D();
  imageOffset.x = 0;
  imageOffset.y = 0;
  imageOffset.z = 0;
  let imageExtent = new VkExtent3D();
  imageExtent.width = this.width;
  imageExtent.height = this.height;
  imageExtent.depth = 1;

  let bufferImageCopy = new VkBufferImageCopy();
  bufferImageCopy.bufferOffset = 0;
  bufferImageCopy.bufferRowLength = 0;
  bufferImageCopy.bufferImageHeight = 0;
  bufferImageCopy.imageSubresource = imageSubresource;
  bufferImageCopy.imageOffset = imageOffset;
  bufferImageCopy.imageExtent = imageExtent;

  vkCmdCopyBufferToImage(
    cmdBuffer,
    buffer,
    this.image,
    VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL,
    1,
    [bufferImageCopy]
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

export default Texture2D;
