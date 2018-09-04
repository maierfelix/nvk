#include "utils.h"
#include "index.h"
#include "VkPhysicalDeviceProperties.h"

Nan::Persistent<v8::FunctionTemplate> _VkPhysicalDeviceProperties::constructor;

_VkPhysicalDeviceProperties::_VkPhysicalDeviceProperties() {
  instance = (VkPhysicalDeviceProperties*) malloc(sizeof(VkPhysicalDeviceProperties));
}

_VkPhysicalDeviceProperties::~_VkPhysicalDeviceProperties() { }

void _VkPhysicalDeviceProperties::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // Constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkPhysicalDeviceProperties::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkPhysicalDeviceProperties").ToLocalChecked());

  // Prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  SetPrototypeAccessor(proto, Nan::New("apiVersion").ToLocalChecked(), GetapiVersion, SetapiVersion, ctor);
  SetPrototypeAccessor(proto, Nan::New("driverVersion").ToLocalChecked(), GetdriverVersion, SetdriverVersion, ctor);
  SetPrototypeAccessor(proto, Nan::New("vendorID").ToLocalChecked(), GetvendorID, SetvendorID, ctor);
  SetPrototypeAccessor(proto, Nan::New("deviceID").ToLocalChecked(), GetdeviceID, SetdeviceID, ctor);
  SetPrototypeAccessor(proto, Nan::New("deviceType").ToLocalChecked(), GetdeviceType, SetdeviceType, ctor);
  SetPrototypeAccessor(proto, Nan::New("deviceName").ToLocalChecked(), GetdeviceName, SetdeviceName, ctor);
  SetPrototypeAccessor(proto, Nan::New("pipelineCacheUUID").ToLocalChecked(), GetpipelineCacheUUID, SetpipelineCacheUUID, ctor);
  SetPrototypeAccessor(proto, Nan::New("limits").ToLocalChecked(), Getlimits, Setlimits, ctor);
  SetPrototypeAccessor(proto, Nan::New("sparseProperties").ToLocalChecked(), GetsparseProperties, SetsparseProperties, ctor);
  
  Nan::Set(target, Nan::New("VkPhysicalDeviceProperties").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkPhysicalDeviceProperties::New) {
  _VkPhysicalDeviceProperties* self = new _VkPhysicalDeviceProperties();
  self->Wrap(info.Holder());
  info.GetReturnValue().Set(info.Holder());
};

