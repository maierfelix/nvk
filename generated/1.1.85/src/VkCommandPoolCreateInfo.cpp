/*
 * MACHINE GENERATED, DO NOT EDIT
 * GENERATED BY node-vulkan v0.0.8
 */
#include "utils.h"
#include "index.h"
#include "VkCommandPoolCreateInfo.h"

Nan::Persistent<v8::FunctionTemplate> _VkCommandPoolCreateInfo::constructor;

_VkCommandPoolCreateInfo::_VkCommandPoolCreateInfo() {
  instance.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
  
}

_VkCommandPoolCreateInfo::~_VkCommandPoolCreateInfo() {
  //printf("VkCommandPoolCreateInfo deconstructed!!\n");
  
  
  pNext.Reset();
  
  
  
}

void _VkCommandPoolCreateInfo::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkCommandPoolCreateInfo::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkCommandPoolCreateInfo").ToLocalChecked());

  // prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  
  SetPrototypeAccessor(proto, Nan::New("sType").ToLocalChecked(), GetsType, SetsType, ctor);
  SetPrototypeAccessor(proto, Nan::New("pNext").ToLocalChecked(), GetpNext, SetpNext, ctor);
  SetPrototypeAccessor(proto, Nan::New("flags").ToLocalChecked(), Getflags, Setflags, ctor);
  SetPrototypeAccessor(proto, Nan::New("queueFamilyIndex").ToLocalChecked(), GetqueueFamilyIndex, SetqueueFamilyIndex, ctor);
  Nan::Set(target, Nan::New("VkCommandPoolCreateInfo").ToLocalChecked(), ctor->GetFunction());
}

bool _VkCommandPoolCreateInfo::flush() {
  _VkCommandPoolCreateInfo *self = this;
  
  return true;
}

NAN_METHOD(_VkCommandPoolCreateInfo::New) {
  if (info.IsConstructCall()) {
    _VkCommandPoolCreateInfo* self = new _VkCommandPoolCreateInfo();
    self->Wrap(info.Holder());
    
    if (info[0]->IsObject()) {
      v8::Local<v8::Object> obj = Nan::To<v8::Object>(info[0]).ToLocalChecked();
      v8::Local<v8::String> sAccess0 = Nan::New("sType").ToLocalChecked();
      v8::Local<v8::String> sAccess1 = Nan::New("pNext").ToLocalChecked();
      v8::Local<v8::String> sAccess2 = Nan::New("flags").ToLocalChecked();
      v8::Local<v8::String> sAccess3 = Nan::New("queueFamilyIndex").ToLocalChecked();
      if (obj->Has(sAccess0)) info.This()->Set(sAccess0, obj->Get(sAccess0));
      if (obj->Has(sAccess1)) info.This()->Set(sAccess1, obj->Get(sAccess1));
      if (obj->Has(sAccess2)) info.This()->Set(sAccess2, obj->Get(sAccess2));
      if (obj->Has(sAccess3)) info.This()->Set(sAccess3, obj->Get(sAccess3));
      
    }
    
    info.GetReturnValue().Set(info.Holder());
  } else {
    Nan::ThrowError("VkCommandPoolCreateInfo constructor cannot be invoked without 'new'");
  }
};

// sType
NAN_GETTER(_VkCommandPoolCreateInfo::GetsType) {
  _VkCommandPoolCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkCommandPoolCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.sType));
}NAN_SETTER(_VkCommandPoolCreateInfo::SetsType) {
  _VkCommandPoolCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkCommandPoolCreateInfo>(info.This());
  if (value->IsNumber()) {
    self->instance.sType = static_cast<VkStructureType>(Nan::To<int32_t>(value).FromMaybe(0));
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected 'Number' for 'VkCommandPoolCreateInfo.sType' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// pNext
NAN_GETTER(_VkCommandPoolCreateInfo::GetpNext) {
  _VkCommandPoolCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkCommandPoolCreateInfo>(info.This());
}NAN_SETTER(_VkCommandPoolCreateInfo::SetpNext) {
  _VkCommandPoolCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkCommandPoolCreateInfo>(info.This());
}// flags
NAN_GETTER(_VkCommandPoolCreateInfo::Getflags) {
  _VkCommandPoolCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkCommandPoolCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.flags));
}NAN_SETTER(_VkCommandPoolCreateInfo::Setflags) {
  _VkCommandPoolCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkCommandPoolCreateInfo>(info.This());
  if (value->IsNumber()) {
    self->instance.flags = static_cast<VkCommandPoolCreateFlags>(Nan::To<int32_t>(value).FromMaybe(0));
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected 'Number' for 'VkCommandPoolCreateInfo.flags' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// queueFamilyIndex
NAN_GETTER(_VkCommandPoolCreateInfo::GetqueueFamilyIndex) {
  _VkCommandPoolCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkCommandPoolCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.queueFamilyIndex));
}NAN_SETTER(_VkCommandPoolCreateInfo::SetqueueFamilyIndex) {
  _VkCommandPoolCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkCommandPoolCreateInfo>(info.This());
  if (value->IsNumber()) {
    self->instance.queueFamilyIndex = static_cast<uint32_t>(Nan::To<int64_t>(value).FromMaybe(0));
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected 'Number' for 'VkCommandPoolCreateInfo.queueFamilyIndex' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}