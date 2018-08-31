/*
VkApplicationInfo app = {};
app.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
app.pApplicationName = "Hello!";
app.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
app.pEngineName = "No Engine";
app.engineVersion = VK_MAKE_VERSION(1, 0, 0);
app.apiVersion = VK_API_VERSION_1_0;
*/
#ifndef __VK_INSTANCE_CREATE_INFO_H__
#define __VK_INSTANCE_CREATE_INFO_H__

#include <nan.h>

#define GLFW_INCLUDE_VULKAN
#include <GLFW/glfw3.h>

class _VkInstanceCreateInfo: public Nan::ObjectWrap {

  public:
    VkInstanceCreateInfo *instance;
    // #methods
    static NAN_METHOD(New);
    // #accessors
    static NAN_GETTER(GetpApplicationInfo);
    static NAN_SETTER(SetpApplicationInfo);
    static NAN_GETTER(GetenabledLayerCount);
    static NAN_SETTER(SetenabledLayerCount);
    static NAN_GETTER(GetppEnabledLayerNames);
    static NAN_SETTER(SetppEnabledLayerNames);

    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(v8::Local<v8::Object> exports);

  private:
    // #properties
    _VkApplicationInfo *pApplicationInfo;
    Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> ppEnabledLayerNames;

    _VkInstanceCreateInfo();
    ~_VkInstanceCreateInfo();
};

#endif
