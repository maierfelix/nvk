#ifndef __VK_VKALLOCATIONCALLBACKS_H__
#define __VK_VKALLOCATIONCALLBACKS_H__

#include <nan.h>

#define GLFW_INCLUDE_VULKAN
#include <GLFW/glfw3.h>

class _VkAllocationCallbacks: public Nan::ObjectWrap {

  public:
    // #methods
    static NAN_METHOD(New);
    // #accessors 
    static NAN_SETTER(SetpfnAllocation);
     
    static NAN_SETTER(SetpfnReallocation);
     
    static NAN_SETTER(SetpfnFree);
     
    static NAN_SETTER(SetpfnInternalAllocation);
     
    static NAN_SETTER(SetpfnInternalFree);
    

    // real instance
    VkAllocationCallbacks *instance;

    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(v8::Local<v8::Object> exports);

  private:
    _VkAllocationCallbacks();
    ~_VkAllocationCallbacks();

};

#endif