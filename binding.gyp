{
  "variables": {
    "platform": "<(OS)",
    "vkVersion": "1.1.77.0"
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
                  "./lib/<(platform)/<(target_arch)/GLEW/glew32.dll",
                  "./lib/<(platform)/<(target_arch)/GLFW/glfw3.dll"
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
      "sources": [
         "./generated/1.1.83/VkOffset2D.cpp",
         "./generated/1.1.83/VkExtent2D.cpp",
         "./generated/1.1.83/VkRect2D.cpp",
         "./generated/1.1.83/VkClearRect.cpp",
         "./generated/1.1.83/VkApplicationInfo.cpp",
         "./generated/1.1.83/VkDeviceQueueCreateInfo.cpp",
         "./generated/1.1.83/VkDeviceCreateInfo.cpp",
         "./generated/1.1.83/VkInstanceCreateInfo.cpp",
         "./generated/1.1.83/VkBufferCreateInfo.cpp",
         "./generated/1.1.83/VkImageSubresourceRange.cpp",
         "./generated/1.1.83/VkImageMemoryBarrier.cpp",
         "./generated/1.1.83/VkPhysicalDeviceFeatures.cpp",
         "./generated/1.1.83/VkBindImagePlaneMemoryInfo.cpp",
         "./generated/1.1.83/VkInstance.cpp",
         "./generated/1.1.83/VkPhysicalDevice.cpp",
         "./generated/1.1.83/VkDevice.cpp",
         "./generated/1.1.83/VkQueue.cpp",
         "./generated/1.1.83/VkCommandBuffer.cpp",
         "./generated/1.1.83/VkDeviceMemory.cpp",
         "./generated/1.1.83/VkCommandPool.cpp",
         "./generated/1.1.83/VkBuffer.cpp",
         "./generated/1.1.83/VkBufferView.cpp",
         "./generated/1.1.83/VkImage.cpp",
         "./generated/1.1.83/VkImageView.cpp",
         "./generated/1.1.83/VkShaderModule.cpp",
         "./generated/1.1.83/VkPipeline.cpp",
         "./generated/1.1.83/VkPipelineLayout.cpp",
         "./generated/1.1.83/VkSampler.cpp",
         "./generated/1.1.83/VkDescriptorSet.cpp",
         "./generated/1.1.83/VkDescriptorSetLayout.cpp",
         "./generated/1.1.83/VkDescriptorPool.cpp",
         "./generated/1.1.83/VkFence.cpp",
         "./generated/1.1.83/VkSemaphore.cpp",
         "./generated/1.1.83/VkEvent.cpp",
         "./generated/1.1.83/VkQueryPool.cpp",
         "./generated/1.1.83/VkFramebuffer.cpp",
         "./generated/1.1.83/VkRenderPass.cpp",
         "./generated/1.1.83/VkPipelineCache.cpp",
         "./generated/1.1.83/VkObjectTableNVX.cpp",
         "./generated/1.1.83/VkIndirectCommandsLayoutNVX.cpp",
         "./generated/1.1.83/VkDescriptorUpdateTemplate.cpp",
         "./generated/1.1.83/VkSamplerYcbcrConversion.cpp",
         "./generated/1.1.83/VkValidationCacheEXT.cpp",
         "./generated/1.1.83/VkDisplayKHR.cpp",
         "./generated/1.1.83/VkDisplayModeKHR.cpp",
         "./generated/1.1.83/VkSurfaceKHR.cpp",
         "./generated/1.1.83/VkSwapchainKHR.cpp",
         "./generated/1.1.83/VkDebugReportCallbackEXT.cpp",
         "./generated/1.1.83/VkDebugUtilsMessengerEXT.cpp",
         "./generated/1.1.83/index.cpp"
      ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "./lib/include",
        "C:/VulkanSDK/<(vkVersion)/Include"
      ],
      "library_dirs": [
        "./lib/<(platform)/<(target_arch)/GLFW",
        "./lib/<(platform)/<(target_arch)/GLEW",
        "C:/VulkanSDK/<(vkVersion)/Lib"
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
                "LinkIncremental": 1,
                "AdditionalLibraryDirectories": [
                  "../@PROJECT_SOURCE_DIR@/lib/<(platform)/<(target_arch)",
                ]
              }
            }
          }
        ]
      ]
    }
  ]
}
