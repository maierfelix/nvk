/*
 * MACHINE GENERATED, DO NOT EDIT
 * GENERATED BY node-vulkan v0.0.8
 */
#include "utils.h"
#include "index.h"
#include "VkPipelineTessellationStateCreateInfo.h"

Nan::Persistent<v8::FunctionTemplate> _VkPipelineTessellationStateCreateInfo::constructor;

_VkPipelineTessellationStateCreateInfo::_VkPipelineTessellationStateCreateInfo() {
  instance.sType = VK_STRUCTURE_TYPE_PIPELINE_TESSELLATION_STATE_CREATE_INFO;
  
}

_VkPipelineTessellationStateCreateInfo::~_VkPipelineTessellationStateCreateInfo() {
  //printf("VkPipelineTessellationStateCreateInfo deconstructed!!\n");
  
  
  pNext.Reset();
  
  
  
}

void _VkPipelineTessellationStateCreateInfo::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkPipelineTessellationStateCreateInfo::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkPipelineTessellationStateCreateInfo").ToLocalChecked());

  // prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  
  SetPrototypeAccessor(proto, Nan::New("sType").ToLocalChecked(), GetsType, SetsType, ctor);
  SetPrototypeAccessor(proto, Nan::New("pNext").ToLocalChecked(), GetpNext, SetpNext, ctor);
  SetPrototypeAccessor(proto, Nan::New("flags").ToLocalChecked(), Getflags, Setflags, ctor);
  SetPrototypeAccessor(proto, Nan::New("patchControlPoints").ToLocalChecked(), GetpatchControlPoints, SetpatchControlPoints, ctor);
  Nan::Set(target, Nan::New("VkPipelineTessellationStateCreateInfo").ToLocalChecked(), ctor->GetFunction());
}

bool _VkPipelineTessellationStateCreateInfo::flush() {
  _VkPipelineTessellationStateCreateInfo *self = this;
  
  return true;
}

NAN_METHOD(_VkPipelineTessellationStateCreateInfo::New) {
  if (info.IsConstructCall()) {
    _VkPipelineTessellationStateCreateInfo* self = new _VkPipelineTessellationStateCreateInfo();
    self->Wrap(info.Holder());
    
    if (info[0]->IsObject()) {
      v8::Local<v8::Object> obj = Nan::To<v8::Object>(info[0]).ToLocalChecked();
      v8::Local<v8::String> sAccess0 = Nan::New("sType").ToLocalChecked();
      v8::Local<v8::String> sAccess1 = Nan::New("pNext").ToLocalChecked();
      v8::Local<v8::String> sAccess2 = Nan::New("flags").ToLocalChecked();
      v8::Local<v8::String> sAccess3 = Nan::New("patchControlPoints").ToLocalChecked();
      if (obj->Has(sAccess0)) info.This()->Set(sAccess0, obj->Get(sAccess0));
      if (obj->Has(sAccess1)) info.This()->Set(sAccess1, obj->Get(sAccess1));
      if (obj->Has(sAccess2)) info.This()->Set(sAccess2, obj->Get(sAccess2));
      if (obj->Has(sAccess3)) info.This()->Set(sAccess3, obj->Get(sAccess3));
      
    }
    
    info.GetReturnValue().Set(info.Holder());
  } else {
    Nan::ThrowError("VkPipelineTessellationStateCreateInfo constructor cannot be invoked without 'new'");
  }
};

// sType
NAN_GETTER(_VkPipelineTessellationStateCreateInfo::GetsType) {
  _VkPipelineTessellationStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineTessellationStateCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.sType));
}NAN_SETTER(_VkPipelineTessellationStateCreateInfo::SetsType) {
  _VkPipelineTessellationStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineTessellationStateCreateInfo>(info.This());
  if (value->IsNumber()) {
    self->instance.sType = static_cast<VkStructureType>(Nan::To<int32_t>(value).FromMaybe(0));
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected 'Number' for 'VkPipelineTessellationStateCreateInfo.sType' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// pNext
NAN_GETTER(_VkPipelineTessellationStateCreateInfo::GetpNext) {
  _VkPipelineTessellationStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineTessellationStateCreateInfo>(info.This());
}NAN_SETTER(_VkPipelineTessellationStateCreateInfo::SetpNext) {
  _VkPipelineTessellationStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineTessellationStateCreateInfo>(info.This());
}// flags
NAN_GETTER(_VkPipelineTessellationStateCreateInfo::Getflags) {
  _VkPipelineTessellationStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineTessellationStateCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.flags));
}NAN_SETTER(_VkPipelineTessellationStateCreateInfo::Setflags) {
  _VkPipelineTessellationStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineTessellationStateCreateInfo>(info.This());
  if (value->IsNumber()) {
    self->instance.flags = static_cast<VkPipelineTessellationStateCreateFlags>(Nan::To<int32_t>(value).FromMaybe(0));
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected 'Number' for 'VkPipelineTessellationStateCreateInfo.flags' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// patchControlPoints
NAN_GETTER(_VkPipelineTessellationStateCreateInfo::GetpatchControlPoints) {
  _VkPipelineTessellationStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineTessellationStateCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.patchControlPoints));
}NAN_SETTER(_VkPipelineTessellationStateCreateInfo::SetpatchControlPoints) {
  _VkPipelineTessellationStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineTessellationStateCreateInfo>(info.This());
  if (value->IsNumber()) {
    self->instance.patchControlPoints = static_cast<uint32_t>(Nan::To<int64_t>(value).FromMaybe(0));
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected 'Number' for 'VkPipelineTessellationStateCreateInfo.patchControlPoints' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}