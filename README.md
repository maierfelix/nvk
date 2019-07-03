<p align="center">
  <a href="#">
    <img src="https://i.imgur.com/7rnMbVp.png" height="204">
  </a>
  <br/>
  <br/>
  <a href="https://www.npmjs.com/package/nvk">
    <img src="https://img.shields.io/npm/v/nvk.svg?style=flat-square" alt="NPM Version" />
  </a>
  <a href="https://vulkan.lunarg.com/doc/view/1.1.108.0/mac/chunked_spec/chap34.html">
    <img src="https://img.shields.io/badge/vulkan-1.1.108-f07178.svg?style=flat-square" alt="Vulkan Header Version" />
  </a>
  <a href="//www.npmjs.com/package/nvk">
    <img src="https://img.shields.io/npm/dt/nvk.svg?style=flat-square" alt="NPM Downloads" />
  </a>
</p>

#

This is a low-abstraction, high-performance [Vulkan](https://en.wikipedia.org/wiki/Vulkan_(API)) API with interfaces for JavaScript and [TypeScript](#typescript). Currently the latest supported Vulkan version is *1.1.108*, which includes support for e.g. Compute Shaders and NVIDIA's Real-Time Ray Tracing Pipeline `VK_NV_raytracing`.

### Platforms:

*nvk* comes with pre-built N-API binaries for the following platforms:

|       OS      |     Status    |
| ------------- | ------------- |
| Windows       | ‌‌ ‌‌ ‌‌ ‌‌ ‌‌ ‌‌ ✔ ‌‌ ‌‌ ‌‌ ‌‌ ‌‌ ‌‌|
| Linux         | ‌‌ ‌‌ ‌‌ ‌‌ ‌‌ ‌‌ ✔ ‌‌ ‌‌ ‌‌ ‌‌ ‌‌ ‌‌|
| Mac           | ‌‌ ‌‌ ‌‌ ‌‌ ‌‌ ‌‌ ✔ ‌‌ ‌‌ ‌‌ ‌‌ ‌‌ ‌‌|

### Why Vulkan in JavaScript?
 - Less overhead than WebGL/OpenGL
 - Essential features like Compute, Geometry and Tesselation shaders
 - API for Realtime Raytracing
 - Multi-threading
 - Low-level memory control using [ArrayBuffers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

This project is a *very* thin layer above Vulkan, built with simplicity and performance in mind. Native memory for Vulkan gets built entirely within JavaScript to reduce trampolining overhead. Bounding checks and type validations are enabled by default, but can be disabled using the `--disable-validation-checks` flag.

#

  * [Installation](#installation)
  * [Example](#example)
  * [TypeScript](#typescript)
  * [Syntactic Sugar](#syntactic-sugar)
      - [sType auto-filling](#stype-auto-filling)
      - [Structure creation shortcut](#structure-creation-shortcut)
      - [Nested structures](#nested-structures)
  * [Project Structure](#project-structure)
  * [Binding Code Generator](#binding-code-generator)
  * [Linking](#linking)
  * [Build Instructions](#build-instructions)
    + [Requirements](#requirements)
    + [Windows](#windows)
    + [Linux](#linux)
    + [MacOS](#macos)
  * [CLI](#cli)
      - [Syntax](#syntax)
      - [Flags](#flags)
    + [Usage](#usage)
      - [Generation](#generation)
      - [Building](#building)
  * [TODOs](#todos)

## Installation:

This project comes with pre-built binaries, so to install *nvk* simply run:

````
npm install nvk
````

## Example:

In most cases the bindings match the C99 style of Vulkan. This allows you to follow existing C/C++ tutorials, but write the implementation itself with *nvk*. Note that both interfaces end up with a similar amount of code. Optionally you can use some [syntactic sugar](#syntactic-sugar) to write things quicker.

JavaScript/TypeScript:
````js
let instance = new VkInstance();
let appInfo = new VkApplicationInfo();
appInfo.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
appInfo.pApplicationName = "App";
appInfo.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
appInfo.pEngineName = "Engine";
appInfo.engineVersion = VK_MAKE_VERSION(1, 0, 0);
appInfo.apiVersion = VK_API_VERSION_1_0;

let validationLayers = [
  "VK_LAYER_LUNARG_standard_validation"
];
let instanceInfo = new VkInstanceCreateInfo();
instanceInfo.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
instanceInfo.pApplicationInfo = appInfo;
instanceInfo.ppEnabledLayerNames = validationLayers;
instanceInfo.enabledLayerCount = validationLayers.length;
vkCreateInstance(instanceInfo, null, instance);
````

C++:
````cpp
VkInstance instance;
VkApplicationInfo appInfo = {};
appInfo.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
appInfo.pApplicationName = "App";
appInfo.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
appInfo.pEngineName = "Engine";
appInfo.engineVersion = VK_MAKE_VERSION(1, 0, 0);
appInfo.apiVersion = VK_API_VERSION_1_0;

const std::vector<const char*> validationLayers = {
  "VK_LAYER_LUNARG_standard_validation"
};
VkInstanceCreateInfo instanceInfo = {};
instanceInfo.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
instanceInfo.pApplicationInfo = &appInfo;
instanceInfo.ppEnabledLayerNames = validationLayers.data();
instanceInfo.enabledLayerCount = static_cast<uint32_t>(validationLayers.size());
vkCreateInstance(&instanceInfo, nullptr, &instance);
````

## TypeScript:

To use the TypeScript definition file, simply follow the installation steps above or use [this](https://github.com/maierfelix/nvk-examples/tree/master/typescript) example as a reference. Afterwards in your `.ts` file, import and use *nvk* as follows:

````ts
import * as nvk from "nvk/generated/1.1.108/index";

Object.assign(global, nvk);

let win = new VulkanWindow({
  width: 480,
  height: 320,
  title: "typescript-example"
});

let appInfo = new VkApplicationInfo({
  pApplicationName: "Hello!",
  applicationVersion: VK_MAKE_VERSION(1, 0, 0),
  pEngineName: "No Engine",
  engineVersion: VK_MAKE_VERSION(1, 0, 0),
  apiVersion: VK_API_VERSION_1_0
});
````

Also note, that it is recommended to enable the `--strict` mode in the TS compiler options and use the latest version of the TS compiler.

## Syntactic Sugar:

The API gives you some sugar to write things quicker, but still gives you the option to write everything explicitly

#### sType auto-filling
`sType` members get auto-filled, but you can still set them yourself

````js
let appInfo = new VkApplicationInfo();
appInfo.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
````

Becomes:
````js
let appInfo = new VkApplicationInfo(); // sType auto-filled
````

#### Structure creation shortcut

Instead of:
````js
let offset = new VkOffset2D();
offset.x = 0;
offset.y = 0;
let extent = new VkExtent2D();
extent.width = 640;
extent.height = 480;
let renderArea = new VkRect2D();
renderArea.offset = offset;
renderArea.extent = extent;
````

You can write:
````js
let renderArea = new VkRect2D({
  offset: new VkOffset2D({ x: 0, y: 0 }),
  extent: new VkExtent2D({ width: 640, height: 480 })
});
````

#### Nested structures

*nvk* allows to use nested structures to improve memory usage and performance. A nested structure is pre-allocated automatically and shares the native memory of it's top-level structure.
You can use the `--enable-shared-memory-hints` flag, to get hints where you could've used a nested structure in your code.

Instead of:
````js
let scissor = new VkRect2D();
scissor.offset = new VkOffset2D();
scissor.extent = new VkExtent2D();
scissor.offset.x = 0;
scissor.offset.y = 0;
scissor.extent.width = 480;
scissor.extent.height = 320;
````

You can write:
````js
let scissor = new VkRect2D();
scissor.offset.x = 0;
scissor.offset.y = 0;
scissor.extent.width = 480;
scissor.extent.height = 320;
````

## Project Structure:
 - `docs`: generated vulkan documentation files
 - `generator`: code for binding generation
 - `generated`: the generated binding code
 - `examples`: ready-to-run examples
 - `lib`: required third party libs
 - `src`: classes for e.g. window creation

This tool uses a new JavaScript type called [`BigInt`](https://developers.google.com/web/updates/2018/05/bigint) to represent memory addresses returned by Vulkan. The `BigInt` type was recently added, so make sure you use a recent node.js version.

## Binding Code Generator:

The Generator generates code based on a `vk.xml` specification file. It first converts the XML file into an [AST](https://raw.githubusercontent.com/maierfelix/nvk/master/generated/1.1.108/ast.json), which is then used by the code generator. Currently more than `~300.000` lines of code get generated, where `~60.000` lines are JavaScript, `~50.000` lines are TypeScript, `~40.000` lines are C++ code and the rest code for the documentation and AST.

Starting from version `0.5.0`, *nvk* now uses a concept called *Hybrid bindings*, which reduces the overhead of JavaScript<->C++ context switching. Structures tend to have many members, where each member has to be a getter/setter function. Before this change, these getters/setters were written in C++, so there were many tiny context switches. Now the native memory of Structures and Handles just get filled entirely within JavaScript (see the file [here](https://raw.githubusercontent.com/maierfelix/nvk/master/generated/1.1.108/win32/interfaces.js)), resulting in much less overhead and much simpler binding and generator code.

## Linking:

This section is of interest, if you have an existing C++ project and want to link against this one.

This project mostly doesn't requires to be linked against. All structures and handles have properties to access the underlying memory directly. For example, see [VkApplicationInfo](https://maierfelix.github.io/nvk/1.1.108/structs/VkApplicationInfo.html) (#Default Properties).

Structures and handles come with these 3 properties:

 - *.memoryBuffer*: Reference to the underlying native memory, wrapped inside an [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)
 - *.memoryAddress*: Native address (BigInt) of *memoryBuffer*. To convert BigInt into a native type, see e.g. [this](https://github.com/nodejs/node-addon-api/blob/master/doc/bigint.md#int64value) document
 - *.byteLength*: Total native bytelength of the structure/handle

## Build Instructions:

**Warning**: You may want to **skip this section**, as *nvk* uses [N-API](https://nodejs.org/api/n-api.html#n_api_n_api) and ships pre-compiled binaries. This section is only of interest if you want to generate and build the bindings yourself, which is likely not your intention!

This project requires two-pass compilation which means, after initially compiling the bindings, a second compilation is required. This is necessary, because this project constructs Vulkan memory entirely from within JavaScript.
 - At the first compilation, memory layouts of vulkan structures get stored inside a JSON file
 - At the second pass, these memory layout then get used to inline memory offsets inside the JavaScript binding code

### Requirements:
 - node.js >= v10.9.0 recommended

### Windows:
If you already have Visual Studio >= 15 installed, then just make sure to have Python `2.7.x` installed.

If you don't have Visual Studio, then install the following package:
````
npm install --global --production windows-build-tools
````

Now install the corresponding Vulkan SDK version from [here](https://vulkan.lunarg.com/sdk/home#windows).

Next, clone this repository.

To generate and compile the bindings, run:
````
npm run generate --vkversion=x
npm run build --vkversion=x
````

### Linux:

Download and setup the corresponding Vulkan SDK version from [here](https://vulkan.lunarg.com/sdk/home#linux).

Follow the guide on how to correctly setup the SDK.
Make sure that the environment variables are correctly set, e.g. `echo $VULKAN_SDK`.

Next, clone this repository.

To generate and compile the bindings, run:
````
npm run generate --vkversion=x
npm run build --vkversion=x
````

### MacOS:

Download and setup the corresponding Vulkan SDK version from [here](https://vulkan.lunarg.com/sdk/home#mac).

Follow the guide on how to correctly setup the SDK.
Make sure that the environment variables are correctly set, e.g. `echo $VULKAN_SDK`.

Next, clone this repository.

To generate and compile the bindings, run:
````
npm run generate --vkversion=x
npm run build --vkversion=x
````

## CLI:

#### Syntax:
````
npm run [script] [flag] [value]
````

### Usage:

#### General:
````
[--disable-validation-checks]: Disables type and bounding checks for better performance
[--enable-shared-memory-hints]: Enables console hints, reporting to use nested structures when possible - useful for performance optimization
````

#### Generator:
You can generate bindings with:
````
npm run generate --vkversion=1.1.108
````

The generated bindings can then be found in `generated/{vkversion}/${platform}`

 - Make sure the specified version to generate bindings for can be found [here](https://github.com/KhronosGroup/Vulkan-Docs/releases)
 - The binding specification file gets auto-downloaded and is stored in `generate/specifications/{vkversion}.xml`<br/>
 - `--incremental` flag should only be used if you're a developer of *nvk*

##### Flags:
````
[--vkversion]: The Vulkan version to generate bindings for
[--fake-platform]: Allows to specify a fake platform to generate bindings for. Only use this when the native bindings don't have to be recompiled! A useful but dangerous flag
[--disable-minification]: Disables code minification of the JavaScript interfaces
[--incremental]: Enables incremental builds when building the bindings
[--docs]: Generates HTML-based documentation, also used for TypeScript type annotations
````

#### Building:
You can build the generated bindings with:
````
npm run build --vkversion=1.1.108
````

The compiled bindings can then be found in `generated/{vkversion}/build`

##### Flags:
````
[--vkversion]: The Vulkan version to build bindings for
[--msvsversion]: The Visual Studio version to build the bindings with
````

## TODOs:
 - [ ] Function generation (~95%)
 - [ ] Documentation generator (95%)
