#ifndef __VK_BUFFER_CREATE_INFO_H__
#define __VK_BUFFER_CREATE_INFO_H__

#include <nan.h>

#define GLFW_INCLUDE_VULKAN
#include <GLFW/glfw3.h>

class _VkBufferCreateInfo: public Nan::ObjectWrap {

  public:
    VkBufferCreateInfo *instance;
    // #methods
    static NAN_METHOD(New);
    // #accessors
    static NAN_GETTER(GetpQueueFamilyIndices);
    static NAN_SETTER(SetpQueueFamilyIndices);

    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(v8::Local<v8::Object> exports);

  private:
    // #properties
    Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> pQueueFamilyIndices;

    _VkBufferCreateInfo ();
    ~_VkBufferCreateInfo ();
};

#endif
