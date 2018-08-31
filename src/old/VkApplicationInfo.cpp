/*
VkApplicationInfo app = {};
app.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
app.pApplicationName = "Hello!";
app.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
app.pEngineName = "No Engine";
app.engineVersion = VK_MAKE_VERSION(1, 0, 0);
app.apiVersion = VK_API_VERSION_1_0;
*/

#include <cstdlib>

#include "utils.h"
#include "VkApplicationInfo.h"

Nan::Persistent<v8::FunctionTemplate> _VkApplicationInfo::constructor;

_VkApplicationInfo::_VkApplicationInfo() {
  instance = (VkApplicationInfo*) malloc(sizeof(VkApplicationInfo));
  instance->pNext = nullptr;
  instance->pApplicationName = nullptr;
  instance->pEngineName = nullptr;
};
_VkApplicationInfo::~_VkApplicationInfo() { printf("Killed VkApplicationInfo"); };

void _VkApplicationInfo::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkApplicationInfo::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkApplicationInfo").ToLocalChecked());

  // prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  SetPrototypeAccessor(proto, Nan::New("sType").ToLocalChecked(), GetsType, SetsType, ctor);
  SetPrototypeAccessor(proto, Nan::New("pApplicationName").ToLocalChecked(), GetpApplicationName, SetpApplicationName, ctor);
  Nan::Set(target, Nan::New("VkApplicationInfo").ToLocalChecked(), ctor->GetFunction());
};

NAN_METHOD(_VkApplicationInfo::New) {
  _VkApplicationInfo* self = new _VkApplicationInfo();
  self->Wrap(info.Holder());
  info.GetReturnValue().Set(info.Holder());
};

// sType
NAN_GETTER(_VkApplicationInfo::GetsType) {
  _VkApplicationInfo *self = Nan::ObjectWrap::Unwrap<_VkApplicationInfo>(info.This());
  VkApplicationInfo *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(instance->sType));
};
NAN_SETTER(_VkApplicationInfo::SetsType) {
  _VkApplicationInfo *self = Nan::ObjectWrap::Unwrap<_VkApplicationInfo>(info.This());
  VkApplicationInfo *instance = self->instance;
  instance->sType = static_cast<VkStructureType>(value->Uint32Value());
};

// pApplicationName
NAN_GETTER(_VkApplicationInfo::GetpApplicationName) {
  _VkApplicationInfo *self = Nan::ObjectWrap::Unwrap<_VkApplicationInfo>(info.This());
  VkApplicationInfo *instance = self->instance;
  if (instance->pApplicationName != nullptr) {
    info.GetReturnValue().Set(Nan::New(self->pApplicationName));
  } else {
    info.GetReturnValue().Set(Nan::Null());
  }
};
NAN_SETTER(_VkApplicationInfo::SetpApplicationName) {
  _VkApplicationInfo *self = Nan::ObjectWrap::Unwrap<_VkApplicationInfo>(info.This());
  VkApplicationInfo *instance = self->instance;
  Nan::Persistent<v8::String, v8::CopyablePersistentTraits<v8::String>> str(Nan::To<v8::String>(value).ToLocalChecked());
  self->pApplicationName = str;
  if (instance->pApplicationName != nullptr) {}
  instance->pApplicationName = copyV8String(value);
};
