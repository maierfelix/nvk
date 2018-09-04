#ifndef __VK_VKPHYSICALDEVICEPROPERTIES_H__
#define __VK_VKPHYSICALDEVICEPROPERTIES_H__

#include <nan.h>

#define GLFW_INCLUDE_VULKAN
#include <GLFW/glfw3.h>

class _VkPhysicalDeviceProperties: public Nan::ObjectWrap {

  public:
    // #methods
    static NAN_METHOD(New);
    // #accessors
    static NAN_GETTER(GetapiVersion);
    static NAN_SETTER(SetapiVersion);
    
    static NAN_GETTER(GetdriverVersion);
    static NAN_SETTER(SetdriverVersion);
    
    static NAN_GETTER(GetvendorID);
    static NAN_SETTER(SetvendorID);
    
    static NAN_GETTER(GetdeviceID);
    static NAN_SETTER(SetdeviceID);
    
    static NAN_GETTER(GetdeviceType);
    static NAN_SETTER(SetdeviceType);
    
    Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> deviceName;
    static NAN_GETTER(GetdeviceName);
    static NAN_SETTER(SetdeviceName);
    
    Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> pipelineCacheUUID;
    static NAN_GETTER(GetpipelineCacheUUID);
    static NAN_SETTER(SetpipelineCacheUUID);
    
      _VkPhysicalDeviceLimits *limits;
      static NAN_GETTER(Getlimits);
    static NAN_SETTER(Setlimits);
    
      _VkPhysicalDeviceSparseProperties *sparseProperties;
      static NAN_GETTER(GetsparseProperties);
    static NAN_SETTER(SetsparseProperties);
    

    // real instance
    VkPhysicalDeviceProperties *instance;

    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(v8::Local<v8::Object> exports);

  private:
    _VkPhysicalDeviceProperties();
    ~_VkPhysicalDeviceProperties();

};

#endif