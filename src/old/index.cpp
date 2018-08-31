#include <nan.h>

#define GLFW_INCLUDE_VULKAN
#include <GLFW/glfw3.h>

#define GLM_FORCE_RADIANS
#define GLM_FORCE_DEPTH_ZERO_TO_ONE

#include <glm/vec4.hpp>
#include <glm/mat4x4.hpp>

#include "VkApplicationInfo.h"
#include "VkBufferCreateInfo.h"
#include "VkInstanceCreateInfo.h"
#include "VkImageSubresourceRange.h"
#include "VkBindImagePlaneMemoryInfo.h"

NAN_MODULE_INIT(InitModule) {
  _VkApplicationInfo::Initialize(target);
  _VkBufferCreateInfo::Initialize(target);
  _VkInstanceCreateInfo::Initialize(target);
  _VkImageSubresourceRange::Initialize(target);
  _VkBindImagePlaneMemoryInfo::Initialize(target);
}

NODE_MODULE(myModule, InitModule);
