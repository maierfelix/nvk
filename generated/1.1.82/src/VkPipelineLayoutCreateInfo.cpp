/*
 * MACHINE GENERATED, DO NOT EDIT
 * GENERATED BY node-vulkan v0.0.5
 */
#include "utils.h"
#include "index.h"
#include "VkPipelineLayoutCreateInfo.h"

Nan::Persistent<v8::FunctionTemplate> _VkPipelineLayoutCreateInfo::constructor;

_VkPipelineLayoutCreateInfo::_VkPipelineLayoutCreateInfo() {
  instance.sType = VK_STRUCTURE_TYPE_PIPELINE_LAYOUT_CREATE_INFO;
}

_VkPipelineLayoutCreateInfo::~_VkPipelineLayoutCreateInfo() {
  //printf("VkPipelineLayoutCreateInfo deconstructed!!\n");
}

void _VkPipelineLayoutCreateInfo::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkPipelineLayoutCreateInfo::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkPipelineLayoutCreateInfo").ToLocalChecked());

  // prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  
  SetPrototypeAccessor(proto, Nan::New("sType").ToLocalChecked(), GetsType, SetsType, ctor);
  SetPrototypeAccessor(proto, Nan::New("pNext").ToLocalChecked(), GetpNext, SetpNext, ctor);
  SetPrototypeAccessor(proto, Nan::New("flags").ToLocalChecked(), Getflags, Setflags, ctor);
  SetPrototypeAccessor(proto, Nan::New("setLayoutCount").ToLocalChecked(), GetsetLayoutCount, SetsetLayoutCount, ctor);
  SetPrototypeAccessor(proto, Nan::New("pSetLayouts").ToLocalChecked(), GetpSetLayouts, SetpSetLayouts, ctor);
  SetPrototypeAccessor(proto, Nan::New("pushConstantRangeCount").ToLocalChecked(), GetpushConstantRangeCount, SetpushConstantRangeCount, ctor);
  SetPrototypeAccessor(proto, Nan::New("pPushConstantRanges").ToLocalChecked(), GetpPushConstantRanges, SetpPushConstantRanges, ctor);
  Nan::Set(target, Nan::New("VkPipelineLayoutCreateInfo").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkPipelineLayoutCreateInfo::New) {
  if (info.IsConstructCall()) {
    _VkPipelineLayoutCreateInfo* self = new _VkPipelineLayoutCreateInfo();
    self->Wrap(info.Holder());
    
    if (info[0]->IsObject()) {
      v8::Local<v8::Object> obj = info[0]->ToObject();
      v8::Local<v8::String> sAccess0 = Nan::New("sType").ToLocalChecked();
      v8::Local<v8::String> sAccess1 = Nan::New("pNext").ToLocalChecked();
      v8::Local<v8::String> sAccess2 = Nan::New("flags").ToLocalChecked();
      v8::Local<v8::String> sAccess3 = Nan::New("setLayoutCount").ToLocalChecked();
      v8::Local<v8::String> sAccess4 = Nan::New("pSetLayouts").ToLocalChecked();
      v8::Local<v8::String> sAccess5 = Nan::New("pushConstantRangeCount").ToLocalChecked();
      v8::Local<v8::String> sAccess6 = Nan::New("pPushConstantRanges").ToLocalChecked();
      if (obj->Has(sAccess0)) info.This()->Set(sAccess0, obj->Get(sAccess0));
      if (obj->Has(sAccess1)) info.This()->Set(sAccess1, obj->Get(sAccess1));
      if (obj->Has(sAccess2)) info.This()->Set(sAccess2, obj->Get(sAccess2));
      if (obj->Has(sAccess3)) info.This()->Set(sAccess3, obj->Get(sAccess3));
      if (obj->Has(sAccess4)) info.This()->Set(sAccess4, obj->Get(sAccess4));
      if (obj->Has(sAccess5)) info.This()->Set(sAccess5, obj->Get(sAccess5));
      if (obj->Has(sAccess6)) info.This()->Set(sAccess6, obj->Get(sAccess6));
      
    }
    
    info.GetReturnValue().Set(info.Holder());
  } else {
    Nan::ThrowError("VkPipelineLayoutCreateInfo constructor cannot be invoked without 'new'");
  }
};

