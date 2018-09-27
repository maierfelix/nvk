/*
 * MACHINE GENERATED, DO NOT EDIT
 * GENERATED BY node-vulkan v0.0.1
 */
#include "utils.h"
#include "index.h"
#include "VkQueueFamilyProperties.h"

Nan::Persistent<v8::FunctionTemplate> _VkQueueFamilyProperties::constructor;

_VkQueueFamilyProperties::_VkQueueFamilyProperties() {
  
}

_VkQueueFamilyProperties::~_VkQueueFamilyProperties() {
  //printf("VkQueueFamilyProperties deconstructed!!\n");
}

void _VkQueueFamilyProperties::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkQueueFamilyProperties::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkQueueFamilyProperties").ToLocalChecked());

  // prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  
  SetPrototypeAccessor(proto, Nan::New("queueFlags").ToLocalChecked(), GetqueueFlags, nullptr, ctor);
  SetPrototypeAccessor(proto, Nan::New("queueCount").ToLocalChecked(), GetqueueCount, nullptr, ctor);
  SetPrototypeAccessor(proto, Nan::New("timestampValidBits").ToLocalChecked(), GettimestampValidBits, nullptr, ctor);
  SetPrototypeAccessor(proto, Nan::New("minImageTransferGranularity").ToLocalChecked(), GetminImageTransferGranularity, nullptr, ctor);
  Nan::Set(target, Nan::New("VkQueueFamilyProperties").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkQueueFamilyProperties::New) {
  if (info.IsConstructCall()) {
    _VkQueueFamilyProperties* self = new _VkQueueFamilyProperties();
    self->Wrap(info.Holder());

    if (info[0]->IsObject()) {
      v8::Local<v8::Object> obj = info[0]->ToObject();
      v8::Local<v8::String> sAccess0 = Nan::New("queueFlags").ToLocalChecked();
      v8::Local<v8::String> sAccess1 = Nan::New("queueCount").ToLocalChecked();
      v8::Local<v8::String> sAccess2 = Nan::New("timestampValidBits").ToLocalChecked();
      v8::Local<v8::String> sAccess3 = Nan::New("minImageTransferGranularity").ToLocalChecked();
      if (obj->Has(sAccess0)) {
       v8::Local<v8::Value> arg = obj->Get(sAccess0);
        info.This()->Set(sAccess0, arg);
      }
      if (obj->Has(sAccess1)) {
       v8::Local<v8::Value> arg = obj->Get(sAccess1);
        info.This()->Set(sAccess1, arg);
      }
      if (obj->Has(sAccess2)) {
       v8::Local<v8::Value> arg = obj->Get(sAccess2);
        info.This()->Set(sAccess2, arg);
      }
      if (obj->Has(sAccess3)) {
       v8::Local<v8::Value> arg = obj->Get(sAccess3);
        info.This()->Set(sAccess3, arg);
      }
      }

    info.GetReturnValue().Set(info.Holder());
  } else {
    Nan::ThrowError("VkQueueFamilyProperties constructor cannot be invoked without 'new'");
  }
};

// queueFlags
NAN_GETTER(_VkQueueFamilyProperties::GetqueueFlags) {
  _VkQueueFamilyProperties *self = Nan::ObjectWrap::Unwrap<_VkQueueFamilyProperties>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.queueFlags));
}// queueCount
NAN_GETTER(_VkQueueFamilyProperties::GetqueueCount) {
  _VkQueueFamilyProperties *self = Nan::ObjectWrap::Unwrap<_VkQueueFamilyProperties>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.queueCount));
}// timestampValidBits
NAN_GETTER(_VkQueueFamilyProperties::GettimestampValidBits) {
  _VkQueueFamilyProperties *self = Nan::ObjectWrap::Unwrap<_VkQueueFamilyProperties>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.timestampValidBits));
}// minImageTransferGranularity
NAN_GETTER(_VkQueueFamilyProperties::GetminImageTransferGranularity) {
  _VkQueueFamilyProperties *self = Nan::ObjectWrap::Unwrap<_VkQueueFamilyProperties>(info.This());
  if (self->minImageTransferGranularity.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->minImageTransferGranularity);
    info.GetReturnValue().Set(obj);
  }
}