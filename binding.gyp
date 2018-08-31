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
         "./generate/generated/index.cpp",
         "./generate/generated/VkOffset2D.cpp",
         "./generate/generated/VkExtent2D.cpp",
         "./generate/generated/VkRect2D.cpp",
         "./generate/generated/VkClearRect.cpp",
         "./generate/generated/VkApplicationInfo.cpp",
         "./generate/generated/VkDeviceQueueCreateInfo.cpp",
         "./generate/generated/VkDeviceCreateInfo.cpp",
         "./generate/generated/VkInstanceCreateInfo.cpp",
         "./generate/generated/VkBufferCreateInfo.cpp",
         "./generate/generated/VkImageSubresourceRange.cpp",
         "./generate/generated/VkImageMemoryBarrier.cpp",
         "./generate/generated/VkPhysicalDeviceFeatures.cpp",
         "./generate/generated/VkBindImagePlaneMemoryInfo.cpp",
         "./generate/generated/VkInstance.cpp",
         "./generate/generated/VkPhysicalDevice.cpp",
         "./generate/generated/VkDevice.cpp",
         "./generate/generated/VkQueue.cpp",
         "./generate/generated/VkCommandBuffer.cpp",
         "./generate/generated/VkDeviceMemory.cpp",
         "./generate/generated/VkCommandPool.cpp",
         "./generate/generated/VkBuffer.cpp",
         "./generate/generated/VkBufferView.cpp",
         "./generate/generated/VkImage.cpp",
         "./generate/generated/VkImageView.cpp",
         "./generate/generated/VkShaderModule.cpp",
         "./generate/generated/VkPipeline.cpp",
         "./generate/generated/VkPipelineLayout.cpp",
         "./generate/generated/VkSampler.cpp",
         "./generate/generated/VkDescriptorSet.cpp",
         "./generate/generated/VkDescriptorSetLayout.cpp",
         "./generate/generated/VkDescriptorPool.cpp",
         "./generate/generated/VkFence.cpp",
         "./generate/generated/VkSemaphore.cpp",
         "./generate/generated/VkEvent.cpp",
         "./generate/generated/VkQueryPool.cpp",
         "./generate/generated/VkFramebuffer.cpp",
         "./generate/generated/VkRenderPass.cpp",
         "./generate/generated/VkPipelineCache.cpp",
         "./generate/generated/VkObjectTableNVX.cpp",
         "./generate/generated/VkIndirectCommandsLayoutNVX.cpp",
         "./generate/generated/VkDescriptorUpdateTemplate.cpp",
         "./generate/generated/VkSamplerYcbcrConversion.cpp",
         "./generate/generated/VkValidationCacheEXT.cpp",
         "./generate/generated/VkDisplayKHR.cpp",
         "./generate/generated/VkDisplayModeKHR.cpp",
         "./generate/generated/VkSurfaceKHR.cpp",
         "./generate/generated/VkSwapchainKHR.cpp",
         "./generate/generated/VkDebugReportCallbackEXT.cpp",
         "./generate/generated/VkDebugUtilsMessengerEXT.cpp"
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
