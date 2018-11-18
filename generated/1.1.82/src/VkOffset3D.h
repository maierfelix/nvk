/*
 * MACHINE GENERATED, DO NOT EDIT
 * GENERATED BY node-vulkan v0.0.5
 */
#ifndef __VK_VKOFFSET3D_H__
#define __VK_VKOFFSET3D_H__

#include <nan.h>

#include <vulkan/vulkan_win32.h>
#define GLFW_INCLUDE_VULKAN
#include <GLFW/glfw3.h>

class _VkOffset3D: public Nan::ObjectWrap {

  public:
    // #methods
    static NAN_METHOD(New);
    // #accessors
    static NAN_GETTER(Getx);
    static NAN_SETTER(Setx);
    
    static NAN_GETTER(Gety);
    static NAN_SETTER(Sety);
    
    static NAN_GETTER(Getz);
    static NAN_SETTER(Setz);
    

    // real instance
    VkOffset3D instance = {};

    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(v8::Local<v8::Object> exports);

  private:
    _VkOffset3D();
    ~_VkOffset3D();

};

#endif