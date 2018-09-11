{
  "variables": {
    "root": "../..",
    "platform": "<(OS)",
    "vkVersion": "1.1.82.0",
    "vkSDK": "C:/VulkanSDK"
  },
  "conditions": [
    [ "platform == 'win'", { "variables": { "platform": "windows" } } ],
    [ "platform == 'mac'", { "variables": { "platform": "darwin" } } ]
  ],
  "targets": [
    {
      "target_name": "action_after_build",
      "type": "none",
      "conditions": [
        [
          "OS=='win'",
          {
            "copies": [
              {
                "files": [
                  "<(root)/lib/<(platform)/<(target_arch)/GLEW/glew32.dll",
                  "<(root)/lib/<(platform)/<(target_arch)/GLFW/glfw3.dll"
                ],
                "destination": "<(PRODUCT_DIR)"
              }
            ]
          }
        ]
      ]
    },
    {
      "target_name": "addon",
      "sources": [ "./src/VkOffset2D.cpp",
"./src/VkExtent2D.cpp",
"./src/VkExtent3D.cpp",
"./src/VkRect2D.cpp",
"./src/VkClearRect.cpp",
"./src/VkPhysicalDeviceProperties.cpp",
"./src/VkApplicationInfo.cpp",
"./src/VkDeviceQueueCreateInfo.cpp",
"./src/VkDeviceCreateInfo.cpp",
"./src/VkInstanceCreateInfo.cpp",
"./src/VkQueueFamilyProperties.cpp",
"./src/VkBufferCreateInfo.cpp",
"./src/VkImageSubresourceRange.cpp",
"./src/VkImageMemoryBarrier.cpp",
"./src/VkPhysicalDeviceFeatures.cpp",
"./src/VkPhysicalDeviceSparseProperties.cpp",
"./src/VkPhysicalDeviceLimits.cpp",
"./src/VkBindImagePlaneMemoryInfo.cpp",
"./src/VkInstance.cpp",
"./src/VkPhysicalDevice.cpp",
"./src/VkDevice.cpp",
"./src/VkQueue.cpp",
"./src/VkCommandBuffer.cpp",
"./src/VkDeviceMemory.cpp",
"./src/VkCommandPool.cpp",
"./src/VkBuffer.cpp",
"./src/VkBufferView.cpp",
"./src/VkImage.cpp",
"./src/VkImageView.cpp",
"./src/VkShaderModule.cpp",
"./src/VkPipeline.cpp",
"./src/VkPipelineLayout.cpp",
"./src/VkSampler.cpp",
"./src/VkDescriptorSet.cpp",
"./src/VkDescriptorSetLayout.cpp",
"./src/VkDescriptorPool.cpp",
"./src/VkFence.cpp",
"./src/VkSemaphore.cpp",
"./src/VkEvent.cpp",
"./src/VkQueryPool.cpp",
"./src/VkFramebuffer.cpp",
"./src/VkRenderPass.cpp",
"./src/VkPipelineCache.cpp",
"./src/VkObjectTableNVX.cpp",
"./src/VkIndirectCommandsLayoutNVX.cpp",
"./src/VkDescriptorUpdateTemplate.cpp",
"./src/VkSamplerYcbcrConversion.cpp",
"./src/VkValidationCacheEXT.cpp",
"./src/VkDisplayKHR.cpp",
"./src/VkDisplayModeKHR.cpp",
"./src/VkSurfaceKHR.cpp",
"./src/VkSwapchainKHR.cpp",
"./src/VkDebugReportCallbackEXT.cpp",
"./src/VkDebugUtilsMessengerEXT.cpp",
"./src/index.cpp" ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "<(root)/lib/include",
        "<(vkSDK)/<(vkVersion)/Include"
      ],
      "library_dirs": [
        "<(root)/lib/<(platform)/<(target_arch)/GLFW",
        "<(root)/lib/<(platform)/<(target_arch)/GLEW",
        "<(vkSDK)/<(vkVersion)/Lib"
      ],
      "conditions": [
        [
          "OS=='mac'",
          {
            "include_dirs": [ "<!@(pkg-config glfw3 glew --cflags-only-I | sed s/-I//g)"],
            "libraries": [ "<!@(pkg-config --libs glfw3 glew)", "-framework OpenGL"],
            "library_dirs": [ "/usr/local/lib" ],
            "xcode_settings": {
              "OTHER_CPLUSPLUSFLAGS" : ["-std=c++11", "-stdlib=libc++"],
              "OTHER_LDFLAGS": ["-stdlib=libc++"],
              "MACOSX_DEPLOYMENT_TARGET": "10.10"
            }
          }
        ],
        [
          "OS=='win'",
          {
            "cflags": [
              "-stdlib=libstdc++"
            ],
            "link_settings": {
              "libraries": [
                "-lglfw3dll.lib",
                "-lglew32.lib",
                "-lvulkan-1.lib"
              ]
            },
            "defines": [
              "WIN32_LEAN_AND_MEAN",
              "VC_EXTRALEAN",
              "_ITERATOR_DEBUG_LEVEL=0"
            ],
            "msvs_settings": {
              "VCCLCompilerTool": {
                "AdditionalOptions": ["/MP /EHsc"]
              },
              "VCLibrarianTool": {
                "AdditionalOptions" : ["/NODEFAULTLIB:MSVCRT"]
              },
              "VCLinkerTool": {
                "LinkTimeCodeGeneration": 1,
                "LinkIncremental": 1
              }
            }
          }
        ]
      ]
    }
  ]
}
