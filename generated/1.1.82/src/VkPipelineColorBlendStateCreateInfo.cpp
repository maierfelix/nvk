/*
 * MACHINE GENERATED, DO NOT EDIT
 * GENERATED BY node-vulkan v0.0.1
 */
#include "utils.h"
#include <string.h>
#include "index.h"
#include "VkPipelineColorBlendStateCreateInfo.h"

Nan::Persistent<v8::FunctionTemplate> _VkPipelineColorBlendStateCreateInfo::constructor;

_VkPipelineColorBlendStateCreateInfo::_VkPipelineColorBlendStateCreateInfo() {
  instance.sType = VK_STRUCTURE_TYPE_PIPELINE_COLOR_BLEND_STATE_CREATE_INFO;
}

_VkPipelineColorBlendStateCreateInfo::~_VkPipelineColorBlendStateCreateInfo() {
  //printf("VkPipelineColorBlendStateCreateInfo deconstructed!!\n");
}

void _VkPipelineColorBlendStateCreateInfo::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkPipelineColorBlendStateCreateInfo::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkPipelineColorBlendStateCreateInfo").ToLocalChecked());

  // prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  
  SetPrototypeAccessor(proto, Nan::New("sType").ToLocalChecked(), GetsType, SetsType, ctor);
  SetPrototypeAccessor(proto, Nan::New("flags").ToLocalChecked(), Getflags, Setflags, ctor);
  SetPrototypeAccessor(proto, Nan::New("logicOpEnable").ToLocalChecked(), GetlogicOpEnable, SetlogicOpEnable, ctor);
  SetPrototypeAccessor(proto, Nan::New("logicOp").ToLocalChecked(), GetlogicOp, SetlogicOp, ctor);
  SetPrototypeAccessor(proto, Nan::New("attachmentCount").ToLocalChecked(), GetattachmentCount, SetattachmentCount, ctor);
  SetPrototypeAccessor(proto, Nan::New("pAttachments").ToLocalChecked(), GetpAttachments, SetpAttachments, ctor);
  SetPrototypeAccessor(proto, Nan::New("blendConstants").ToLocalChecked(), GetblendConstants, SetblendConstants, ctor);
  Nan::Set(target, Nan::New("VkPipelineColorBlendStateCreateInfo").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkPipelineColorBlendStateCreateInfo::New) {
  if (info.IsConstructCall()) {
    _VkPipelineColorBlendStateCreateInfo* self = new _VkPipelineColorBlendStateCreateInfo();
    self->Wrap(info.Holder());
    info.GetReturnValue().Set(info.Holder());
  } else {
    Nan::ThrowError("VkPipelineColorBlendStateCreateInfo constructor cannot be invoked without 'new'");
  }
};

// sType
NAN_GETTER(_VkPipelineColorBlendStateCreateInfo::GetsType) {
  _VkPipelineColorBlendStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineColorBlendStateCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.sType));
}NAN_SETTER(_VkPipelineColorBlendStateCreateInfo::SetsType) {
  _VkPipelineColorBlendStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineColorBlendStateCreateInfo>(info.This());
  self->instance.sType = static_cast<VkStructureType>((int32_t)value->NumberValue());
}// flags
NAN_GETTER(_VkPipelineColorBlendStateCreateInfo::Getflags) {
  _VkPipelineColorBlendStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineColorBlendStateCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.flags));
}NAN_SETTER(_VkPipelineColorBlendStateCreateInfo::Setflags) {
  _VkPipelineColorBlendStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineColorBlendStateCreateInfo>(info.This());
  self->instance.flags = static_cast<VkPipelineColorBlendStateCreateFlags>((int32_t)value->NumberValue());
}// logicOpEnable
NAN_GETTER(_VkPipelineColorBlendStateCreateInfo::GetlogicOpEnable) {
  _VkPipelineColorBlendStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineColorBlendStateCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.logicOpEnable));
}NAN_SETTER(_VkPipelineColorBlendStateCreateInfo::SetlogicOpEnable) {
  _VkPipelineColorBlendStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineColorBlendStateCreateInfo>(info.This());
  self->instance.logicOpEnable = static_cast<uint32_t>(value->NumberValue());
}// logicOp
NAN_GETTER(_VkPipelineColorBlendStateCreateInfo::GetlogicOp) {
  _VkPipelineColorBlendStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineColorBlendStateCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.logicOp));
}NAN_SETTER(_VkPipelineColorBlendStateCreateInfo::SetlogicOp) {
  _VkPipelineColorBlendStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineColorBlendStateCreateInfo>(info.This());
  self->instance.logicOp = static_cast<VkLogicOp>((int32_t)value->NumberValue());
}// attachmentCount
NAN_GETTER(_VkPipelineColorBlendStateCreateInfo::GetattachmentCount) {
  _VkPipelineColorBlendStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineColorBlendStateCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.attachmentCount));
}NAN_SETTER(_VkPipelineColorBlendStateCreateInfo::SetattachmentCount) {
  _VkPipelineColorBlendStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineColorBlendStateCreateInfo>(info.This());
  self->instance.attachmentCount = static_cast<uint32_t>(value->NumberValue());
}// pAttachments
NAN_GETTER(_VkPipelineColorBlendStateCreateInfo::GetpAttachments) {
  _VkPipelineColorBlendStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineColorBlendStateCreateInfo>(info.This());
  if (self->pAttachments.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->pAttachments);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkPipelineColorBlendStateCreateInfo::SetpAttachments) {
  _VkPipelineColorBlendStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineColorBlendStateCreateInfo>(info.This());
  
    // js
    if (value->IsArray() || value->IsArrayBufferView()) {
      v8::Handle<v8::Array> arr = v8::Handle<v8::Array>::Cast(value);
      Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> obj(arr);
      self->pAttachments = obj;
    } else {
      if (!self->pAttachments.IsEmpty()) self->pAttachments.Empty();
    }
  
  // vulkan
  if (!(value->IsNull())) {
    self->instance.pAttachments = copyArrayOfV8Objects<VkPipelineColorBlendAttachmentState, _VkPipelineColorBlendAttachmentState>(value);
  } else {
    self->instance.pAttachments = nullptr;
  }
}// blendConstants
NAN_GETTER(_VkPipelineColorBlendStateCreateInfo::GetblendConstants) {
  _VkPipelineColorBlendStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineColorBlendStateCreateInfo>(info.This());
  if (self->blendConstants.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    info.GetReturnValue().Set(Nan::New(self->blendConstants));
  }
}NAN_SETTER(_VkPipelineColorBlendStateCreateInfo::SetblendConstants) {
  _VkPipelineColorBlendStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineColorBlendStateCreateInfo>(info.This());
  
    // js
    if (value->IsArray() || value->IsArrayBufferView()) {
      v8::Handle<v8::Array> arr = v8::Handle<v8::Array>::Cast(value);
      Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> obj(arr);
      self->blendConstants = obj;
    } else {
      if (!self->blendConstants.IsEmpty()) self->blendConstants.Empty();
    }
  
  // vulkan
  if (!(value->IsNull())) {
    memcpy(self->instance.blendConstants, createArrayOfV8Numbers<float>(value), sizeof(float) * 4);
  } else {
    memset(&self->instance.blendConstants, 0, sizeof(float));
  }
}