# Running examples

Some examples use libraries such as [gl-matrix](http://glmatrix.net/) or the WebAssembly port of [tinyobjloader](https://github.com/maierfelix/tolw)

1. ``npm install`` to install dependencies (if any)

2. ``npm run start --vkversion=1.1.92`` to run an example

Note that the `vkversion` flag specifies the vulkan version you want to use. Make sure you generated and compiled the bindings for it, otherwise you will get an error

## Previews:

#### [Cube](https://github.com/maierfelix/node-vulkan/tree/master/examples/cube):
<img src="https://i.imgur.com/ey9XooY.gif" width="336">

 - A spinning cube, demonstrating buffer and texture upload

#### [Triangle](https://github.com/maierfelix/node-vulkan/tree/master/examples/triangle):
<img src="https://i.imgur.com/nGGxpsQ.gif" width="336">

 - The most basic example - A good starting point

#### [TypeScript](https://github.com/maierfelix/node-vulkan/tree/master/examples/typescript):

 - Example on how to setup and use ``node-vulkan`` in TypeScript

#### [Webcam](https://github.com/maierfelix/node-vulkan/tree/master/examples/webcam):
<img src="https://i.imgur.com/cRrVc1N.gif" width="336">

 - A spinning webcam model using a PBR shader
 - Demonstrates ``.obj`` file uploading, uniform buffer objects and window events
