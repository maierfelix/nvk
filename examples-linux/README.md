# Running examples

This repository contains examples and demos for [nvk](https://github.com/maierfelix/nvk) - a [Vulkan](https://en.wikipedia.org/wiki/Vulkan_(API)) rendering API for node.js

Some examples use libraries such as [gl-matrix](http://glmatrix.net/) or the WebAssembly port of [tinyobjloader](https://github.com/maierfelix/tolw)

## Building:
1. Clone this repository
2. Run `npm install`
3. Navigate into an example folder and run `npm run start --vkversion=1.1.97`

Note that the `--vkversion` flag specifies the vulkan version you want to use. Currently the recommended version is `1.1.97`.

## Previews:

#### [Compute](/compute):
<img src="https://i.imgur.com/ZBSsmZT.jpg" width="336">

 - Compute shader rendering the mandelbrot set

#### [Cube](/cube):
<img src="https://i.imgur.com/ey9XooY.gif" width="336">

 - A spinning cube, demonstrating buffer and texture upload

#### [Triangle](/triangle):
<img src="https://i.imgur.com/nGGxpsQ.gif" width="336">

 - The most basic example - A good starting point

#### [TypeScript](/typescript):

 - Example on how to setup and use ``nvk`` in TypeScript

#### [Webcam](/webcam):
<img src="https://i.imgur.com/cRrVc1N.gif" width="336">

 - A spinning webcam model using a PBR shader
 - Demonstrates ``.obj`` file uploading, uniform buffer objects and window events
