{
  "variables": {
    "root": "../../..",
    "platform": "<(OS)",
    "release": "<@(module_root_dir)/build/Release",
    "vkSDK": "/mnt/c/Users/User/Desktop/lxss-shared/1.1.114.0/x86_64"
  },
  "conditions": [
    [ "platform == 'win'", { "variables": { "platform": "win" } } ],
    [ "platform == 'linux'", { "variables": { "platform": "linux" } } ],
    [ "platform == 'mac'", { "variables": { "platform": "darwin" } } ]
  ],
  "targets": [
    {
      "target_name": "action_after_build",
      "type": "none",
      "conditions": []
    },
    {
      "sources": [
        "./src/index.cpp"
      ],
      "conditions": [
        [
          "OS=='win'",
          {
            "target_name": "addon-win32",
            "cflags": [
              "-stdlib=libstdc++"
            ],
            "include_dirs": [
              "<!@(node -p \"require('node-addon-api').include\")",
              "<(root)/lib/include/",
              "<(vkSDK)/include"
            ],
            "library_dirs": [
              "<(root)/lib/<(platform)/<(target_arch)/GLFW",
              "<(vkSDK)/lib"
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
          },
          "OS=='linux'",
          {
            "target_name": "addon-linux",
            "include_dirs": [
              "<!@(node -p \"require('node-addon-api').include\")",
              "<(root)/lib/include/",
              "<(vkSDK)/include"
            ],
            "cflags": [
              "-std=c++11",
              "-fexceptions",
              "-Wno-switch",
              "-Wno-unused",
              "-Wno-uninitialized",
            ],
            "cflags_cc": [
              "-std=c++11",
              "-fexceptions",
              "-Wno-switch",
              "-Wno-unused",
              "-Wno-uninitialized"
            ],
            "libraries": [
              "-Wl,-rpath,<(release)",
              "<(release)/libvulkan.so",
              "<(release)/../../<(root)/lib/<(platform)/<(target_arch)/GLFW/libglfw3.a",
              "-lvulkan",
              "-lXrandr",
              "-lXi",
              "-lX11",
              "-lXxf86vm",
              "-lXinerama",
              "-lXcursor",
              "-ldl",
              "-pthread"
            ]
          },
          "OS=='mac'",
          {
            "defines": [
              "NAPI_DISABLE_CPP_EXCEPTIONS"
            ],
            "target_name": "addon-darwin",
            "include_dirs": [
              "<!@(node -p \"require('node-addon-api').include\")",
              "<(root)/lib/include",
              "<(vkSDK)/include"
            ],
            "libraries": [
              "<(release)/libvulkan.dylib",
              "<(release)/libMoltenVK.dylib",
              "<(release)/../../<(root)/lib/<(platform)/<(target_arch)/GLFW/libglfw3.a"
            ],
            "xcode_settings": {
              "OTHER_CPLUSPLUSFLAGS": [
                "-std=c++11",
                "-stdlib=libc++"
              ],
              "OTHER_LDFLAGS": [
                "-Wl,-rpath,<(release)",
                "-lvulkan",
                "-lMoltenVK",
                "-framework Cocoa",
                "-framework IOKit",
                "-framework Metal",
                "-framework QuartzCore"
              ],
              "LIBRARY_SEARCH_PATHS": [
                "<(release)"
              ]
            }
          }
        ]
      ]
    }
  ]
}