// sType
NAN_GETTER(_VkPipelineLayoutCreateInfo::GetsType) {
  _VkPipelineLayoutCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineLayoutCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.sType));
}NAN_SETTER(_VkPipelineLayoutCreateInfo::SetsType) {
  _VkPipelineLayoutCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineLayoutCreateInfo>(info.This());
  self->instance.sType = static_cast<VkStructureType>((int32_t)value->NumberValue());
}// pNext
NAN_GETTER(_VkPipelineLayoutCreateInfo::GetpNext) {
  _VkPipelineLayoutCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineLayoutCreateInfo>(info.This());
}NAN_SETTER(_VkPipelineLayoutCreateInfo::SetpNext) {
  _VkPipelineLayoutCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineLayoutCreateInfo>(info.This());
}// flags
NAN_GETTER(_VkPipelineLayoutCreateInfo::Getflags) {
  _VkPipelineLayoutCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineLayoutCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.flags));
}NAN_SETTER(_VkPipelineLayoutCreateInfo::Setflags) {
  _VkPipelineLayoutCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineLayoutCreateInfo>(info.This());
  self->instance.flags = static_cast<VkPipelineLayoutCreateFlags>((int32_t)value->NumberValue());
}// setLayoutCount
NAN_GETTER(_VkPipelineLayoutCreateInfo::GetsetLayoutCount) {
  _VkPipelineLayoutCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineLayoutCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.setLayoutCount));
}NAN_SETTER(_VkPipelineLayoutCreateInfo::SetsetLayoutCount) {
  _VkPipelineLayoutCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineLayoutCreateInfo>(info.This());
  self->instance.setLayoutCount = static_cast<uint32_t>(value->NumberValue());
}// pSetLayouts
NAN_GETTER(_VkPipelineLayoutCreateInfo::GetpSetLayouts) {
  _VkPipelineLayoutCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineLayoutCreateInfo>(info.This());
  if (self->pSetLayouts.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->pSetLayouts);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkPipelineLayoutCreateInfo::SetpSetLayouts) {
  _VkPipelineLayoutCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineLayoutCreateInfo>(info.This());
  
    // js
    if (value->IsArray() || value->IsArrayBufferView()) {
      v8::Handle<v8::Array> arr = v8::Handle<v8::Array>::Cast(value);
      Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> obj(arr);
      self->pSetLayouts = obj;
    } else {
      if (!self->pSetLayouts.IsEmpty()) self->pSetLayouts.Empty();
    }
  
  // vulkan
  if (!(value->IsNull())) {
    self->instance.pSetLayouts = copyArrayOfV8Objects<VkDescriptorSetLayout, _VkDescriptorSetLayout>(value);
  } else {
    self->instance.pSetLayouts = VK_NULL_HANDLE;
  }
}// pushConstantRangeCount
NAN_GETTER(_VkPipelineLayoutCreateInfo::GetpushConstantRangeCount) {
  _VkPipelineLayoutCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineLayoutCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.pushConstantRangeCount));
}NAN_SETTER(_VkPipelineLayoutCreateInfo::SetpushConstantRangeCount) {
  _VkPipelineLayoutCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineLayoutCreateInfo>(info.This());
  self->instance.pushConstantRangeCount = static_cast<uint32_t>(value->NumberValue());
}// pPushConstantRanges
NAN_GETTER(_VkPipelineLayoutCreateInfo::GetpPushConstantRanges) {
  _VkPipelineLayoutCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineLayoutCreateInfo>(info.This());
  if (self->pPushConstantRanges.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->pPushConstantRanges);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkPipelineLayoutCreateInfo::SetpPushConstantRanges) {
  _VkPipelineLayoutCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineLayoutCreateInfo>(info.This());
  
    // js
    if (value->IsArray() || value->IsArrayBufferView()) {
      v8::Handle<v8::Array> arr = v8::Handle<v8::Array>::Cast(value);
      Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> obj(arr);
      self->pPushConstantRanges = obj;
    } else {
      if (!self->pPushConstantRanges.IsEmpty()) self->pPushConstantRanges.Empty();
    }
  
  // vulkan
  if (!(value->IsNull())) {
    self->instance.pPushConstantRanges = copyArrayOfV8Objects<VkPushConstantRange, _VkPushConstantRange>(value);
  } else {
    self->instance.pPushConstantRanges = nullptr;
  }
}