/*
 * MACHINE GENERATED, DO NOT EDIT
 * GENERATED BY node-vulkan v0.0.5
 */
#include "utils.h"
#include "index.h"
#include "VkImageSubresourceLayers.h"

Nan::Persistent<v8::FunctionTemplate> _VkImageSubresourceLayers::constructor;

_VkImageSubresourceLayers::_VkImageSubresourceLayers() {
  
}

_VkImageSubresourceLayers::~_VkImageSubresourceLayers() {
  //printf("VkImageSubresourceLayers deconstructed!!\n");
}

void _VkImageSubresourceLayers::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkImageSubresourceLayers::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkImageSubresourceLayers").ToLocalChecked());

  // prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  
  SetPrototypeAccessor(proto, Nan::New("aspectMask").ToLocalChecked(), GetaspectMask, SetaspectMask, ctor);
  SetPrototypeAccessor(proto, Nan::New("mipLevel").ToLocalChecked(), GetmipLevel, SetmipLevel, ctor);
  SetPrototypeAccessor(proto, Nan::New("baseArrayLayer").ToLocalChecked(), GetbaseArrayLayer, SetbaseArrayLayer, ctor);
  SetPrototypeAccessor(proto, Nan::New("layerCount").ToLocalChecked(), GetlayerCount, SetlayerCount, ctor);
  Nan::Set(target, Nan::New("VkImageSubresourceLayers").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkImageSubresourceLayers::New) {
  if (info.IsConstructCall()) {
    _VkImageSubresourceLayers* self = new _VkImageSubresourceLayers();
    self->Wrap(info.Holder());
    
    if (info[0]->IsObject()) {
      v8::Local<v8::Object> obj = info[0]->ToObject();
      v8::Local<v8::String> sAccess0 = Nan::New("aspectMask").ToLocalChecked();
      v8::Local<v8::String> sAccess1 = Nan::New("mipLevel").ToLocalChecked();
      v8::Local<v8::String> sAccess2 = Nan::New("baseArrayLayer").ToLocalChecked();
      v8::Local<v8::String> sAccess3 = Nan::New("layerCount").ToLocalChecked();
      if (obj->Has(sAccess0)) info.This()->Set(sAccess0, obj->Get(sAccess0));
      if (obj->Has(sAccess1)) info.This()->Set(sAccess1, obj->Get(sAccess1));
      if (obj->Has(sAccess2)) info.This()->Set(sAccess2, obj->Get(sAccess2));
      if (obj->Has(sAccess3)) info.This()->Set(sAccess3, obj->Get(sAccess3));
      
    }
    
    info.GetReturnValue().Set(info.Holder());
  } else {
    Nan::ThrowError("VkImageSubresourceLayers constructor cannot be invoked without 'new'");
  }
};

// aspectMask
NAN_GETTER(_VkImageSubresourceLayers::GetaspectMask) {
  _VkImageSubresourceLayers *self = Nan::ObjectWrap::Unwrap<_VkImageSubresourceLayers>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.aspectMask));
}NAN_SETTER(_VkImageSubresourceLayers::SetaspectMask) {
  _VkImageSubresourceLayers *self = Nan::ObjectWrap::Unwrap<_VkImageSubresourceLayers>(info.This());
  self->instance.aspectMask = static_cast<VkImageAspectFlags>((int32_t)value->NumberValue());
}// mipLevel
NAN_GETTER(_VkImageSubresourceLayers::GetmipLevel) {
  _VkImageSubresourceLayers *self = Nan::ObjectWrap::Unwrap<_VkImageSubresourceLayers>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.mipLevel));
}NAN_SETTER(_VkImageSubresourceLayers::SetmipLevel) {
  _VkImageSubresourceLayers *self = Nan::ObjectWrap::Unwrap<_VkImageSubresourceLayers>(info.This());
  self->instance.mipLevel = static_cast<uint32_t>(value->NumberValue());
}// baseArrayLayer
NAN_GETTER(_VkImageSubresourceLayers::GetbaseArrayLayer) {
  _VkImageSubresourceLayers *self = Nan::ObjectWrap::Unwrap<_VkImageSubresourceLayers>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.baseArrayLayer));
}NAN_SETTER(_VkImageSubresourceLayers::SetbaseArrayLayer) {
  _VkImageSubresourceLayers *self = Nan::ObjectWrap::Unwrap<_VkImageSubresourceLayers>(info.This());
  self->instance.baseArrayLayer = static_cast<uint32_t>(value->NumberValue());
}// layerCount
NAN_GETTER(_VkImageSubresourceLayers::GetlayerCount) {
  _VkImageSubresourceLayers *self = Nan::ObjectWrap::Unwrap<_VkImageSubresourceLayers>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.layerCount));
}NAN_SETTER(_VkImageSubresourceLayers::SetlayerCount) {
  _VkImageSubresourceLayers *self = Nan::ObjectWrap::Unwrap<_VkImageSubresourceLayers>(info.This());
  self->instance.layerCount = static_cast<uint32_t>(value->NumberValue());
}