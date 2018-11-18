/*
 * MACHINE GENERATED, DO NOT EDIT
 * GENERATED BY node-vulkan v0.0.5
 */
#include "utils.h"
#include "index.h"
#include "VkRenderPassCreateInfo.h"

Nan::Persistent<v8::FunctionTemplate> _VkRenderPassCreateInfo::constructor;

_VkRenderPassCreateInfo::_VkRenderPassCreateInfo() {
  instance.sType = VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO;
}

_VkRenderPassCreateInfo::~_VkRenderPassCreateInfo() {
  //printf("VkRenderPassCreateInfo deconstructed!!\n");
}

void _VkRenderPassCreateInfo::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkRenderPassCreateInfo::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkRenderPassCreateInfo").ToLocalChecked());

  // prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  
  SetPrototypeAccessor(proto, Nan::New("sType").ToLocalChecked(), GetsType, SetsType, ctor);
  SetPrototypeAccessor(proto, Nan::New("pNext").ToLocalChecked(), GetpNext, SetpNext, ctor);
  SetPrototypeAccessor(proto, Nan::New("flags").ToLocalChecked(), Getflags, Setflags, ctor);
  SetPrototypeAccessor(proto, Nan::New("attachmentCount").ToLocalChecked(), GetattachmentCount, SetattachmentCount, ctor);
  SetPrototypeAccessor(proto, Nan::New("pAttachments").ToLocalChecked(), GetpAttachments, SetpAttachments, ctor);
  SetPrototypeAccessor(proto, Nan::New("subpassCount").ToLocalChecked(), GetsubpassCount, SetsubpassCount, ctor);
  SetPrototypeAccessor(proto, Nan::New("pSubpasses").ToLocalChecked(), GetpSubpasses, SetpSubpasses, ctor);
  SetPrototypeAccessor(proto, Nan::New("dependencyCount").ToLocalChecked(), GetdependencyCount, SetdependencyCount, ctor);
  SetPrototypeAccessor(proto, Nan::New("pDependencies").ToLocalChecked(), GetpDependencies, SetpDependencies, ctor);
  Nan::Set(target, Nan::New("VkRenderPassCreateInfo").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkRenderPassCreateInfo::New) {
  if (info.IsConstructCall()) {
    _VkRenderPassCreateInfo* self = new _VkRenderPassCreateInfo();
    self->Wrap(info.Holder());
    
    if (info[0]->IsObject()) {
      v8::Local<v8::Object> obj = info[0]->ToObject();
      v8::Local<v8::String> sAccess0 = Nan::New("sType").ToLocalChecked();
      v8::Local<v8::String> sAccess1 = Nan::New("pNext").ToLocalChecked();
      v8::Local<v8::String> sAccess2 = Nan::New("flags").ToLocalChecked();
      v8::Local<v8::String> sAccess3 = Nan::New("attachmentCount").ToLocalChecked();
      v8::Local<v8::String> sAccess4 = Nan::New("pAttachments").ToLocalChecked();
      v8::Local<v8::String> sAccess5 = Nan::New("subpassCount").ToLocalChecked();
      v8::Local<v8::String> sAccess6 = Nan::New("pSubpasses").ToLocalChecked();
      v8::Local<v8::String> sAccess7 = Nan::New("dependencyCount").ToLocalChecked();
      v8::Local<v8::String> sAccess8 = Nan::New("pDependencies").ToLocalChecked();
      if (obj->Has(sAccess0)) info.This()->Set(sAccess0, obj->Get(sAccess0));
      if (obj->Has(sAccess1)) info.This()->Set(sAccess1, obj->Get(sAccess1));
      if (obj->Has(sAccess2)) info.This()->Set(sAccess2, obj->Get(sAccess2));
      if (obj->Has(sAccess3)) info.This()->Set(sAccess3, obj->Get(sAccess3));
      if (obj->Has(sAccess4)) info.This()->Set(sAccess4, obj->Get(sAccess4));
      if (obj->Has(sAccess5)) info.This()->Set(sAccess5, obj->Get(sAccess5));
      if (obj->Has(sAccess6)) info.This()->Set(sAccess6, obj->Get(sAccess6));
      if (obj->Has(sAccess7)) info.This()->Set(sAccess7, obj->Get(sAccess7));
      if (obj->Has(sAccess8)) info.This()->Set(sAccess8, obj->Get(sAccess8));
      
    }
    
    info.GetReturnValue().Set(info.Holder());
  } else {
    Nan::ThrowError("VkRenderPassCreateInfo constructor cannot be invoked without 'new'");
  }
};

