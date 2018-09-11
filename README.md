# node-vulkan
Automated vulkan binding generation for node.js

## Requirements:
 - node.js >= v10.9.0

## Structure:
 - `generate`: code for binding generation
 - `generated`: the emitted binding code
 - `lib`: required third party libs

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

### Compilation:
Copy the root's build.bat in the given generated binding folder and run it
