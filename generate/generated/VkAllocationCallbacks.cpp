#include "utils.h"
#include "index.h"
#include "VkAllocationCallbacks.h"

Nan::Persistent<v8::FunctionTemplate> _VkAllocationCallbacks::constructor;

_VkAllocationCallbacks::_VkAllocationCallbacks() {
  instance = (VkAllocationCallbacks*) malloc(sizeof(VkAllocationCallbacks));
}

_VkAllocationCallbacks::~_VkAllocationCallbacks() { }

void _VkAllocationCallbacks::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // Constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkAllocationCallbacks::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkAllocationCallbacks").ToLocalChecked());

  // Prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  SetPrototypeAccessor(proto, Nan::New("pfnAllocation").ToLocalChecked(), GetpfnAllocation, SetpfnAllocation, ctor);
  SetPrototypeAccessor(proto, Nan::New("pfnReallocation").ToLocalChecked(), GetpfnReallocation, SetpfnReallocation, ctor);
  SetPrototypeAccessor(proto, Nan::New("pfnFree").ToLocalChecked(), GetpfnFree, SetpfnFree, ctor);
  SetPrototypeAccessor(proto, Nan::New("pfnInternalAllocation").ToLocalChecked(), GetpfnInternalAllocation, SetpfnInternalAllocation, ctor);
  SetPrototypeAccessor(proto, Nan::New("pfnInternalFree").ToLocalChecked(), GetpfnInternalFree, SetpfnInternalFree, ctor);
  
  Nan::Set(target, Nan::New("VkAllocationCallbacks").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkAllocationCallbacks::New) {
  _VkAllocationCallbacks* self = new _VkAllocationCallbacks();
  self->Wrap(info.Holder());
  info.GetReturnValue().Set(info.Holder());
};

// pfnAllocation
NAN_GETTER(_VkAllocationCallbacks::GetpfnAllocation) {
  _VkAllocationCallbacks *self = Nan::ObjectWrap::Unwrap<_VkAllocationCallbacks>(info.This());
  VkAllocationCallbacks *instance = self->instance; 
}
NAN_SETTER(_VkAllocationCallbacks::SetpfnAllocation) {
  _VkAllocationCallbacks *self = Nan::ObjectWrap::Unwrap<_VkAllocationCallbacks>(info.This());
  VkAllocationCallbacks *instance = self->instance; 
}// pfnReallocation
NAN_GETTER(_VkAllocationCallbacks::GetpfnReallocation) {
  _VkAllocationCallbacks *self = Nan::ObjectWrap::Unwrap<_VkAllocationCallbacks>(info.This());
  VkAllocationCallbacks *instance = self->instance; 
}
NAN_SETTER(_VkAllocationCallbacks::SetpfnReallocation) {
  _VkAllocationCallbacks *self = Nan::ObjectWrap::Unwrap<_VkAllocationCallbacks>(info.This());
  VkAllocationCallbacks *instance = self->instance; 
}// pfnFree
NAN_GETTER(_VkAllocationCallbacks::GetpfnFree) {
  _VkAllocationCallbacks *self = Nan::ObjectWrap::Unwrap<_VkAllocationCallbacks>(info.This());
  VkAllocationCallbacks *instance = self->instance; 
}
NAN_SETTER(_VkAllocationCallbacks::SetpfnFree) {
  _VkAllocationCallbacks *self = Nan::ObjectWrap::Unwrap<_VkAllocationCallbacks>(info.This());
  VkAllocationCallbacks *instance = self->instance; 
}// pfnInternalAllocation
NAN_GETTER(_VkAllocationCallbacks::GetpfnInternalAllocation) {
  _VkAllocationCallbacks *self = Nan::ObjectWrap::Unwrap<_VkAllocationCallbacks>(info.This());
  VkAllocationCallbacks *instance = self->instance; 
}
NAN_SETTER(_VkAllocationCallbacks::SetpfnInternalAllocation) {
  _VkAllocationCallbacks *self = Nan::ObjectWrap::Unwrap<_VkAllocationCallbacks>(info.This());
  VkAllocationCallbacks *instance = self->instance; 
}// pfnInternalFree
NAN_GETTER(_VkAllocationCallbacks::GetpfnInternalFree) {
  _VkAllocationCallbacks *self = Nan::ObjectWrap::Unwrap<_VkAllocationCallbacks>(info.This());
  VkAllocationCallbacks *instance = self->instance; 
}
NAN_SETTER(_VkAllocationCallbacks::SetpfnInternalFree) {
  _VkAllocationCallbacks *self = Nan::ObjectWrap::Unwrap<_VkAllocationCallbacks>(info.This());
  VkAllocationCallbacks *instance = self->instance; 
}