/*
 * MACHINE GENERATED, DO NOT EDIT
 * GENERATED BY node-vulkan v0.0.1
 */
#include "utils.h"
#include "index.h"
#include "VkMemoryRequirements.h"

Nan::Persistent<v8::FunctionTemplate> _VkMemoryRequirements::constructor;

_VkMemoryRequirements::_VkMemoryRequirements() {
  
}

_VkMemoryRequirements::~_VkMemoryRequirements() {
  //printf("VkMemoryRequirements deconstructed!!\n");
}

void _VkMemoryRequirements::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkMemoryRequirements::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkMemoryRequirements").ToLocalChecked());

  // prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  
  SetPrototypeAccessor(proto, Nan::New("size").ToLocalChecked(), Getsize, nullptr, ctor);
  SetPrototypeAccessor(proto, Nan::New("alignment").ToLocalChecked(), Getalignment, nullptr, ctor);
  SetPrototypeAccessor(proto, Nan::New("memoryTypeBits").ToLocalChecked(), GetmemoryTypeBits, nullptr, ctor);
  Nan::Set(target, Nan::New("VkMemoryRequirements").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkMemoryRequirements::New) {
  if (info.IsConstructCall()) {
    _VkMemoryRequirements* self = new _VkMemoryRequirements();
    self->Wrap(info.Holder());

    if (info[0]->IsObject()) {
      v8::Local<v8::Object> obj = info[0]->ToObject();
      v8::Local<v8::String> sAccess0 = Nan::New("size").ToLocalChecked();
      v8::Local<v8::String> sAccess1 = Nan::New("alignment").ToLocalChecked();
      v8::Local<v8::String> sAccess2 = Nan::New("memoryTypeBits").ToLocalChecked();
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
      }

    info.GetReturnValue().Set(info.Holder());
  } else {
    Nan::ThrowError("VkMemoryRequirements constructor cannot be invoked without 'new'");
  }
};

// size
NAN_GETTER(_VkMemoryRequirements::Getsize) {
  _VkMemoryRequirements *self = Nan::ObjectWrap::Unwrap<_VkMemoryRequirements>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.size));
}// alignment
NAN_GETTER(_VkMemoryRequirements::Getalignment) {
  _VkMemoryRequirements *self = Nan::ObjectWrap::Unwrap<_VkMemoryRequirements>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.alignment));
}// memoryTypeBits
NAN_GETTER(_VkMemoryRequirements::GetmemoryTypeBits) {
  _VkMemoryRequirements *self = Nan::ObjectWrap::Unwrap<_VkMemoryRequirements>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.memoryTypeBits));
}