{
  "variables": {
    "root": "../..",
    "platform": "<(OS)",
    "vkSDK": "C:/VulkanSDK/1.1.85.0"
  },
  "conditions": [
    [ "platform == 'win'", { "variables": { "platform": "win" } } ],
    [ "platform == 'mac'", { "variables": { "platform": "darwin" } } ]
  ],
  "targets": [
    {
      "target_name": "action_after_build",
      "type": "none",
      "conditions": []
    },
    {
      "target_name": "addon",
      "sources": [
        "./src/index.cpp",
"./src/source.cpp"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "<(root)/lib/include/",
        "<(vkSDK)/Include"
      ],
      "library_dirs": [
        "<(root)/lib/<(platform)/<(target_arch)/GLFW",
        "<(vkSDK)/Lib"
      ],
      "conditions": [
        [
          "OS=='win'",
          {
            "cflags": [
              "-stdlib=libstdc++"
            ],
            "link_settings": {
              "libraries": [
                "-lglfw3dll.lib",
                "-lvulkan-1.lib"
              ]
            },
            "defines": [
              "WIN32_LEAN_AND_MEAN",
              "VC_EXTRALEAN",
              "_ITERATOR_DEBUG_LEVEL=0",
              "_HAS_EXCEPTIONS=1"
            ],
            "msvs_settings": {
              "VCCLCompilerTool": {
                "FavorSizeOrSpeed": 1,
                "StringPooling": "true",
                "Optimization": 2,
                "WarningLevel": 3,
                "AdditionalOptions": ["/MP /EHsc"],
                "ExceptionHandling": 1
              },
              "VCLibrarianTool": {
                "AdditionalOptions" : ["/NODEFAULTLIB:MSVCRT"]
              },
              "VCLinkerTool": {
                
      "LinkTimeCodeGeneration": 1,
      "LinkIncremental": 1
    ,
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
