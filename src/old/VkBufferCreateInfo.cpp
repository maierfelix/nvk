#include <set>
#include <cstdlib>

#include "utils.h"
#include "VkBufferCreateInfo.h"

Nan::Persistent<v8::FunctionTemplate> _VkBufferCreateInfo::constructor;

_VkBufferCreateInfo::_VkBufferCreateInfo() {
  instance = (VkBufferCreateInfo*) malloc(sizeof(VkBufferCreateInfo));
  instance->pNext = nullptr;
}
_VkBufferCreateInfo::~_VkBufferCreateInfo() { printf("Killed VkBufferCreateInfo"); }

void _VkBufferCreateInfo::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkBufferCreateInfo::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkBufferCreateInfo").ToLocalChecked());

  // prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  SetPrototypeAccessor(proto, Nan::New("pQueueFamilyIndices").ToLocalChecked(), GetpQueueFamilyIndices, SetpQueueFamilyIndices, ctor);
  Nan::Set(target, Nan::New("VkBufferCreateInfo").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkBufferCreateInfo::New) {
  _VkBufferCreateInfo* self = new _VkBufferCreateInfo();
  self->Wrap(info.Holder());
  info.GetReturnValue().Set(info.Holder());
};

// pQueueFamilyIndices
NAN_GETTER(_VkBufferCreateInfo::GetpQueueFamilyIndices) {
  _VkBufferCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkBufferCreateInfo>(info.This());
  v8::Isolate *isolate = v8::Isolate::GetCurrent();
  VkBufferCreateInfo *instance = self->instance;
  if (instance->pQueueFamilyIndices != nullptr) {
    info.GetReturnValue().Set(Nan::New(self->pQueueFamilyIndices));
  } else {
    info.GetReturnValue().SetNull();
  }
}

NAN_SETTER(_VkBufferCreateInfo::SetpQueueFamilyIndices) {
  _VkBufferCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkBufferCreateInfo>(info.This());
  v8::Isolate *isolate = v8::Isolate::GetCurrent();
  VkBufferCreateInfo *instance = self->instance;
  // js
  {
    v8::Handle<v8::Array> arr = v8::Handle<v8::Array>::Cast(value);
    Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> obj(arr);
    self->pQueueFamilyIndices = obj;
  }
  // vulkan
  {
    // free previous
    if (instance->pQueueFamilyIndices != nullptr) {}
    instance->pQueueFamilyIndices = createArrayOfV8Uint32(value);
  }
}
