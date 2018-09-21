# node-vulkan
This is a Vulkan binding generator for node.js.

The bindings are machine generated and provide an API to interact from JavaScript with the low-level interface of Vulkan. The API of this project strives to be as close as possible to Vulkan's original API.

**Note**: This is an early experiment, use with *honor*!

## Structure:
 - `generator`: code for binding generation
 - `generated`: the generated binding code
 - `lib`: required third party libs
 - `test`: contains a triangle rendering demo using node-vulkan

## Preview:<br/>
<img src="https://i.imgur.com/P7kgOt9.png" width="380">

## Requirements:
 - node.js >= v10.9.0

## Installation:
 
### Windows:
Make sure you have either Visual Studio >= 15 installed or use
````
npm install --global --production windows-build-tools
````

Install the Vulkan SDK from [here](https://vulkan.lunarg.com/sdk/home#windows)

Install this tool with
````
npm install node-vulkan
````

## API:

### Syntax:
````
npm run [script] [flag] [value]
````

### Flags:
````
 [-version -v] [version]: The vulkan version to generate bindings for
````

## Usage:

### Generation:
You can specify a version to generate bindings for like this:
````
npm run generate -- -v 1.1.82.0
````
Make sure that the given specification file can be found in `generate/specifications/{v}.xml`<br/>
The emitted bindings can then be found in `generated/{v}/`

Vulkan specifications files can be found [here](https://github.com/KhronosGroup/Vulkan-Docs/releases)

### Compilation:
Copy the root's build.bat into the given generated binding folder and run it

### TODOs:
 - [ ] Struct generation (~85%)
 - [x] Handle generation (~100%)
 - [x] Enum generation (100%)
 - [ ] Function generation (~80%)
 - [ ] Data mutation reflection (~85%)
 - [ ] Deallocation (~0%)
