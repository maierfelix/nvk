/*
 * MACHINE GENERATED, DO NOT EDIT
 * GENERATED BY node-vulkan v0.0.5
 */
#ifndef __VK_VKLAYERPROPERTIES_H__
#define __VK_VKLAYERPROPERTIES_H__

#include <nan.h>

#include <vulkan/vulkan_win32.h>
#define GLFW_INCLUDE_VULKAN
#include <GLFW/glfw3.h>

class _VkLayerProperties: public Nan::ObjectWrap {

  public:
    // #methods
    static NAN_METHOD(New);
    // #accessors
    Nan::Persistent<v8::String, v8::CopyablePersistentTraits<v8::String>> layerName;
    static NAN_GETTER(GetlayerName);
    static NAN_GETTER(GetspecVersion);
    static NAN_GETTER(GetimplementationVersion);
    Nan::Persistent<v8::String, v8::CopyablePersistentTraits<v8::String>> description;
    static NAN_GETTER(Getdescription);

    // real instance
    VkLayerProperties instance = {};

    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(v8::Local<v8::Object> exports);

  private:
    _VkLayerProperties();
    ~_VkLayerProperties();

};

#endif