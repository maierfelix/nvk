/*
 * MACHINE GENERATED, DO NOT EDIT
 * GENERATED BY node-vulkan v0.0.5
 */
#include "utils.h"
#include "index.h"
#include "VkImageViewCreateInfo.h"

Nan::Persistent<v8::FunctionTemplate> _VkImageViewCreateInfo::constructor;

_VkImageViewCreateInfo::_VkImageViewCreateInfo() {
  instance.sType = VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO;
}

_VkImageViewCreateInfo::~_VkImageViewCreateInfo() {
  //printf("VkImageViewCreateInfo deconstructed!!\n");
}

void _VkImageViewCreateInfo::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkImageViewCreateInfo::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkImageViewCreateInfo").ToLocalChecked());

  // prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  
  SetPrototypeAccessor(proto, Nan::New("sType").ToLocalChecked(), GetsType, SetsType, ctor);
  SetPrototypeAccessor(proto, Nan::New("pNext").ToLocalChecked(), GetpNext, SetpNext, ctor);
  SetPrototypeAccessor(proto, Nan::New("flags").ToLocalChecked(), Getflags, Setflags, ctor);
  SetPrototypeAccessor(proto, Nan::New("image").ToLocalChecked(), Getimage, Setimage, ctor);
  SetPrototypeAccessor(proto, Nan::New("viewType").ToLocalChecked(), GetviewType, SetviewType, ctor);
  SetPrototypeAccessor(proto, Nan::New("format").ToLocalChecked(), Getformat, Setformat, ctor);
  SetPrototypeAccessor(proto, Nan::New("components").ToLocalChecked(), Getcomponents, Setcomponents, ctor);
  SetPrototypeAccessor(proto, Nan::New("subresourceRange").ToLocalChecked(), GetsubresourceRange, SetsubresourceRange, ctor);
  Nan::Set(target, Nan::New("VkImageViewCreateInfo").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkImageViewCreateInfo::New) {
  if (info.IsConstructCall()) {
    _VkImageViewCreateInfo* self = new _VkImageViewCreateInfo();
    self->Wrap(info.Holder());
    
    if (info[0]->IsObject()) {
      v8::Local<v8::Object> obj = info[0]->ToObject();
      v8::Local<v8::String> sAccess0 = Nan::New("sType").ToLocalChecked();
      v8::Local<v8::String> sAccess1 = Nan::New("pNext").ToLocalChecked();
      v8::Local<v8::String> sAccess2 = Nan::New("flags").ToLocalChecked();
      v8::Local<v8::String> sAccess3 = Nan::New("image").ToLocalChecked();
      v8::Local<v8::String> sAccess4 = Nan::New("viewType").ToLocalChecked();
      v8::Local<v8::String> sAccess5 = Nan::New("format").ToLocalChecked();
      v8::Local<v8::String> sAccess6 = Nan::New("components").ToLocalChecked();
      v8::Local<v8::String> sAccess7 = Nan::New("subresourceRange").ToLocalChecked();
      if (obj->Has(sAccess0)) info.This()->Set(sAccess0, obj->Get(sAccess0));
      if (obj->Has(sAccess1)) info.This()->Set(sAccess1, obj->Get(sAccess1));
      if (obj->Has(sAccess2)) info.This()->Set(sAccess2, obj->Get(sAccess2));
      if (obj->Has(sAccess3)) info.This()->Set(sAccess3, obj->Get(sAccess3));
      if (obj->Has(sAccess4)) info.This()->Set(sAccess4, obj->Get(sAccess4));
      if (obj->Has(sAccess5)) info.This()->Set(sAccess5, obj->Get(sAccess5));
      if (obj->Has(sAccess6)) info.This()->Set(sAccess6, obj->Get(sAccess6));
      if (obj->Has(sAccess7)) info.This()->Set(sAccess7, obj->Get(sAccess7));
      
    }
    
    info.GetReturnValue().Set(info.Holder());
  } else {
    Nan::ThrowError("VkImageViewCreateInfo constructor cannot be invoked without 'new'");
  }
};

