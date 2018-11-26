"use strict";
exports.__esModule = true;
var index_1 = require("../../generated/1.1.85/index");
var win = new index_1.VulkanWindow({
    width: 480,
    height: 320,
    title: "typescript-example"
});
var instance = new index_1.VkInstance();
var appInfo = new index_1.VkApplicationInfo({
    pApplicationName: "Hello!",
    applicationVersion: index_1.VK_MAKE_VERSION(1, 0, 0),
    pEngineName: "No Engine",
    engineVersion: index_1.VK_MAKE_VERSION(1, 0, 0),
    apiVersion: index_1.VK_API_VERSION_1_0
});
var validationLayers = [
    "VK_LAYER_LUNARG_core_validation",
    "VK_LAYER_LUNARG_standard_validation"
];
var instanceExtensions = win.getRequiredInstanceExtensions();
var instanceInfo = new index_1.VkInstanceCreateInfo();
instanceInfo.sType = index_1.VkStructureType.VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
instanceInfo.pApplicationInfo = appInfo;
instanceInfo.enabledLayerCount = validationLayers.length;
instanceInfo.ppEnabledLayerNames = validationLayers;
instanceInfo.enabledExtensionCount = instanceExtensions.length;
instanceInfo.ppEnabledExtensionNames = instanceExtensions;
var result = index_1.vkCreateInstance(instanceInfo, null, instance);
if (result !== index_1.VkResult.VK_SUCCESS)
    throw "Failed to create VkInstance!";
setInterval(function () {
    win.pollEvents();
}, 1e3 / 60);
