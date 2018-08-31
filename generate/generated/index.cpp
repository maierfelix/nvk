#include <nan.h>

#define GLFW_INCLUDE_VULKAN
#include <GLFW/glfw3.h>

#define GLM_FORCE_RADIANS
#define GLM_FORCE_DEPTH_ZERO_TO_ONE

#include <glm/vec4.hpp>
#include <glm/mat4x4.hpp>

#include "index.h"
#include "enums.h"

NAN_MODULE_INIT(InitModule) {
  _VkDebugUtilsMessengerEXT::Initialize(target);
  _VkDebugReportCallbackEXT::Initialize(target);
  _VkSwapchainKHR::Initialize(target);
  _VkSurfaceKHR::Initialize(target);
  _VkDisplayModeKHR::Initialize(target);
  _VkDisplayKHR::Initialize(target);
  _VkValidationCacheEXT::Initialize(target);
  _VkSamplerYcbcrConversion::Initialize(target);
  _VkDescriptorUpdateTemplate::Initialize(target);
  _VkIndirectCommandsLayoutNVX::Initialize(target);
  _VkObjectTableNVX::Initialize(target);
  _VkPipelineCache::Initialize(target);
  _VkRenderPass::Initialize(target);
  _VkFramebuffer::Initialize(target);
  _VkQueryPool::Initialize(target);
  _VkEvent::Initialize(target);
  _VkSemaphore::Initialize(target);
  _VkFence::Initialize(target);
  _VkDescriptorPool::Initialize(target);
  _VkDescriptorSetLayout::Initialize(target);
  _VkDescriptorSet::Initialize(target);
  _VkSampler::Initialize(target);
  _VkPipelineLayout::Initialize(target);
  _VkPipeline::Initialize(target);
  _VkShaderModule::Initialize(target);
  _VkImageView::Initialize(target);
  _VkImage::Initialize(target);
  _VkBufferView::Initialize(target);
  _VkBuffer::Initialize(target);
  _VkCommandPool::Initialize(target);
  _VkDeviceMemory::Initialize(target);
  _VkCommandBuffer::Initialize(target);
  _VkQueue::Initialize(target);
  _VkDevice::Initialize(target);
  _VkPhysicalDevice::Initialize(target);
  _VkInstance::Initialize(target);
  _VkBindImagePlaneMemoryInfo::Initialize(target);
  _VkImageSubresourceRange::Initialize(target);
  _VkImageMemoryBarrier::Initialize(target);
  _VkBufferCreateInfo::Initialize(target);
  _VkApplicationInfo::Initialize(target);
  _VkInstanceCreateInfo::Initialize(target);
  _VkPhysicalDeviceFeatures::Initialize(target);
  _VkDeviceQueueCreateInfo::Initialize(target);
  _VkDeviceCreateInfo::Initialize(target);
  _VkExtent2D::Initialize(target);
  _VkOffset2D::Initialize(target);
  _VkRect2D::Initialize(target);
  _VkClearRect::Initialize(target);
  
  target->Set(
    Nan::New("getVulkanEnumerations").ToLocalChecked(),
    Nan::New<v8::FunctionTemplate>(getVulkanEnumerations)->GetFunction()
  );
}

NODE_MODULE(myModule, InitModule);