// sType
NAN_GETTER(_VkImageViewCreateInfo::GetsType) {
  _VkImageViewCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkImageViewCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.sType));
}NAN_SETTER(_VkImageViewCreateInfo::SetsType) {
  _VkImageViewCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkImageViewCreateInfo>(info.This());
  self->instance.sType = static_cast<VkStructureType>((int32_t)value->NumberValue());
}// pNext
NAN_GETTER(_VkImageViewCreateInfo::GetpNext) {
  _VkImageViewCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkImageViewCreateInfo>(info.This());
}NAN_SETTER(_VkImageViewCreateInfo::SetpNext) {
  _VkImageViewCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkImageViewCreateInfo>(info.This());
}// flags
NAN_GETTER(_VkImageViewCreateInfo::Getflags) {
  _VkImageViewCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkImageViewCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.flags));
}NAN_SETTER(_VkImageViewCreateInfo::Setflags) {
  _VkImageViewCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkImageViewCreateInfo>(info.This());
  self->instance.flags = static_cast<VkImageViewCreateFlags>((int32_t)value->NumberValue());
}// image
NAN_GETTER(_VkImageViewCreateInfo::Getimage) {
  _VkImageViewCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkImageViewCreateInfo>(info.This());
  if (self->image.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->image);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkImageViewCreateInfo::Setimage) {
  _VkImageViewCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkImageViewCreateInfo>(info.This());
  // js
  if (!(value->IsNull())) {
    Nan::Persistent<v8::Object, v8::CopyablePersistentTraits<v8::Object>> obj(value->ToObject());
    self->image = obj;
  } else {
    //self->image = Nan::Persistent<v8::Object, v8::CopyablePersistentTraits<v8::Object>>(Nan::Null());
  }
  // vulkan
  if (!(value->IsNull())) {
    _VkImage* obj = Nan::ObjectWrap::Unwrap<_VkImage>(value->ToObject());
    self->instance.image = obj->instance;
  } else {
    self->instance.image = VK_NULL_HANDLE;
  }
}// viewType
NAN_GETTER(_VkImageViewCreateInfo::GetviewType) {
  _VkImageViewCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkImageViewCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.viewType));
}NAN_SETTER(_VkImageViewCreateInfo::SetviewType) {
  _VkImageViewCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkImageViewCreateInfo>(info.This());
  self->instance.viewType = static_cast<VkImageViewType>((int32_t)value->NumberValue());
}// format
NAN_GETTER(_VkImageViewCreateInfo::Getformat) {
  _VkImageViewCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkImageViewCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.format));
}NAN_SETTER(_VkImageViewCreateInfo::Setformat) {
  _VkImageViewCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkImageViewCreateInfo>(info.This());
  self->instance.format = static_cast<VkFormat>((int32_t)value->NumberValue());
}// components
NAN_GETTER(_VkImageViewCreateInfo::Getcomponents) {
  _VkImageViewCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkImageViewCreateInfo>(info.This());
  if (self->components.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->components);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkImageViewCreateInfo::Setcomponents) {
  _VkImageViewCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkImageViewCreateInfo>(info.This());
  // js
  if (!(value->IsNull())) {
    Nan::Persistent<v8::Object, v8::CopyablePersistentTraits<v8::Object>> obj(value->ToObject());
    self->components = obj;
  } else {
    //self->components = Nan::Persistent<v8::Object, v8::CopyablePersistentTraits<v8::Object>>(Nan::Null());
  }
  // vulkan
  if (!(value->IsNull())) {
    _VkComponentMapping* obj = Nan::ObjectWrap::Unwrap<_VkComponentMapping>(value->ToObject());
    self->instance.components = obj->instance;
  } else {
    memset(&self->instance.components, 0, sizeof(VkComponentMapping));
  }
}// subresourceRange
NAN_GETTER(_VkImageViewCreateInfo::GetsubresourceRange) {
  _VkImageViewCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkImageViewCreateInfo>(info.This());
  if (self->subresourceRange.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->subresourceRange);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkImageViewCreateInfo::SetsubresourceRange) {
  _VkImageViewCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkImageViewCreateInfo>(info.This());
  // js
  if (!(value->IsNull())) {
    Nan::Persistent<v8::Object, v8::CopyablePersistentTraits<v8::Object>> obj(value->ToObject());
    self->subresourceRange = obj;
  } else {
    //self->subresourceRange = Nan::Persistent<v8::Object, v8::CopyablePersistentTraits<v8::Object>>(Nan::Null());
  }
  // vulkan
  if (!(value->IsNull())) {
    _VkImageSubresourceRange* obj = Nan::ObjectWrap::Unwrap<_VkImageSubresourceRange>(value->ToObject());
    self->instance.subresourceRange = obj->instance;
  } else {
    memset(&self->instance.subresourceRange, 0, sizeof(VkImageSubresourceRange));
  }
}