// apiVersion
NAN_GETTER(_VkPhysicalDeviceProperties::GetapiVersion) {
  _VkPhysicalDeviceProperties *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceProperties>(info.This());
  VkPhysicalDeviceProperties *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->apiVersion));
}
NAN_SETTER(_VkPhysicalDeviceProperties::SetapiVersion) {
  _VkPhysicalDeviceProperties *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceProperties>(info.This());
  VkPhysicalDeviceProperties *instance = self->instance;
  self->instance->apiVersion = static_cast<uint32_t>(value->NumberValue());
}// driverVersion
NAN_GETTER(_VkPhysicalDeviceProperties::GetdriverVersion) {
  _VkPhysicalDeviceProperties *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceProperties>(info.This());
  VkPhysicalDeviceProperties *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->driverVersion));
}
NAN_SETTER(_VkPhysicalDeviceProperties::SetdriverVersion) {
  _VkPhysicalDeviceProperties *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceProperties>(info.This());
  VkPhysicalDeviceProperties *instance = self->instance;
  self->instance->driverVersion = static_cast<uint32_t>(value->NumberValue());
}// vendorID
NAN_GETTER(_VkPhysicalDeviceProperties::GetvendorID) {
  _VkPhysicalDeviceProperties *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceProperties>(info.This());
  VkPhysicalDeviceProperties *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->vendorID));
}
NAN_SETTER(_VkPhysicalDeviceProperties::SetvendorID) {
  _VkPhysicalDeviceProperties *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceProperties>(info.This());
  VkPhysicalDeviceProperties *instance = self->instance;
  self->instance->vendorID = static_cast<uint32_t>(value->NumberValue());
}// deviceID
NAN_GETTER(_VkPhysicalDeviceProperties::GetdeviceID) {
  _VkPhysicalDeviceProperties *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceProperties>(info.This());
  VkPhysicalDeviceProperties *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->deviceID));
}
NAN_SETTER(_VkPhysicalDeviceProperties::SetdeviceID) {
  _VkPhysicalDeviceProperties *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceProperties>(info.This());
  VkPhysicalDeviceProperties *instance = self->instance;
  self->instance->deviceID = static_cast<uint32_t>(value->NumberValue());
}// deviceType
NAN_GETTER(_VkPhysicalDeviceProperties::GetdeviceType) {
  _VkPhysicalDeviceProperties *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceProperties>(info.This());
  VkPhysicalDeviceProperties *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->deviceType));
}
NAN_SETTER(_VkPhysicalDeviceProperties::SetdeviceType) {
  _VkPhysicalDeviceProperties *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceProperties>(info.This());
  VkPhysicalDeviceProperties *instance = self->instance;
  self->instance->deviceType = static_cast<VkPhysicalDeviceType>(value->Uint32Value());
}// deviceName
NAN_GETTER(_VkPhysicalDeviceProperties::GetdeviceName) {
  _VkPhysicalDeviceProperties *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceProperties>(info.This());
  VkPhysicalDeviceProperties *instance = self->instance; 
}
NAN_SETTER(_VkPhysicalDeviceProperties::SetdeviceName) {
  _VkPhysicalDeviceProperties *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceProperties>(info.This());
  VkPhysicalDeviceProperties *instance = self->instance; 
}// pipelineCacheUUID
NAN_GETTER(_VkPhysicalDeviceProperties::GetpipelineCacheUUID) {
  _VkPhysicalDeviceProperties *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceProperties>(info.This());
  VkPhysicalDeviceProperties *instance = self->instance; 
}
NAN_SETTER(_VkPhysicalDeviceProperties::SetpipelineCacheUUID) {
  _VkPhysicalDeviceProperties *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceProperties>(info.This());
  VkPhysicalDeviceProperties *instance = self->instance; 
}// limits
NAN_GETTER(_VkPhysicalDeviceProperties::Getlimits) {
  _VkPhysicalDeviceProperties *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceProperties>(info.This());
  VkPhysicalDeviceProperties *instance = self->instance;
  if (self->limits != nullptr) {
    info.GetReturnValue().Set(self->limits->handle());
  } else {
    info.GetReturnValue().SetNull();
  }
}
NAN_SETTER(_VkPhysicalDeviceProperties::Setlimits) {
  _VkPhysicalDeviceProperties *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceProperties>(info.This());
  VkPhysicalDeviceProperties *instance = self->instance;
  _VkPhysicalDeviceLimits* obj = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceLimits>(value->ToObject());
  self->limits = obj;
  instance->limits = *obj->instance;
}// sparseProperties
NAN_GETTER(_VkPhysicalDeviceProperties::GetsparseProperties) {
  _VkPhysicalDeviceProperties *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceProperties>(info.This());
  VkPhysicalDeviceProperties *instance = self->instance;
  if (self->sparseProperties != nullptr) {
    info.GetReturnValue().Set(self->sparseProperties->handle());
  } else {
    info.GetReturnValue().SetNull();
  }
}
NAN_SETTER(_VkPhysicalDeviceProperties::SetsparseProperties) {
  _VkPhysicalDeviceProperties *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceProperties>(info.This());
  VkPhysicalDeviceProperties *instance = self->instance;
  _VkPhysicalDeviceSparseProperties* obj = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceSparseProperties>(value->ToObject());
  self->sparseProperties = obj;
  instance->sparseProperties = *obj->instance;
}