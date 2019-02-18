export function createDescriptorSet() {
  let descriptorSetAllocInfo = new VkDescriptorSetAllocateInfo();
  descriptorSetAllocInfo.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_ALLOCATE_INFO;
  descriptorSetAllocInfo.descriptorPool = descriptorPool;
  descriptorSetAllocInfo.descriptorSetCount = 1;
  descriptorSetAllocInfo.pSetLayouts = [descriptorSetLayout];
  result = vkAllocateDescriptorSets(device, descriptorSetAllocInfo, [descriptorSet]);
  ASSERT_VK_RESULT(result);

  let descriptorBufferInfo = new VkDescriptorBufferInfo();
  descriptorBufferInfo.buffer = uniformBuffer;
  descriptorBufferInfo.offset = 0;
  descriptorBufferInfo.range = ubo.byteLength;

  let writeDescriptorSet = new VkWriteDescriptorSet();
  writeDescriptorSet.sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
  writeDescriptorSet.dstSet = descriptorSet;
  writeDescriptorSet.dstBinding = 0;
  writeDescriptorSet.dstArrayElement = 0;
  writeDescriptorSet.descriptorCount = 1;
  writeDescriptorSet.descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
  writeDescriptorSet.pImageInfo = null;
  writeDescriptorSet.pBufferInfo = [descriptorBufferInfo];
  writeDescriptorSet.pTexelBufferView = null;

  let descriptorImageInfo = new VkDescriptorImageInfo();
  descriptorImageInfo.sampler = grassImage.sampler;
  descriptorImageInfo.imageView = grassImage.imageView;
  descriptorImageInfo.imageLayout = VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL;

  let writeDescriptorSetSampler = new VkWriteDescriptorSet();
  writeDescriptorSetSampler.sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
  writeDescriptorSetSampler.dstSet = descriptorSet;
  writeDescriptorSetSampler.dstBinding = 1;
  writeDescriptorSetSampler.dstArrayElement = 0;
  writeDescriptorSetSampler.descriptorCount = 1;
  writeDescriptorSetSampler.descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
  writeDescriptorSetSampler.pImageInfo = descriptorImageInfo;
  writeDescriptorSetSampler.pBufferInfo = null;
  writeDescriptorSetSampler.pTexelBufferView = null;

  vkUpdateDescriptorSets(device, 2, [writeDescriptorSet, writeDescriptorSetSampler], 0, null);
};

export function createDescriptorPool() {
  let descriptorPoolSize = new VkDescriptorPoolSize();
  descriptorPoolSize.type = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
  descriptorPoolSize.descriptorCount = 1;
  let samplerDescriptorPoolSize = new VkDescriptorPoolSize();
  samplerDescriptorPoolSize.type = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
  samplerDescriptorPoolSize.descriptorCount = 1;

  let descriptorPoolInfo = new VkDescriptorPoolCreateInfo();
  descriptorPoolInfo.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_POOL_CREATE_INFO;
  descriptorPoolInfo.maxSets = 1;
  descriptorPoolInfo.poolSizeCount = 2;
  descriptorPoolInfo.pPoolSizes = [descriptorPoolSize, samplerDescriptorPoolSize];
  result = vkCreateDescriptorPool(device, descriptorPoolInfo, null, descriptorPool);
  ASSERT_VK_RESULT(result);
};

export function createDescriptorSetLayout() {
  let descriptorSetLayoutBinding = new VkDescriptorSetLayoutBinding();
  descriptorSetLayoutBinding.binding = 0;
  descriptorSetLayoutBinding.descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
  descriptorSetLayoutBinding.descriptorCount = 1;
  descriptorSetLayoutBinding.stageFlags = VK_SHADER_STAGE_VERTEX_BIT;
  descriptorSetLayoutBinding.pImmutableSamplers = null;

  let samplerDescriptorSetLayoutBinding = new VkDescriptorSetLayoutBinding();
  samplerDescriptorSetLayoutBinding.binding = 1;
  samplerDescriptorSetLayoutBinding.descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
  samplerDescriptorSetLayoutBinding.descriptorCount = 1;
  samplerDescriptorSetLayoutBinding.stageFlags = VK_SHADER_STAGE_FRAGMENT_BIT;
  samplerDescriptorSetLayoutBinding.pImmutableSamplers = null;

  let descriptorSetLayoutInfo = new VkDescriptorSetLayoutCreateInfo();
  descriptorSetLayoutInfo.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_LAYOUT_CREATE_INFO;
  descriptorSetLayoutInfo.bindingCount = 2;
  descriptorSetLayoutInfo.pBindings = [descriptorSetLayoutBinding, samplerDescriptorSetLayoutBinding];

  result = vkCreateDescriptorSetLayout(device, descriptorSetLayoutInfo, null, descriptorSetLayout);
  ASSERT_VK_RESULT(result);
};
