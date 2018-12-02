<p align="center">
  <a href="//maierfelix.github.io/Iroh/">
    <img src="https://i.imgur.com/ihAIfaw.gif" height="182">
  </a>
</p>

#

This is a [Vulkan](https://en.wikipedia.org/wiki/Vulkan_(API)) API for node.js, which allows to interact from JavaScript/[TypeScript](#typescript) with the low-level interface of Vulkan. The API of this project strives to be as close as possible to Vulkan's C/C++ API.

#

  * [Preview](#preview)
  * [Example](#example)
  * [Installation](#installation)
    + [Requirements](#requirements)
    + [Windows](#windows)
  * [CLI](#cli)
      - [Syntax](#syntax)
      - [Flags](#flags)
    + [Usage](#usage)
      - [Generation](#generation)
      - [Building](#building)
  * [TypeScript](#typescript)
  * [Syntactic Sugar](#syntactic-sugar)
      - [sType auto-filling](#stype-auto-filling)
      - [Structure creation shortcut](#structure-creation-shortcut)
  * [Project Structure](#project-structure)
  * [Binding Code Generator](#binding-code-generator)
  * [HTML, CSS based UIs](#html-css-based-uis)
  * [TODOs](#todos)

## Preview:<br/>
<img src="https://i.imgur.com/cRrVc1N.gif" width="380">

You can find more previews and demos in [/examples](https://github.com/maierfelix/node-vulkan/tree/master/examples)

## Example:

In most cases the bindings match the native style of Vulkan. This allows you to follow existing C/C++ tutorials, but write the implementation itself with node-vulkan. Note that both interfaces end up with a similar amount of code. Optionally you can use some [syntactic sugar](#syntactic-sugar) to write things quicker.

JavaScript/TypeScript:
````js
let appInfo = new VkApplicationInfo();
appInfo.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
appInfo.pApplicationName = "App";
appInfo.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
appInfo.pEngineName = "Engine";
appInfo.engineVersion = VK_MAKE_VERSION(1, 0, 0);
appInfo.apiVersion = VK_API_VERSION_1_0;
````

C++:
````cpp
VkApplicationInfo appInfo = {};
appInfo.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
appInfo.pApplicationName = "App";
appInfo.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
appInfo.pEngineName = "Engine";
appInfo.engineVersion = VK_MAKE_VERSION(1, 0, 0);
appInfo.apiVersion = VK_API_VERSION_1_0;
````

## Installation:

<img src="https://i.imgur.com/CiWjods.png" width="380">

### Requirements:
 - node.js >= v10.9.0 recommended

### Windows:
Make sure you have Visual Studio >= 15 installed or use
````
npm install --global --production windows-build-tools
````

Install the corresponding Vulkan SDK version from [here](https://vulkan.lunarg.com/sdk/home#windows). The later installer will ask you to setup bindings for ``1.1.85``, so make sure you have ``Vulkan SDK 1.1.85`` installed.

Install node-vulkan
````
npm install node-vulkan
````

After installing node-vulkan, a setup will ask you, if it should automate the whole binding build process for you.

Afterwards you can `require` or `import` node-vulkan in your project!

## CLI:

#### Syntax:
````
npm run [script] [flag] [value]
````

#### Flags:
````
 [--vkversion] [version]: The Vulkan version to generate bindings for
 [--msvsversion] [msvsversion]: The Visual Studio version to build the bindings with
````

### Usage:

#### Generation:
You can specify a version to generate bindings for like this:
````
npm run generate --vkversion=1.1.85
````

 - Make sure the specified version to generate bindings for can be found [here](https://github.com/KhronosGroup/Vulkan-Docs/releases)
 - The binding specification file gets auto-downloaded and is stored in `generate/specifications/{vkversion}.xml`<br/>
 - The generated bindings can then be found in `generated/{vkversion}/`

#### Building:
You can build the generated bindings like this:
````
npm run build --vkversion=1.1.85 --msvsversion=2017
````

The compiled bindings can then be found in `generated/{vkversion}/build`

## TypeScript:

When generating bindings, a TypeScript definition file is auto-generated as well (see e.g. the file [here](https://github.com/maierfelix/node-vulkan/blob/master/generated/1.1.85/index.d.ts)).

To use the definition file, simply follow the installation steps above. Afterwards in your `.ts` file, import and use node-vulkan as follows:

````ts
import {
  VulkanWindow,
  VkApplicationInfo,
  VK_MAKE_VERSION,
  VK_API_VERSION_1_0
} from "node-vulkan/generated/1.1.85/index";

let win = new VulkanWindow({ width: 480, height: 320 });

let appInfo = new VkApplicationInfo({
  pApplicationName: "Hello!",
  applicationVersion: VK_MAKE_VERSION(1, 0, 0),
  pEngineName: "No Engine",
  engineVersion: VK_MAKE_VERSION(1, 0, 0),
  apiVersion: VK_API_VERSION_1_0
});
````

Also note, that it is recommended to enable the `--strict` mode in the compiler options.

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

## Project Structure:
 - `generator`: code for binding generation
 - `generated`: the generated binding code
 - `examples`: ready-to-run examples
 - `lib`: required third party libs
 - `src`: classes for e.g. window creation

This tool uses a new JavaScript type called [`BigInt`](https://developers.google.com/web/updates/2018/05/bigint) to represent memory addresses returned by Vulkan. The `BigInt` type was recently added, so make sure you use a recent node.js version.

## Binding Code Generator:

The Generator generates C++ code from a `vk.xml` specification file. It first converts the XML file into an [AST](https://raw.githubusercontent.com/maierfelix/node-vulkan/master/generated/1.1.85/ast.json), which is then used by the code generator. Currently a total of `~170.000` lines of code get generated, where `~110.000` lines are C++ code.

If you're interested in what a generated file look like, checkout [`calls.h`](https://github.com/maierfelix/node-vulkan/blob/master/generated/1.1.85/src/calls.h) or [`VkGraphicsPipelineCreateInfo.cpp`](https://github.com/maierfelix/node-vulkan/blob/master/generated/1.1.85/src/VkGraphicsPipelineCreateInfo.cpp)

## HTML, CSS based UIs

The [chromium-ui](https://github.com/maierfelix/node-vulkan/tree/chromium-ui) branch contains an experiment about letting users create UIs with a complete HTML/CSS browser toolchain. The website (browser frame) can then be rendered inside Vulkan. This is done using [Chromium-Embedded-Framework](https://bitbucket.org/chromiumembedded/cef). The browser texture is shared with vulkan's memory, so you can directly render it on top of your application. Oh yes!

There is one last thing that prevents me from merging it. At the moment, browser redraws trigger a CPU texture copying path, which is horribly slow. At the moment the pipeline is:

 - **[** CEF **|->** OpenGL **<->** Vulkan **]**

CEF recently got shared textures added, meaning crazy performance and no CPU wandering anymore! The above pipeline could now be:
 - **[** CEF **<->** D3D11 **<->** Vulkan **]**

---
 - **|->** copying
 - **<->** sharing

But CEF's shared textures on Windows require D3D11 which I'm not familiar with. If you're interested in helping and solving this one last step, please make a PR!

## TODOs:
 - [ ] Struct generation (~85%)
 - [x] Handle generation (~100%)
 - [x] Enum generation (100%)
 - [ ] Function generation (~85%)
 - [ ] Deallocation (~85%)
 - [ ] Vulkan API fill V8 reflection (~85%)
 - [ ] CEF D3D11 high-performance texture sharing (~0%)
