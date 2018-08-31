/*
VkApplicationInfo app = {};
app.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
app.pApplicationName = "Hello!";
app.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
app.pEngineName = "No Engine";
app.engineVersion = VK_MAKE_VERSION(1, 0, 0);
app.apiVersion = VK_API_VERSION_1_0;
*/

#include <set>
#include <cstdlib>

#include "utils.h"
#include "VkApplicationInfo.h"
#include "VkInstanceCreateInfo.h"

Nan::Persistent<v8::FunctionTemplate> _VkInstanceCreateInfo::constructor;

_VkInstanceCreateInfo::_VkInstanceCreateInfo() {
  instance = (VkInstanceCreateInfo*) malloc(sizeof(VkInstanceCreateInfo));
  instance->pNext = nullptr;
  instance->pApplicationInfo = nullptr;
  instance->ppEnabledLayerNames = nullptr;
  instance->ppEnabledExtensionNames = nullptr;
}
_VkInstanceCreateInfo::~_VkInstanceCreateInfo() { printf("Killed VkInstanceCreateInfo"); }

void _VkInstanceCreateInfo::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkInstanceCreateInfo::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkInstanceCreateInfo").ToLocalChecked());

  // prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  SetPrototypeAccessor(proto, Nan::New("pApplicationInfo").ToLocalChecked(), GetpApplicationInfo, SetpApplicationInfo, ctor);
  SetPrototypeAccessor(proto, Nan::New("enabledLayerCount").ToLocalChecked(), GetenabledLayerCount, SetenabledLayerCount, ctor);
  SetPrototypeAccessor(proto, Nan::New("ppEnabledLayerNames").ToLocalChecked(), GetppEnabledLayerNames, SetppEnabledLayerNames, ctor);
  Nan::Set(target, Nan::New("VkInstanceCreateInfo").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkInstanceCreateInfo::New) {
  _VkInstanceCreateInfo* self = new _VkInstanceCreateInfo();
  self->Wrap(info.Holder());
  info.GetReturnValue().Set(info.Holder());
};

// pApplicationInfo
NAN_GETTER(_VkInstanceCreateInfo::GetpApplicationInfo) {
  _VkInstanceCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkInstanceCreateInfo>(info.This());
  VkInstanceCreateInfo *instance = self->instance;
  info.GetReturnValue().Set(self->pApplicationInfo->handle());
}
NAN_SETTER(_VkInstanceCreateInfo::SetpApplicationInfo) {
  _VkInstanceCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkInstanceCreateInfo>(info.This());
  VkInstanceCreateInfo *instance = self->instance;
  _VkApplicationInfo* obj = Nan::ObjectWrap::Unwrap<_VkApplicationInfo>(value->ToObject());
  self->pApplicationInfo = obj;
  instance->pApplicationInfo = obj->instance;
}

// enabledLayerCount
NAN_GETTER(_VkInstanceCreateInfo::GetenabledLayerCount) {
  _VkInstanceCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkInstanceCreateInfo>(info.This());
  VkInstanceCreateInfo *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(instance->enabledLayerCount));
}
NAN_SETTER(_VkInstanceCreateInfo::SetenabledLayerCount) {
  _VkInstanceCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkInstanceCreateInfo>(info.This());
  VkInstanceCreateInfo *instance = self->instance;
  instance->enabledLayerCount = value->Uint32Value();
}

// ppEnabledLayerNames
NAN_GETTER(_VkInstanceCreateInfo::GetppEnabledLayerNames) {
  _VkInstanceCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkInstanceCreateInfo>(info.This());
  v8::Isolate *isolate = v8::Isolate::GetCurrent();
  VkInstanceCreateInfo *instance = self->instance;
  if (instance->ppEnabledLayerNames != nullptr) {
    info.GetReturnValue().Set(Nan::New(self->ppEnabledLayerNames));
  } else {
    info.GetReturnValue().SetNull();
  }
}

NAN_SETTER(_VkInstanceCreateInfo::SetppEnabledLayerNames) {
  _VkInstanceCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkInstanceCreateInfo>(info.This());
  v8::Isolate *isolate = v8::Isolate::GetCurrent();
  VkInstanceCreateInfo *instance = self->instance;
  // js
  {
    v8::Handle<v8::Array> arr = v8::Handle<v8::Array>::Cast(value);
    Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> obj(arr);
    self->ppEnabledLayerNames = obj;
  }
  // vulkan
  {
    if (instance->ppEnabledLayerNames != nullptr) {}
    instance->ppEnabledLayerNames = createArrayOfV8Strings(value);
  }
}