// sType
NAN_GETTER(_VkRenderPassCreateInfo::GetsType) {
  _VkRenderPassCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkRenderPassCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.sType));
}NAN_SETTER(_VkRenderPassCreateInfo::SetsType) {
  _VkRenderPassCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkRenderPassCreateInfo>(info.This());
  self->instance.sType = static_cast<VkStructureType>((int32_t)value->NumberValue());
}// pNext
NAN_GETTER(_VkRenderPassCreateInfo::GetpNext) {
  _VkRenderPassCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkRenderPassCreateInfo>(info.This());
}NAN_SETTER(_VkRenderPassCreateInfo::SetpNext) {
  _VkRenderPassCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkRenderPassCreateInfo>(info.This());
}// flags
NAN_GETTER(_VkRenderPassCreateInfo::Getflags) {
  _VkRenderPassCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkRenderPassCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.flags));
}NAN_SETTER(_VkRenderPassCreateInfo::Setflags) {
  _VkRenderPassCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkRenderPassCreateInfo>(info.This());
  self->instance.flags = static_cast<VkRenderPassCreateFlags>((int32_t)value->NumberValue());
}// attachmentCount
NAN_GETTER(_VkRenderPassCreateInfo::GetattachmentCount) {
  _VkRenderPassCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkRenderPassCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.attachmentCount));
}NAN_SETTER(_VkRenderPassCreateInfo::SetattachmentCount) {
  _VkRenderPassCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkRenderPassCreateInfo>(info.This());
  self->instance.attachmentCount = static_cast<uint32_t>(value->NumberValue());
}// pAttachments
NAN_GETTER(_VkRenderPassCreateInfo::GetpAttachments) {
  _VkRenderPassCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkRenderPassCreateInfo>(info.This());
  if (self->pAttachments.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->pAttachments);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkRenderPassCreateInfo::SetpAttachments) {
  _VkRenderPassCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkRenderPassCreateInfo>(info.This());
  
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
    self->instance.pAttachments = copyArrayOfV8Objects<VkAttachmentDescription, _VkAttachmentDescription>(value);
  } else {
    self->instance.pAttachments = nullptr;
  }
}// subpassCount
NAN_GETTER(_VkRenderPassCreateInfo::GetsubpassCount) {
  _VkRenderPassCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkRenderPassCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.subpassCount));
}NAN_SETTER(_VkRenderPassCreateInfo::SetsubpassCount) {
  _VkRenderPassCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkRenderPassCreateInfo>(info.This());
  self->instance.subpassCount = static_cast<uint32_t>(value->NumberValue());
}// pSubpasses
NAN_GETTER(_VkRenderPassCreateInfo::GetpSubpasses) {
  _VkRenderPassCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkRenderPassCreateInfo>(info.This());
  if (self->pSubpasses.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->pSubpasses);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkRenderPassCreateInfo::SetpSubpasses) {
  _VkRenderPassCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkRenderPassCreateInfo>(info.This());
  
    // js
    if (value->IsArray() || value->IsArrayBufferView()) {
      v8::Handle<v8::Array> arr = v8::Handle<v8::Array>::Cast(value);
      Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> obj(arr);
      self->pSubpasses = obj;
    } else {
      if (!self->pSubpasses.IsEmpty()) self->pSubpasses.Empty();
    }
  
  // vulkan
  if (!(value->IsNull())) {
    self->instance.pSubpasses = copyArrayOfV8Objects<VkSubpassDescription, _VkSubpassDescription>(value);
  } else {
    self->instance.pSubpasses = nullptr;
  }
}// dependencyCount
NAN_GETTER(_VkRenderPassCreateInfo::GetdependencyCount) {
  _VkRenderPassCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkRenderPassCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.dependencyCount));
}NAN_SETTER(_VkRenderPassCreateInfo::SetdependencyCount) {
  _VkRenderPassCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkRenderPassCreateInfo>(info.This());
  self->instance.dependencyCount = static_cast<uint32_t>(value->NumberValue());
}// pDependencies
NAN_GETTER(_VkRenderPassCreateInfo::GetpDependencies) {
  _VkRenderPassCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkRenderPassCreateInfo>(info.This());
  if (self->pDependencies.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->pDependencies);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkRenderPassCreateInfo::SetpDependencies) {
  _VkRenderPassCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkRenderPassCreateInfo>(info.This());
  
    // js
    if (value->IsArray() || value->IsArrayBufferView()) {
      v8::Handle<v8::Array> arr = v8::Handle<v8::Array>::Cast(value);
      Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> obj(arr);
      self->pDependencies = obj;
    } else {
      if (!self->pDependencies.IsEmpty()) self->pDependencies.Empty();
    }
  
  // vulkan
  if (!(value->IsNull())) {
    self->instance.pDependencies = copyArrayOfV8Objects<VkSubpassDependency, _VkSubpassDependency>(value);
  } else {
    self->instance.pDependencies = nullptr;
  }
}