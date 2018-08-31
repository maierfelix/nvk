#include "utils.h"
#include "index.h"
#include "VkImageMemoryBarrier.h"

Nan::Persistent<v8::FunctionTemplate> _VkImageMemoryBarrier::constructor;

_VkImageMemoryBarrier::_VkImageMemoryBarrier() {
  instance = (VkImageMemoryBarrier*) malloc(sizeof(VkImageMemoryBarrier));
}

_VkImageMemoryBarrier::~_VkImageMemoryBarrier() { }

void _VkImageMemoryBarrier::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // Constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkImageMemoryBarrier::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkImageMemoryBarrier").ToLocalChecked());

  // Prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  SetPrototypeAccessor(proto, Nan::New("sType").ToLocalChecked(), GetsType, SetsType, ctor);
  SetPrototypeAccessor(proto, Nan::New("srcAccessMask").ToLocalChecked(), GetsrcAccessMask, SetsrcAccessMask, ctor);
  SetPrototypeAccessor(proto, Nan::New("dstAccessMask").ToLocalChecked(), GetdstAccessMask, SetdstAccessMask, ctor);
  SetPrototypeAccessor(proto, Nan::New("oldLayout").ToLocalChecked(), GetoldLayout, SetoldLayout, ctor);
  SetPrototypeAccessor(proto, Nan::New("newLayout").ToLocalChecked(), GetnewLayout, SetnewLayout, ctor);
  SetPrototypeAccessor(proto, Nan::New("srcQueueFamilyIndex").ToLocalChecked(), GetsrcQueueFamilyIndex, SetsrcQueueFamilyIndex, ctor);
  SetPrototypeAccessor(proto, Nan::New("dstQueueFamilyIndex").ToLocalChecked(), GetdstQueueFamilyIndex, SetdstQueueFamilyIndex, ctor);
  SetPrototypeAccessor(proto, Nan::New("image").ToLocalChecked(), Getimage, Setimage, ctor);
  SetPrototypeAccessor(proto, Nan::New("subresourceRange").ToLocalChecked(), GetsubresourceRange, SetsubresourceRange, ctor);
  
  Nan::Set(target, Nan::New("VkImageMemoryBarrier").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkImageMemoryBarrier::New) {
  _VkImageMemoryBarrier* self = new _VkImageMemoryBarrier();
  self->Wrap(info.Holder());
  info.GetReturnValue().Set(info.Holder());
};

