/*
 * MACHINE GENERATED, DO NOT EDIT
 * GENERATED BY node-vulkan v0.1.0
 */
#ifndef __VK_VKCLEARDEPTHSTENCILVALUE_H__
#define __VK_VKCLEARDEPTHSTENCILVALUE_H__

#include <nan.h>

#include <vulkan/vulkan_win32.h>
#define GLFW_INCLUDE_VULKAN
#include <GLFW/glfw3.h>

class _VkClearDepthStencilValue: public Nan::ObjectWrap {

  public:
    // #methods
    static NAN_METHOD(New);
    // #accessors
    static NAN_GETTER(Getdepth);
    static NAN_SETTER(Setdepth);
    
    static NAN_GETTER(Getstencil);
    static NAN_SETTER(Setstencil);
    

    // real instance
    VkClearDepthStencilValue instance = {};

    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(v8::Local<v8::Object> exports);
    bool flush(void);

  private:

    _VkClearDepthStencilValue();
    ~_VkClearDepthStencilValue();

};

#endif