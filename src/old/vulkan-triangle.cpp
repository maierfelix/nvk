#include <set>

#include <nan.h>

#define GLFW_INCLUDE_VULKAN
#include <GLFW/glfw3.h>

#define GLM_FORCE_RADIANS
#define GLM_FORCE_DEPTH_ZERO_TO_ONE

#include <glm/vec4.hpp>
#include <glm/mat4x4.hpp>

#define EXPORT_FN(name) exports->Set(                   \
  Nan::New("FN_"#name).ToLocalChecked(),                \
  Nan::New<v8::FunctionTemplate>(##name)->GetFunction() \
)

VkDevice device;
GLFWwindow* window;
VkInstance instance;
VkSurfaceKHR surface;
VkPhysicalDevice physicalDevice = VK_NULL_HANDLE;

VkQueue graphicQueue;
VkQueue presentQueue;

// used extensions
const std::vector<const char*> deviceExtensions = {
  VK_KHR_SWAPCHAIN_EXTENSION_NAME
};

struct SwapChainSupportDetails {
  VkSurfaceCapabilitiesKHR capabilities;
  std::vector<VkSurfaceFormatKHR> formats;
  std::vector<VkPresentModeKHR> presentModes;
};
/*
void VkApplicationInfo(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  GLuint program = static_cast<GLuint>(info[0]->NumberValue());
  v8::String::Utf8Value name(info[1]->ToString());
  GLuint loc = glGetUniformLocation(program, *name);
  info.GetReturnValue().Set(loc);
};
*/
void createInstance(void) {

  // app info
  VkApplicationInfo app = {};
  app.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
  app.pApplicationName = "Hello!";
  app.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
  app.pEngineName = "No Engine";
  app.engineVersion = VK_MAKE_VERSION(1, 0, 0);
  app.apiVersion = VK_API_VERSION_1_0;

  // create info
  VkInstanceCreateInfo create = {};
  create.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
  create.pApplicationInfo = &app;

  uint32_t glfwExtensionCount = 0;
  const char** glfwExtensions;
  glfwExtensions = glfwGetRequiredInstanceExtensions(&glfwExtensionCount);

  create.enabledExtensionCount = glfwExtensionCount;
  create.ppEnabledExtensionNames = glfwExtensions;

  create.enabledLayerCount = 0;

  if (vkCreateInstance(&create, nullptr, &instance) != VK_SUCCESS) {
    throw std::runtime_error("Instance creation failed!");
  }

};

void clearInstance(void) {
  vkDestroyDevice(device, nullptr);
  vkDestroyInstance(instance, nullptr);
  vkDestroySurfaceKHR(instance, surface, nullptr);
  glfwDestroyWindow(window);
  glfwTerminate();
};

void getQueueFamilyIndices(int *pQueueFamilyIndex, int *pPresentFamilyIndex) {
  int graphicsFamily = -1;
  int presentFamily = -1;
  uint32_t queueFamilyCount = 0;
  vkGetPhysicalDeviceQueueFamilyProperties(physicalDevice, &queueFamilyCount, nullptr);
  std::vector<VkQueueFamilyProperties> queueFamilies(queueFamilyCount);
  vkGetPhysicalDeviceQueueFamilyProperties(physicalDevice, &queueFamilyCount, queueFamilies.data());
  int i = 0;
  for (const auto& queueFamily:queueFamilies) {
    // set queue family index
    if (
      (queueFamily.queueCount > 0) &&
      (queueFamily.queueFlags & VK_QUEUE_GRAPHICS_BIT)
    ) graphicsFamily = i++;
    VkBool32 presentSupport = false;
    vkGetPhysicalDeviceSurfaceSupportKHR(physicalDevice, i, surface, &presentSupport);
    // set queue present index
    if (
      (queueFamily.queueCount > 0) &&
      (presentSupport)
    ) presentFamily = i;
    if (graphicsFamily >= 0 && presentFamily >= 0) break;
  }
  *pQueueFamilyIndex = graphicsFamily;
  *pPresentFamilyIndex = presentFamily;
};

static const char *VkPhysicalDeviceTypeString(VkPhysicalDeviceType type) {
  switch (type) {
    #define STR(r)                    \
    case VK_PHYSICAL_DEVICE_TYPE_##r: \
      return #r
      STR(OTHER);
      STR(INTEGRATED_GPU);
      STR(DISCRETE_GPU);
      STR(VIRTUAL_GPU);
      STR(CPU);
    #undef STR
    default:
      return "UNKNOWN_DEVICE";
  };
};

void printPhysicalDeviceProperties(VkPhysicalDeviceProperties *props) {
  const uint32_t apiVersion = props->apiVersion;
  const uint32_t major = VK_VERSION_MAJOR(apiVersion);
  const uint32_t minor = VK_VERSION_MINOR(apiVersion);
  const uint32_t patch = VK_VERSION_PATCH(apiVersion);
  printf("VULKAN %d.%d.%d\n", major, minor, patch);
  printf("Device type: %s\n", VkPhysicalDeviceTypeString(props->deviceType));
  printf("Device name: %s\n", props->deviceName);
};

void choosePhysicalDevice(void) {
  VkPhysicalDevice device = VK_NULL_HANDLE;
  VkPhysicalDeviceFeatures deviceFeatures;
  VkPhysicalDeviceProperties deviceProperties;
  uint32_t deviceCount = 0;
  vkEnumeratePhysicalDevices(instance, &deviceCount, nullptr);
  if (deviceCount <= 0) throw std::runtime_error("No render devices available!");
  std::vector<VkPhysicalDevice> devices(deviceCount);
  vkEnumeratePhysicalDevices(instance, &deviceCount, devices.data());
  // use first device
  device = devices.front();
  vkGetPhysicalDeviceFeatures(device, &deviceFeatures);
  vkGetPhysicalDeviceProperties(device, &deviceProperties);
  printPhysicalDeviceProperties(&deviceProperties);
  // set the global physical device
  physicalDevice = device;
};

void createLogicalDevice(void) {
  float queuePriority = 1.0f;
  int queueFamilyIndex = 0;
  int presentFamilyIndex = 0;
  getQueueFamilyIndices(&queueFamilyIndex, &presentFamilyIndex);
  std::vector<VkDeviceQueueCreateInfo> queueInfos;
  std::set<int> uniqueQueueFamilies = {queueFamilyIndex, presentFamilyIndex};
  for (int queueFamilyIndex:uniqueQueueFamilies) {
    VkDeviceQueueCreateInfo queueInfo = {};
    queueInfo.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
    queueInfo.queueFamilyIndex = queueFamilyIndex;
    queueInfo.queueCount = 1;
    queueInfo.pQueuePriorities = &queuePriority;
    queueInfos.push_back(queueInfo);
  };
  // fill device
  VkDeviceCreateInfo deviceInfo = {};
  VkPhysicalDeviceFeatures deviceFeatures = {};
  deviceInfo.sType = VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO;
  // queue
  deviceInfo.pQueueCreateInfos = queueInfos.data();
  deviceInfo.queueCreateInfoCount = static_cast<uint32_t>(queueInfos.size());
  // device features
  deviceInfo.pEnabledFeatures = &deviceFeatures;
  // extensions
  deviceInfo.ppEnabledExtensionNames = deviceExtensions.data();
  deviceInfo.enabledExtensionCount = static_cast<uint32_t>(deviceExtensions.size());
  // layers
  deviceInfo.enabledLayerCount = 0;
  if (vkCreateDevice(physicalDevice, &deviceInfo, nullptr, &device) != VK_SUCCESS) {
    throw std::runtime_error("Failed to create logical device!");
  }
  // attach device queues
  vkGetDeviceQueue(device, queueFamilyIndex, 0, &graphicQueue);
  vkGetDeviceQueue(device, presentFamilyIndex, 0, &presentQueue);
};

void createSwapChain(void) {
  /*SwapChainSupportDetails details = createSwapDetails();
  VkSurfaceFormatKHR surfaceFormat = chooseSwapSurfaceFormat(details.formats);
  VkPresentModeKHR presentMode = chooseSwapPresentMode(details.presentModes);
  VkExtent2D extent = chooseSwapExtent(details.capabilities);*/
};

/*SwapChainSupportDetails createSwapDetails(void) {
  SwapChainSupportDetails details;
  uint32_t formatCount = 0;
  uint32_t presentCount = 0;
  vkGetPhysicalDeviceSurfaceCapabilitiesKHR(physicalDevice, surface, &details.capabilities);
  // format
  vkGetPhysicalDeviceSurfaceFormatsKHR(physicalDevice, surface, &formatCount, nullptr);
  if (formatCount != 0) {
    details.formats.resize(formatCount);
    vkGetPhysicalDeviceSurfaceFormatsKHR(physicalDevice, surface, &formatCount, details.format.data());
  }
  // presentation
  vkGetPhysicalDeviceSurfacePresentModesKHR(physicalDevice, surface, &presentCount, nullptr);
  if (presentCount != 0) {
    details.presentModes.resize(presentCount);
    vkGetPhysicalDeviceSurfacePresentModesKHR(physicalDevice, surface, &presentCount, details.presentModes.data());
  }
  return details;
};*/

VkSurfaceFormatKHR chooseSwapSurfaceFormat(const std::vector<VkSurfaceFormatKHR> &formats) {
  VkSurfaceFormatKHR first = formats[0];
  if (formats.size() == 1 && first.format == VK_FORMAT_UNDEFINED) {
    return {VK_FORMAT_B8G8R8A8_UNORM, VK_COLOR_SPACE_SRGB_NONLINEAR_KHR};
  }
  for (const auto& entry:formats) {
    if (
      (entry.format == VK_FORMAT_B8G8R8A8_UNORM) &&
      (entry.colorSpace == VK_COLOR_SPACE_SRGB_NONLINEAR_KHR)
    ) return entry;
  };
  return first;
};

VkPresentModeKHR chooseSwapPresentMode(const std::vector<VkPresentModeKHR> presentModes) {
  for (const auto& mode:presentModes) {
    // triple buffering, non-blocking fifo
    if (
      (mode == VK_PRESENT_MODE_MAILBOX_KHR) ||
      // fallback
      (mode == VK_PRESENT_MODE_IMMEDIATE_KHR)
    ) return mode;
  };
  // buffering, blocking when empty
  return VK_PRESENT_MODE_FIFO_KHR;
};
/*
VkExtend2D chooseSwapExtent(const VkSurfaceCapabilitiesKHR &capabilities) {
  return capabilities.currentExtent;
};
*/
void createSurface(void) {
  /*VkWin32SurfaceCreateInfoKHR surfaceInfo = {};
  surfaceInfo.sType = VK_STRUCTURE_TYPE_WIN32_SURFACE_CREATE_INFO_KHR;
  surfaceInfo.hwnd = glfwGetWin32Window(window);
  surfaceInfo.hinstance = GetModuleHandle(nullptr);
  auto createWin32SurfaceKHR = (
    (PFN_vkCreateWin32SurfaceKHR) vkGetInstanceProcAddr(instance, "vkCreateWin32SurfaceKHR")
  );
  if (
    (!createWin32SurfaceKHR) ||
    (createWin32SurfaceKHR(instance, &surfaceInfo, nullptr, &surface)) != VK_SUCCESS
  ) throw std::runtime_error("Failed to create window surface!");*/
  if (glfwCreateWindowSurface(instance, window, nullptr, &surface) != VK_SUCCESS) {
    throw std::runtime_error("Failed to create window surface!");
  }
};

void createWindow(int width, int height) {
  glfwInit();

  glfwWindowHint(GLFW_CLIENT_API, GLFW_NO_API);
  glfwWindowHint(GLFW_RESIZABLE, GLFW_FALSE);

  window = glfwCreateWindow(width, height, "Vulkan", nullptr, nullptr);

  glm::mat4 matrix;
  glm::vec4 vec;
  auto test = matrix * vec;
};

void createRenderLoop(void) {
  while (!glfwWindowShouldClose(window)) {
    glfwPollEvents();
  };
  glfwDestroyWindow(window);
  glfwTerminate();
};

void setup(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  int width = static_cast<int>(info[0]->NumberValue());
  int height = static_cast<int>(info[1]->NumberValue());
  createWindow(width, height);
  createInstance();
  createSurface();
  choosePhysicalDevice();
  createLogicalDevice();
  createSwapChain();
  createRenderLoop();
};

void init(v8::Local<v8::Object> exports) {
  EXPORT_FN(setup);
};

NODE_MODULE(NODE_GYP_MODULE_NAME, init);
