# node-vulkan
This is a Vulkan API for node.js.

The bindings are machine generated and provide an API to interact from JavaScript with the low-level interface of Vulkan. The API of this project strives to be as close as possible to Vulkan's original API.

**Note**: This is an early experiment, use with *honor*!

## Preview:<br/>
<img src="https://i.imgur.com/pT76hSl.gif" width="380">

## Structure:
 - `generator`: code for binding generation
 - `generated`: the generated binding code
 - `examples`: contains a triangle and cube demo
 - `lib`: required third party libs

## Requirements:
 - node.js >= v10.9.0

## Generator:

### Installation:

#### Windows:
Make sure you have either Visual Studio >= 15 installed or use
````
npm install --global --production windows-build-tools
````

Install the Vulkan SDK from [here](https://vulkan.lunarg.com/sdk/home#windows)

Clone this repo
````
git clone git@github.com:maierfelix/node-vulkan.git
````

Install dependencies
````
npm install
````

### API:

#### Syntax:
````
npm run [script] [flag] [value]
````

#### Flags:
````
 [-vkversion] [version]: The vulkan version to generate bindings for
````

### Usage:

#### Generation:
You can specify a version to generate bindings for like this:
````
npm run generate -vkversion=1.1.82
````

 - Make sure the specified version to generate bindings for can be found [here](https://github.com/KhronosGroup/Vulkan-Docs/releases)
 - The binding specification file gets auto-downloaded and is stored in `generate/specifications/{vkversion}.xml`<br/>
 - The generated bindings can then be found in `generated/{vkversion}/`

#### Building:
You can build the generated bindings like this:
````
npm run build -vkversion=1.1.82
````

The compiled bindings can then be found in `generated/{vkversion}/build`

## Syntactic Sugar:
 - `sType` is auto-filled, but can be explicitly set

### TODOs:
 - [ ] Struct generation (~85%)
 - [x] Handle generation (~100%)
 - [x] Enum generation (100%)
 - [ ] Function generation (~85%)
 - [ ] Deallocation (~0%)
 - [ ] Vulkan API fill V8 reflection (~85%)