// sType
NAN_GETTER(_VkImageMemoryBarrier::GetsType) {
  _VkImageMemoryBarrier *self = Nan::ObjectWrap::Unwrap<_VkImageMemoryBarrier>(info.This());
  VkImageMemoryBarrier *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->sType));
}
NAN_SETTER(_VkImageMemoryBarrier::SetsType) {
  _VkImageMemoryBarrier *self = Nan::ObjectWrap::Unwrap<_VkImageMemoryBarrier>(info.This());
  VkImageMemoryBarrier *instance = self->instance;
  self->instance->sType = static_cast<VkStructureType>(value->Uint32Value());
}// srcAccessMask
NAN_GETTER(_VkImageMemoryBarrier::GetsrcAccessMask) {
  _VkImageMemoryBarrier *self = Nan::ObjectWrap::Unwrap<_VkImageMemoryBarrier>(info.This());
  VkImageMemoryBarrier *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(static_cast<uint8_t>(self->instance->srcAccessMask)));
}
NAN_SETTER(_VkImageMemoryBarrier::SetsrcAccessMask) {
  _VkImageMemoryBarrier *self = Nan::ObjectWrap::Unwrap<_VkImageMemoryBarrier>(info.This());
  VkImageMemoryBarrier *instance = self->instance;
  self->instance->srcAccessMask = static_cast<VkAccessFlags>(value->Uint32Value());
}// dstAccessMask
NAN_GETTER(_VkImageMemoryBarrier::GetdstAccessMask) {
  _VkImageMemoryBarrier *self = Nan::ObjectWrap::Unwrap<_VkImageMemoryBarrier>(info.This());
  VkImageMemoryBarrier *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(static_cast<uint8_t>(self->instance->dstAccessMask)));
}
NAN_SETTER(_VkImageMemoryBarrier::SetdstAccessMask) {
  _VkImageMemoryBarrier *self = Nan::ObjectWrap::Unwrap<_VkImageMemoryBarrier>(info.This());
  VkImageMemoryBarrier *instance = self->instance;
  self->instance->dstAccessMask = static_cast<VkAccessFlags>(value->Uint32Value());
}// oldLayout
NAN_GETTER(_VkImageMemoryBarrier::GetoldLayout) {
  _VkImageMemoryBarrier *self = Nan::ObjectWrap::Unwrap<_VkImageMemoryBarrier>(info.This());
  VkImageMemoryBarrier *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->oldLayout));
}
NAN_SETTER(_VkImageMemoryBarrier::SetoldLayout) {
  _VkImageMemoryBarrier *self = Nan::ObjectWrap::Unwrap<_VkImageMemoryBarrier>(info.This());
  VkImageMemoryBarrier *instance = self->instance;
  self->instance->oldLayout = static_cast<VkImageLayout>(value->Uint32Value());
}// newLayout
NAN_GETTER(_VkImageMemoryBarrier::GetnewLayout) {
  _VkImageMemoryBarrier *self = Nan::ObjectWrap::Unwrap<_VkImageMemoryBarrier>(info.This());
  VkImageMemoryBarrier *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->newLayout));
}
NAN_SETTER(_VkImageMemoryBarrier::SetnewLayout) {
  _VkImageMemoryBarrier *self = Nan::ObjectWrap::Unwrap<_VkImageMemoryBarrier>(info.This());
  VkImageMemoryBarrier *instance = self->instance;
  self->instance->newLayout = static_cast<VkImageLayout>(value->Uint32Value());
}// srcQueueFamilyIndex
NAN_GETTER(_VkImageMemoryBarrier::GetsrcQueueFamilyIndex) {
  _VkImageMemoryBarrier *self = Nan::ObjectWrap::Unwrap<_VkImageMemoryBarrier>(info.This());
  VkImageMemoryBarrier *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->srcQueueFamilyIndex));
}
NAN_SETTER(_VkImageMemoryBarrier::SetsrcQueueFamilyIndex) {
  _VkImageMemoryBarrier *self = Nan::ObjectWrap::Unwrap<_VkImageMemoryBarrier>(info.This());
  VkImageMemoryBarrier *instance = self->instance;
  self->instance->srcQueueFamilyIndex = static_cast<uint32_t>(value->NumberValue());
}// dstQueueFamilyIndex
NAN_GETTER(_VkImageMemoryBarrier::GetdstQueueFamilyIndex) {
  _VkImageMemoryBarrier *self = Nan::ObjectWrap::Unwrap<_VkImageMemoryBarrier>(info.This());
  VkImageMemoryBarrier *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->dstQueueFamilyIndex));
}
NAN_SETTER(_VkImageMemoryBarrier::SetdstQueueFamilyIndex) {
  _VkImageMemoryBarrier *self = Nan::ObjectWrap::Unwrap<_VkImageMemoryBarrier>(info.This());
  VkImageMemoryBarrier *instance = self->instance;
  self->instance->dstQueueFamilyIndex = static_cast<uint32_t>(value->NumberValue());
}// image
NAN_GETTER(_VkImageMemoryBarrier::Getimage) {
  _VkImageMemoryBarrier *self = Nan::ObjectWrap::Unwrap<_VkImageMemoryBarrier>(info.This());
  VkImageMemoryBarrier *instance = self->instance;
  if (self->image != nullptr) {
    info.GetReturnValue().Set(self->image->handle());
  } else {
    info.GetReturnValue().SetNull();
  }
}
NAN_SETTER(_VkImageMemoryBarrier::Setimage) {
  _VkImageMemoryBarrier *self = Nan::ObjectWrap::Unwrap<_VkImageMemoryBarrier>(info.This());
  VkImageMemoryBarrier *instance = self->instance;
  _VkImage* obj = Nan::ObjectWrap::Unwrap<_VkImage>(value->ToObject());
  self->image = obj;
  instance->image = *obj->instance;
}// subresourceRange
NAN_GETTER(_VkImageMemoryBarrier::GetsubresourceRange) {
  _VkImageMemoryBarrier *self = Nan::ObjectWrap::Unwrap<_VkImageMemoryBarrier>(info.This());
  VkImageMemoryBarrier *instance = self->instance;
  if (self->subresourceRange != nullptr) {
    info.GetReturnValue().Set(self->subresourceRange->handle());
  } else {
    info.GetReturnValue().SetNull();
  }
}
NAN_SETTER(_VkImageMemoryBarrier::SetsubresourceRange) {
  _VkImageMemoryBarrier *self = Nan::ObjectWrap::Unwrap<_VkImageMemoryBarrier>(info.This());
  VkImageMemoryBarrier *instance = self->instance;
  _VkImageSubresourceRange* obj = Nan::ObjectWrap::Unwrap<_VkImageSubresourceRange>(value->ToObject());
  self->subresourceRange = obj;
  instance->subresourceRange = *obj->instance;
}