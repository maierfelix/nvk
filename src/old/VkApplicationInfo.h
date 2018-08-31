#ifndef __VK_APPLICATION_INFO_H__
#define __VK_APPLICATION_INFO_H__

#include <nan.h>

#define GLFW_INCLUDE_VULKAN
#include <GLFW/glfw3.h>

class _VkApplicationInfo: public Nan::ObjectWrap {

  public:
    VkApplicationInfo *instance;
    // #methods
    static NAN_METHOD(New);
    // #accessors
    static NAN_GETTER(GetsType);
    static NAN_SETTER(SetsType);
    static NAN_GETTER(GetpApplicationName);
    static NAN_SETTER(SetpApplicationName);

    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(v8::Local<v8::Object> exports);

  private:
    Nan::Persistent<v8::String, v8::CopyablePersistentTraits<v8::String>> pApplicationName;
    _VkApplicationInfo();
    ~_VkApplicationInfo();
};

#endif
